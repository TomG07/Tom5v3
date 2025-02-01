import { ApplicationCommandAttachmentOption, ApplicationCommandAutocompleteNumericOption, ApplicationCommandAutocompleteStringOption, ApplicationCommandBooleanOption, ApplicationCommandChannelOption, ApplicationCommandMentionableOption, ApplicationCommandNumericOption, ApplicationCommandOptionType, ApplicationCommandRoleOption, ApplicationCommandStringOption, ApplicationCommandUserOption } from "discord.js";
import Command from "../../classes/Command.js";
import Event from "../../classes/Event.js";
import Tom5 from "../../classes/Tom5.js";

export class Evento extends Event<"interactionCreate"> {

    client: Tom5

    constructor(client: Tom5) {
        super(
            {
                name: "interactionCreate"
            }
        )

        this.client = client
        
        this.execute = async (interaction) => {

            if (!interaction.isAutocomplete()) return

            // eslint-disable-next-line prefer-const
            let comando = this.client.utils.commands.get(interaction.commandName)

            const focusedOption = interaction.options.getFocused(true)
            let filteredOption: unknown;

            for (const option of comando.options) {
                if (option.type === ApplicationCommandOptionType.Subcommand && option.name === interaction.options.getSubcommand()) {
                    
                    filteredOption = option.options.filter(o => o.name === focusedOption.name)[0]

                    if (filteredOption) {
                        comando = this.client.utils.subcommands.get(interaction.commandName).get(interaction.options.getSubcommand())

                        break
                    }
                }
            }

            if (!comando.autocomplete) {
                return await interaction.respond(
                    [
                        {
                            name: "Impossível Auto-Completar",
                            value: "1"
                        }
                    ]
                )
            }

            try {
                await comando.autocomplete(client, interaction)
            } catch (err) {
                console.log(err)

                return await interaction.respond(
                    [
                        {
                            name: "Erro ao Auto-Completar",
                            value: "1"
                        }
                    ]
                )
            }
        }
    }
}