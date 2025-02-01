import chalk from "chalk";
import LogsManagerInterface from "../interfaces/logsManagerInterface.js";
import capitalize from "../functions/capitalize.js";

export default class LogsManager{

    create(opt: LogsManagerInterface) {
        const name = opt.name
        const color = opt.color
        const shard = opt.shardId
        const content = opt.content
        const add = opt.aditional

        let msg =  ""

        msg += `${chalk.bold.grey(`SHARD ${shard}`)}`

        if (name) {
            msg += ` ${chalk.bold[color](`[${name.toUpperCase()}]`)}`
        }

        msg += ` ${capitalize(content)}`

        if (add) {
            msg += `\nAdicional: \n${add}`
        }

        console.log(msg)
    }
}