import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import Command from "../../classes/Command.js";
import { Languages } from "../../structures/enums/langsEnum.js";
import emojis from "../../structures/others/emojis.js";
import renderComponents from "../../structures/functions/renderComponents.js";

export class Comando extends Command {

    constructor() {
        super(
            {
                name: "language",
                description: "[CONFIG] Altera o meu idioma",
                aliases: ["lang", "languages"],
                botPerms: [],
                category: "config",
                devOnly: false,
                options: [],
                reference: null,
                reparing: false,
                subCommand: null,
                usage: "/language",
                userPerms: [],
                nameLocalizations: {
                    "pt-BR": "linguagem",
                    "en-US": "language"
                },
                descriptionLocalizations: {
                    "pt-BR": "[CONFIG] Altera o meu idioma",
                    "en-US": "[CONFIG] Change my language"
                }
            }
        )

        this.execute = async ({ client, ctx }) => {

            const msg1 = await ctx.interaction.reply(
                {
                    content: ctx.t("commands:language:reply:1.content", { load: emojis.load }),
                    components: JSON.parse(JSON.stringify(renderComponents(client, "commands:language:reply:1.components")))
                }
            )

            msg1.createMessageComponentCollector(
                {
                    componentType: ComponentType.Button,
                    time: 120000,
                    idle: 45000
                }
            ).on("collect", async (i1) => {

                const type: "servidor" | "pessoal" = i1.customId === "servidor" ? "servidor" : "pessoal"

                if (type === "servidor") {
                    const checkPerms = i1.guild.members.cache.get(i1.user.id).permissions.has("ManageGuild")

                    if (!checkPerms) {
                        return await i1.reply(
                            {
                                content: ctx.t("commands:language:errors.missingPermissions", { errado: emojis.errado }),
                                flags: ["Ephemeral"]
                            }
                        )
                    }
                }

                const msg2 = await i1.update(
                    {
                        content: ctx.t("commands:language:reply:2.content", { load: emojis.load }),
                        components: JSON.parse(JSON.stringify(renderComponents(client, "commands:language:reply:2.components"))),
                        // withResponse: true
                    }
                )

                msg2.createMessageComponentCollector(
                    {
                        componentType: ComponentType.Button,
                        time: 120000,
                        idle: 45000
                    }
                ).on("collect", async (i2) => {

                    const lang = i2.customId

                    const i3 = await i2.deferUpdate({ /*withResponse: true*/ })

                    switch (type) {

                        case "pessoal": {

                            await client.db.updateUser(
                                {
                                    _id: i2.user.id
                                },

                                {
                                    $set: {
                                        "lang": Languages[lang]
                                    }
                                }
                            )

                            await i3.edit(
                                {
                                    content: ctx.t("commands:language:reply.3", { certo: emojis.certo, lng: lang }),
                                    components: []
                                }
                            ).catch(() => {})

                            break
                        }

                        case "servidor": {

                            await client.db.updateGuild(
                                {
                                    _id: i2.guild.id
                                },
                                {
                                    $set: {
                                        "lang": Languages[lang]
                                    }
                                }
                            )

                            await i3.edit(
                                {
                                    content: ctx.t("commands:language:reply.3", { certo: emojis.certo, lng: lang }),
                                    components: []
                                }
                            ).catch(() => {})

                            break
                        }
                    }
                }).on("end", async () => await msg2.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))

            }).on("end", async () => await msg1.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))
        }
    }
}