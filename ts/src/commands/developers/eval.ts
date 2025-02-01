import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType } from "discord.js";
import Command from "../../classes/Command.js";
import { inspect } from "util"
import emojis from "../../structures/others/emojis.js";

export class Comando extends Command {

    constructor() {
        super(
            {
                name: "eval",
                description: ".",
                aliases: ["e"],
                options: [
                    {
                        name: "code",
                        description: ".",
                        type: ApplicationCommandOptionType.String,
                        required: true
                    }
                ],
                devOnly: true,
                usage: "/eval <code>",
                botPerms: [],
                reference: null,
                subCommand: null,
                userPerms: [],
                category: "developers",
                reparing: false,
                userIntegration: true,
                descriptionLocalizations: {
                    "en-US": "[DEVELOPERS] Run a script on my terminal",
                    "pt-BR": "[DESENVOLVEDORES] Execute um comando no meu terminal"
                }
            }
        )
        
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.execute = async ({ client, ctx }) => {

            let code: string

            if (ctx.interaction instanceof ChatInputCommandInteraction) {
                code = ctx.interaction.options.getString("code", true)
            } else {
                code = ctx.args.join(` `)
            }

            try {
                code = await eval(code)

                if (typeof code !== "string") {
                    code = inspect(code, { depth: 0 })
                }
            } catch (err) {
                code = err.stack
            }

            const components = [
                new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId("del_eval")
                    .setEmoji(emojis.errado)
                    .setStyle(ButtonStyle.Secondary)
                )
            ]

            const msg = await ctx.reply(
                {
                    content: `\`\`\`js\n${code}\`\`\``,
                    components
                }
            )

            msg.createMessageComponentCollector(
                {
                    time: 120000,
                    idle: 45000,
                    componentType: ComponentType.Button
                }
            ).on("collect", async (i) => {

                if (i.user.id !== ctx.user.id) {
                    return await i.reply(
                        {
                            content: `**(${emojis.errado}) Interação disponível apenas para ${ctx.user}!**`,
                            flags: ["Ephemeral"]
                        }
                    )
                }

                if (i.customId !== "del_eval") return

                await i.deferUpdate({ withResponse: true })
                await i.deleteReply().catch(() => {})

                await ctx.delete().catch(() => {})

            }).on("end", async () => await msg.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))
        }
    }
}