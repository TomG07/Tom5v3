import { ChannelType } from "discord.js";
import Event from "../../classes/Event.js";
import Tom5 from "../../classes/Tom5.js";
import emojis from "../../structures/others/emojis.js";

export class Evento extends Event<"messageCreate"> {
    client: Tom5;

    constructor(client: Tom5) {
        super(
            {
                name: "messageCreate"
            }
        )
        this.client = client
        this.execute = async (message) => {
            
            if (![ChannelType.GuildText, ChannelType.DM].includes(message.channel.type)) return
            if (!message.content) return
            if (message.author.bot) return

            // ALTERAR DEPOIS
            const serverSuporte = this.client.guilds.cache.get("1133531362419281940")

            switch (message.channel.type) {
                case ChannelType.DM: {

                    const canalSuporte = serverSuporte.channels.cache.find(c => c.type === ChannelType.GuildText && c.name.includes(`${message.author.username}`) && c.topic === `${message.author.id}`)

                    if (canalSuporte?.type !== ChannelType.GuildText) return

                    await canalSuporte.send(`**${message.author.username}:** ${message.content}`)
                    await message.react(emojis.certo)

                    break
                }

                case ChannelType.GuildText: {

                    const tickets = await this.client.db.findClient(
                        {
                            _id: this.client.user.id
                        },
                        true
                    ).then(doc => doc.tickets?.size > 0 ? doc.tickets : new Map())

                    if (
                        message.channel.topic &&
                        tickets.size > 0 &&
                        tickets.has(message.channel.id)
                    ) {
                        const userId = this.client.users.cache.get(message.channel.topic)

                        const dm = await userId.createDM(true)

                        await dm.send(`**${message.author.username}:** ${message.content}`).catch(async () => {
                            await message.delete()
                            return await message.channel.send(
                                {
                                    content: `> **Erro ao enviar mensagem ao usuário**`
                                }
                            )
                        })

                        await message.react(emojis.certo)
                    }

                    break
                }
            }
        }
    }
}