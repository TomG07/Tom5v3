import { ChatInputCommandInteraction } from "discord.js";
import Command from "../../../classes/Command.js";
import emojis from "../../../structures/others/emojis.js";
import { RifasType } from "../../../structures/types/rifasType.js";

export class Comando extends Command {

    constructor() {
        super(
            {
                name: "estado",
                aliases: ["status"],
                botPerms: [],
                category: "economy",
                description: "Vê o estado de uma rifa",
                devOnly: false,
                options: [],
                reference: "rifa",
                reparing: false,
                subCommand: true,
                usage: "/rifa estado <id>",
                userPerms: [],
                nameLocalizations: {
                    "pt-BR": "estado",
                    "en-US": "status"
                },
                descriptionLocalizations: {
                    "pt-BR": "[ECONOMIA] Vê o estado de uma rifa",
                    "en-US": "[ECONOMY] See the status of a raffle"
                },
            }
        );

        this.autocomplete = async (client, interaction) => {
            
            const choices: {name: string, value: string}[] = []

            const rifas: RifasType[] = await client.db.findClient(
                {
                    _id: client.user.id
                }
            ).then(doc => doc.rifasAtivas)

            if (rifas.length < 1) {
                return await interaction.respond([{name: "Não existem rifas ativas.", value: "1"}])
            }

            const rifasUser = rifas.filter(rifa => {
                if (!rifa.tickets) {
                    return {
                        userId: interaction.user.id,
                        entries: 0
                    }
                } else {
                    return rifa.tickets.find(r => r.userId === interaction.user.id)
                }
            })

            if (rifasUser.length < 1) {
                await interaction.respond([{name: "Não está a participar em nenhuma rifa!", value: "1"}])
            }

            rifasUser.forEach(rifa => {
                choices.push(
                    {
                        name: `Dono: ${client.users.cache.get(rifa.owner).username} | Tipo: ${rifa.global ? "Global" : "Local"} | ID: ${rifa.id}`,
                        value: rifa.id
                    }
                );
            })

            await interaction.respond(choices)
        }

        this.execute = async ({ client, ctx }) => {

            let rifaId = ""

            if (ctx.interaction instanceof ChatInputCommandInteraction) {
                rifaId = ctx.interaction.options.getString("id", true)
            } else {
                rifaId = ctx.args[1]
            }

            if (!rifaId) {
                return await ctx.reply(
                    {
                        content: `**(${emojis.errado}) Informe o ID da rifa que pretende consultar da seguinte forma: \`${this.usage}\`.**`
                    }
                )
            }

            const rifa: RifasType = await client.db.findClient(
                {
                    _id: client.user.id
                }
            ).then(doc => doc.rifasAtivas.find(r => r.id === rifaId))

            if (!rifa) {
                const rifaSorteada: RifasType = await client.db.findClient(
                    {
                        _id: client.user.id
                    }
                ).then(doc => doc.rifasSorteadas.find(r => r.id === rifaId))

                if (rifaSorteada) {

                    let prémio = rifaSorteada.premio || 0
                    let usuários: number = 0

                    if (rifaSorteada.tickets) {
                        for (const r of rifaSorteada.tickets) {
                            prémio += (r.entries * 2000)
                            
                            usuários++
                        }
                    }

                    return await ctx.reply(
                        {
                            content: `**(<:tom5_icons_awardcup:1119638381769527427>) Status da Rifa**\n\n> Dados:\n<:tom5_icons_timer:1023251410776768572> | **Data de Encerramento:** <t:${~~(rifaSorteada.dataFinal.getTime() / 1000)}:R>\n<:tom5_icons_award:1119638389340258414> | **Prémio:** \`${prémio}\` (${rifaSorteada.winner ? await client.users.fetch(rifaSorteada.winner).then(u => `${u} - \`${u.id}\``) : `Nenhum vencedor`})\n<:defaultperms:1264590420307087370> | **Participantes:** \`${usuários}\`\n<:tom5_icons_discover:1119638428292759573> | **Tipo:** \`${rifaSorteada.global ? "Global" : "Local"}\`\n<:tom5_icons_Person:1119638402325811240> | **Limite Máximo de Usuários:** \`${rifaSorteada.maxUsers ? rifaSorteada.maxUsers : "Não definido"}\`\n<:tom5_icons_Person:1119638402325811240> | **Mínimo de Usuários:** \`${rifaSorteada.minUsers ? rifaSorteada.minUsers : "Não definido"}\`\n<:tom5_icons_store:1119638418423566356> | **Mínimo de Tickets por entrada:** \`${rifaSorteada.minTickets ? rifaSorteada.minTickets : "Não definido"}\`\n<:tom5_icons_channel:1119638377449390100> | **Canal de Logs:** ${rifaSorteada.logsChannel ? await client.channels.fetch(rifaSorteada.logsChannel) : `\`Não definido\``}\n<:tom5_icons_owner:1119638425214132235> | **Criador:** ${await client.users.fetch(rifaSorteada.owner).then(u => `[${u.username}](<https://discord.gg/tbsZVq5WEx>) [\`${u.id}\`]`)}\n-# Nota: O prémio será a soma dos valores dos tickets mais o valor definido pelo criador!`,
                        }
                    )
                } else {
                    return await ctx.reply(
                        {
                            content: `**(${emojis.errado}) Não foi possível encontrar a rifa com o ID fornecido.**`
                        }
                    )
                }
            } else {
                let prémio = rifa.premio || 0
                let usuários: number = 0

                if (rifa.tickets) {
                    for (const r of rifa.tickets) {
                        prémio += (r.entries * 2000)
                        usuários++
                    }
                }

                return await ctx.reply(
                    {
                        content: `**(<:tom5_icons_awardcup:1119638381769527427>) Status da Rifa**\n\n> Dados:\n<:tom5_icons_timer:1023251410776768572> | **Data de Encerramento:** <t:${~~(rifa.dataFinal.getTime() / 1000)}:R>\n<:tom5_icons_award:1119638389340258414> | **Prémio:** \`${prémio}\` (${rifa.winner ? await client.users.fetch(rifa.winner).then(u => `${u} - \`${u.id}\``) : `Nenhum vencedor`})\n<:defaultperms:1264590420307087370> | **Participantes:** \`${usuários}\`\n<:tom5_icons_discover:1119638428292759573> | **Tipo:** \`${rifa.global ? "Global" : "Local"}\`\n<:tom5_icons_Person:1119638402325811240> | **Limite Máximo de Usuários:** \`${rifa.maxUsers ? rifa.maxUsers : "Não definido"}\`\n<:tom5_icons_Person:1119638402325811240> | **Mínimo de Usuários:** \`${rifa.minUsers ? rifa.minUsers : "Não definido"}\`\n<:tom5_icons_store:1119638418423566356> | **Mínimo de Tickets por entrada:** \`${rifa.minTickets ? rifa.minTickets : "Não definido"}\`\n<:tom5_icons_channel:1119638377449390100> | **Canal de Logs:** ${rifa.logsChannel ? await client.channels.fetch(rifa.logsChannel) : `\`Não definido\``}\n<:tom5_icons_owner:1119638425214132235> | **Criador:** ${await client.users.fetch(rifa.owner).then(u => `[${u.username}](<https://discord.gg/tbsZVq5WEx>) [\`${u.id}\`]`)}\n-# Nota: O prémio será a soma dos valores dos tickets mais o valor definido pelo criador!`,
                    }
                )
            }
        }
    }
}