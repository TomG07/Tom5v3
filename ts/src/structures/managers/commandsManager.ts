import { APIApplicationCommand, ApplicationCommandType } from "discord.js";
import Tom5 from "../../classes/Tom5.js";
import CommandOptions from "../interfaces/commandOptions.js";
import fs from "fs"
import Command from "../../classes/Command.js";
import fetch, { BodyInit } from "node-fetch"

export default class CommandsManager {

    client: Tom5
    commands: Map<string, CommandOptions>
    subCommands: Map<string, Map<string, CommandOptions>>
    aliases: Map<string, CommandOptions>

    constructor(client: Tom5) {
        this.client = client
        this.commands = new Map<string, CommandOptions>()
        this.subCommands = new Map<string, Map<string, CommandOptions>>()
        this.aliases = new Map<string, CommandOptions>()
    }

    private async loadCommands() {

        const folders = fs.readdirSync("./js/src/commands")

        for (const folder of folders) {

            const files = fs.readdirSync(`./js/src/commands/${folder}`)

            for (const file of files) {

                if (!file.endsWith(".js")) {
                    
                    const subs = fs.readdirSync(`./js/src/commands/${folder}/${file}`)

                    for (const sub of subs) {

                        const { Comando } = await import(`../../commands/${folder}/${file}/${sub}`)

                        const cmd: Command = new Comando()

                        if (cmd.subCommand) {
                            const cachedSub = this.subCommands.get(cmd.reference)

                            if (!cachedSub) {
                                this.subCommands.set(cmd.reference, new Map<string, CommandOptions>().set(cmd.name, cmd))
                            } else {
                                cachedSub.set(cmd.name, cmd)
                            }
                        }
                    }
                } else {

                    const { Comando } = await import(`../../commands/${folder}/${file}`)

                    const cmd: Command = new Comando()

                    Object.assign(cmd, { type: ApplicationCommandType.ChatInput, "integration_types": [0, 1] })

                    this.commands.set(cmd.name, cmd)

                    if (cmd.aliases && cmd.aliases.length > 0) {
                        for (const alias of cmd.aliases) {
                            this.aliases.set(alias, cmd)
                        }
                    }
                }
            }
        }

        await this.client.application.commands.set(Array.from(this.commands.values()))
    }
    
    async setCommands() {
    
        this.client.log(
            {
                color: "yellow",
                content: "a carregar",
                shardId: this.client.shardId,
                name: "commands"
            }
        )

        await this.loadCommands()

        this.client.log(
            {
                color: "green",
                content: `carregados ${this.commands.size} comandos`,
                shardId: this.client.shardId,
                name: "commands"
            }
        )
    }
}