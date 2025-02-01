import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType } from "discord.js";
import Command from "../../../classes/Command.js";
import emojis from "../../../structures/others/emojis.js";
import manageNumber from "../../../structures/functions/manageNumber.js";

export class Comando extends Command {

    constructor() {
        super(
            {
                name: "comprar",
                description: "Compre tickets para entrar em rifas",
                aliases: ["buy"],
                botPerms: [],
                category: "economy",
                devOnly: false,
                options: [],
                reference: "rifa",
                reparing: false,
                subCommand: true,
                usage: "/rifa comprar <quantidade>",
                userPerms: []
            }
        )

        this.execute = async ({ client, ctx }) => {

            let qntd: number;

            if (ctx.interaction instanceof ChatInputCommandInteraction) {
                const arg = ctx.interaction.options.getString("quantidade", true)

                if (!arg || isNaN(Number(manageNumber(arg, "multiplier"))) || !isFinite(Number(manageNumber(arg, "multiplier"))) || Number(manageNumber(arg, "multiplier")) < 1) {
                    return await ctx.reply(
                        {
                            content: `**(${emojis.errado}) Quantidade não indicada ou indicada incorretamente**`
                        }
                    )
                }

                qntd = Number(manageNumber(arg, "multiplier"))
            } else {
                const arg = ctx.args[1]

                if (!arg || isNaN(Number(manageNumber(arg, "multiplier"))) || !isFinite(Number(manageNumber(arg, "multiplier"))) || Number(manageNumber(arg, "multiplier")) < 1) {
                    return await ctx.reply(
                        {
                            content: `**(${emojis.errado}) Quantidade não indicada ou indicada incorretamente**`
                        }
                    )
                }

                qntd = Number(manageNumber(arg, "multiplier"))
            }

            const msg1 = await ctx.reply(
                {
                    content: `**(${emojis.load}) Comprar ${manageNumber(qntd)} rifas por \`${manageNumber(qntd * 2000)}\` TomBits?**`,
                    components: [
                        new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId("sim")
                            .setEmoji(emojis.certo)
                            .setStyle(ButtonStyle.Secondary),

                            new ButtonBuilder()
                            .setCustomId("nao")
                            .setEmoji(emojis.errado)
                            .setStyle(ButtonStyle.Secondary)
                        )
                    ]
                }
            )

            msg1.createMessageComponentCollector(
                {
                    componentType: ComponentType.Button,
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

                const customId = i1.customId

                switch (customId) {
                    case "sim": {

                        const userDoc = await client.db.findUser(
                            {
                                _id: ctx.user.id
                            }
                        )

                        if ((qntd * 2000) > userDoc.economia.carteira) {
                            return await msg1.edit(
                                {
                                    content: `**(${emojis.errado}) Quantia na sua carteira inferior à necessária**`,
                                    components: []
                                }
                            )
                        }

                        await msg1.edit(
                            {
                                content: `**(${emojis.certo}) \`${manageNumber(qntd)}\` tickets comprados com sucesso.**`,
                                components: []
                            }
                        )
            
                        await client.db.updateUser(
                            {
                                _id: ctx.user.id
                            },
                            {
                                $inc: {
                                    "economia.ticketsComprados": qntd
                                },
                                $set: {
                                    "economia.carteira": userDoc.economia.carteira - (qntd * 2000)
                                },
                                $push: {
                                    "economia.transacoes": {
                                        type: "-",
                                        amount: qntd * 2000,
                                        name: "Comprar de Tickets",
                                        date: new Date()
                                    }
                                }
                            }
                        )

                        break
                    }

                    case "nao": {

                        await msg1.edit(
                            {
                                content: `**(${emojis.errado}) Operação cancelada com sucesso**`,
                                components: []
                            }
                        )

                        break
                    }
                }
            }).on("end", async () => await msg1.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))
        }
    }
}