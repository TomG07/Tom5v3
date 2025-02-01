import { ChatInputCommandInteraction, Guild, Message } from "discord.js";
import Tom5 from "../../classes/Tom5";

export default interface WebhookLogOptions {
    client: Tom5
    interaction?: Message | ChatInputCommandInteraction,
    type: "interaction" | "guildJoin" | "guildLeave"
    guild?: Guild
}