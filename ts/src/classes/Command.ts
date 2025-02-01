import { ApplicationCommandOptionData, AutocompleteInteraction, LocalizationMap, PermissionFlags } from "discord.js";
import CommandOptions from "../structures/interfaces/commandOptions.js";
import ExecuteOptions from "../structures/interfaces/executeOptions.js";
import Tom5 from "./Tom5.js";

export default class Command {
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

    constructor(opts: CommandOptions) {
        this.name = opts.name
        this.nameLocalizations = opts.nameLocalizations
        this.description = opts.description
        this.descriptionLocalizations = opts.descriptionLocalizations
        this.usage = opts.usage
        this.aliases = opts.aliases
        this.options = opts.options
        this.devOnly = opts.devOnly
        this.userPerms = opts.userPerms
        this.botPerms = opts.botPerms
        this.reference = opts.reference
        this.subCommand = opts.subCommand
        this.category = opts.category
        this.reparing = opts.reparing
        this.userIntegration = opts.userIntegration
        this.cooldown = opts.cooldown
        this.execute = opts.execute
        this.autocomplete = opts.autocomplete
    }
}