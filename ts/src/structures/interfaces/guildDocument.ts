import { Document } from "mongoose"

export interface GuildDocument extends Document<string> {
    prefix: string,
    lang: number,
    vip: {
        active: boolean,
        end: number,
        type: "bronze" | "ouro" | "diamante"
    },
    configs: {
        logsAções: {
            channelId: string,
            messageId: string
        },
        logsRifas: string
    }
}