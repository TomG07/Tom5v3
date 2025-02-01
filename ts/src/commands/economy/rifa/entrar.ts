import { ChatInputCommandInteraction } from "discord.js";
import Command from "../../../classes/Command.js";
import { RifasType } from "../../../structures/types/rifasType.js";
import emojis from "../../../structures/others/emojis.js";

export class Comando extends Command {

    constructor() {
        super(
            {
                name: "entrar",
                description: ".",
                aliases: ["apostar", "join", "bet"],
                botPerms: [],
                category: "economy",
                devOnly: false,
                options: [],
                reference: "rifa",
                reparing: false,
                subCommand: true,
                usage: "/rifa join <id> <quantidade>",
                userPerms: []
            }
        )

        this.autocomplete = async (client, interaction) => {

            const rifas: RifasType[] = await client.db.findClient(
                {
                    _id: client.user.id
                }
            ).then(doc => doc.rifasAtivas)

            if (rifas.length < 1) {
                return await interaction.respond([{name: "Não existem rifas ativas.", value: "1"}])
            }

            await interaction.respond(rifas.map(rifa => {
                const dono = client.users.cache.get(rifa.owner)

                return {
                    name: `Dono: ${dono.username} | Tipo: ${rifa.global ? "Global" : "Local"} | ID: ${rifa.id}`,
                    value: rifa.id
                }
            }))
        }

        this.execute = async ({ client, ctx }) => {

            let rifaId: string;
            let quantidade: number;

            if (ctx.interaction instanceof ChatInputCommandInteraction) {
                rifaId = ctx.interaction.options.getString("id", true)
                quantidade = ctx.interaction.options.getNumber("quantidade", true)
            } else {

                const id = ctx.args[1]
                const qntd = ctx.args[2]

                if (!id) {
                    return await ctx.reply(
                        {
                            content: `**(${emojis.errado}) Informe o ID da rifa que pretende entrar.**`
                        }
                    )
                }
    
                if (!qntd || isNaN(Number(qntd)) || !isFinite(Number(qntd)) || Number(qntd) < 1) {
                    return await ctx.reply(
                        {
                            content: `**(${emojis.errado}) Quantidade não indicada ou indicada incorretamente**`
                        }
                    )
                }

                rifaId = id
                quantidade = Number(qntd)
            }

            const rifa: RifasType = await client.db.findClient(
                {
                    _id: client.user.id
                }
            ).then(doc => doc.rifasAtivas.find(r => r.id === rifaId))

            if (!rifa) {
                return await ctx.reply(
                    {
                        content: `**(${emojis.errado}) Impossível encontrar uma rifa com o ID fornecido**`
                    }
                )
            }

            const userDoc = await client.db.findUser(
                {
                    _id: ctx.user.id
                }
            )

            if (userDoc.economia.ticketsComprados as number < quantidade) {

                const cmdComprar = client.application.commands.cache.find(c => c.name === "rifa")

                return await ctx.reply(
                    {
                        content: `**(${emojis.errado}) Quantia de tickets superior à disponível na sua conta. Use </rifa comprar:${cmdComprar.id}>**`
                    }
                )
            }

            let userJoins = rifa.tickets.find(r => r.userId === ctx.user.id)

            if (!userJoins) {
                rifa.tickets.push(
                    {
                        userId: ctx.user.id,
                        entries: 0
                    }
                )

                userJoins = rifa.tickets.find(r => r.userId === ctx.user.id)
            }

            if ((userJoins.entries + quantidade) < rifa.minTickets) {
                return await ctx.reply(
                    {
                        content: `**(${emojis.errado}) Imposível apostar devido ao mínimo de tickets por entrada (\`${rifa.minTickets}\`)**`
                    }
                )
            }

            await ctx.reply(
                {
                    content: `**(${emojis.certo}) \`${quantidade}\` tickets apostado(s) na rifa \`${rifa.id}\`**`
                }
            )

            const rifas: RifasType[] = await client.db.findClient(
                {
                    _id: client.user.id
                }
            ).then(doc => doc.rifasAtivas)

            rifas.splice(rifas.indexOf(rifa), 1)

            rifa.tickets.find(r => r.userId === ctx.user.id).entries += quantidade
            rifa.premio += (quantidade * 2000)

            rifas.push(rifa)

            await client.db.updateClient(
                {
                    _id: client.user.id
                },
                {
                    $set: {
                        "rifasAtivas": rifas
                    }
                }
            )

            await client.db.updateUser(
                {
                    _id: ctx.user.id
                },
                {
                    $set: {
                        "economia.ticketsComprados": userDoc.economia.ticketsComprados as number - quantidade
                    }
                }
            )
        }
    }
}