import Tom5 from "../../classes/Tom5.js";
import CommandContext from "../classes/commandContext.js";

export default interface ExecuteOptions {
    client: Tom5,
    ctx: CommandContext
}