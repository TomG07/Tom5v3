import Tom5 from "../../classes/Tom5.js";
import fs from "fs"

export default class EventsManager {

    client: Tom5;
    events: Map<string, object>;

    constructor(client: Tom5) {
        this.client = client
        this.events = new Map<string, object>()
    }

    private async loadEvents() {
        
        const folders = fs.readdirSync("./js/src/events")

        for (const folder of folders) {

            const files = fs.readdirSync(`./js/src/events/${folder}`)

            for (const file of files) {

                const { Evento } = await import(`../../events/${folder}/${file}`).catch(err => {})

                const evt = new Evento(this.client)

                this.events.set(file.replace(".js", ""), evt)
            }
        }
    }

    async setEvents() {

        this.client.log(
            {
                color: "yellow",
                content: "a carregar",
                shardId: this.client.shardId,
                name: "events"
            }
        )

        await this.loadEvents()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.events.forEach((evt: any) => {
            this.client.on(evt.name, async (...args) => await evt.execute(...args))
        })

        this.client.log(
            {
                color: "green",
                content: `carregados ${this.events.size} eventos`,
                shardId: this.client.shardId,
                name: "events"
            }
        )
    }
}