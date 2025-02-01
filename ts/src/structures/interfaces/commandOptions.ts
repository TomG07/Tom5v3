import { ApplicationCommandOptionData, AutocompleteInteraction, LocalizationMap, PermissionFlags } from "discord.js"
import ExecuteOptions from "./executeOptions.js"
import Tom5 from "../../classes/Tom5.js"

export default interface CommandOptions {
    name: string
    nameLocalizations?: LocalizationMap
    description: string
    descriptionLocalizations?: LocalizationMap
    usage: string
    aliases: string[] | null
    options: ApplicationCommandOptionData[] | null
    devOnly: false | boolean
    userPerms: Array<keyof PermissionFlags> | null
    botPerms: Array<keyof PermissionFlags> | null
    reference: null | string
    subCommand: null | boolean
    category: string
    reparing: false | boolean
    userIntegration?: true | boolean
    cooldown?: number
    execute?: (opt: ExecuteOptions) => unknown
    autocomplete?: (client: Tom5, interaction: AutocompleteInteraction) => unknown
}