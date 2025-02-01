import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, ComponentType, StringSelectMenuBuilder, StringSelectMenuInteraction } from "discord.js";
import Command from "../../../classes/Command.js";
import emojis from "../../../structures/others/emojis.js";
import ms from "ms"
import { RifasType } from "../../../structures/types/rifasType.js";
import pms from "pretty-ms"
import generateKey from "../../../structures/functions/generateKey.js";
import manageNumber from "../../../structures/functions/manageNumber.js";

export class Comando extends Command {

    constructor() {
        super(
            {
                name: "criar",
                aliases: ["c", "create"],
                botPerms: [],
                category: "economy",
                description: "Crie uma rifa",
                devOnly: false,
                options: [],
                reference: "rifa",
                reparing: false,
                subCommand: true,
                usage: "/rifa criar",
                userPerms: [],
                nameLocalizations: {
                    "pt-BR": "criar",
                    "en-US": "create"
                },
                descriptionLocalizations: {
                    "pt-BR": "[ECONOMIA] Cria uma rifa",
                    "en-US": "[ECONOMY] Create a raffle"
                },
            }
        )

        this.execute = async ({ client, ctx }) => {

            const components = [
                new ActionRowBuilder<StringSelectMenuBuilder>()
                .setComponents(
                    new StringSelectMenuBuilder()
                    .setCustomId("rifa_criar")
                    .setPlaceholder("Selecionar Opção")
                    .setOptions([
                        {
                            label: "Data de Encerramento  (Opção Obrigatória)",
                            value: "data_final",
                            description: "Define a data para encerrar a rifa",
                            emoji: "<:tom5_icons_timer:1023251410776768572>"
                        },
                        {
                            label: "Prémio",
                            value: "premio",
                            description: "Define o prémio para o vencedor",
                            emoji: "<:tom5_icons_award:1119638389340258414>"
                        },
                        {
                            label: "Tipo",
                            value: "type",
                            description: "Rifa Global ou Local?",
                            emoji: "<:tom5_icons_discover:1119638428292759573>"
                        },
                        {
                            label: "Limite de Usuários",
                            value: "max_users",
                            description: "Definir um limite de usuários",
                            emoji: "<:tom5_icons_Person:1119638402325811240>"
                        },
                        {
                            label: "Mínimo de Usuários",
                            value: "min_users",
                            description: "Definir um mínimo de usuários",
                            emoji: "<:tom5_icons_Person:1119638402325811240>"
                        },
                        {
                            label: "Mínimo de Tickets",
                            value: "min_tickets",
                            description: "Definir um mínimo de tickets por entrada",
                            emoji: "<:tom5_icons_store:1119638418423566356>"
                        },
                        {
                            label: "Canal de Logs",
                            value: "logs_channel",
                            description: "Definir um canal de atualizações",
                            emoji: "<:tom5_icons_channel:1119638377449390100>"
                        }
                    ])
                ),

                new ActionRowBuilder<ButtonBuilder>()
                .setComponents(
                    new ButtonBuilder()
                    .setCustomId("criar_rifa")
                    .setEmoji("<:tom5_icons_Correct:1119638374664372264>")
                    .setLabel("Criar Rifa")
                    .setStyle(ButtonStyle.Secondary)
                )
            ]

            const rifa: RifasType = {
                dataFinal: null,
                id: null,
                premio: 0,
                tickets: [],
                logsChannel: null,
                maxUsers: null,
                minTickets: 1,
                minUsers: 1,
                owner: null,
                winner: null,
                global: true
            }

            const msg1 = await ctx.reply(
                {
                    content: `**(<:tom5_icons_awardcup:1119638381769527427>) Painel de Configuração de Rifa**\n\n> Dados:\n<:tom5_icons_timer:1023251410776768572> | **Data de Encerramento (Obrigatório):** ${rifa.dataFinal ? `<t:${~~(rifa.dataFinal.getTime() / 1000)}:F>` : `\`Não definida\``}\n<:tom5_icons_award:1119638389340258414> | **Prémio:** \`${rifa.premio ? rifa.premio : "Não definido"}\`\n<:tom5_icons_discover:1119638428292759573> | **Tipo:** \`${rifa.global ? "Global" : "Local"}\`\n<:tom5_icons_Person:1119638402325811240> | **Limite Máximo de Usuários:** \`${rifa.maxUsers ? rifa.maxUsers : "Não definido"}\`\n<:tom5_icons_Person:1119638402325811240> | **Mínimo de Usuários:** \`${rifa.minUsers ? rifa.minUsers : "Não definido"}\`\n<:tom5_icons_store:1119638418423566356> | **Mínimo de Tickets por entrada:** \`${rifa.minTickets ? rifa.minTickets : "Não definido"}\`\n<:tom5_icons_channel:1119638377449390100> | **Canal de Logs:** ${rifa.logsChannel ? await client.channels.fetch(rifa.logsChannel) : `\`Não definido\``}\n\n> Para configurar uma rifa, use o menu abaixo.\n-# Nota: O prémio será a soma dos valores dos tickets mais o valor definido pelo criador!`,
                    components: components
                }
            )


