import { ComponentType } from "discord.js";
import Command from "../../../classes/Command.js";
import manageNumber from "../../../structures/functions/manageNumber.js";
import paginator from "../../../structures/functions/paginator.js";
import emojis from "../../../structures/others/emojis.js";

export class Comando extends Command {

    constructor() {
        super(
            {
                name: "tombits",
                aliases: ["tb", "coins"],
                botPerms: [],
                category: "economy",
                description: ".",
                devOnly: false,
                options: [],
                reference: "rank",
                reparing: false,
                subCommand: true,
                usage: "/rank tombits",
                userPerms: []
            }
        )

        this.execute = async ({ client, ctx }) => {

            const msg1 = await ctx.reply(
                {
                    content: `**(${emojis.load}) A carregar dados...**`
                }
            )
            
            const data = (await client.db.findManyUsers(
                {
                    "economia.carteira": { $gt: 0 }
                }
            )).sort((a, b) => {
                
                let numA = a.economia.carteira
                let numB = b.economia.carteira

                if (a.economia.banco) {
                    numA += a.economia.banco.saldo
                }

                if (b.economia.banco) {
                    numB += b.economia.banco.saldo
                }

                return numB - numA
            }).map((userDoc, index) => {

                const user = client.users.cache.get(userDoc._id);

                let num: number = userDoc.economia.carteira || 0;

                if (userDoc.economia.banco) {
                    num += userDoc.economia.banco.saldo || 0;
                }

                return `**#${index + 1}º** | [${user?.username || "Usuário Desconhecido"}](<https://discord.gg/tbsZVq5WEx>) -> **${manageNumber(num)}** TomBits\n`;
            })

            let paginatorData = paginator(
                {
                    data,
                    perPage: 10,
                    page: 1
                }
            )

            const msg2 = await msg1.edit(
                {
                    content: paginatorData.pageData.join(''),
                    components: paginatorData.components
                }
            )

            msg2.createMessageComponentCollector(
                {
                    time: 120000,
                    idle: 45000,
                    componentType: ComponentType.Button
                }
            ).on("collect", async (i2) => {

                if (i2.user.id !== ctx.user.id) {
                    return await i2.reply(
                        {
                            content: `**(${emojis.errado}) Interação disponível apenas para ${ctx.user}!**`,
                            flags: ["Ephemeral"]
                        }
                    )
                }

                await i2.deferUpdate()

                switch (i2.customId) {

                    case "voltar": {
                        
                        paginatorData = paginator(
                            {
                                data: data,
                                perPage: 1,
                                page: paginatorData.page - 1
                            }
                        )

                        await msg2.edit(
                            {
                                content: paginatorData.pageData.join(``),
                                components: paginatorData.components
                            }
                        )

                        break
                    }

                    case "proximo": {
                        
                        paginatorData = paginator(
                            {
                                data: data,
                                perPage: 1,
                                page: paginatorData.page + 1
                            }
                        )

                        await msg2.edit(
                            {
                                content: paginatorData.pageData.join(``),
                                components: paginatorData.components
                            }
                        )

                        break
                    }
                }
            })
        }
    }
}