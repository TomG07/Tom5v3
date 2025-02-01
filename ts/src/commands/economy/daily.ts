import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } from "discord.js";
import Command from "../../classes/Command.js";
import emojis from "../../structures/others/emojis.js";
import { TransactionsType } from "../../structures/types/transactionsType.js";
import colors from "../../structures/others/colors.js";
import ScheduleJob from "../../classes/ScheduleJob.js";
import manageNumber from "../../structures/functions/manageNumber.js";
import capitalize from "../../structures/functions/capitalize.js";

export class Comando extends Command {

    constructor() {
        super(
            {
                name: "daily",
                description: "[ECONOMIA] Colete o seu prémio diário",
                aliases: ["d"],
                botPerms: [],
                category: "economy",
                devOnly: false,
                options: [],
                reference: null,
                reparing: false,
                subCommand: null,
                usage: "/daily",
                userPerms: [],
                descriptionLocalizations: {
                    "pt-BR": "[ECONOMIA] Colete o seu prémio diário",
                    "en-US": "[ECONOMY] Collect your daily reward"
                }
            }
        )
        
        this.execute = async ({ client, ctx }) => {

            const [userDoc, guildDoc] = await Promise.all(
                [
                    client.db.findUser(
                        {
                            _id: ctx.user.id
                        }
                    ),
                    client.db.findGuild(
                        {
                            _id: ctx.guild.id
                        }
                    )
                ]
            )

            let proximo = userDoc.economia.daily.proximo as number
            const now = Date.now()

            if (now < proximo) {

                return await ctx.reply(
                    {
                        embeds: [
                            new EmbedBuilder()
                            .setColor(colors.errado)
                            .setDescription(`**(${emojis.errado}) Já resgatou o seu daily recentemente. Volte <t:${~~(proximo / 1000)}:R>**`)
                        ]
                    }
                )
            }

            const guildVip = guildDoc.vip?.active ? guildDoc.vip : null
            const userVip = userDoc.vip?.active ? userDoc.vip : null

            const vipUserMultiplier: { [key: string]: number } = {
                "bronze": 1,
                "prata": 2,
                "ouro": 2,
                "diamante": 3
            }

            const vipGuildMultiplier: { [key: string]: { chance: number, multiplicador: number } } = {
                "bronze": { chance: 1, multiplicador: 1 },
                "prata": { chance: 0.25, multiplicador: 2 },
                "ouro": { chance: 0.5, multiplicador: 2 },
                "diamante": { chance: 1, multiplicador: 2 }
            }

            let multiplier: { chance: number, multiplicador: number };
            let vipAplied: "user" | "guild" | "none"

            if (guildVip && !userVip) {
                multiplier = vipGuildMultiplier[guildVip.type]
                vipAplied = "guild"
            } else if (userVip) {
                multiplier = {
                    chance: 1,
                    multiplicador: vipUserMultiplier[userVip.type]
                }
                vipAplied = "user"
            } else {
                multiplier = {
                    chance: 1,
                    multiplicador: 1
                }
                vipAplied = "none"
            }

            const vipsEmojis: { [key: string]: string } = {
                "bronze": "<:bronze:1280123875685826583>",
                "prata": "<:prata:1280123881138683904>",
                "ouro": "<:ouro:1280123878265454623>",
                "diamante": "<:diamante:1280123883231510548>"
            }

            const chance = Math.random() <= multiplier.chance

            let addString = ""

            if (chance && vipAplied !== "none") {
                switch (vipAplied) {
                    case "guild": {
                        addString = `Ganhou __${multiplier.multiplicador}x__ porque **${ctx.guild.name}** tem VIP **${vipsEmojis[guildVip.type]} ${capitalize(guildVip.type)}**`

                        break
                    }

                    case "user": {
                        addString = `Ganhou __${multiplier.multiplicador}x__ porque tem VIP **${vipsEmojis[userVip.type]} ${capitalize(userVip.type)}**`

                        break
                    }
                }
            } else {

                switch (vipAplied) {
                    case "guild": {
                        addString = `Não teve sorte desta vez... Chance de __${vipGuildMultiplier[guildVip.type].chance * 100}%__ para __${vipGuildMultiplier[guildVip.type].multiplicador}x__`

                        break
                    }

                    default: {
                        addString = `Sabia que pode ganhar em até __3x__ mais no seu daily se obtiver VIP?`
                    }
                }
            }

            const premio = chance ? Math.floor((Math.random() * 1500) + 500) * multiplier.multiplicador : Math.floor((Math.random() * 1500) + 500)

            const transactionData: TransactionsType = {
                type: "+",
                amount: premio,
                date: new Date(),
                name: "Prémio Diário"
            }

            proximo = Date.now() + (1000 * 60 * 60 * 24)

            await client.db.updateUser(
                {
                    _id: ctx.user.id
                },
                {
                    $set: {
                        "economia.carteira": userDoc.economia.carteira as number + premio,
                        "economia.daily.ultimo": Date.now(),
                        "economia.daily.proximo": proximo
                    },
                    $push: {
                        "economia.transacoes": transactionData
                    }
                }
            )

            if (userDoc.remembers.daily) {

                if (client.utils.usersScheduleJobs.has(`daily_${ctx.user.id}`) && client.utils.usersScheduleJobs.get(`daily_${ctx.user.id}`).actualJob) {
                    client.utils.usersScheduleJobs.get(`daily_${ctx.user.id}`).cancel()
                    client.utils.usersScheduleJobs.delete(`daily_${ctx.user.id}`)
                }

                const job = new ScheduleJob(proximo, async () => {

                    const user = await client.users.fetch(userDoc._id as string)

                    const userDocAtual = await client.db.findUser(
                        {
                            _id: user.id
                        }
                    )

                    if (!userDocAtual.remembers.daily) return

                    const userChannel = await user.createDM(true)
                    
                    await userChannel.send(
                        {
                            content: `**(${emojis.certo}) Já podes resgatar o teu daily novamente!**`
                        }
                    ).catch(() => {})
                })

                client.utils.usersScheduleJobs.set(`daily_${ctx.user.id}`, job)

                job.start()
            }

            const components = [
                new ActionRowBuilder<ButtonBuilder>()
                .setComponents(
                    new ButtonBuilder()
                    .setCustomId(userDoc.remembers.daily ? "desativar_lembrete" : "ativar_lembrete")
                    .setLabel(userDoc.remembers.daily ? "Desativar Lembrete" : "Ativar Lembrete")
                    .setStyle(userDoc.remembers.daily ? ButtonStyle.Danger : ButtonStyle.Success)
                )
            ]

            const msg1 = await ctx.reply(
                {
                    embeds: [
                        new EmbedBuilder()
                        .setColor(colors.certo)
                        .setDescription(`**(${emojis.certo}) Recebeste \`${manageNumber(premio)}\` <:dollar:1146037895271026781> TomBits! Volta <t:${~~((Date.now() + 86400000) / 1000)}:R>.**\n-# ${addString}`)
                    ],
                    components
                }
            )

            msg1.createMessageComponentCollector(
                {
                    time: 120000,
                    idle: 45000,
                    componentType: ComponentType.Button
                }
            ).on("collect", async (i1) => {

                if (i1.user.id !== ctx.user.id) {
                    return await i1.reply(
                        {
                            content: `**(${emojis.errado}) Interação disponível apenas para ${ctx.user}!**`,
                            flags: ["Ephemeral"]
                        }
                    )
                }

                switch (i1.message.components[0].components[0].customId) {

                    case "ativar_lembrete": {

                        await client.db.updateUser(
                            {
                                _id: ctx.user.id
                            },
                            {
                                $set: {
                                    "remembers.daily": true
                                }
                            }
                        )

                        if (!client.utils.usersScheduleJobs.has(`daily_${ctx.user.id}`)) {
                            const job = new ScheduleJob(proximo, async () => {

                                const user = await client.users.fetch(userDoc._id as string)
            
                                const userDocAtual = await client.db.findUser(
                                    {
                                        _id: user.id
                                    }
                                )
            
                                if (!userDocAtual.remembers.daily) return
            
                                const userChannel = await user.createDM(true)
                                
                                await userChannel.send(
                                    {
                                        content: `**(${emojis.certo}) ${user} Já podes resgatar o teu daily novamente!**`
                                    }
                                ).catch(() => {})
                            })
            
                            client.utils.usersScheduleJobs.set(`daily_${ctx.user.id}`, job)

                            job.start()
                        }

                        await i1.reply(
                            {
                                content: `**(${emojis.certo}) Lembrete \`ativado\` com sucesso.**`,
                                flags: ["Ephemeral"]
                            }
                        )

                        components[0].components[0].setCustomId("desativar_lembrete").setLabel("Desativar Lembrete").setStyle(ButtonStyle.Danger)

                        await msg1.edit(
                            {
                                components
                            }
                        )

                        break
                    }

                    case "desativar_lembrete": {

                        await client.db.updateUser(
                            {
                                _id: ctx.user.id
                            },
                            {
                                $set: {
                                    "remembers.daily": false
                                }
                            }
                        )

                        if (client.utils.usersScheduleJobs.has(`daily_${ctx.user.id}`)) {
                            client.utils.usersScheduleJobs.get(`daily_${ctx.user.id}`).cancel()
                            client.utils.usersScheduleJobs.delete(`daily_${ctx.user.id}`)
                        }

                        await i1.reply(
                            {
                                content: `**(${emojis.certo}) Lembrete \`desativado\` com sucesso.**`,
                                flags: ["Ephemeral"]
                            }
                        )

                        components[0].components[0].setCustomId("ativar_lembrete").setLabel("Ativar Lembrete").setStyle(ButtonStyle.Success)

                        await msg1.edit(
                            {
                                components
                            }
                        )

                        break
                    }
                }
            }).on("end", async () => await msg1.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))
        }
    }
}