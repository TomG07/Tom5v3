import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, StringSelectMenuBuilder } from "discord.js";
import Command from "../../classes/Command.js";
import emojis from "../../structures/others/emojis.js";

export class Comando extends Command {

    constructor() {
        super(
            {
                name: "tickets",
                description: "Painel de gestão de tickets",
                aliases: ["painel-tickets"],
                botPerms: [],
                category: "developers",
                devOnly: true,
                options: [],
                reference: null,
                reparing: false,
                subCommand: false,
                usage: "/tickets",
                userPerms: [],
                descriptionLocalizations: {
                    "en-US": "[DEVELOPERS] Tickets' panel",
                    "pt-BR": "[DESENVOLVEDORES] Paienl de gestão dos tickets"
                },
                userIntegration: true
            }
        )

        this.execute = async ({ client, ctx }) => {

            const tickets = await client.db.findClient(
                {
                    _id: client.user.id
                }
            ).then(doc => doc.tickets)

            if (!tickets || tickets.size < 1) {
                const msg1 = await ctx.reply(
                    {
                        content: `**(${emojis.errado}) Não existem tickets abertos no momento.**`,
                        components: [
                            new ActionRowBuilder<StringSelectMenuBuilder>()
                            .setComponents(
                                new StringSelectMenuBuilder()
                                .setCustomId("menu_painel_tickets")
                                .setOptions(
                                    [
                                        {
                                            label: "Ver Histórico",
                                            value: "historico"
                                        }
                                    ]
                                )
                            )
                        ]
                    }
                )

                msg1.createMessageComponentCollector(
                    {
                        componentType: ComponentType.StringSelect,
                        time: 120000,
                        idle: 45000
                    }
                ).on("collect", async (i1) => {

                    if (i1.user.id !== ctx.user.id) {
                        return await i1.reply(
                            {
                                content: `**(${emojis.errado}) Interação disponível apenas para ${ctx.user}!**`,
                                flags: ["Ephemeral"]
                            }
                        )
                    }

                    await i1.deferUpdate()

                    // switch (i1.values[0]) {

                    //     case "historico": {

                    //         const ticketsFechados: Map<string, ClosedTicketsType> = await client.db.findClient(
                    //             {
                    //                 _id: client.user.id
                    //             }
                    //         ).then(doc => doc.ticketsFechados)

                    //         if (!ticketsFechados) {
                    //             return await i1.editReply(
                    //                 {
                    //                     content: `**(${emojis.errado}) Não existe histórico de tickets.**`
                    //                 }
                    //             )
                    //         }

                    //         const data: ClosedTicketsType[] = []

                    //         for (const ticket of ticketsFechados) {
                    //             data.push(ticket[1])
                    //         }

                    //         break
                    //     }
                    // }
                }).on("end", async () => await msg1.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))
            }
        }
    }
}