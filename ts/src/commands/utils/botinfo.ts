import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import Command from "../../classes/Command.js";
import colors from "../../structures/others/colors.js";

export class Comando extends Command {

    constructor() {
        super(
            {
                name: "botinfo",
                description: "[ÚTEIS] Vê as minhas informações",
                aliases: ["bi"],
                botPerms: [],
                category: "utils",
                devOnly: false,
                options: [],
                reference: null,
                reparing: false,
                subCommand: null,
                usage: "/botinfo",
                userPerms: [],
                descriptionLocalizations: {
                    "pt-BR": "[ÚTEIS] Vê as minhas informações",
                    "en-US": "[USEFUL] View my information"
                },
                userIntegration: true
            }
        )

        this.execute = async ({ client, ctx }) => {

            const servers = client.guilds.cache.size
            const users = client.guilds.cache.map(guild => guild.memberCount).reduce((a, b) => a + b)
            
            const clientWs = client.ws.ping
            let ws = ""

            if (clientWs < 150) {
                ws = `<:tom5_icons_goodping:1119638423964229694> WebSocket: \`${clientWs}\` ms`
            } else if (clientWs < 400) {
                ws = `<:tom5_icons_idelping:1119638419774132365> WebSocket: \`${clientWs}\` ms`
            } else {
                ws = `<:tom5_icons_badping:1119638367563419729> WebSocket: \`${clientWs}\` ms`
            }

            const uptime = `<t:${~~((Date.now() - client.uptime) / 1000)}:R>`

            const msg = `**<:tom5_icons_serverinsight:1013547577477701744> Informações Básicas**\n> <:tom5_icons_clouddown:1119643920956145814> **Servidores:** \`${servers}\`\n> <:tom5_icons_Person:1119638402325811240> **Usuários:** \`${users.toLocaleString("pt-BR")}\`\n> ${ws}\n> <:tom5_icons_timer:1023251410776768572> **Uptime:** ${uptime}\n> <:tom5_icons_owner:1119638425214132235> **Dono:** ${client.users.cache.get(client.devs[0])}`

            const tomlabsIcon = client.guilds.cache.find(g => g.name.toLowerCase().startsWith("tomlabs")).iconURL({ extension: "png", forceStatic: true, size: 4096 })

            await ctx.reply(
                {
                    embeds: [
                        new EmbedBuilder()
                        .setColor(colors.normal)
                        .setDescription(msg)
                        .setThumbnail(client.user.avatarURL())
                        .setFooter(
                            {
                                text: `Projetado por: TomLabs`,
                                iconURL: tomlabsIcon
                            }
                        )
                    ],
                    components: [
                        new ActionRowBuilder<ButtonBuilder>().addComponents(
                            new ButtonBuilder()
                            .setLabel(ctx.t("events:message:clientMention:reply:buttons:0.label"))
                            .setEmoji({ animated: false, id: '1119638417001685062', name: 'tom5_icons_link' })
                            .setStyle(ButtonStyle.Link)
                            .setURL(`https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=3300683246647&scope=bot+applications.commands`),
    
                            new ButtonBuilder()
                            .setLabel(ctx.t("events:message:clientMention:reply:buttons:1.label"))
                            .setEmoji({ animated: false, id: "1023251390602162227", name: "tom5_icons_message" })
                            .setStyle(ButtonStyle.Link)
                            .setURL('https://discord.gg/tbsZVq5WEx')
                        )
                    ]
                }
            )
        }
    }
}