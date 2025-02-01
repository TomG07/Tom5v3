import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, Message } from "discord.js";
import Command from "../../classes/Command.js";
import CommandOptions from "../../structures/interfaces/commandOptions.js";
import emojis from "../../structures/others/emojis.js";
import colors from "../../structures/others/colors.js";

export class Comando extends Command {

    constructor() {
        super(
            {
                name: "rifa",
                nameLocalizations: {
                    "en-US": "raffle",
                    "pt-BR": "rifa"
                },
                aliases: ["raffle", "rifas"],
                botPerms: [],
                category: "economy",
                description: "Entra na aposta com várias pessoas e vence!",
                devOnly: false,
                reference: "rifa",
                reparing: false,
                subCommand: null,
                usage: "/rifa <option>",
                userPerms: [],
                options: [
                    {
                        name: "criar",
                        description: "Crie uma rifa",
                        type: ApplicationCommandOptionType.Subcommand,
                        nameLocalizations: {
                            "pt-BR": "criar",
                            "en-US": "create"
                        },
                        descriptionLocalizations: {
                            "pt-BR": "[ECONOMIA] Cria uma rifa",
                            "en-US": "[ECONOMY] Create a raffle"
                        }
                    },
                    {
                        name: "estado",
                        description: "Veja o estado de uma rifa",
                        type: ApplicationCommandOptionType.Subcommand,
                        options: [
                            {
                                name: "id",
                                description: "ID da rifa que pretende consultar",
                                type: ApplicationCommandOptionType.String,
                                required: true,
                                descriptionLocalizations: {
                                    "pt-BR": "ID da rifa que pretende consultar",
                                    "en-US": "Raffle ID you want to check"
                                },
                                autocomplete: true
                            }
                        ],
                        nameLocalizations: {
                            "pt-BR": "estado",
                            "en-US": "status"
                        },
                        descriptionLocalizations: {
                            "pt-BR": "[ECONOMIA] Vê o estado de uma rifa",
                            "en-US": "[ECONOMY] See the status of a raffle"
                        }
                    },
                    {
                        name: "comprar",
                        description: "Compre tickets para aderir a uma rifa",
                        type: ApplicationCommandOptionType.Subcommand,
                        options: [
                            {
                                name: "quantidade",
                                description: "Indique a quantidade de tickets que deseja comprar",
                                type: ApplicationCommandOptionType.String,
                                required: true,
                                nameLocalizations: {
                                    "pt-BR": "quantidade",
                                    "en-US": "quantity"
                                },
                                descriptionLocalizations: {
                                    "pt-BR": "Indique a quantidade de tickets que deseja comprar",
                                    "en-US": "Indicate the quantity of tickets you wish to purchase."
                                }
                            }
                        ],
                        nameLocalizations: {
                            "pt-BR": "comprar",
                            "en-US": "buy"
                        },
                        descriptionLocalizations: {
                            "pt-BR": "[ECONOMIA] Compre tickets para aderir a uma rifa",
                            "en-US": "[ECONOMY] Buy tickets to join a raffle."
                        }
                    },
                    {
                        name: "entrar",
                        description: "Entre numa rifa com os seus tickets",
                        type: ApplicationCommandOptionType.Subcommand,
                        options: [
                            {
                                name: "id",
                                description: "ID da rifa que deseja entrar",
                                type: ApplicationCommandOptionType.String,
                                autocomplete: true,
                                required: true,
                                descriptionLocalizations: {
                                    "pt-BR": "ID da rifa que deseja entrar",
                                    "en-US": "ID of the raffle you wish to enter."
                                }
                            },
                            {
                                name: "quantidade",
                                description: "Quantidae de tickets que deseja apostar",
                                type: ApplicationCommandOptionType.Number,
                                required: true,
                                nameLocalizations: {
                                    "pt-BR": "quantidade",
                                    "en-US": "quantity"
                                },
                                descriptionLocalizations: {
                                    "pt-BR": "Indique a quantidade de tickets que deseja apostar",
                                    "en-US": "Indicate the quantity of tickets you wish to bet."
                                }
                            }
                        ],
                        nameLocalizations: {
                            "pt-BR": "entrar",
                            "en-US": "join"
                        },
                        descriptionLocalizations: {
                            "pt-BR": "[ECONOMIA] Entre numa rifa com os seus tickets",
                            "en-US": "[ECONOMY] Join a raffle with your tickets"
                        }
                    },
                    {
                        name: "procurar",
                        description: "Procure rifas globais ou locais para apostar!",
                        type: ApplicationCommandOptionType.Subcommand,
                        options: [],
                        nameLocalizations: {
                            "pt-BR": "procurar",
                            "en-US": "search"
                        },
                        descriptionLocalizations: {
                            "pt-BR": "[ECONOMIA] Procura por rifas e aposta nelas",
                            "en-US": "[ECONOMY] Search for global or local raffles to bet"
                        }
                    }
                ],
                userIntegration: true
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

                const sub = this.options.filter(o => o.type === ApplicationCommandOptionType.Subcommand).map(o => `\`${o.nameLocalizations[client.i18next.language]}\``)
                
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