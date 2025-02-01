import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, ComponentType, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import Command from "../../classes/Command.js";
import emojis from "../../structures/others/emojis.js";
import colors from "../../structures/others/colors.js";

export class Comando extends Command {

    constructor() {
        super(
            {
                name: "config",
                description: "Configure os meus sistemas no seu servidor",
                aliases: ["configurações", "configs"],
                botPerms: [],
                category: "config",
                devOnly: false,
                reference: "config",
                reparing: false,
                subCommand: null,
                usage: "/config",
                userPerms: [
                    "ManageChannels",
                    "ManageGuild"
                ],
                descriptionLocalizations: {
                    "en-US": "[CONFIG] Set up my systems on your server",
                    "pt-BR": "[CONFIG] Configure os meus sistemas no seu servidor"
                },
                options: []
            }
        )

        this.execute = async ({ client, ctx }) => {

            const t = ctx.t

            const components = [
                new ActionRowBuilder<StringSelectMenuBuilder>()
                .setComponents(
                    new StringSelectMenuBuilder()
                    .setCustomId("menu_config")
                    .setOptions(
                        [
                            {
                                label: t("commands:config:components:menu_config:1.label"),
                                value: "economia",
                                description: t("commands:config:components:menu_config:1.description"),
                                emoji: "<:coin:1264589815609819199>"
                            }
                        ]
                    )
                )
            ]

            const msg1 = await ctx.reply(
                {
                    content: t("commands:config:reply.1", { load: emojis.load }),
                    components: components
                }
            )

            const c1 = msg1.createMessageComponentCollector(
                {
                    componentType: ComponentType.StringSelect,
                    time: 5000, // AQUI -----------------------------------------------------------------------------------
                    // idle: 45000
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

                await i1.deferUpdate()

                switch (i1.values[0]) {

                    case "economia": {

                        const components2 = [
                            new ActionRowBuilder<StringSelectMenuBuilder>()
                            .setComponents(
                                new StringSelectMenuBuilder()
                                .setCustomId("menu_config_economia")
                                .setOptions(
                                    [
                                        {
                                            label: t("commands:config:components:menu_config_economia:1.label"),
                                            value: "logs",
                                            description: t("commands:config:components:menu_config_economia:1.description"),
                                            emoji: "<:icons_fingerprint:1264591316470337639>"
                                        }
                                    ]
                                )
                            )
                        ]

                        const msg2 = await msg1.edit(
                            {
                                content: "",
                                embeds: [
                                    new EmbedBuilder()
                                    .setColor(colors.normal)
                                    .setDescription(t("commands:config:reply.2"))
                                ],
                                components: components2
                            }
                        )

                        c1.stop()

                        const c2 = msg2.createMessageComponentCollector(
                            {
                                componentType: ComponentType.StringSelect,
                                time: 120000,
                                idle: 45000
                            }
                        ).on("collect", async (i2) => {

                            if (i2.user.id !== ctx.user.id) {
                                return await i2.reply(
                                    {
                                        content: `**(${emojis.errado}) Interação disponível apenas para ${ctx.user}!**`,
                                        flags: ["Ephemeral"]
                                    }
                                )
                            }

                            await i2.deferUpdate()

                            switch (i2.values[0]) {

                                case "logs": {

                                    const components3 = [
                                        new ActionRowBuilder<StringSelectMenuBuilder>()
                                        .setComponents(
                                            new StringSelectMenuBuilder()
                                            .setCustomId("config_logs_menu")
                                            .setOptions(
                                                [
                                                    {
                                                        label: t("commands:config:components:config_logs_menu:1.label"),
                                                        value: "ações",
                                                        description: t("commands:config:components:config_logs_menu:1.description"),
                                                        emoji: "<:growth:1264591751168004146>"
                                                    },
                                                    {
                                                        label: t("commands:config:components:config_logs_menu:2.label"),
                                                        value: "rifas_locais",
                                                        description: t("commands:config:components:config_logs_menu:2.description"),
                                                        emoji: "<:awardcup:1264588967240532008>"
                                                    }
                                                ]
                                            )
                                        )
                                    ]

                                    let guildDoc = await client.db.findGuild(
                                        {
                                            _id: ctx.guild.id
                                        }
                                    )

                                    let logsAções = ctx.guild.channels.cache.get(guildDoc.configs.logsAções.channelId)
                                    let logsRifas = ctx.guild.channels.cache.get(guildDoc.configs.logsRifas)

                                    const msg3 = await msg1.edit(
                                        {
                                            content: t("commands:config:reply:3.content", {
                                                load: emojis.load
                                            }),
                                            embeds: [
                                                new EmbedBuilder()
                                                .setColor(colors.normal)
                                                .setDescription(t("commands:config:reply:3.embed", { 
                                                    logsAções: `${logsAções ? `${logsAções} \`${logsAções.id}\`` : `\`Não definido\``}`,
                                                    logsRifas: `${logsRifas ? `${logsRifas} \`${logsRifas.id}\`` : `\`Não definido\``}`
                                                }))
                                            ],
                                            components: components3
                                        }
                                    )

                                    c2.stop()

                                    msg3.createMessageComponentCollector(
                                        {
                                            componentType: ComponentType.StringSelect,
                                            time: 120000,
                                            idle: 45000
                                        }
                                    ).on("collect", async (i3) => {

                                        if (i3.user.id !== ctx.user.id) {
                                            return await i3.reply(
                                                {
                                                    content: `**(${emojis.errado}) Interação disponível apenas para ${ctx.user}!**`,
                                                    flags: ["Ephemeral"]
                                                }
                                            )
                                        }

                                        await i3.deferReply({ flags: ["Ephemeral"] })

                                        switch (i3.values[0]) {

                                            case "ações": {

                                                const msg4 = await i3.editReply(
                                                    {
                                                        content: t("commands:config:reply:4:content.1", {
                                                            load: emojis.load
                                                        }),
                                                        components: [
                                                            new ActionRowBuilder<ChannelSelectMenuBuilder>()
                                                            .setComponents(
                                                                new ChannelSelectMenuBuilder()
                                                                .setCustomId("menu_config_channels")
                                                                .setChannelTypes([ChannelType.GuildText, ChannelType.GuildAnnouncement])
                                                            )
                                                        ]
                                                    }
                                                )

                                                msg4.createMessageComponentCollector(
                                                    {
                                                        componentType: ComponentType.ChannelSelect,
                                                        time: 120000,
                                                        idle: 45000
                                                    }
                                                ).on("collect", async (i4) => {

                                                    await i4.deferUpdate()

                                                    const channel = await i4.guild.channels.fetch(i4.values[0])

                                                    await client.db.updateGuild(
                                                        {
                                                            _id: ctx.guild.id
                                                        },
                                                        {
                                                            $set: {
                                                                "configs.logsAções": channel.id
                                                            }
                                                        }
                                                    )

                                                    guildDoc = await client.db.findGuild(
                                                        {
                                                            _id: ctx.guild.id
                                                        }
                                                    )

                                                    logsAções = ctx.guild.channels.cache.get(guildDoc.configs.logsAções.channelId)
                                                    logsRifas = ctx.guild.channels.cache.get(guildDoc.configs.logsRifas)

                                                    await i3.editReply(
                                                        {
                                                            content: t("commands:config:reply:4:content.2", {
                                                                certo: emojis.certo,
                                                                canal: `${channel} \`${channel.id}\``
                                                            }),
                                                            components: []
                                                        }
                                                    )

                                                    await msg1.edit(
                                                        {
                                                            embeds: [
                                                                new EmbedBuilder()
                                                                .setColor(colors.normal)
                                                                .setDescription(t("commands:config:reply:4.embed", { 
                                                                    logsAções: `${logsAções ? `${logsAções} \`${logsAções.id}\`` : `\`Não definido\``}`,
                                                                    logsRifas: `${logsRifas ? `${logsRifas} \`${logsRifas.id}\`` : `\`Não definido\``}`
                                                                }))
                                                            ],
                                                            components: components3
                                                        }
                                                    )
                                                }).on("end", async () => await msg4.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))

                                                break
                                            }

                                            case "rifas_locais": {

                                                const msg4 = await i3.editReply(
                                                    {
                                                        content: t("commands:config:reply:4:content.1", {
                                                            load: emojis.load
                                                        }),
                                                        components: [
                                                            new ActionRowBuilder<ChannelSelectMenuBuilder>()
                                                            .setComponents(
                                                                new ChannelSelectMenuBuilder()
                                                                .setCustomId("menu_config_channels")
                                                                .setChannelTypes([ChannelType.GuildText, ChannelType.GuildAnnouncement])
                                                            )
                                                        ]
                                                    }
                                                )

                                                msg4.createMessageComponentCollector(
                                                    {
                                                        componentType: ComponentType.ChannelSelect,
                                                        time: 120000,
                                                        idle: 45000
                                                    }
                                                ).on("collect", async (i4) => {

                                                    await i4.deferUpdate()

                                                    const channel = await i4.guild.channels.fetch(i4.values[0])

                                                    await client.db.updateGuild(
                                                        {
                                                            _id: ctx.guild.id
                                                        },
                                                        {
                                                            $set: {
                                                                "configs.logsRifas": channel.id
                                                            }
                                                        }
                                                    )

                                                    guildDoc = await client.db.findGuild(
                                                        {
                                                            _id: ctx.guild.id
                                                        }
                                                    )

                                                    logsAções = ctx.guild.channels.cache.get(guildDoc.configs.logsAções.channelId)
                                                    logsRifas = ctx.guild.channels.cache.get(guildDoc.configs.logsRifas)

                                                    await i3.editReply(
                                                        {
                                                            content: t("commands:config:reply:4:content.2", {
                                                                certo: emojis.certo,
                                                                canal: `${channel} \`${channel.id}\``
                                                            }),
                                                            components: []
                                                        }
                                                    )

                                                    await msg1.edit(
                                                        {
                                                            embeds: [
                                                                new EmbedBuilder()
                                                                .setColor(colors.normal)
                                                                .setDescription(t("commands:config:reply:4.embed", { 
                                                                    logsAções: `${logsAções ? `${logsAções} \`${logsAções.id}\`` : `\`Não definido\``}`,
                                                                    logsRifas: `${logsRifas ? `${logsRifas} \`${logsRifas.id}\`` : `\`Não definido\``}`
                                                                }))
                                                            ],
                                                            components: components3
                                                        }
                                                    )
                                                }).on("end", async () => await msg4.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))

                                                break
                                            }
                                        }
                                    }).on("end", async () => await msg3.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))

                                    break
                                }
                            }
                        }).on("end", async () => await msg2.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))

                        break
                    }
                }
            }).on("end", async (e, r) => {
                if (!["time", "idle"].includes(r)) return
                
                await msg1.edit(
                    { 
                        components: [ 
                            new ActionRowBuilder<ButtonBuilder>(
                                { 
                                    components: [ 
                                        new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) 
                                    ] 
                                }
                            ) 
                        ] 
                    }
                )
            })
        }
    }
}