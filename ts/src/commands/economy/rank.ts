import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, Message } from "discord.js";
import Command from "../../classes/Command.js";
import colors from "../../structures/others/colors.js";
import emojis from "../../structures/others/emojis.js";
import CommandOptions from "../../structures/interfaces/commandOptions.js";

export class Comando extends Command {

    constructor() {
        super(
            {
                name: "rank",
                description: "Veja o seu rank",
                aliases: ["r", "ld", "leaderboard"],
                botPerms: [],
                category: "economy",
                devOnly: false,
                options: [
                    {
                        name: "tombits",
                        description: "Veja o seu rank de TomBits",
                        type: ApplicationCommandOptionType.Subcommand,
                        descriptionLocalizations: {
                            "pt-BR": "[ECONOMIA] Veja o seu rank de TomBits",
                            "en-US": "[ECONOMY] See your rank of TomBits"
                        }
                    }
                ],
                reference: "rank",
                reparing: false,
                subCommand: false,
                usage: "/rank <option>",
                userPerms: [],
                descriptionLocalizations: {
                    "pt-BR": "[ECONOMIA] Veja o seu rank",
                    "en-US": "[ECONOMY] See your position."
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

                const sub = this.options.filter(o => o.type === ApplicationCommandOptionType.Subcommand).map(o => `\`${o.nameLocalizations ? o.nameLocalizations[client.i18next.language] : o.name}\``)
                
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