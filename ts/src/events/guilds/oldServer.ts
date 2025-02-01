import Event from "../../classes/Event.js";
import Tom5 from "../../classes/Tom5.js";
import webhookLog from "../../structures/functions/webhookLog.js";

export class Evento extends Event<"guildDelete"> {

    client: Tom5

    constructor(client: Tom5) {
        super(
            {
                name: "guildDelete"
            }
        )

        this.client = client

        this.execute = async (guild) => {

            await webhookLog(
                {
                    client: this.client,
                    type: "guildLeave",
                    guild: guild
                }
            )
        }
    }

}