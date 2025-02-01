import { ChannelType, TextChannel, User } from "discord.js";
import ScheduleJob from "../../classes/ScheduleJob.js";
import Tom5 from "../../classes/Tom5.js";
import { RifasType } from "../types/rifasType.js";
import emojis from "../others/emojis.js";
import { TransactionsType } from "../types/transactionsType.js";

export default class Job extends ScheduleJob {

    client: Tom5

    constructor(client: Tom5) {
        super(
            "*/30 * * * * *", // 30/30 segundos
            async (data) => {

                const rifas: RifasType[] = await this.client.db.findClient(
                    {
                        _id: this.client.user.id
                    },
                    true
                ).then(doc => doc.rifasAtivas)
    
                const now = data.getTime()
    
                for (const rifa of rifas) {
    
                    const entries: string[] = [];
                    const users: string[] = []
                    let logs: User | TextChannel;
    
                    if (rifa.logsChannel) {
                        const ch = await this.client.channels.fetch(rifa.logsChannel)
    
                        if (ch.type === ChannelType.GuildText) logs = ch
                    } else {
                        logs = await this.client.users.fetch(rifa.owner)
                    }  
                    
                    if (new Date(rifa.dataFinal).getTime() <= now) {
    
                        if (!rifa.tickets) {
    
                            rifas.splice(rifas.indexOf(rifa), 1)
    
                            await this.client.db.updateClient(
                                {
                                    _id: this.client.user.id
                                },
                                {
                                    $push: {
                                        "rifasSorteadas": rifa
                                    },
                                    $set: {
                                        "rifasAtivas": rifas
                                    }
                                }
                            )

                            let entries = 0

                            rifa.tickets.forEach(ticket => entries += ticket.entries)

                            const investimento = rifa.premio - (entries * 2000)

                            const transType: TransactionsType = {
                                amount: investimento,
                                date: new Date(),
                                name: "Reembolso do Investimento de Rifas",
                                type: "+"                 
                            }

                            await this.client.db.updateUser(
                                {
                                    _id: rifa.owner
                                },
                                {
                                    $inc: {
                                        "economia.carteira": investimento
                                    },
                                    $push: {
                                        "economia.transacoes": transType
                                    }
                                }
                            )
    
                            return await logs.send(
                                {
                                    content: `**(${emojis.errado}) Impossível sortear a rifa \`${rifa.id}\`**.\n\n> **Motivo:** Nenhum ticket comprado.`
                                }
                            ).catch(() => {})
                        }
    
                        for (const r of rifa.tickets) {
                            
                            for (let i = 0; i < r.entries; i++) {
                                entries.push(r.userId)
                            }
    
                            users.push(r.userId)
                        }
        
                        if (rifa.minUsers && (users.length < rifa.minUsers)) {
    
                            rifas.splice(rifas.indexOf(rifa), 1)
    
                            await this.client.db.updateClient(
                                {
                                    _id: this.client.user.id
                                },
                                {
                                    $push: {
                                        "rifasSorteadas": rifa
                                    },
                                    $set: {
                                        "rifasAtivas": rifas
                                    }
                                }
                            )

                            let entries = 0

                            rifa.tickets.forEach(ticket => entries += ticket.entries)

                            for (const ticket of rifa.tickets) {
                                await this.client.db.updateUser(
                                    {
                                        _id: ticket.userId
                                    },
                                    {
                                        $inc: {
                                            "economia.carteira": (ticket.entries * 2000)
                                        },
                                        $push: {
                                            "economia.transacoes": {
                                                name: "Reembolso de Investimento de Rifas",
                                                amount: (ticket.entries * 2000),
                                                date: new Date(),
                                                type: "+"
                                            }
                                        }
                                    }
                                )
                            }

                            const investimento = rifa.premio - (entries * 2000)

                            const transType: TransactionsType = {
                                amount: investimento,
                                date: new Date(),
                                name: "Reembolso do Investimento de Rifas",
                                type: "+"                 
                            }

                            await this.client.db.updateUser(
                                {
                                    _id: rifa.owner
                                },
                                {
                                    $inc: {
                                        "economia.carteira": investimento
                                    },
                                    $push: {
                                        "economia.transacoes": transType
                                    }
                                }
                            )
    
                            return await logs.send(
                                {
                                    content: `**(${emojis.errado}) Impossível sortear a rifa \`${rifa.id}\`**.\n\n> **Motivo:** Número de usuários inferior ao mínimo.`
                                }
                            ).catch(() => {})
                        }
    
                        if (!rifa.tickets || rifa.tickets.length === 0) {
    
                            const index = rifas.indexOf(rifa)
    
                            rifas.splice(index, 1)
    
                            await this.client.db.updateClient(
                                {
                                    _id: this.client.user.id
                                },
                                {
                                    $push: {
                                        "rifasSorteadas": rifa
                                    },
                                    $set: {
                                        "rifasAtivas": rifas
                                    }
                                }
                            )
    
                            return
                        }
    
                        const random = Math.floor(Math.random() * entries.length)
                        const sorteado = await this.client.users.fetch(entries[random])
    
                        await this.client.db.updateUser(
                            {
                                _id: sorteado.id
                            },
                            {
                                $inc: {
                                    "economia.carteira": rifa.premio
                                },
                                $push: {
                                    "economia.transacoes": {
                                        type: "+",
                                        name: "Prémio em Rifas",
                                        amount: rifa.premio,
                                        date: new Date()
                                    }
                                }
                            }
                        )
    
                        await logs.send(
                            {
                                content: `**(${emojis.certo}) O usuário ${sorteado} [\`${sorteado.id}]\`] ganhou a rifa com o ID \`${rifa.id}\` com um total de \`${rifa.premio}\` TomBits!**`
                            }
                        ).catch(() => {})
    
                        await sorteado.send(
                            {
                                content: `**(${emojis.certo}) Parabéns ${sorteado} [\`${sorteado.id}]\`]! Ganhaste a rifa com o ID \`${rifa.id}\` com um total de \`${rifa.premio}\` TomBits!**`
                            }
                        ).catch(() => {})
    
                        rifa.winner = sorteado.id
    
                        rifas.splice(rifas.indexOf(rifa), 1)
    
                        await this.client.db.updateClient(
                            {
                                _id: this.client.user.id
                            },
                            {
                                $push: {
                                    "rifasSorteadas": rifa
                                },
                                $set: {
                                    "rifasAtivas": rifas
                                }
                            }
                        )
                    }
                }
            }
        )

        this.client = client
    }
}