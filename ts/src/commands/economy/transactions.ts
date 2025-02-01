import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } from "discord.js";
import Command from "../../classes/Command.js";
import paginator from "../../structures/functions/paginator.js";
import { TransactionsType } from "../../structures/types/transactionsType.js";
import emojis from "../../structures/others/emojis.js";
import colors from "../../structures/others/colors.js";
import manageNumber from "../../structures/functions/manageNumber.js";

export class Comando extends Command {

    constructor() {
        super(
            {
                name: "transações",
                description: "[ECONOMIA] Vê a tuas transações",
                aliases: ["trans", "transações"],
                botPerms: [],
                category: "economy",
                devOnly: false,
                options: [],
                reference: null,
                reparing: false,
                subCommand: null,
                usage: "/transações",
                userPerms: [],
                nameLocalizations: {
                    "pt-BR": "transações",
                    "en-US": "transactions"
                },
                descriptionLocalizations: {
                    "pt-BR": "[ECONOMIA] Vê a tuas transações",
                    "en-US": "[ECONOMY] View your transactions"
                },
                userIntegration: true
            }
        )
        
        this.execute = async ({ client, ctx }) => {

            const userDoc = await client.db.findUser(
                {
                    _id: ctx.user.id
                }
            )

            let transactions = userDoc.economia.transacoes as TransactionsType[]

            if (!transactions || transactions.length < 1) {
                return await ctx.reply(
                    {
                        content: `**(${emojis.errado}) Nenhuma transação registada.**`
                    }
                )
            }

            transactions = transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

            const data: string[] = []

            for (const transaction of transactions) {

                const msg = `> **Nome:** ${transaction.name}\n> **Tipo:** ${transaction.type === "+" ? "(<:tom5_icons_djoin:1119638399251402752>) Recebido" : "(<:tom5_icons_dleave:1119638405165359235>) Pagamento"}\n> **Data:** <t:${~~(new Date(transaction.date).getTime() / 1000)}:F>\n> **Quantia:** \`${manageNumber(transaction.amount)}\` TomBits\n\n`

                data.push(msg)
            }

            let paginatorData = paginator(
                {
                    data: data,
                    perPage: 5,
                    page: 1
                }
            )

            const msg1 = await ctx.reply(
                {
                    content: `**(<:tom5_icons_loop:1146037076979093545>) Informações sobre as suas transações:**`,
                    embeds: [
                        new EmbedBuilder()
                        .setColor(colors.normal)
                        .setDescription(`${paginatorData.pageData.join(` `)}`)
                        .setFooter(
                            {
                                text: `${data.length} transações no total`
                            }
                        )
                    ],
                    components: paginatorData.components
                }
            )

            msg1.createMessageComponentCollector(
                {
                    time: 120000,
                    idle: 45000,
                    componentType: ComponentType.Button
                }
            ).on("collect", async (i1) => {

                switch (i1.customId) {

                    case "voltar": {

                        paginatorData = paginator(
                            {
                                data: data,
                                perPage: 5,
                                page: paginatorData.page - 1
                            }
                        )

                        await i1.update(
                            {
                                embeds: [
                                    new EmbedBuilder()
                                    .setColor(colors.normal)
                                    .setDescription(`${paginatorData.pageData.join(` `)}`)
                                    .setFooter(
                                        {
                                            text: `${manageNumber(data.length)} transações no total`
                                        }
                                    )
                                ],
                                components: paginatorData.components
                            }
                        )

                        break
                    }

                    case "proximo": {

                        paginatorData = paginator(
                            {
                                data: data,
                                perPage: 5,
                                page: paginatorData.page + 1
                            }
                        )

                        await i1.update(
                            {
                                embeds: [
                                    new EmbedBuilder()
                                    .setColor(colors.normal)
                                    .setDescription(`${paginatorData.pageData.join(` `)}`)
                                    .setFooter(
                                        {
                                            text: `${manageNumber(data.length)} transações no total`
                                        }
                                    )
                                ],
                                components: paginatorData.components
                            }
                        )

                        break
                    }
                }
            }).on("end", async () => await msg1.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))
        }
    }
}