            msg1.createMessageComponentCollector(
                {
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

                if (i1 instanceof StringSelectMenuInteraction) {

                    await i1.deferReply({ flags: ["Ephemeral"] })

                    const value = i1.values[0]

                    switch (value) {

                        case "data_final": {

                            const msg2 = await i1.editReply(
                                {
                                    content: `> **(${emojis.load}) Selecione no menu abaixo a duração da rifa**`,
                                    components: [
                                        new ActionRowBuilder<StringSelectMenuBuilder>()
                                        .setComponents(
                                            new StringSelectMenuBuilder()
                                            .setCustomId("set_time")
                                            .setPlaceholder("Selecionar Duração")
                                            .setOptions([
                                                {
                                                    label: "1 Hora",
                                                    value: "1h"
                                                },
                                                {
                                                    label: "1 Dia",
                                                    value: "1d"
                                                },
                                                {
                                                    label: "1 Semana",
                                                    value: "7d"
                                                },
                                                {
                                                    label: "1 Mês",
                                                    value: "30d"
                                                },
                                                {
                                                    label: "Personalizar",
                                                    value: "custom",
                                                    description: "Defina um valor personalizado"
                                                }
                                            ])
                                        )
                                    ]
                                }
                            )

                            msg2.createMessageComponentCollector(
                                {
                                    componentType: ComponentType.StringSelect,
                                    time: 120000,
                                    idle: 45000
                                }
                            ).on("collect", async (i2) => {

                                await i2.deferUpdate()

                                const value2 = i2.values[0]

                                let msTime: string;

                                if (value2 === "custom") {

                                    await i2.editReply(
                                        {
                                            content: `**(${emojis.load}) Envie por mensagem a duração da rifa no seguinte formato:**\n\n>>> - 1m (1 minuto)\n- 1h (1 hora)\n- 1d (1 dia)\n- 1w (1 semana)`,
                                            components: []
                                        }
                                    )

                                    const collector3 = await i2.channel.awaitMessages(
                                        {
                                            filter: (u) => u.author.id === i2.user.id,
                                            max: 1,
                                            time: 120000,
                                    idle: 45000
                                        }
                                    )

                                    const i3 = collector3.map(x => x)[0]

                                    const types = ["m", "h", "d", "w"]

                                    for (let i = 0; i < types.length; i++) {

                                        if (i3.content.includes(types[i])) break

                                        if (i === types.length) {
                                            await i3.delete().catch(() => {})
        
                                            await i2.editReply(
                                                {
                                                    content: `**(${emojis.errado}) Erro ao processar a mensagem enviada. Por favor verifique o seu conteúdo.**`
                                                }
                                            )

                                            await i1.deleteReply()

                                            await msg1.edit(
                                                {
                                                    components
                                                }
                                            )

                                            return
                                        }
                                    }

                                    msTime = ms(Number(i3.content))

                                    await i3.delete().catch(() => {})

                                } else {
                                    msTime = ms(Number(value2))
                                }

                                rifa.dataFinal = new Date(Date.now() + msTime)

                                await i2.editReply(
                                    {
                                        content: `**(${emojis.certo}) Duração de \`${pms(Number(msTime))}\` definida com sucesso.**`,
                                        components: []
                                    }
                                )

                                await msg1.edit(
                                    {
                                        content: `**(<:tom5_icons_awardcup:1119638381769527427>) Painel de Configuração de Rifa**\n\n> Dados:\n<:tom5_icons_timer:1023251410776768572> | **Data de Encerramento (Obrigatório):** ${rifa.dataFinal ? `<t:${~~(rifa.dataFinal.getTime() / 1000)}:F>` : `\`Não definida\``}\n<:tom5_icons_award:1119638389340258414> | **Prémio:** \`${rifa.premio ? rifa.premio : "Não definido"}\`\n<:tom5_icons_discover:1119638428292759573> | **Tipo:** \`${rifa.global ? "Global" : "Local"}\`\n<:tom5_icons_Person:1119638402325811240> | **Limite Máximo de Usuários:** \`${rifa.maxUsers ? rifa.maxUsers : "Não definido"}\`\n<:tom5_icons_Person:1119638402325811240> | **Mínimo de Usuários:** \`${rifa.minUsers ? rifa.minUsers : "Não definido"}\`\n<:tom5_icons_store:1119638418423566356> | **Mínimo de Tickets por entrada:** \`${rifa.minTickets ? rifa.minTickets : "Não definido"}\`\n<:tom5_icons_channel:1119638377449390100> | **Canal de Logs:** ${rifa.logsChannel ? await client.channels.fetch(rifa.logsChannel) : `\`Não definido\``}\n\n> Para configurar uma rifa, use o menu abaixo.\n-# Nota: O prémio será a soma dos valores dos tickets mais o valor definido pelo criador!`,
                                        components: components
                                    }
                                )
                            }).on("end", async () => await msg2.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))

                            break
                        }

                        case "premio": {

                            await i1.editReply(
                                {
                                    content: `> **(${emojis.load}) Envie por mensagem o valor base do prémio da rifa.**`
                                }
                            )

                            const collector2 = await i1.channel.awaitMessages(
                                {
                                    time: 120000,
                                    idle: 45000,
                                    filter: (u) => u.author.id === i1.user.id,
                                    max: 1
                                }
                            )

                            const i2 = collector2.map(x => x)[0]

                            if (isNaN(Number(manageNumber(i2.content))) || !isFinite(Number(manageNumber(i2.content))) || Number(manageNumber(i2.content)) <= 0) {
                                await i2.delete().catch(() => {})
        
                                await i1.editReply(
                                    {
                                        content: `**(${emojis.errado}) Erro ao processar a mensagem enviada. Por favor verifique o seu conteúdo.**`
                                    }
                                )

                                await msg1.edit(
                                    {
                                        components: components
                                    }
                                )

                                return
                            }

                            const userDoc = await client.db.findUser(
                                {
                                    _id: ctx.user.id
                                }
                            )

                            if (userDoc.economia.carteira < Number(manageNumber(i2.content))) {
                                await i2.delete().catch(() => {})
        
                                await i1.editReply(
                                    {
                                        content: `**(${emojis.errado}) Quantia superior à que você tem na carteira!**`
                                    }
                                )

                                await msg1.edit(
                                    {
                                        components: components
                                    }
                                )

                                return
                            }

                            rifa.premio = Number(manageNumber(i2.content))
                            
                            await i2.delete().catch(() => {})

                            await i1.editReply(
                                {
                                    content: `**(${emojis.certo}) Prémio de \`${manageNumber(rifa.premio, "reduce")}\` definido com sucesso.**`,
                                }
                            )

                            await msg1.edit(
                                {
                                    content: `**(<:tom5_icons_awardcup:1119638381769527427>) Painel de Configuração de Rifa**\n\n> Dados:\n<:tom5_icons_timer:1023251410776768572> | **Data de Encerramento (Obrigatório):** ${rifa.dataFinal ? `<t:${~~(rifa.dataFinal.getTime() / 1000)}:F>` : `\`Não definida\``}\n<:tom5_icons_award:1119638389340258414> | **Prémio:** \`${rifa.premio ? rifa.premio : "Não definido"}\`\n<:tom5_icons_discover:1119638428292759573> | **Tipo:** \`${rifa.global ? "Global" : "Local"}\`\n<:tom5_icons_Person:1119638402325811240> | **Limite Máximo de Usuários:** \`${rifa.maxUsers ? rifa.maxUsers : "Não definido"}\`\n<:tom5_icons_Person:1119638402325811240> | **Mínimo de Usuários:** \`${rifa.minUsers ? rifa.minUsers : "Não definido"}\`\n<:tom5_icons_store:1119638418423566356> | **Mínimo de Tickets por entrada:** \`${rifa.minTickets ? rifa.minTickets : "Não definido"}\`\n<:tom5_icons_channel:1119638377449390100> | **Canal de Logs:** ${rifa.logsChannel ? await client.channels.fetch(rifa.logsChannel) : `\`Não definido\``}\n\n> Para configurar uma rifa, use o menu abaixo.\n-# Nota: O prémio será a soma dos valores dos tickets mais o valor definido pelo criador!`,
                                    components: components
                                }
                            )

