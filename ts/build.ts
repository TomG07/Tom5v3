import * as dotenv from "dotenv"
import LogsManager from "./src/structures/managers/logsManager.js"
import { ShardingManager } from "discord.js"

dotenv.config({ path: "variables.env" })

const log = new LogsManager().create

new class extends ShardingManager {

    constructor() {
        super(
            "js/main.js",
            {
                totalShards: "auto",
                respawn: true,
                mode: "process",
                token: process.env.ENVIRONMENT === "run" ? process.env.DISCORD_TOKEN : process.env.DISCORD_TOKEN_CANARY
            }
        )

        this.on("shardCreate", (shard) => {
            
            log(
                {
                    color: "green",
                    content: "Criada",
                    shardId: shard.id + 1
                }
            )

            shard.once("ready", () => {

                log(
                    {
                        color: "green",
                        content: "Iniciada",
                        shardId: shard.id + 1,
                    }
                )
            })

            shard.on("error", (error) => {
                log(
                    {
                        color: "red",
                        content: "erro Capturado",
                        shardId: shard.id + 1,
                        aditional: `${error.stack}`
                    }
                )
            })
        })
        
        this.spawn(
            {
                timeout: 60000,
            }
        )
    }
}