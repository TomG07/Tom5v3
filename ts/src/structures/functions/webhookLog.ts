import { ChannelType, EmbedBuilder, Message, MessagePayload, Webhook, WebhookClient, WebhookMessageCreateOptions } from "discord.js";
import WebhookLogOptions from "../interfaces/webhookLogsOptions.js";
import colors from "../others/colors.js";

export default async function webhookLog(opt: WebhookLogOptions) {

    const client = opt.client
    const interaction = opt.interaction
    const type = opt.type
    const guild = opt.guild

    const logsChannelId = await client.db.findClient(
        {
            _id: client.user.id
        },
        true
    ).then(doc => doc.logsChannel)

    const logsChannel = await client.channels.fetch(logsChannelId) 

    if (logsChannel.type !== ChannelType.GuildText) return

    const webhook = new WebhookClient({ url: "https://ptb.discord.com/api/webhooks/1272980068397875210/dOf8W6N6D-Fw0Io3rnRho_I8Iy0-kOjFLdcAjR4Rj1LE6bXqAGijC7EsiMCuppD2iGxR" })
    
    switch (type) {

        case "interaction": {
            
            let data: string | MessagePayload | WebhookMessageCreateOptions
        
            if (interaction instanceof Message) {
                const cmd =  `\`${interaction.content}\``
                const user = interaction.author

                const fields = [
                    {
                        name: "Comando",
                        value: `\`${cmd}\``,
                        inline: false
                    },
                    {
                        name: "Usuário",
                        value: `${user} - [\`${user.id}\`]`,
                        inline: false
                    }
                ]

                if (interaction.guild) {
                    fields.push(
                        {
                            name: "Servidor",
                            value: `\`${interaction.guild.name}\` - ${await interaction.guild.fetchOwner()} [\`${(await interaction.guild.fetchOwner()).id}\`]`,
                            inline: false
                        },
                    )
                }

                if (interaction.channel) {
                    fields.push(
                        {
                            name: "Mensagem",
                            value: `${interaction.url} [\`${interaction.id}\`] - ${interaction.channel} - [\`${interaction.channel.id}\`]`,
                            inline: false
                        }
                    )
                }
                
                data = {
                    embeds: [
                        new EmbedBuilder()
                        .setColor(colors.normal)
                        .setFields(fields)
                    ]
                }
                
            } else {

                const cmd = `</${interaction.commandName}:${interaction.commandId}>`
                const user = interaction.user

                const fields = [
                    {
                        name: "Comando",
                        value: `${cmd}`,
                        inline: false
                    },
                    {
                        name: "Usuário",
                        value: `${user} - [\`${user.id}\`]`,
                        inline: false
                    }
                ]

                if (interaction.guild) {
                    fields.push(
                        {
                            name: "Servidor",
                            value: `\`${interaction.guild.name}\` - ${await interaction.guild.fetchOwner()} [\`${(await interaction.guild.fetchOwner()).id}\`]`,
                            inline: false
                        },
                    )
                }

                if (interaction.channel) {
                    fields.push(
                        {
                            name: "Mensagem",
                            value: `Sem URL [\`${interaction.id}\`] - ${interaction.channel} - [\`${interaction.channel.id}\`]`,
                            inline: false
                        }
                    )
                }
                
                data = {
                    embeds: [
                        new EmbedBuilder()
                        .setColor(colors.normal)
                        .setFields(fields)
                    ]
                }
            }        
        
            webhook.send(data)

            break
        }

        case "guildJoin": {

            const name = guild.name
            const owner = await guild.fetchOwner()
            const membersCount = guild.memberCount
            const icon = guild.iconURL()
            const id = guild.id

            const data = {
                content: "Servidor Adicionado",
                embeds: [
                    new EmbedBuilder()
                    .setColor(colors.normal)
                    .setFields(
                        {
                            name: "Nome / ID",
                            value: `${name} / \`${id}\``,
                            inline: false
                        },
                        {
                            name: "Membros",
                            value: `\`${membersCount}\``,
                            inline: false
                        },
                        {
                            name: "Dono",
                            value: `${owner} - [\`${owner.id}\`]`,
                            inline: false
                        }
                    )
                    .setThumbnail(icon)
                ]
        
            }
        
            webhook.send(data)

            break

        }

        case "guildLeave": {

            const name = guild.name
            const owner = await guild.fetchOwner()
            const membersCount = guild.memberCount
            const icon = guild.iconURL()
            const id = guild.id

            const data = {
                content: "Servidor Removido",
                embeds: [
                    new EmbedBuilder()
                    .setColor(colors.normal)
                    .setFields(
                        {
                            name: "Nome / ID",
                            value: `${name} / \`${id}\``,
                            inline: false
                        },
                        {
                            name: "Membros",
                            value: `\`${membersCount}\``,
                            inline: false
                        },
                        {
                            name: "Dono",
                            value: `${owner} - [\`${owner.id}\`]`,
                            inline: false
                        }
                    )
                    .setThumbnail(icon)
                ]
        
            }
        
            webhook.send(data)

            break
        }
    }
}