                            break
                        }

                        case "type": {

                            const msg2 = await i1.editReply(
                                {
                                    content: `> **(${emojis.load}) Escolhe nos botões abaixo o tipo de rifa**`,
                                    components: [
                                        new ActionRowBuilder<ButtonBuilder>()
                                        .setComponents(
                                            new ButtonBuilder()
                                            .setCustomId("global")
                                            .setEmoji("<:tom5_icons_globe:1119638376044298270>")
                                            .setLabel("Global")
                                            .setStyle(ButtonStyle.Secondary),

                                            new ButtonBuilder()
                                            .setCustomId("local")
                                            .setEmoji("<:tom5_icons_generalinfo:1013547554228686920>")
                                            .setLabel("Local")
                                            .setStyle(ButtonStyle.Secondary),

                                            new ButtonBuilder()
                                            .setCustomId("info")
                                            .setEmoji("<:tom5_icons_question:1013546739170558135>")
                                            .setLabel("Saber Mais")
                                            .setStyle(ButtonStyle.Success)
                                        )
                                    ]
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

                                switch (i2.customId) {

                                    case "global": {

                                        rifa.global = true

                                        await i2.deferUpdate()

                                        await i1.editReply(
                                            {
                                                content: `**(${emojis.certo}) Rifa definida como \`Global\`**`,
                                                components: []
                                            }
                                        )

                                        await msg1.edit(
                                            {
                                                content: `**(<:tom5_icons_awardcup:1119638381769527427>) Painel de Configuração de Rifa**\n\n> Dados:\n<:tom5_icons_timer:1023251410776768572> | **Data de Encerramento (Obrigatório):** ${rifa.dataFinal ? `<t:${~~(rifa.dataFinal.getTime() / 1000)}:F>` : `\`Não definida\``}\n<:tom5_icons_award:1119638389340258414> | **Prémio:** \`${rifa.premio ? rifa.premio : "Não definido"}\`\n<:tom5_icons_discover:1119638428292759573> | **Tipo:** \`${rifa.global ? "Global" : "Local"}\`\n<:tom5_icons_Person:1119638402325811240> | **Limite Máximo de Usuários:** \`${rifa.maxUsers ? rifa.maxUsers : "Não definido"}\`\n<:tom5_icons_Person:1119638402325811240> | **Mínimo de Usuários:** \`${rifa.minUsers ? rifa.minUsers : "Não definido"}\`\n<:tom5_icons_store:1119638418423566356> | **Mínimo de Tickets por entrada:** \`${rifa.minTickets ? rifa.minTickets : "Não definido"}\`\n<:tom5_icons_channel:1119638377449390100> | **Canal de Logs:** ${rifa.logsChannel ? await client.channels.fetch(rifa.logsChannel) : `\`Não definido\``}\n\n> Para configurar uma rifa, use o menu abaixo.\n-# Nota: O prémio será a soma dos valores dos tickets mais o valor definido pelo criador!`,
                                                components: components
                                            }
                                        )

                                        break
                                    }

                                    case "local": {

                                        rifa.global = false

                                        await i2.deferUpdate()

                                        await i1.editReply(
                                            {
                                                content: `**(${emojis.certo}) Rifa definida como \`Local\`**`,
                                                components: []
                                            }
                                        )

                                        await msg1.edit(
                                            {
                                                content: `**(<:tom5_icons_awardcup:1119638381769527427>) Painel de Configuração de Rifa**\n\n> Dados:\n<:tom5_icons_timer:1023251410776768572> | **Data de Encerramento (Obrigatório):** ${rifa.dataFinal ? `<t:${~~(rifa.dataFinal.getTime() / 1000)}:F>` : `\`Não definida\``}\n<:tom5_icons_award:1119638389340258414> | **Prémio:** \`${rifa.premio ? rifa.premio : "Não definido"}\`\n<:tom5_icons_discover:1119638428292759573> | **Tipo:** \`${rifa.global ? "Global" : "Local"}\`\n<:tom5_icons_Person:1119638402325811240> | **Limite Máximo de Usuários:** \`${rifa.maxUsers ? rifa.maxUsers : "Não definido"}\`\n<:tom5_icons_Person:1119638402325811240> | **Mínimo de Usuários:** \`${rifa.minUsers ? rifa.minUsers : "Não definido"}\`\n<:tom5_icons_store:1119638418423566356> | **Mínimo de Tickets por entrada:** \`${rifa.minTickets ? rifa.minTickets : "Não definido"}\`\n<:tom5_icons_channel:1119638377449390100> | **Canal de Logs:** ${rifa.logsChannel ? await client.channels.fetch(rifa.logsChannel) : `\`Não definido\``}\n\n> Para configurar uma rifa, use o menu abaixo.\n-# Nota: O prémio será a soma dos valores dos tickets mais o valor definido pelo criador!`,
                                                components: components
                                            }
                                        )

                                        break
                                    }

                                    case "info": {

                                        if (i2.deferred || i2.replied) {
                                            await i2.editReply(
                                                {
                                                    content: `**Informações sobre o tipo de Rifa**\n\n__Global__\n> - O tipo de rifa global permite a entrada de membros pelo mundo todo, abrangendo muitos mais servidores que usam este sistema.\n> - Pode ser encontrada no comando de procura de rifas.\n\n__Local__\n> - O tipo de rifa local apenas permite a participação dos membros deste servidor.\n> - Não pode ser encontrada no comando de procura de rifas.`
                                                }
                                            )
                                        } else {
                                            await i2.reply(
                                                {
                                                    content: `**Informações sobre o tipo de Rifa**\n\n__Global__\n> - O tipo de rifa global permite a entrada de membros pelo mundo todo, abrangendo muitos mais servidores que usam este sistema.\n> - Pode ser encontrada no comando de procura de rifas.\n\n__Local__\n> - O tipo de rifa local apenas permite a participação dos membros deste servidor.\n> - Não pode ser encontrada no comando de procura de rifas.`,
                                                    flags: ["Ephemeral"]
                                                }
                                            )
                                        }

                                        break
                                    }
                                }
                            }).on("end", async () => await msg2.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))

                            break
                        }

                        case "max_users": {

                            await i1.editReply(
                                {
                                    content: `> **(${emojis.load}) Envie por mensagem o número máximo de usuários.**`
                                }
                            )

                            const collector2 = await i1.channel.awaitMessages(
                                {
                                    time: 120000,
                                    idle: 45000,
                                    filter: (u) => u.author.id === i1.user.id,
                                    max: 1
                                }
                            )

                            const i2 = collector2.map(x => x)[0]

                            if (isNaN(Number(i2.content)) || !isFinite(Number(i2.content)) || Number(i2.content) <= 0) {
                                await i2.delete().catch(() => {})
        
                                await i1.editReply(
                                    {
                                        content: `**(${emojis.errado}) Erro ao processar a mensagem enviada. Por favor verifique o seu conteúdo.**`
                                    }
                                )

                                await msg1.edit(
                                    {
                                        components: components
                                    }
                                )

                                return
                            }

                            if (rifa.minUsers) {
                                if (rifa.minUsers > Number(i2.content)) {
                                    await i2.delete().catch(() => {})

                                    await i1.editReply(
                                        {
                                            content: `**(${emojis.errado}) O número máximo de usuários não pode ser menor que o mínimo já definido!**`
                                        }
                                    )

                                    await msg1.edit(
                                        {
                                            components
                                        }
                                    )

                                    return
                                }
                            }

                            rifa.maxUsers = Number(i2.content)
                            
                            await i2.delete().catch(() => {})

                            await i1.editReply(
                                {
                                    content: `**(${emojis.certo}) Número máximo de usuários definido para \`${rifa.maxUsers}\` com sucesso.**`,
                                }
                            )

                            await msg1.edit(
                                {
                                    content: `**(<:tom5_icons_awardcup:1119638381769527427>) Painel de Configuração de Rifa**\n\n> Dados:\n<:tom5_icons_timer:1023251410776768572> | **Data de Encerramento (Obrigatório):** ${rifa.dataFinal ? `<t:${~~(rifa.dataFinal.getTime() / 1000)}:F>` : `\`Não definida\``}\n<:tom5_icons_award:1119638389340258414> | **Prémio:** \`${rifa.premio ? rifa.premio : "Não definido"}\`\n<:tom5_icons_discover:1119638428292759573> | **Tipo:** \`${rifa.global ? "Global" : "Local"}\`\n<:tom5_icons_Person:1119638402325811240> | **Limite Máximo de Usuários:** \`${rifa.maxUsers ? rifa.maxUsers : "Não definido"}\`\n<:tom5_icons_Person:1119638402325811240> | **Mínimo de Usuários:** \`${rifa.minUsers ? rifa.minUsers : "Não definido"}\`\n<:tom5_icons_store:1119638418423566356> | **Mínimo de Tickets por entrada:** \`${rifa.minTickets ? rifa.minTickets : "Não definido"}\`\n<:tom5_icons_channel:1119638377449390100> | **Canal de Logs:** ${rifa.logsChannel ? await client.channels.fetch(rifa.logsChannel) : `\`Não definido\``}\n\n> Para configurar uma rifa, use o menu abaixo.\n-# Nota: O prémio será a soma dos valores dos tickets mais o valor definido pelo criador!`,
                                    components: components
                                }
                            )

                            break
                        }

                        case "min_users": {

                            await i1.editReply(
                                {
                                    content: `> **(${emojis.load}) Envie por mensagem o número mínimo de usuários.**`
                                }
                            )

                            const collector2 = await i1.channel.awaitMessages(
                                {
                                    time: 120000,
                                    idle: 45000,
                                    filter: (u) => u.author.id === i1.user.id,
                                    max: 1
                                }
                            )

                            const i2 = collector2.map(x => x)[0]

                            if (isNaN(Number(i2.content)) || !isFinite(Number(i2.content)) || Number(i2.content) <= 0) {
                                await i2.delete().catch(() => {})
        
                                await i1.editReply(
                                    {
                                        content: `**(${emojis.errado}) Erro ao processar a mensagem enviada. Por favor verifique o seu conteúdo.**`
                                    }
                                )

                                await msg1.edit(
                                    {
                                        components: components
                                    }
                                )

                                return
                            }

                            if (rifa.maxUsers) {
                                if (Number(i2.content) > rifa.maxUsers) {
                                    await i2.delete().catch(() => {})

                                    await i1.editReply(
                                        {
                                            content: `**(${emojis.errado}) O número mínimo de usuários não pode ser maior que o máximo já definido!**`
                                        }
                                    )

                                    await msg1.edit(
                                        {
                                            components
                                        }
                                    )

                                    return
                                }
                            }

                            rifa.minUsers = Number(i2.content)
                            
                            await i2.delete().catch(() => {})

                            await i1.editReply(
                                {
                                    content: `**(${emojis.certo}) Número mínimo de usuários definido para \`${rifa.minUsers}\` com sucesso.**`,
                                }
                            )

                            await msg1.edit(
                                {
                                    content: `**(<:tom5_icons_awardcup:1119638381769527427>) Painel de Configuração de Rifa**\n\n> Dados:\n<:tom5_icons_timer:1023251410776768572> | **Data de Encerramento (Obrigatório):** ${rifa.dataFinal ? `<t:${~~(rifa.dataFinal.getTime() / 1000)}:F>` : `\`Não definida\``}\n<:tom5_icons_award:1119638389340258414> | **Prémio:** \`${rifa.premio ? rifa.premio : "Não definido"}\`\n<:tom5_icons_discover:1119638428292759573> | **Tipo:** \`${rifa.global ? "Global" : "Local"}\`\n<:tom5_icons_Person:1119638402325811240> | **Limite Máximo de Usuários:** \`${rifa.maxUsers ? rifa.maxUsers : "Não definido"}\`\n<:tom5_icons_Person:1119638402325811240> | **Mínimo de Usuários:** \`${rifa.minUsers ? rifa.minUsers : "Não definido"}\`\n<:tom5_icons_store:1119638418423566356> | **Mínimo de Tickets por entrada:** \`${rifa.minTickets ? rifa.minTickets : "Não definido"}\`\n<:tom5_icons_channel:1119638377449390100> | **Canal de Logs:** ${rifa.logsChannel ? await client.channels.fetch(rifa.logsChannel) : `\`Não definido\``}\n\n> Para configurar uma rifa, use o menu abaixo.\n-# Nota: O prémio será a soma dos valores dos tickets mais o valor definido pelo criador!`,
                                    components: components
                                }
                            )

                            break
                        }

                        case "min_tickets": {

                            await i1.editReply(
                                {
                                    content: `> **(${emojis.load}) Envie por mensagem o número mínimo de tickets por entrada.**`
                                }
                            )

                            const collector2 = await i1.channel.awaitMessages(
                                {
                                    time: 120000,
                                    idle: 45000,
                                    filter: (u) => u.author.id === i1.user.id,
                                    max: 1
                                }
                            )

                            const i2 = collector2.map(x => x)[0]

                            if (isNaN(Number(i2.content)) || !isFinite(Number(i2.content)) || Number(i2.content) <= 0) {
                                await i2.delete().catch(() => {})
        
                                await i1.editReply(
                                    {
                                        content: `**(${emojis.errado}) Erro ao processar a mensagem enviada. Por favor verifique o seu conteúdo.**`
                                    }
                                )

                                await msg1.edit(
                                    {
                                        components: components
                                    }
                                )

                                return
                            }

                            rifa.minTickets = Number(i2.content)
                            
                            await i2.delete().catch(() => {})

                            await i1.editReply(
                                {
                                    content: `**(${emojis.certo}) Número mínimo de tickets por entrada definido para \`${rifa.minTickets}\` com sucesso.**`,
                                }
                            )

                            await msg1.edit(
                                {
                                    content: `**(<:tom5_icons_awardcup:1119638381769527427>) Painel de Configuração de Rifa**\n\n> Dados:\n<:tom5_icons_timer:1023251410776768572> | **Data de Encerramento (Obrigatório):** ${rifa.dataFinal ? `<t:${~~(rifa.dataFinal.getTime() / 1000)}:F>` : `\`Não definida\``}\n<:tom5_icons_award:1119638389340258414> | **Prémio:** \`${rifa.premio ? rifa.premio : "Não definido"}\`\n<:tom5_icons_discover:1119638428292759573> | **Tipo:** \`${rifa.global ? "Global" : "Local"}\`\n<:tom5_icons_Person:1119638402325811240> | **Limite Máximo de Usuários:** \`${rifa.maxUsers ? rifa.maxUsers : "Não definido"}\`\n<:tom5_icons_Person:1119638402325811240> | **Mínimo de Usuários:** \`${rifa.minUsers ? rifa.minUsers : "Não definido"}\`\n<:tom5_icons_store:1119638418423566356> | **Mínimo de Tickets por entrada:** \`${rifa.minTickets ? rifa.minTickets : "Não definido"}\`\n<:tom5_icons_channel:1119638377449390100> | **Canal de Logs:** ${rifa.logsChannel ? await client.channels.fetch(rifa.logsChannel) : `\`Não definido\``}\n\n> Para configurar uma rifa, use o menu abaixo.\n-# Nota: O prémio será a soma dos valores dos tickets mais o valor definido pelo criador!`,
                                    components: components
                                }
                            )

                            break
                        }

                        case "logs_channel": {

                            const msg2 = await i1.editReply(
                                {
                                    content: `> **(${emojis.load}) Selecione no meno abaixo o canal para receber as logs.**`,
                                    components: [
                                        new ActionRowBuilder<ChannelSelectMenuBuilder>()
                                        .setComponents(
                                            new ChannelSelectMenuBuilder()
                                            .setChannelTypes(ChannelType.GuildText)
                                            .setCustomId("canal_logs")
                                            .setPlaceholder("Selecionar Canal")
                                        )
                                    ]
                                }
                            )

                            msg2.createMessageComponentCollector(
                                {
                                    componentType: ComponentType.ChannelSelect,
                                    time: 120000,
                                    idle: 45000
                                }
                            ).on("collect", async (i2) => {

                                const channelId = i2.values[0]

                                const channel = await i2.guild.channels.fetch(channelId)

                                rifa.logsChannel = channel.id

                                await i2.deferUpdate()

                                await i1.editReply(
                                    {
                                        content: `**(${emojis.certo}) Canal de logs definido para ${channel} [\`${channel.id}\`] com sucesso.**`,
                                        components: []
                                    }
                                )
        
                                await msg1.edit(
                                    {
                                        content: `**(<:tom5_icons_awardcup:1119638381769527427>) Painel de Configuração de Rifa**\n\n> Dados:\n<:tom5_icons_timer:1023251410776768572> | **Data de Encerramento (Obrigatório):** ${rifa.dataFinal ? `<t:${~~(rifa.dataFinal.getTime() / 1000)}:F>` : `\`Não definida\``}\n<:tom5_icons_award:1119638389340258414> | **Prémio:** \`${rifa.premio ? rifa.premio : "Não definido"}\`\n<:tom5_icons_discover:1119638428292759573> | **Tipo:** \`${rifa.global ? "Global" : "Local"}\`\n<:tom5_icons_Person:1119638402325811240> | **Limite Máximo de Usuários:** \`${rifa.maxUsers ? rifa.maxUsers : "Não definido"}\`\n<:tom5_icons_Person:1119638402325811240> | **Mínimo de Usuários:** \`${rifa.minUsers ? rifa.minUsers : "Não definido"}\`\n<:tom5_icons_store:1119638418423566356> | **Mínimo de Tickets por entrada:** \`${rifa.minTickets ? rifa.minTickets : "Não definido"}\`\n<:tom5_icons_channel:1119638377449390100> | **Canal de Logs:** ${rifa.logsChannel ? await client.channels.fetch(rifa.logsChannel) : `\`Não definido\``}\n\n> Para configurar uma rifa, use o menu abaixo.\n-# Nota: O prémio será a soma dos valores dos tickets mais o valor definido pelo criador!`,
                                        components: components
                                    }
                                )
                            }).on("end", async () => await msg2.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))

                            break
                        }
                    }
                } else if (i1 instanceof ButtonInteraction) {

                    if (i1.customId !== "criar_rifa") return

                    if (!rifa.dataFinal) {

                        await i1.reply(
                            {
                                content: `**(${emojis.errado}) A data final da rifa não foi definida!**`,
                                flags: ["Ephemeral"]
                            }
                        )

                        return

                    } else {
                        
                        rifa.id = generateKey(12)
                        rifa.owner = ctx.user.id
                        rifa.tickets = []

                        await i1.deferUpdate()

                        await msg1.edit(
                            {
                                content: `**(${emojis.certo}) Rifa criada com sucesso [\`${rifa.id}\`].**`,
                                components: []
                            }
                        )


                        const userDoc = await client.db.findUser(
                            {
                                _id: ctx.user.id
                            }
                        ).then(doc => doc)

                        await client.db.updateUser(
                            {
                                _id: ctx.user.id
                            },
                            {
                                $set: {
                                    "economia.carteira": userDoc.economia.carteira - rifa.premio
                                }
                            }
                        )

                        await client.db.updateClient(
                            {
                                _id: client.user.id
                            },
                            {
                                $push: {
                                    rifasAtivas: rifa
                                }
                            }
                        )

                        return
                    }
                }
            }).on("end", async () => await msg1.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))
        }
    }
}