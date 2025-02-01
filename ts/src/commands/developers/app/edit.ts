import { ActionRowBuilder, ActivityType, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, ComponentType, EmbedBuilder, ModalBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import Command from "../../../classes/Command.js";
import emojis from "../../../structures/others/emojis.js";
import colors from "../../../structures/others/colors.js";

export class Comando extends Command {

    constructor() {
        super(
            {
                name: "edit",
                description: "Edite a aplicação",
                aliases: ["e"],
                options: [],
                devOnly: true,
                usage: "/app edit",
                botPerms: [],
                reference: "app",
                subCommand: true,
                userPerms: [],
                category: "developers",
                reparing: false,
                nameLocalizations: {
                    "pt-BR": "editar",
                    "en-US": "edit"
                },
                descriptionLocalizations: {
                    "pt-BR": "[DESENVOLVEDORES] Edite a aplicação",
                    "en-US": "[DEVELOPERS] Edit application"
                },
            }
        )
        
        this.execute = async ({ client, ctx }) => {

            const components1 = [
                new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(
                    new StringSelectMenuBuilder()
                    .setCustomId("menu1")
                    .setPlaceholder("Selecionar Opção")
                    .setOptions(
                        new StringSelectMenuOptionBuilder()
                        .setLabel("Avatar")
                        .setValue("avatar"),

                        new StringSelectMenuOptionBuilder()
                        .setLabel("Status")
                        .setValue("status"),

                        new StringSelectMenuOptionBuilder()
                        .setLabel("Canal de logs")
                        .setValue("logs")
                    )
                )
            ]

            const reply1 = await ctx.reply(
                {
                    embeds: [
                        new EmbedBuilder()
                        .setColor(colors.normal)
                        .setDescription(`**> Para editar a aplicação, use o menu abaixo para realizar as alterações**`)
                    ],
                    components: components1
                }
            )

            const collector1 = reply1.createMessageComponentCollector(
                {
                    componentType: ComponentType.StringSelect,
                    time: 120000,
                    idle: 45000
                }
            )

            collector1.on("collect", async (i1) => {

                if (i1.user.id !== ctx.user.id) {
                    return await i1.reply(
                        {
                            content: `**(${emojis.errado}) Interação disponível apenas para ${ctx.user}!**`,
                            flags: ["Ephemeral"]
                        }
                    )
                }

                const value = i1.values[0]

                switch (value) {
                    case "avatar": {

                        await i1.showModal(
                            new ModalBuilder()
                            .setCustomId("modalAvatar")
                            .setTitle("Alteração de avatar")
                            .setComponents(
                                new ActionRowBuilder<TextInputBuilder>()
                                .setComponents(
                                    new TextInputBuilder()
                                    .setCustomId("avatarUrl")
                                    .setLabel("Avatar URL")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                                )
                            )
                        )

                        const i2 = await i1.awaitModalSubmit(
                            {
                                time: 120000,
                                idle: 45000,
                                filter: (u) => u.user.id === i1.user.id
                            }
                        )

                        const avatarUrl = i2.fields.getTextInputValue("avatarUrl")

                        await client.user.setAvatar(avatarUrl).catch(async () => {

                            await i2.deferUpdate()

                            await i1.followUp(
                                {
                                    embeds: [
                                        new EmbedBuilder()
                                        .setColor(colors.errado)
                                        .setDescription(`**${emojis.errado} Erro ao alterar o avatar**`)
                                    ],
                                    components: [],
                                    flags: ["Ephemeral"]
                                }
                            )
                        })

                        await i2.deferUpdate()

                        await i1.reply(
                            {
                                embeds: [
                                    new EmbedBuilder()
                                    .setColor(colors.certo)
                                    .setDescription(`**${emojis.certo} Avatar alterado com sucesso**`)
                                ],
                                components: [],
                                flags: ["Ephemeral"]
                            }
                        )

                        break
                    }

                    case "status": {

                        await i1.showModal(
                            new ModalBuilder()
                            .setCustomId("modalStatus")
                            .setTitle("Alteração de status")
                            .setComponents(
                                new ActionRowBuilder<TextInputBuilder>()
                                .setComponents(
                                    new TextInputBuilder()
                                    .setCustomId("status")
                                    .setLabel("Novo status")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                                )
                            )
                        )

                        const i2 = await i1.awaitModalSubmit(
                            {
                                time: 120000,
                                idle: 45000,
                                filter: (u) => u.user.id === i1.user.id
                            }
                        )

                        const status = i2.fields.getTextInputValue("status")

                        client.user.setActivity(
                            {
                                name: "Status",
                                state: status,
                                type: ActivityType.Custom
                            }
                        )

                        await i2.deferUpdate()

                        await i1.reply(
                            {
                                embeds: [
                                    new EmbedBuilder()
                                    .setColor(colors.certo)
                                    .setDescription(`**${emojis.certo} Status alterado com sucesso**`)
                                ],
                                components: [],
                                flags: ["Ephemeral"]
                            }
                        )

                        break
                    }

                    case "logs": {

                        const i2 = await i1.reply(
                            {
                                embeds: [
                                    new EmbedBuilder()
                                    .setColor(colors.normal)
                                    .setDescription(`**> Selecione o canal no menu abaixo**`)
                                ],
                                components: [
                                    new ActionRowBuilder<ChannelSelectMenuBuilder>()
                                    .setComponents(
                                        new ChannelSelectMenuBuilder()
                                        .setCustomId("channelMenu")
                                        .setChannelTypes(ChannelType.GuildText)
                                        .setPlaceholder('Selecione o canal')
                                        .setMaxValues(1)
                                    )
                                ],
                                flags: ["Ephemeral"],
                                // withResponse: true
                            }
                        )

                        const collector2 = i2.createMessageComponentCollector(
                            {
                                componentType: ComponentType.ChannelSelect,
                                time: 120000,
                                idle: 45000
                            }
                        )

                        collector2.on("collect", async (i3) => {

                            if (i3.user.id !== ctx.user.id) {
                                return await i3.reply(
                                    {
                                        content: `**(${emojis.errado}) Interação disponível apenas para ${ctx.user}!**`,
                                        flags: ["Ephemeral"]
                                    }
                                )
                            }

                            await i3.deferUpdate()

                            const channelId = i3.values[0]
                            
                            await client.db.findClient(
                                {
                                    _id: client.user.id
                                },
                                true
                            )

                            await client.db.updateClient(
                                {
                                    _id: client.user.id
                                },
                                {
                                    $set: {
                                        "logsChannel": channelId
                                    }
                                }
                            )

                            await client.db.updateClient(
                                {
                                    _id: client.user.id
                                },
                                {
                                    $set: {
                                        "logsChannel": channelId
                                    }
                                }
                            )

                            await i3.editReply(
                                {
                                    embeds: [
                                        new EmbedBuilder()
                                        .setColor(colors.certo)
                                        .setDescription(`**${emojis.certo} Canal de logs alterado com sucesso**`)
                                    ],
                                    components: []
                                }
                            )
                        }).on("end", async () => await i2.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))

                        break
                    }
                }
            }).on("end", async () => await reply1.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))
        }
    }
}