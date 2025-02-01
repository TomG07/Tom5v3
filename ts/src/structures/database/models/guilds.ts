import { Schema, model } from "mongoose";
import { GuildDocument } from "../../interfaces/guildDocument.js";

const schema = new Schema(
    {
        _id: String,
        prefix: String,
        lang: { type: Number, default: 0 },
        vip: {
            active: { type: Boolean, default: false },
            end: { type: Number, default: 0 },
            type: { type: String, default: false },
        },

        configs: {
            logsAções: {
                channelId: { type: String, default: false },
                messageId: { type: String, default: false },
            },
            logsRifas: { type: String, default: undefined }
        }
    }
)

export default model<GuildDocument>("guilds", schema)