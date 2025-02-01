import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import Command from "../../../classes/Command.js";
import paginator from "../../../structures/functions/paginator.js";
import emojis from "../../../structures/others/emojis.js";
import capitalize from "../../../structures/functions/capitalize.js";
import manageNumber from "../../../structures/functions/manageNumber.js";

export class Comando extends Command {

    constructor() {
        super(
            {
                name: "servidor",
                description: ".",
                aliases: ["servidores", "server", "servers", "guild", "guilds"],
                botPerms: [],
                category: "utils",
                devOnly: false,
                options: [],
                reference: "vip",
                reparing: false,
                subCommand: true,
                usage: "/vip servidor",
                userPerms: ["ManageGuild"]
            }
        )

        this.execute = async ({ client, ctx }) => {
            
            const data = [
                `**(<:tom5_icons_colorserverpartner:1145743444636094597>) VIP - Servidores**\n\n<:bronze:1280123875685826583> | **Regalias VIP __Bronze__**\n> - Limite de Empresas Agregadas: __+5__\n> - Limite de Representantes: __+1__\n> - Destaque no servidor da __TomLabs__ (Dono do Servidor)\n\n<:dollar:1146037895271026781> | **Preço:** \`5k / dia\` ou \`150k / mês\` TomBits`,
                `**(<:tom5_icons_colorserverpartner:1145743444636094597>) VIP - Servidores**\n\n<:prata:1280123881138683904> | **Regalias VIP __Prata__**\n> - Recompensa diária __x2__ (Chance de 25%)\n> - Limite de Empresas Agregadas: __+10__\n> - Limite de Representantes: __+2__\n> - Destaque no servidor da __TomLabs__ (Dono do Servidor)\n\n<:dollar:1146037895271026781> | **Preço:** \`7k / dia\` ou \`210k / mês\` TomBits\n-# Os membros que já possuam VIP pessoal, não serão abrangidos pelo multiplicador de Daily`,
                `**(<:tom5_icons_colorserverpartner:1145743444636094597>) VIP - Servidores**\n\n<:ouro:1280123878265454623> | **Regalias VIP __Ouro__**\n> - Recompensa diária __x2__ (Chance de 50%)\n> - Limite de Empresas Agregadas: __+15__\n> - Limite de Representantes: __+5__\n> - Destaque no servidor da __TomLabs__ (Dono do Servidor)\n> - Sorteios __exclusivos para membros__ para membros dos servidores VIPS na TomLabs\n\n<:dollar:1146037895271026781> | **Preço:** \`10k / dia\` ou \`300k / mês\` TomBits\n-# Os membros que já possuam VIP pessoal, não serão abrangidos pelo multiplicador de Daily`,
                `**(<:tom5_icons_colorserverpartner:1145743444636094597>) VIP - Servidores**\n\n<:diamante:1280123883231510548> | **Regalias VIP __Diamante__**\n> - Recompensa diária __x2__ (Chance de 100%)\n> - Limite de Empresas Agregadas: __+25__\n> - Limite de Representantes: __+10__\n> - Destaque no servidor da __TomLabs__ (Dono do Servidor)\n> - Sorteios __exclusivos para membros__ no servidor da TomLabs\n> - Lugar no __Hall da Fama__\n\n<:dollar:1146037895271026781> | **Preço:** \`20k / dia\` ou \`600k / mês\` TomBits\n-# Os membros que já possuam VIP pessoal, não serão abrangidos pelo multiplicador de Daily`,
            ]

            const vips: { [key: number]: { type: string, price: number, emoji: string } } = {
                0: { type: "bronze", price: 150000, emoji: "<:bronze:1280123875685826583>" },
                1: { type: "prata", price: 210000, emoji: "<:prata:1280123881138683904>" },
                2: { type: "ouro", price: 300000, emoji: "<:ouro:1280123878265454623>" },
                3: { type: "diamante", price: 600000, emoji: "<:diamante:1280123883231510548>" }
            }

            let paginatorData = paginator(
                {
                    data: data,
                    perPage: 1,
                    page: 1
                }
            )

            paginatorData.components[0].addComponents(
                new ButtonBuilder()
                .setCustomId(`comprar_${vips[0].type}`)
                .setLabel("Comprar")
                .setStyle(ButtonStyle.Success)
            )

            const msg1 = await ctx.reply(
                {
                    content: paginatorData.pageData.join(` `),
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

                if (i1.user.id !== ctx.user.id) {
                    return await i1.reply(
                        {
                            content: `**(${emojis.errado}) Interação disponível apenas para ${ctx.user}!**`,
                            flags: ["Ephemeral"]
                        }
                    )
                }

                await i1.deferUpdate()

                switch (i1.customId) {

                    case "voltar": {
                        
                        paginatorData = paginator(
                            {
                                data: data,
                                perPage: 1,
                                page: paginatorData.page - 1
                            }
                        )

                        paginatorData.components[0].addComponents(
                            new ButtonBuilder()
                            .setCustomId(`comprar_${vips[paginatorData.page - 1].type}`)
                            .setLabel("Comprar")
                            .setStyle(ButtonStyle.Success)
                        )

                        await msg1.edit(
                            {
                                content: paginatorData.pageData.join(` `),
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

                        paginatorData.components[0].addComponents(
                            new ButtonBuilder()
                            .setCustomId(`comprar_${vips[paginatorData.page - 1].type}`)
                            .setLabel("Comprar")
                            .setStyle(ButtonStyle.Success)
                        )

                        await msg1.edit(
                            {
                                content: paginatorData.pageData.join(` `),
                                components: paginatorData.components
                            }
                        )

                        break
                    }

                    case `comprar_${vips[paginatorData.page - 1].type}`: {

                        const vipType = vips[paginatorData.page - 1].type
                        const quantia = vips[paginatorData.page - 1].price
                        const emoji = vips[paginatorData.page - 1].emoji

                        const msg2 = await i1.followUp(
                            {
                                content: `**(${emojis.load}) Comprar o VIP ${capitalize(vipType)} ${emoji} por __${manageNumber(quantia)}__ TomBits?**\n-# A troca de tipos de vip não adiciona proporcionalmente a quantia de dias para o fim do vip anterior ao vip novo!`,
                                components: [
                                    new ActionRowBuilder<ButtonBuilder>()
                                    .setComponents(
                                        new ButtonBuilder()
                                        .setCustomId("sim")
                                        .setStyle(ButtonStyle.Secondary)
                                        .setEmoji(emojis.certo),

                                        new ButtonBuilder()
                                        .setCustomId("nao")
                                        .setStyle(ButtonStyle.Secondary)
                                        .setEmoji(emojis.errado)
                                    )
                                ],
                                flags: ["Ephemeral"]
                            }
                        )

                        msg2.createMessageComponentCollector(
                            {
                                time: 120000,
                                idle: 45000,
                                componentType: ComponentType.Button
                            }
                        ).on("collect", async (i2) => {

                            await i2.deferUpdate()

                            switch (i2.customId) {
                                
                                case "sim": {

                                    const userEconomyDoc = await client.db.findUser(
                                        {
                                            _id: ctx.user.id
                                        }
                                    ).then(doc => doc.economia)

                                    if (userEconomyDoc.carteira < quantia) {

                                        await i2.editReply(
                                            {
                                                content: `**(${emojis.errado}) Quantia do teu saldo inferior à necessária!**`,
                                                components: []
                                            }
                                        )

                                        break
                                    }

                                    await client.db.updateUser(
                                        {
                                            _id: ctx.user.id
                                        },
                                        {
                                            $set: {
                                                "economia.carteira": userEconomyDoc.carteira - quantia
                                            }
                                        }
                                    )

                                    await client.db.updateGuild(
                                        {
                                            _id: ctx.interaction.guild.id
                                        },
                                        {
                                            $set: {
                                                "vip": {
                                                    "active": true,
                                                    "end": Date.now() + (30 * 24 * 60 * 60 * 1000),
                                                    "type": vipType
                                                }
                                            }
                                        }
                                    )

                                    await i2.editReply(
                                        {
                                            content: `**(${emojis.certo}) VIP ${capitalize(vipType)} ${emoji} comprado com sucesso.**`,
                                            components: []
                                        }
                                    )

                                    break
                                }

                                case "nao": {

                                    await i2.editReply(
                                        {
                                            content: `**(${emojis.errado}) Operação cancelada.**`,
                                            components: [],
                                            embeds: []
                                        }
                                    )

                                    break
                                }
                            }
                        })

                        break
                    }
                }
            }).on("end", async () => await msg1.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))
        }
    }
}