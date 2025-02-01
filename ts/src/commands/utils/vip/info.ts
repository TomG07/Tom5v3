import { ChatInputCommandInteraction, EmbedBuilder, User } from "discord.js";
import Command from "../../../classes/Command.js";
import colors from "../../../structures/others/colors.js";
import emojis from "../../../structures/others/emojis.js";
import capitalize from "../../../structures/functions/capitalize.js";

export class Comando extends Command {

    constructor() {
        super(
            {
                name: "info",
                description: ".",
                aliases: ["i", "infos"],
                botPerms: [],
                category: "utils",
                devOnly: false,
                options: [],
                reference: "vip",
                reparing: false,
                subCommand: true,
                usage: "/vip info",
                userPerms: []
            }
        )

        this.execute = async ({ client, ctx }) => {

            let type: string;

            const types: { [key: string]: string } = {
                "pessoal": "personal",
                "personal": "personal",
                "servidor": "server",
                "server": "server",
                "guild": "server",
                "user": "personal"
            }

            if (ctx.interaction instanceof ChatInputCommandInteraction) {
                type = ctx.interaction.options.getString("type", true)
            } else {

                const arg = ctx.args[1]

                if (!arg || !types[arg]) {
                    return await ctx.reply(
                        {
                            embeds: [
                                new EmbedBuilder()
                                .setColor(colors.errado)
                                .setDescription(`**(${emojis.errado}) Indique o tipo de Informações que deseja obter: \`pessoal\` / \`servidor\`**`)
                            ]
                        }
                    )
                }

                type = arg
            }

            const vipsEmojis: { [key: string]: string } = {
                "bronze": "<:bronze:1280123875685826583>",
                "prata": "<:prata:1280123881138683904>",
                "ouro": "<:ouro:1280123878265454623>",
                "diamante": "<:diamante:1280123883231510548>"
            }

            switch (types[type]) {

                case "personal": {

                    let user: User;

                    if (ctx.interaction instanceof ChatInputCommandInteraction) {
                        if (ctx.interaction.options.getUser("user") && !ctx.interaction.options.getUser("user").bot) {
                            user = ctx.interaction.options.getUser("user")
                        }
                    } else {
                        const isMention = ctx.interaction.mentions.users.first()

                        if (isMention && !isMention.bot) {
                            user = isMention
                        } else if (!isMention && ctx.args) {
                            
                            const findUser = client.users.cache.find(u => u.id === ctx.args[2])

                            if (findUser && !findUser.bot) {
                                user = findUser
                            }
                        }
                    }

                    if (!user) {
                        user = ctx.user
                    }

                    const userVip = await client.db.findUser(
                        {
                            _id: user.id
                        }
                    ).then(doc => doc.vip)

                    if (!userVip || !userVip.active) {
                        
                        await ctx.reply(
                            {
                                content: `**(${emojis.errado}) O usuário não tem VIP ou não está ativo.**`
                            }
                        )

                        break
                    }

                    const vipType = userVip.type
                    const endsAt = userVip.end

                    const vipData: { [key: string]: string } = {
                        "bronze": `> - Limite de Ações: __+1__\n> - Limite de empresas: __=__\n> - Destaque no servidor da __TomLabs__`,
                        "prata": `> - Recompensa diária __x2__\n> - Limite de Ações: __+2__\n> - Limite de empresas: __+1__\n> - Destaque no servidor da __TomLabs__`,
                        "ouro": `> - Recompensa diária __x2__\n> - Limite de Ações: __+5__\n> - Limite de empresas: __+3__\n> - Destaque no servidor da __TomLabs__\n> - Sorteios __exlusivos__`,
                        "diamante": `> - Recompensa diária __x3__\n> - Limite de Ações: __+10__\n> - Limite de empresas: __+5__\n> - Destaque no servidor da __TomLabs__\n> - Sorteios __exclusivos__`
                    }

                    await ctx.reply(
                        {
                            content: `**(<:tom5_icons_colorserverpartner:1145743444636094597>) Informações VIP - [${user.username}](<https://discord.gg/tbsZVq5WEx>)**\n- Tipo: ${capitalize(vipType)} ${vipsEmojis[vipType]}\n- Acaba <t:${~~(endsAt / 1000)}:R>\n\n**Regalias**\n${vipData[vipType]}`
                        }
                    )

                    break
                }

                case "server": {

                    const serverVip = await client.db.findGuild(
                        {
                            _id: ctx.guild.id
                        }
                    ).then(doc => doc.vip)

                    if (!serverVip || !serverVip.active) {
                        
                        await ctx.reply(
                            {
                                content: `**(${emojis.errado}) O servidor não tem VIP ou não está ativo.**`
                            }
                        )

                        break
                    }

                    const vipsEmojis: { [key: string]: string } = {
                        "bronze": "<:bronze:1280123875685826583>",
                        "prata": "<:prata:1280123881138683904>",
                        "ouro": "<:ouro:1280123878265454623>",
                        "diamante": "<:diamante:1280123883231510548>"
                    }

                    const vipType = serverVip.type
                    const endsAt = serverVip.end

                    const vipData: { [key: string]: string } = {
                        "bronze": `> - Limite de Empresas Agregadas: __+5__\n> - Limite de Representantes: __+1__\n> - Destaque no servidor da __TomLabs__ (Dono do Servidor)`,
                        "prata": `> - Recompensa diária __x2__ (Chance de 25%)\n> - Limite de Empresas Agregadas: __+10__\n> - Limite de Representantes: __+2__\n> - Destaque no servidor da __TomLabs__ (Dono do Servidor)`,
                        "ouro": `> - Recompensa diária __x2__ (Chance de 50%)\n> - Limite de Empresas Agregadas: __+15__\n> - Limite de Representantes: __+5__\n> - Destaque no servidor da __TomLabs__ (Dono do Servidor)\n> - Sorteios __exclusivos para membros__ para membros dos servidores VIPS na TomLabs`,
                        "diamante": `> - Recompensa diária __x2__ (Chance de 100%)\n> - Limite de Empresas Agregadas: __+25__\n> - Limite de Representantes: __+10__\n> - Destaque no servidor da __TomLabs__ (Dono do Servidor)\n> - Sorteios __exclusivos para membros__ no servidor da TomLabs\n> - Lugar no __Hall da Fama__`
                    }

                    await ctx.reply(
                        {
                            content: `**(<:tom5_icons_colorserverpartner:1145743444636094597>) Informações VIP - [${ctx.guild.name}](<https://discord.gg/tbsZVq5WEx>)**\n- Tipo: ${capitalize(vipType)} ${vipsEmojis[vipType]}\n- Acaba <t:${~~(endsAt / 1000)}:R>\n\n**Regalias**\n${vipData[vipType]}`
                        }
                    )

                    break
                }
            }
        }
    }
}