import ScheduleJob from "../../classes/ScheduleJob.js";
import Tom5 from "../../classes/Tom5.js";
import fs from "fs"
import emojis from "../others/emojis.js";

export default class ScheduleManager {

    client: Tom5
    scheduleEvents: Map<string, ScheduleJob>
    cachedEvents: Map<string, ScheduleJob>

    constructor(client: Tom5) {
        this.client = client
        this.scheduleEvents = new Map<string, ScheduleJob>()
        this.cachedEvents = new Map<string, ScheduleJob>()
    }

    private async loadSchedule() {

        const files = fs.readdirSync("./js/src/structures/schedules")

        for (const file of files) {

            const { default: Job } = await import(`../schedules/${file}`).catch(() => {})

            const job = new Job(this.client)

            this.scheduleEvents.set(file.replace(".js", ""), job)
        }

        const usersRemembers = await this.client.db.findManyUsers(
            {
                $or: [
                    {
                        "remembers.daily": true
                    }
                ]
            }
        )

        for (const userDoc of usersRemembers) {
            if (userDoc.remembers.daily) {
                const dailyRememberDate = new Date(userDoc.economia.daily.proximo as number)

                const job = new ScheduleJob(dailyRememberDate, async () => {

                    const user = await this.client.users.fetch(userDoc._id as string)

                    const userDocAtual = await this.client.db.findUser(
                        {
                            _id: user.id
                        }
                    )

                    if (!userDocAtual.remembers.daily) {
                        if (this.cachedEvents.has(`daily_${user.id}`)) {
                            this.cachedEvents.get(`daily_${user.id}`).cancel()
                            this.cachedEvents.delete(`daily_${user.id}`)

                            return
                        }

                        return
                    }

                    const userChannel = await user.createDM(true)
                    
                    await userChannel.send(
                        {
                            content: `**(${emojis.certo}) Já podes resgatar o teu daily novamente!**`
                        }
                    ).catch(() => {})

                })
                
                this.cachedEvents.set(`daily_${userDoc._id}`, job)
                
                job.start()
            }
        }

        this.scheduleEvents.forEach(schedule => schedule.start())
    }

    async setSchedule() {
        this.client.log(
            {
                color: "yellow",
                content: "a carregar",
                shardId: this.client.shardId,
                name: "schedule"
            }
        )

        await this.loadSchedule()

        this.client.log(
            {
                color: "green",
                content: "carregados",
                shardId: this.client.shardId,
                name: "schedule"
            }
        )
    }
}