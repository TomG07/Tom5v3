import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import Command from "../../../classes/Command.js";
import emojis from "../../../structures/others/emojis.js";
import { RifasType } from "../../../structures/types/rifasType.js";
import paginator from "../../../structures/functions/paginator.js";

export class Comando extends Command {

    constructor() {
        super(
            {
                name: "procurar",
                description: ".",
                aliases: ["s", "search"],
                botPerms: [],
                category: "economy",
                devOnly: false,
                options: [],
                reference: "rifa",
                reparing: false,
                subCommand: true,
                usage: "/rifa procurar",
                userPerms: []
            }
        )

        this.execute = async ({ client, ctx }) => {

            const components = [
                new ActionRowBuilder<StringSelectMenuBuilder>()
                .setComponents(
                    new StringSelectMenuBuilder()
                    .setCustomId("menu_filtros")
                    .setOptions(
                        [
                            {
                                label: "Procurar",
                                description: "Aplicar os filtros à pesquisa",
                                value: "procurar",
                                emoji: "<:search:1264593787146076212>"
                            },
                            {
                                label: "Tipo",
                                description: "Global ou Local? (OBRIGATÓRIA)",
                                value: "tipo",
                                emoji: "<:tom5_icons_discover:1119638428292759573>"
                            },
                            {
                                label: "Prémio",
                                description: "Valor mínimo e/ou máximo do prémio",
                                value: "premio",
                                emoji: "<:tom5_icons_award:1119638389340258414>"
                            },
                            {
                                label: "Participantes",
                                description: "Valor mínimo e/ou máximo de participantes",
                                value: "participantes",
                                emoji: "<:people:1264593279983419534>"
                            },
                            {
                                label: "Criador",
                                description: "Filtrar por criador",
                                value: "criador",
                                emoji: "<:tom5_icons_owner:1119638425214132235>"
                            }
                        ]
                    )
                )
            ]

            const msg1 = await ctx.reply(
                {
                    content: `**(${emojis.load}) Selecione os filtros para a procura no menu abaixo**\n\n> Dados da procura:\n<:tom5_icons_discover:1119638428292759573> | **Tipo:** \`Não definido\`\n<:tom5_icons_award:1119638389340258414> | **Prémio:** __Mínimo:__ \`Não definido\` - __Máximo:__ \`Não definido\`\n<:people:1264593279983419534> | **Participantes:** __Mínimo:__ \`Não definido\` - __Máximo:__ \`Não definido\`\n<:tom5_icons_owner:1119638425214132235> | **Criador:** \`Não definido\``,
                    components: components
                }
            )

            const filtros: {
                tipo: string,
                premio?: {
                    min?: number,
                    max?: number
                },
                participantes?: {
                    min?: number,
                    max?: number
                },
                dono?: string
            } = {
                tipo: "",
                premio: {
                    max: null,
                    min: null
                },
                dono: null,
                participantes: {
                    max: null,
                    min: null
                }
            }

            const collector1 = msg1.createMessageComponentCollector(
                {
                    time: 120000,
                    idle: 45000,
                    componentType: ComponentType.StringSelect
                }
            )
            
            collector1.on("collect", async (i1) => {

                if (i1.user.id !== ctx.user.id) {
                    return await i1.reply(
                        {
                            content: `**(${emojis.errado}) Interação disponível apenas para ${ctx.user}!**`,
                            flags: ["Ephemeral"]
                        }
                    )
                }

                await i1.deferReply({ flags: ["Ephemeral"] })

                const value = i1.values[0]

                switch (value) {
                    case "tipo": {

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
                                componentType: ComponentType.Button,
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

                                    filtros.tipo = "Global"

                                    await i2.deferUpdate()

                                    await i1.editReply(
                                        {
                                            content: `**(${emojis.certo}) Rifa definida como \`Global\`**`,
                                            components: []
                                        }
                                    )

                                    await msg1.edit(
                                        {
                                            content: `**(${emojis.load}) Selecione os filtros para a procura no menu abaixo**\n\n> Dados da procura:\n<:tom5_icons_discover:1119638428292759573> | **Tipo:** \`${filtros.tipo === "Global" ? filtros.tipo : (filtros.tipo === "Local" ? filtros.tipo : "Não definido")}\`\n<:tom5_icons_award:1119638389340258414> | **Prémio:** __Mínimo:__ \`${filtros.premio.min ? filtros.premio.min : "Não definido"}\` - __Máximo:__ \`${filtros.premio.max ? filtros.premio.max : "Não definido"}\`\n<:people:1264593279983419534> | **Participantes:** __Mínimo:__ \`${filtros.participantes.min ? filtros.participantes.min : "Não definido"}\` - __Máximo:__ \`${filtros.participantes.max ? filtros.participantes.max : "Não definido"}\`\n<:tom5_icons_owner:1119638425214132235> | **Criador:** ${client.users.cache.get(filtros.dono) ? `[${client.users.cache.get(filtros.dono).username}](<https://discord.gg/tbsZVq5WEx>) (\`${client.users.cache.get(filtros.dono).id}\`)` : "Não definido"}`,
                                            components: components
                                        }
                                    )

                                    break
                                }

                                case "local": {

                                    filtros.tipo = "Local"

                                    await i2.deferUpdate()

                                    await i1.editReply(
                                        {
                                            content: `**(${emojis.certo}) Rifa definida como \`Local\`**`,
                                            components: []
                                        }
                                    )

                                    await msg1.edit(
                                        {
                                            content: `**(${emojis.load}) Selecione os filtros para a procura no menu abaixo**\n\n> Dados da procura:\n<:tom5_icons_discover:1119638428292759573> | **Tipo:** \`${filtros.tipo === "Global" ? filtros.tipo : (filtros.tipo === "Local" ? filtros.tipo : "Não definido")}\`\n<:tom5_icons_award:1119638389340258414> | **Prémio:** __Mínimo:__ \`${filtros.premio.min ? filtros.premio.min : "Não definido"}\` - __Máximo:__ \`${filtros.premio.max ? filtros.premio.max : "Não definido"}\`\n<:people:1264593279983419534> | **Participantes:** __Mínimo:__ \`${filtros.participantes.min ? filtros.participantes.min : "Não definido"}\` - __Máximo:__ \`${filtros.participantes.max ? filtros.participantes.max : "Não definido"}\`\n<:tom5_icons_owner:1119638425214132235> | **Criador:** ${client.users.cache.get(filtros.dono) ? `[${client.users.cache.get(filtros.dono).username}](<https://discord.gg/tbsZVq5WEx>) (\`${client.users.cache.get(filtros.dono).id}\`)` : "Não definido"}`,
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

                    case "premio": {

                        const msg2 = await i1.editReply(
                            {
                                content: `**(${emojis.load}) Selecione abaixo o tipo de valor que deseja definir.**`,
                                components: [
                                    new ActionRowBuilder<ButtonBuilder>()
                                    .setComponents(
                                        new ButtonBuilder()
                                        .setCustomId("min")
                                        .setLabel("Mínimo")
                                        .setStyle(ButtonStyle.Secondary),

                                        new ButtonBuilder()
                                        .setCustomId("max")
                                        .setLabel("Máximo")
                                        .setStyle(ButtonStyle.Secondary)
                                    )
                                ]
                            }
                        )

                        msg2.createMessageComponentCollector(
                            {
                                componentType: ComponentType.Button,
                                time: 120000,
                                idle: 45000
                            }
                        ).on("collect", async (i2) => {

                            await i2.deferUpdate()

                            switch (i2.customId) {

                                case "min": {

                                    await i2.editReply(
                                        {
                                            content: `**(${emojis.load}) Envie por mensagem o valor mínimo do prémio**`,
                                            components: []
                                        }
                                    )

                                    const collector2 = await i2.channel.awaitMessages(
                                        {
                                            max: 1,
                                            filter: (u) => u.author.id === ctx.user.id,
                                            time: 120000,
                                            idle: 45000
                                        }
                                    )

                                    const i3 = collector2.map(a => a)[0]

                                    if (isNaN(Number(i3.content)) || !isFinite(Number(i3.content)) || Number(i3.content) <= 0) {
                                        await i3.delete().catch(() => {})
                
                                        await i2.editReply(
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

                                    if (filtros.premio.max && (Number(i3.content) > filtros.premio.max)) {
                                        await i3.delete().catch(() => {})
                
                                        await i2.editReply(
                                            {
                                                content: `**(${emojis.errado}) O valor mínimo não pode ser maior que o máximo já definido!**`
                                            }
                                        )
        
                                        await msg1.edit(
                                            {
                                                components: components
                                            }
                                        )
        
                                        return
                                    }

                                    filtros.premio.min = Number(i3.content)
                        
                                    await i3.delete().catch(() => {})

                                    await i2.editReply(
                                        {
                                            content: `**(${emojis.certo}) Prémio mínimo de \`${filtros.premio.min}\` definido com sucesso.**`,
                                        }
                                    )

                                    await msg1.edit(
                                        {
                                            content: `**(${emojis.load}) Selecione os filtros para a procura no menu abaixo**\n\n> Dados da procura:\n<:tom5_icons_discover:1119638428292759573> | **Tipo:** \`${filtros.tipo === "Global" ? filtros.tipo : (filtros.tipo === "Local" ? filtros.tipo : "Não definido")}\`\n<:tom5_icons_award:1119638389340258414> | **Prémio:** __Mínimo:__ \`${filtros.premio.min ? filtros.premio.min : "Não definido"}\` - __Máximo:__ \`${filtros.premio.max ? filtros.premio.max : "Não definido"}\`\n<:people:1264593279983419534> | **Participantes:** __Mínimo:__ \`${filtros.participantes.min ? filtros.participantes.min : "Não definido"}\` - __Máximo:__ \`${filtros.participantes.max ? filtros.participantes.max : "Não definido"}\`\n<:tom5_icons_owner:1119638425214132235> | **Criador:** ${client.users.cache.get(filtros.dono) ? `[${client.users.cache.get(filtros.dono).username}](<https://discord.gg/tbsZVq5WEx>) (\`${client.users.cache.get(filtros.dono).id}\`)` : "Não definido"}`,
                                            components: components
                                        }
                                    )

                                    break
                                }

                                case "max": {

                                    await i2.editReply(
                                        {
                                            content: `**(${emojis.load}) Envie por mensagem o valor máximo do prémio**`,
                                            components: []
                                        }
                                    )

                                    const collector2 = await i2.channel.awaitMessages(
                                        {
                                            max: 1,
                                            filter: (u) => u.author.id === ctx.user.id,
                                            time: 120000,
                                            idle: 45000
                                        }
                                    )

                                    const i3 = collector2.map(a => a)[0]

                                    if (isNaN(Number(i3.content)) || !isFinite(Number(i3.content)) || Number(i3.content) <= 0) {
                                        await i3.delete().catch(() => {})
                
                                        await i2.editReply(
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

                                    if (filtros.premio.min && (Number(i3.content) < filtros.premio.min)) {
                                        await i3.delete().catch(() => {})
                
                                        await i2.editReply(
                                            {
                                                content: `**(${emojis.errado}) O valor máximo não pode ser menor que o mínimo já definido!**`
                                            }
                                        )
        
                                        await msg1.edit(
                                            {
                                                components: components
                                            }
                                        )
        
                                        return
                                    }

                                    filtros.premio.max = Number(i3.content)
                        
                                    await i3.delete().catch(() => {})

                                    await i2.editReply(
                                        {
                                            content: `**(${emojis.certo}) Prémio máximo de \`${filtros.premio.max}\` definido com sucesso.**`,
                                        }
                                    )

                                    await msg1.edit(
                                        {
                                            content: `**(${emojis.load}) Selecione os filtros para a procura no menu abaixo**\n\n> Dados da procura:\n<:tom5_icons_discover:1119638428292759573> | **Tipo:** \`${filtros.tipo === "Global" ? filtros.tipo : (filtros.tipo === "Local" ? filtros.tipo : "Não definido")}\`\n<:tom5_icons_award:1119638389340258414> | **Prémio:** __Mínimo:__ \`${filtros.premio.min ? filtros.premio.min : "Não definido"}\` - __Máximo:__ \`${filtros.premio.max ? filtros.premio.max : "Não definido"}\`\n<:people:1264593279983419534> | **Participantes:** __Mínimo:__ \`${filtros.participantes.min ? filtros.participantes.min : "Não definido"}\` - __Máximo:__ \`${filtros.participantes.max ? filtros.participantes.max : "Não definido"}\`\n<:tom5_icons_owner:1119638425214132235> | **Criador:** ${client.users.cache.get(filtros.dono) ? `[${client.users.cache.get(filtros.dono).username}](<https://discord.gg/tbsZVq5WEx>) (\`${client.users.cache.get(filtros.dono).id}\`)` : "Não definido"}`,
                                            components: components
                                        }
                                    )

                                    break
                                }
                            }
                        }).on("end", async () => await msg2.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))

                        break
                    }

                    case "participantes": {

                        const msg2 = await i1.editReply(
                            {
                                content: `**(${emojis.load}) Selecione abaixo o tipo de valor que deseja definir.**`,
                                components: [
                                    new ActionRowBuilder<ButtonBuilder>()
                                    .setComponents(
                                        new ButtonBuilder()
                                        .setCustomId("min")
                                        .setLabel("Mínimo")
                                        .setStyle(ButtonStyle.Secondary),

                                        new ButtonBuilder()
                                        .setCustomId("max")
                                        .setLabel("Máximo")
                                        .setStyle(ButtonStyle.Secondary)
                                    )
                                ]
                            }
                        )

                        msg2.createMessageComponentCollector(
                            {
                                componentType: ComponentType.Button,
                                time: 120000,
                                idle: 45000
                            }
                        ).on("collect", async (i2) => {

                            await i2.deferUpdate()

                            switch (i2.customId) {

                                case "min": {

                                    await i2.editReply(
                                        {
                                            content: `**(${emojis.load}) Envie por mensagem o valor mínimo de participantes**`,
                                            components: []
                                        }
                                    )

                                    const collector2 = await i2.channel.awaitMessages(
                                        {
                                            max: 1,
                                            filter: (u) => u.author.id === ctx.user.id,
                                            time: 120000,
                                            idle: 45000
                                        }
                                    )

                                    const i3 = collector2.map(a => a)[0]

                                    if (isNaN(Number(i3.content)) || !isFinite(Number(i3.content)) || Number(i3.content) <= 0) {
                                        await i3.delete().catch(() => {})
                
                                        await i2.editReply(
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

                                    if (filtros.participantes.max && (Number(i3.content) > filtros.participantes.max)) {
                                        await i3.delete().catch(() => {})
                
                                        await i2.editReply(
                                            {
                                                content: `**(${emojis.errado}) O valor mínimo não pode ser maior que o máximo já definido!**`
                                            }
                                        )
        
                                        await msg1.edit(
                                            {
                                                components: components
                                            }
                                        )
        
                                        return
                                    }

                                    filtros.participantes.min = Number(i3.content)
                        
                                    await i3.delete().catch(() => {})

                                    await i2.editReply(
                                        {
                                            content: `**(${emojis.certo}) Número mínimo de participantes de \`${filtros.participantes.min}\` definido com sucesso.**`,
                                        }
                                    )

                                    await msg1.edit(
                                        {
                                            content: `**(${emojis.load}) Selecione os filtros para a procura no menu abaixo**\n\n> Dados da procura:\n<:tom5_icons_discover:1119638428292759573> | **Tipo:** \`${filtros.tipo === "Global" ? filtros.tipo : (filtros.tipo === "Local" ? filtros.tipo : "Não definido")}\`\n<:tom5_icons_award:1119638389340258414> | **Prémio:** __Mínimo:__ \`${filtros.premio.min ? filtros.premio.min : "Não definido"}\` - __Máximo:__ \`${filtros.premio.max ? filtros.premio.max : "Não definido"}\`\n<:people:1264593279983419534> | **Participantes:** __Mínimo:__ \`${filtros.participantes.min ? filtros.participantes.min : "Não definido"}\` - __Máximo:__ \`${filtros.participantes.max ? filtros.participantes.max : "Não definido"}\`\n<:tom5_icons_owner:1119638425214132235> | **Criador:** ${client.users.cache.get(filtros.dono) ? `[${client.users.cache.get(filtros.dono).username}](<https://discord.gg/tbsZVq5WEx>) (\`${client.users.cache.get(filtros.dono).id}\`)` : "Não definido"}`,
                                            components: components
                                        }
                                    )

                                    break
                                }

                                case "max": {

                                    await i2.editReply(
                                        {
                                            content: `**(${emojis.load}) Envie por mensagem o valor máximo de participantes**`,
                                            components: []
                                        }
                                    )

                                    const collector2 = await i2.channel.awaitMessages(
                                        {
                                            max: 1,
                                            filter: (u) => u.author.id === ctx.user.id,
                                            time: 120000,
                                            idle: 45000
                                        }
                                    )

                                    const i3 = collector2.map(a => a)[0]

                                    if (isNaN(Number(i3.content)) || !isFinite(Number(i3.content)) || Number(i3.content) <= 0) {
                                        await i3.delete().catch(() => {})
                
                                        await i2.editReply(
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

                                    if (filtros.participantes.min && (Number(i3.content) < filtros.participantes.min)) {
                                        await i3.delete().catch(() => {})
                
                                        await i2.editReply(
                                            {
                                                content: `**(${emojis.errado}) O valor máximo não pode ser menor que o mínimo já definido!**`
                                            }
                                        )
        
                                        await msg1.edit(
                                            {
                                                components: components
                                            }
                                        )
        
                                        return
                                    }

                                    filtros.participantes.max = Number(i3.content)
                        
                                    await i3.delete().catch(() => {})

                                    await i2.editReply(
                                        {
                                            content: `**(${emojis.certo}) Número máximo de participantes de \`${filtros.premio.max}\` definido com sucesso.**`,
                                        }
                                    )

                                    await msg1.edit(
                                        {
                                            content: `**(${emojis.load}) Selecione os filtros para a procura no menu abaixo**\n\n> Dados da procura:\n<:tom5_icons_discover:1119638428292759573> | **Tipo:** \`${filtros.tipo === "Global" ? filtros.tipo : (filtros.tipo === "Local" ? filtros.tipo : "Não definido")}\`\n<:tom5_icons_award:1119638389340258414> | **Prémio:** __Mínimo:__ \`${filtros.premio.min ? filtros.premio.min : "Não definido"}\` - __Máximo:__ \`${filtros.premio.max ? filtros.premio.max : "Não definido"}\`\n<:people:1264593279983419534> | **Participantes:** __Mínimo:__ \`${filtros.participantes.min ? filtros.participantes.min : "Não definido"}\` - __Máximo:__ \`${filtros.participantes.max ? filtros.participantes.max : "Não definido"}\`\n<:tom5_icons_owner:1119638425214132235> | **Criador:** ${client.users.cache.get(filtros.dono) ? `[${client.users.cache.get(filtros.dono).username}](<https://discord.gg/tbsZVq5WEx>) (\`${client.users.cache.get(filtros.dono).id}\`)` : "Não definido"}`,
                                            components: components
                                        }
                                    )

                                    break
                                }
                            }
                        }).on("end", async () => await msg2.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))

                        break
                    }

                    case "criador": {

                        const msg2 = await i1.editReply(
                            {
                                content: `**(${emojis.load}) Envie por mensagem a menção ou o ID do usuário**`
                            }
                        )

                        const collector2 = await i1.channel.awaitMessages(
                            {
                                max: 1,
                                filter: (u) => u.author.id === ctx.user.id,
                                time: 120000,
                                idle: 45000
                            }
                        )

                        const i2 = collector2.map(a => a)[0]

                        let id: string;

                        const mention = i2.mentions.members.first()

                        if (!mention) {
                            id = i2.content.split(" ")[0]
                        } else {
                            id = mention.id
                        }

                        const fetchUser = await client.users.fetch(id)

                        if (!fetchUser) {
                            await i2.delete().catch(() => {})
                
                            await msg2.edit(
                                {
                                    content: `**(${emojis.errado}) Erro ao tentar encontrar o usuário.**`
                                }
                            )

                            await msg1.edit(
                                {
                                    components: components
                                }
                            )

                            return
                        }

                        filtros.dono = fetchUser.id

                        await i2.delete().catch(() => {})

                        await i1.editReply(
                            {
                                content: `**(${emojis.certo}) Usuário ${fetchUser} (\`${fetchUser.id}\`) definido com sucesso.**`,
                                components: []
                            }
                        )

                        await msg1.edit(
                            {
                                content: `**(${emojis.load}) Selecione os filtros para a procura no menu abaixo**\n\n> Dados da procura:\n<:tom5_icons_discover:1119638428292759573> | **Tipo:** \`${filtros.tipo === "Global" ? filtros.tipo : (filtros.tipo === "Local" ? filtros.tipo : "Não definido")}\`\n<:tom5_icons_award:1119638389340258414> | **Prémio:** __Mínimo:__ \`${filtros.premio.min ? filtros.premio.min : "Não definido"}\` - __Máximo:__ \`${filtros.premio.max ? filtros.premio.max : "Não definido"}\`\n<:people:1264593279983419534> | **Participantes:** __Mínimo:__ \`${filtros.participantes.min ? filtros.participantes.min : "Não definido"}\` - __Máximo:__ \`${filtros.participantes.max ? filtros.participantes.max : "Não definido"}\`\n<:tom5_icons_owner:1119638425214132235> | **Criador:** ${client.users.cache.get(filtros.dono) ? `[${client.users.cache.get(filtros.dono).username}](<https://discord.gg/tbsZVq5WEx>) (\`${client.users.cache.get(filtros.dono).id}\`)` : "Não definido"}`,
                                components: components
                            }
                        )

                        break
                    }

                    case "procurar": {

                        if (!filtros.tipo) {
                            await i1.editReply(
                                {
                                    content: `**(${emojis.errado}) Indique o tipo da rifa que deseja procurar!**`
                                }
                            )
    
                            await msg1.edit(
                                {
                                    components: components
                                }
                            )
    
                            return
                        }
    
                        let rifas: RifasType[] = await client.db.findClient(
                            {
                                _id: client.user.id
                            }
                        ).then(doc => doc.rifasAtivas)
    
                        rifas = rifas.filter(rifa => {
                            
                            if (filtros.tipo === "Global") {
                                return rifa.global === true
                            } else {
                                return rifa.global === false
                            }
                        })
    
                        if (filtros.dono) {
                            rifas = rifas.filter(rifa => rifa.owner === filtros.dono)
                        }
    
                        if (filtros.premio) {
                            if (filtros.premio.min) {
                                rifas = rifas.filter(rifa => rifa.premio > filtros.premio.min)
                            }
    
                            if (filtros.premio.max) {
                                rifas = rifas.filter(rifa => rifa.premio < filtros.premio.max)
                            }
                        }
    
                        if (filtros.participantes) {
    
                            if (filtros.participantes.min) {
                                rifas.filter(rifa => {
                                    let users: number = 0
    
                                    if (!rifa.tickets) return false
    
                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                    for (const t of rifa.tickets) {
                                        users++
                                    }
    
                                    return filtros.participantes.min < users
                                })
                            }
    
                            if (filtros.participantes.max) {
                                rifas.filter(rifa => {
                                    let users: number = 0
    
                                    if (!rifa.tickets) return false
    
                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                    for (const t of rifa.tickets) {
                                        users++
                                    }
    
                                    return filtros.participantes.max > users
                                })
                            }
                        }
    
                        if (!rifas || rifas.length < 1) {
    
                            await i1.editReply(
                                {
                                    content: `**(${emojis.errado}) Não foram encontradas rifas com os filtros selecionados!**`
                                }
                            )
    
                            await msg1.edit(
                                {
                                    components: components
                                }
                            )
    
                            return
                        }
    
                        let paginatorData = paginator(
                            {
                                data: rifas,
                                perPage: 1,
                                page: 1
                            }
                        )
    
                        let rifa = paginatorData.pageData[0]
                        
                        let usuários: number = 0
                        let entries: number = 0
    
                        if (rifa.tickets.length > 0) {
                            for (const t of rifa.tickets) {
                                usuários++
                                entries += t.entries
                            }
                        }
    
                        let prémio = rifa.premio + (entries * 2000)

                        await i1.deleteReply()
    
                        const msg2 = await msg1.edit(
                            {
                                content: `**(${emojis.certo}) Rifa(s) encontrada(s)!**`,
                                embeds: [
                                    new EmbedBuilder()
                                    .setDescription(`<:tom5_icons_timer:1023251410776768572> | **Data de Encerramento:** <t:${~~(rifa.dataFinal.getTime() / 1000)}:R>\n<:tom5_icons_award:1119638389340258414> | **Prémio:** \`${prémio}\` (${rifa.winner ? await client.users.fetch(rifa.winner).then(u => `${u} - \`${u.id}\``) : `Nenhum vencedor`})\n<:defaultperms:1264590420307087370> | **Participantes:** \`${usuários}\`\n<:tom5_icons_discover:1119638428292759573> | **Tipo:** \`${rifa.global ? "Global" : "Local"}\`\n<:tom5_icons_Person:1119638402325811240> | **Limite Máximo de Usuários:** \`${rifa.maxUsers ? rifa.maxUsers : "Não definido"}\`\n<:tom5_icons_Person:1119638402325811240> | **Mínimo de Usuários:** \`${rifa.minUsers ? rifa.minUsers : "Não definido"}\`\n<:tom5_icons_store:1119638418423566356> | **Mínimo de Tickets por entrada:** \`${rifa.minTickets ? rifa.minTickets : "Não definido"}\`\n<:tom5_icons_channel:1119638377449390100> | **Canal de Logs:** ${rifa.logsChannel ? await client.channels.fetch(rifa.logsChannel) : `\`Não definido\``}\n<:tom5_icons_owner:1119638425214132235> | **Criador:** ${await client.users.fetch(rifa.owner).then(u => `[${u.username}](<https://discord.gg/tbsZVq5WEx>) [\`${u.id}\`]`)}\n-# Nota: O prémio será a soma dos valores dos tickets mais o valor definido pelo criador!`)
                                ],
                                components: paginatorData.components
                            }
                        )

                        collector1.stop()
    
                        msg2.createMessageComponentCollector(
                            {
                                componentType: ComponentType.Button,
                                time: 120000,
                                idle: 45000
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
    
                                case "voltar": {
            
                                    paginatorData = paginator(
                                        {
                                            data: rifas,
                                            perPage: 1,
                                            page: paginatorData.page - 1
                                        }
                                    )
    
                                    rifa = paginatorData.pageData[0]
                                    usuários = 0
                                    entries = 0
                        
                                    if (rifa.tickets.length > 0) {
                                        for (const t of rifa.tickets) {
                                            usuários++
                                            entries += t.entries
                                        }
                                    }
    
                                    prémio = rifa.premio + (entries * 2000)
            
                                    await i2.update(
                                        {
                                            embeds: [
                                                new EmbedBuilder()
                                                .setDescription(`<:tom5_icons_timer:1023251410776768572> | **Data de Encerramento:** <t:${~~(rifa.dataFinal.getTime() / 1000)}:R>\n<:tom5_icons_award:1119638389340258414> | **Prémio:** \`${prémio}\` (${rifa.winner ? await client.users.fetch(rifa.winner).then(u => `${u} - \`${u.id}\``) : `Nenhum vencedor`})\n<:defaultperms:1264590420307087370> | **Participantes:** \`${usuários}\`\n<:tom5_icons_discover:1119638428292759573> | **Tipo:** \`${rifa.global ? "Global" : "Local"}\`\n<:tom5_icons_Person:1119638402325811240> | **Limite Máximo de Usuários:** \`${rifa.maxUsers ? rifa.maxUsers : "Não definido"}\`\n<:tom5_icons_Person:1119638402325811240> | **Mínimo de Usuários:** \`${rifa.minUsers ? rifa.minUsers : "Não definido"}\`\n<:tom5_icons_store:1119638418423566356> | **Mínimo de Tickets por entrada:** \`${rifa.minTickets ? rifa.minTickets : "Não definido"}\`\n<:tom5_icons_channel:1119638377449390100> | **Canal de Logs:** ${rifa.logsChannel ? await client.channels.fetch(rifa.logsChannel) : `\`Não definido\``}\n<:tom5_icons_owner:1119638425214132235> | **Criador:** ${await client.users.fetch(rifa.owner).then(u => `[${u.username}](<https://discord.gg/tbsZVq5WEx>) [\`${u.id}\`]`)}\n-# Nota: O prémio será a soma dos valores dos tickets mais o valor definido pelo criador!`)
                                            ],
                                            components: paginatorData.components
                                        }
                                    )
            
                                    break
                                }
            
                                case "proximo": {
            
                                    paginatorData = paginator(
                                        {
                                            data: rifas,
                                            perPage: 1,
                                            page: paginatorData.page + 1
                                        }
                                    )
    
                                    rifa = paginatorData.pageData[0]
                                    usuários = 0
                                    entries = 0
                        
                                    if (rifa.tickets.length > 0) {
                                        for (const t of rifa.tickets) {
                                            usuários++
                                            entries += t.entries
                                        }
                                    }
    
                                    prémio = rifa.premio + (entries * 2000)
            
                                    await i2.update(
                                        {
                                            embeds: [
                                                new EmbedBuilder()
                                                .setDescription(`<:tom5_icons_timer:1023251410776768572> | **Data de Encerramento:** <t:${~~(rifa.dataFinal.getTime() / 1000)}:R>\n<:tom5_icons_award:1119638389340258414> | **Prémio:** \`${prémio}\` (${rifa.winner ? await client.users.fetch(rifa.winner).then(u => `${u} - \`${u.id}\``) : `Nenhum vencedor`})\n<:defaultperms:1264590420307087370> | **Participantes:** \`${usuários}\`\n<:tom5_icons_discover:1119638428292759573> | **Tipo:** \`${rifa.global ? "Global" : "Local"}\`\n<:tom5_icons_Person:1119638402325811240> | **Limite Máximo de Usuários:** \`${rifa.maxUsers ? rifa.maxUsers : "Não definido"}\`\n<:tom5_icons_Person:1119638402325811240> | **Mínimo de Usuários:** \`${rifa.minUsers ? rifa.minUsers : "Não definido"}\`\n<:tom5_icons_store:1119638418423566356> | **Mínimo de Tickets por entrada:** \`${rifa.minTickets ? rifa.minTickets : "Não definido"}\`\n<:tom5_icons_channel:1119638377449390100> | **Canal de Logs:** ${rifa.logsChannel ? await client.channels.fetch(rifa.logsChannel) : `\`Não definido\``}\n<:tom5_icons_owner:1119638425214132235> | **Criador:** ${await client.users.fetch(rifa.owner).then(u => `[${u.username}](<https://discord.gg/tbsZVq5WEx>) [\`${u.id}\`]`)}\n-# Nota: O prémio será a soma dos valores dos tickets mais o valor definido pelo criador!`)
                                            ],
                                            components: paginatorData.components
                                        }
                                    )
            
                                    break
                                }
                            }
                        }).on("end", async () => await msg2.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))

                        break
                    }
                }
            }).on("end", async () => await msg1.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))
        }
    }
}