import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, Message } from "discord.js";
import Command from "../../classes/Command.js";
import CommandOptions from "../../structures/interfaces/commandOptions.js";
import colors from "../../structures/others/colors.js";
import emojis from "../../structures/others/emojis.js";

export class Comando extends Command {

    constructor() {
        super(
            {
                name: "vip",
                description: "Informações sobre o VIP.",
                aliases: [],
                botPerms: [],
                category: "utils",
                devOnly: false,
                reference: "vip",
                reparing: false,
                subCommand: false,
                usage: "/vip <subCommand>",
                userPerms: [],
                descriptionLocalizations: {
                    "en-US": "[UTILS] VIP Infos",
                    "pt-BR": "[ÚTEIS] Informações sobre o VIP"
                },
                options: [
                    {
                        name: "usuário",
                        description: "Informações de VIP para usuários",
                        type: ApplicationCommandOptionType.Subcommand,
                        nameLocalizations: {
                            "pt-BR": "usuário",
                            "en-US": "user"
                        },
                        descriptionLocalizations: {
                            "pt-BR": "[ÚTEIS] Informações de VIP para usuários",
                            "en-US": "[UTILS] User's VIP informations"
                        }
                    },
                    {
                        name: "servidor",
                        description: "Informações de VIP para servidores",
                        type: ApplicationCommandOptionType.Subcommand,
                        nameLocalizations: {
                            "pt-BR": "servidor",
                            "en-US": "server"
                        },
                        descriptionLocalizations: {
                            "pt-BR": "[ÚTEIS] Informações de VIP para servidores",
                            "en-US": "[UTILS] Server's VIP informations"
                        }
                    },
                    {
                        name: "info",
                        description: "Veja as informações do seu VIP/do servidor",
                        type: ApplicationCommandOptionType.Subcommand,
                        nameLocalizations: {
                            "pt-BR": "info",
                            "en-US": "info"
                        },
                        descriptionLocalizations: {
                            "pt-BR": "[ÚTEIS] Veja as informações do seu VIP/do servidor",
                            "en-US": "[UTILS] Get your/server's VIP information"
                        },
                        options: [
                            {
                                name: "type",
                                description: "Tipo de informações",
                                type: ApplicationCommandOptionType.String,
                                choices: [
                                    {
                                        name: "Pessoal",
                                        value: "personal",
                                        nameLocalizations: {
                                            "pt-BR": "Pessoal",
                                            "en-US": "personal"
                                        }
                                    },
                                    {
                                        name: "Servidor",
                                        value: "server",
                                        nameLocalizations: {
                                            "pt-BR": "Servidor",
                                            "en-US": "Server"
                                        }
                                    }
                                ],
                                required: true
                            },
                            {
                                name: "user",
                                description: "Usuário para ver as informações",
                                type: ApplicationCommandOptionType.User,
                                nameLocalizations: {
                                    "pt-BR": "usuário",
                                    "en-US": "user"
                                },
                                descriptionLocalizations: {
                                    "pt-BR": "Usuário para ver as informações",
                                    "en-US": "User target"
                                },
                                required: false
                            }
                        ]
                    }
                ]
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