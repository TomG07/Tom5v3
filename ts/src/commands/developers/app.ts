import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, Message } from "discord.js";
import Command from "../../classes/Command.js";
import CommandOptions from "../../structures/interfaces/commandOptions.js";
import emojis from "../../structures/others/emojis.js";
import colors from "../../structures/others/colors.js";

export class Comando extends Command {

    constructor() {
        super(
            {
                name: "app",
                description: "[DEVELOPERS]",
                aliases: [],
                options: [
                    {
                        name: "edit",
                        description: "[DESENVOLVEDORES] Edite a aplicação",
                        type: ApplicationCommandOptionType.Subcommand,
                        nameLocalizations: {
                            "pt-BR": "editar",
                            "en-US": "edit"
                        },
                        descriptionLocalizations: {
                            "pt-BR": "[DESENVOLVEDORES] Edite a aplicação",
                            "en-US": "[DEVELOPERS] Edit application"
                        },
                    }
                ],
                devOnly: true,
                usage: "/app <option>",
                botPerms: [],
                reference: "app",
                subCommand: null,
                userPerms: [],
                category: "developers",
                reparing: false,
                userIntegration: true,
                descriptionLocalizations: {
                    "pt-BR": "[DESENVOLVEDORES]",
                    "en-US": "[DEVELOPERS]"
                }
            }
        )
        
        this.execute = async ({ client, ctx }) => {

            let sub: CommandOptions;

            if (!this.reference) return

            if (ctx.interaction instanceof Message && ctx.args.length > 0) {

                const subVerification = client.utils.subcommands.get(this.reference)

                if (!subVerification) return

                for (const subCommand of subVerification.entries()) {

                    const subOptions = subCommand[1]

                    if (
                        subOptions.name.toLowerCase() === ctx.args[0].toLowerCase() ||
                        subOptions.aliases.includes(ctx.args[0].toLowerCase())
                    ) {
                        sub = subOptions

                        break
                    }

                    if (sub) break
                }
            } else if (ctx.interaction instanceof ChatInputCommandInteraction) {

                const subVerification = client.utils.subcommands.get(this.reference)

                if (!subVerification) return

                for (const subCommand of subVerification.entries()) {

                    const subOptions = subCommand[1]

                    const subName = ctx.interaction.options.getSubcommand()

                    if (subOptions.name === subName) {
                        sub = subOptions

                        break
                    }
                }
            }

            if (sub?.execute) {
                return await sub.execute({ client, ctx })
            } else {

                const sub = this.options.filter(o => o.type === ApplicationCommandOptionType.Subcommand).map(o => `\`${o.name}\``)
                
                return ctx.reply(
                    {
                        embeds: [
                            new EmbedBuilder()
                            .setColor(colors.errado)
                            .setDescription(`**(${emojis.errado}) Use um dos seguintes sub-comandos: ${sub.join(`/`)}**`)
                        ]
                    }
                )
            }
        }
    }
}