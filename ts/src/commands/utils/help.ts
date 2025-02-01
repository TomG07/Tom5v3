import { ActionRowBuilder, ApplicationCommand, ButtonBuilder, ButtonStyle, ChannelType, Collection, ComponentType, EmbedBuilder, GuildResolvable, ModalBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import Command from "../../classes/Command.js";
import Tom5 from "../../classes/Tom5.js";
import emojis from "../../structures/others/emojis.js";
import capitalize from "../../structures/functions/capitalize.js";
import colors from "../../structures/others/colors.js";

export class Comando extends Command {

    constructor() {
        super(
            {
                name: "help",
                description: '[ÚTEIS] Obtém ajuda',
                aliases: ["ajuda"],
                botPerms: [],
                category: "utils",
                devOnly: false,
                reference: null,
                reparing: false,
                subCommand: null,
                usage: "/help",
                userPerms: [],
                options: [],
                nameLocalizations: {
                    "pt-BR": "ajuda",
                    "en-US": "help"
                },
                descriptionLocalizations: {
                    "pt-BR": "[ÚTEIS] Obtém ajuda",
                    "en-US": "[USEFUL] Get help"
                },
                userIntegration: true
            }
        )
        
        this.execute = async ({ client, ctx }) => {

            const components1 = [
                new ActionRowBuilder<ButtonBuilder>()
                .setComponents(
                    new ButtonBuilder()
                    .setCustomId("comandos")
                    .setLabel('Comandos')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("<:tom5_icons_menu:1013546811765559366>"),

                    new ButtonBuilder()
                    .setCustomId("suporte")
                    .setLabel('Suporte')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("<:tom5_icons_friends:1013546804723327036>"),

                    new ButtonBuilder()
                    .setCustomId("bugs")
                    .setLabel('Bugs')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji("<:tom5_icons_discordbughunter:1013546788722057236>")
                )
            ]

            const msg1 = await ctx.reply(
                {
                    embeds: [
                        new EmbedBuilder()
                        .setColor(colors.normal)
                        .setDescription(`**> Olá ${ctx.user}! Seleciona abaixo o tipo de ajuda que queres receber**`)
                    ],
                    components: components1
                }
            )

            const collector1 = msg1.createMessageComponentCollector(
                {
                    componentType: ComponentType.Button,
                    time: 120000,
                    idle: 45000
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

                await i1.deferUpdate()

                await msg1.edit(
                    {
                        content: "‎",
                        embeds: [],
                        components: []
                    }
                )

                switch (i1.customId) {
                    case "comandos": {

                        const _ = await msg1.edit(
                            {
                                content: `(${emojis.load}) A carregar comandos...`,
                                embeds: [],
                                components: []
                            }
                        )

                        const commands = await client.application.commands.fetch()

                        const categorias = findCategories(client, commands)

                        const cmdObject = {}
                        
                        const components = [
                            new ActionRowBuilder<StringSelectMenuBuilder>()
                            .addComponents(
                                new StringSelectMenuBuilder()
                                .setCustomId("menu_ajuda")
                                .setPlaceholder("Selecionar Categoria")
                            )
                        ]

                        categorias.forEach(cat => {
                            cmdObject[cat] = filterCommands(client, commands, cat)

                            components[0].components[0].addOptions(
                                new StringSelectMenuOptionBuilder()
                                .setLabel(capitalize(cat))
                                .setValue(cat)
                                .setDefault(false)
                            )
                        })

                        const msg2 = await _.edit(
                            {
                                content: `> Para receber ajuda sobre os commandos, seleciona abaixo a categoria.`,
                                components: components
                            }
                        )

                        const collector2 = msg2.createMessageComponentCollector(
                            {
                                componentType: ComponentType.StringSelect,
                                time: 120000,
                                idle: 45000
                            }
                        )

                        collector2.on("collect", async (i2) => {

                            await i2.deferUpdate()

                            const value = i2.values[0]

                            const catCommands = cmdObject[value]

                            let replyMsg = ""

                            for (let i = 0; i < catCommands.clientCommands.length; i++) {

                                const clientCmd: ApplicationCommand = catCommands.clientCommands[i]
                                const cachedCmd: CachedCommandOptions = catCommands.cachedCommands.get(clientCmd.name)

                                replyMsg += `- ${cachedCmd.reparing} </${clientCmd.name}:${clientCmd.id}> ${cachedCmd.description} [\`${cachedCmd.usage}\`]\n`

                                if (cachedCmd.subcommands.size > 0) {
                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                    for (const [_, subCachedOptions] of cachedCmd.subcommands) {

                                        replyMsg += ` - ${subCachedOptions.reparing} </${subCachedOptions.name}:${subCachedOptions.id}> ${subCachedOptions.description} [\`${subCachedOptions.usage}\`]\n`
                                    }
                                }
                            }

                            replyMsg += `\n>>> **Legenda**\n- (${emojis.certo}) Comando Operacional | (${emojis.errado}) Comando em Reparação\n- \`[]\` Parâmetros opcionais\n- \`<>\` Parâmetros obrigatórios`

                            components[0].components[0].options.forEach(o => o.setDefault(false))
                            components[0].components[0].options.find(o => o.data.value === value).setDefault(true)

                            await i2.editReply(
                                {
                                    content: replyMsg,
                                    components: components
                                }
                            )

                        }).on("end", async () => await msg2.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))

                        break
                    }

                    case "suporte": {

                        const components2 = [
                            new ActionRowBuilder<ButtonBuilder>()
                            .setComponents(
                                new ButtonBuilder()
                                .setCustomId("começar")
                                .setLabel("Começar Formulário")
                                .setStyle(ButtonStyle.Secondary)
                            )
                        ]

                        const msg2 = await msg1.edit(
                            {
                                content: `> Para obter suporte, preencha um breve formulário para que a ajuda seja o mais precisa possível.`,
                                components: components2
                            }
                        )

                        const collector2 = msg2.createMessageComponentCollector(
                            {
                                componentType: ComponentType.Button,
                                time: 120000,
                                idle: 45000
                            }
                        )

                        collector2.on("collect", async (i2) => {

                            if (i2.customId !== "começar") return

                            await i2.deferUpdate()

                            const componentsp1 = [
                                new ActionRowBuilder<StringSelectMenuBuilder>()
                                .setComponents(
                                    new StringSelectMenuBuilder()
                                    .setCustomId("tipos_suporte")
                                    .setPlaceholder("Selecione o tipo de suporte")
                                    .setOptions(
                                        {
                                            label: "Comando/Sistema",
                                            description: "Receba ajuda acerca de um comando ou sistema",
                                            value: "comando",
                                            emoji: "<:tom5_icons_OAuth2:1013547865194377338>"
                                        },
                                        {
                                            label: "Parcerias",
                                            description: "Receba ajuda acerca das parcerias com o Tom5",
                                            value: "parcerias",
                                            emoji: "<:tom5_icons_partner:1013546823857746001>"
                                        },
                                        {
                                            label: "Dados pessoais",
                                            description: "Receba ajuda acerca dos seus dados pessoais coletados",
                                            value: "dados_pessoais",
                                            emoji: "<:tom5_icons_discordmod:1013546791767122004>"
                                        }
                                    )
                                )
                            ]

                            const pergunta1 = await i2.editReply(
                                {
                                    content: `**Primeira Etapa**\n> Selecione o tipo de suporte que desja receber`,
                                    components: componentsp1
                                }
                            )

                            const collectorPergunta1 = pergunta1.createMessageComponentCollector(
                                {
                                    componentType: ComponentType.StringSelect,
                                    time: 120000,
                                    idle: 45000
                                }
                            )

                            collectorPergunta1.on("collect", async (p1) => {

                                const value = p1.values[0]

                                switch (value) {

                                    case "comando": {

                                        await p1.showModal(
                                            new ModalBuilder()
                                            .setCustomId("modal_comamandos")
                                            .setTitle("Comando / Sistemas")
                                            .setComponents(
                                                new ActionRowBuilder<TextInputBuilder>()
                                                .addComponents(
                                                    new TextInputBuilder()
                                                    .setCustomId("nomeComando")
                                                    .setLabel("Nome do comando/sistema")
                                                    .setPlaceholder("Nome do comando ou sistema")
                                                    .setRequired(true)
                                                    .setStyle(TextInputStyle.Short),
                                                ),

                                                new ActionRowBuilder<TextInputBuilder>()
                                                .addComponents(
                                                    new TextInputBuilder()
                                                    .setCustomId("descrição")
                                                    .setLabel("Descrição do suporte")
                                                    .setPlaceholder("Descrição")
                                                    .setRequired(true)
                                                    .setStyle(TextInputStyle.Paragraph),
                                                ),
                                            )
                                        )
                                        
                                        const p1_2 = await p1.awaitModalSubmit(
                                            {
                                                time: 400000,
                                                filter: (u) => u.user.id === ctx.user.id
                                            }
                                        )

                                        const nome = p1_2.fields.getTextInputValue("nomeComando")
                                        const descricao = p1_2.fields.getTextInputValue("descrição")

                                        await p1_2.deferUpdate()

                                        // ALTERAR DEPOIS
                                        const serverSuporte = client.guilds.cache.get("1133531362419281940")
                                        const catSuporte = "1263939514779566244"

                                        const verificar = serverSuporte.channels.cache.find(c => c.type === ChannelType.GuildText && c.topic?.includes(`${p1_2.user.id}`))

                                        if (verificar) {
                                            await p1_2.editReply(
                                                {
                                                    content: `> **${emojis.errado} Já existe um ticket aberto! Por favor, confira as atualizações na sua DM**`,
                                                    components: []
                                                }
                                            )

                                            return
                                        }

                                        const canalSuporte = await serverSuporte.channels.create(
                                            {
                                                name: `suporte-${p1_2.user.username}`,
                                                parent: catSuporte,
                                                permissionOverwrites: [
                                                    {
                                                        id: serverSuporte.roles.everyone,
                                                        deny: ["ViewChannel"]
                                                    }
                                                ],
                                                topic: `${p1_2.user.id}`,
                                                position: 99
                                            }
                                        )

                                        await canalSuporte.send(
                                            {
                                                content: `## **Novo pedido de suporte - Comando/Sistema**\n\n**Informações:**\n> **Usuário:** ${p1_2.user} [\`${p1_2.user.id}\`]\n\n> **Comando/Sistema:** ${nome}\n\n>>> **Mensagem:**\n\`\`\`${descricao}\`\`\``
                                            }
                                        )

                                        const dmUser = await p1_2.user.createDM(true)

                                        await dmUser.send(
                                            {
                                                embeds: [
                                                    new EmbedBuilder()
                                                    .setColor(colors.certo)
                                                    .setDescription(`> **${emojis.certo} O teu pedido foi registado.**`),

                                                    new EmbedBuilder()
                                                    .setColor(colors.normal)
                                                    .setDescription(`> **As atualizações do teu pedido de suporte serão recebidas via este canal. Por favor, não feches as tuas DM's.**`)
                                                ]
                                            }
                                        ).catch(async () => {
                                            const a1 = await p1_2.editReply(
                                                {
                                                    content: `> **${emojis.errado} Erro ao tentar enviuar mensagem para as tuas DM's! Por favor, abre-as para receberes atualizações.**`,
                                                    components: [
                                                        new ActionRowBuilder<ButtonBuilder>()
                                                        .setComponents(
                                                            new ButtonBuilder()
                                                            .setCustomId("retry")
                                                            .setLabel("Tentar denovo")
                                                            .setStyle(ButtonStyle.Secondary)
                                                        )
                                                    ],
                                                }
                                            )

                                            a1.createMessageComponentCollector(
                                                {
                                                    componentType: ComponentType.Button,
                                                    time: 120000,
                                                    idle: 45000
                                                }
                                            ).on("collect", async (i) => {

                                                const dmUser = await p1_2.user.createDM(true)

                                                await dmUser.send(
                                                    {
                                                        embeds: [
                                                            new EmbedBuilder()
                                                            .setColor(colors.certo)
                                                            .setDescription(`> **${emojis.certo} O teu pedido foi registado.**`),

                                                            new EmbedBuilder()
                                                            .setColor(colors.normal)
                                                            .setDescription(`> **As atualizações do teu pedido de suporte serão recebidas via este canal. Por favor, não feches as tuas DM's.**`)
                                                        ]
                                                    }
                                                ).catch(async () => {
                                                    return await i.update(`> **Erro ao reenviar... Tentativa de suporte falhada. Tente reenviar suporte dentro de alguns minutos**`)
                                                })

                                                await dmUser.send(`**Mensagem enviada:** ${descricao}`)

                                                await p1_2.editReply(
                                                    {
                                                        content: `> **${emojis.certo} Formulário enviado! As atualizações chegarão às tuas mensagens privadas! (Se não as tiveres abertas, não receberás ajuda!)**`,
                                                        components: []
                                                    }
                                                )

                                                const clientDoc = await client.db.findClient(
                                                    {
                                                        _id: client.user.id
                                                    },
                                                    true
                                                )
        
                                                let tickets = clientDoc.tickets || new Map()
        
                                                tickets = tickets.set(canalSuporte.id, ctx.user.id)
        
                                                await client.db.updateClient(
                                                    {
                                                        _id: client.user.id
                                                    },
                                                    {
                                                        $set: {
                                                            "tickets": tickets
                                                        }
                                                    }
                                                )
                                            }).on("end", async () => await a1.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))
                                        })

                                        await dmUser.send(`**Mensagem enviada:** ${descricao}`)

                                        await p1_2.editReply(
                                            {
                                                content: `> **${emojis.certo} Formulário enviado! As atualizações chegarão às tuas mensagens privadas! (Se não as tiveres abertas, não receberás ajuda!)**`,
                                                components: []
                                            }
                                        )

                                        const clientDoc = await client.db.findClient(
                                            {
                                                _id: client.user.id
                                            },
                                            true
                                        )

                                        let tickets = clientDoc.tickets || new Map()

                                        tickets = tickets.set(canalSuporte.id, ctx.user.id)

                                        await client.db.updateClient(
                                            {
                                                _id: client.user.id
                                            },
                                            {
                                                $set: {
                                                    "tickets": tickets
                                                }
                                            }
                                        )

                                        break
                                    }

                                    case "parcerias": {

                                        await p1.showModal(
                                            new ModalBuilder()
                                            .setCustomId("modal_parcerias")
                                            .setTitle("Parcerias")
                                            .setComponents(
                                                new ActionRowBuilder<TextInputBuilder>()
                                                .addComponents(
                                                    new TextInputBuilder()
                                                    .setCustomId("descrição")
                                                    .setLabel("Descrição da sua dúvida")
                                                    .setRequired(true)
                                                    .setStyle(TextInputStyle.Paragraph),
                                                )
                                            )
                                        )
                                        
                                        const p1_2 = await p1.awaitModalSubmit(
                                            {
                                                time: 400000,
                                                filter: (u) => u.user.id === ctx.user.id
                                            }
                                        )

                                        const descricao = p1_2.fields.getTextInputValue("descrição")

                                        await p1_2.deferUpdate()

                                        // ALTERAR DEPOIS
                                        const serverSuporte = client.guilds.cache.get("1133531362419281940")
                                        const catSuporte = "1263939514779566244"

                                        const verificar = serverSuporte.channels.cache.find(c => c.type === ChannelType.GuildText && c.topic?.includes(`${p1_2.user.id}`))

                                        if (verificar) {
                                            await p1_2.editReply(
                                                {
                                                    content: `> **${emojis.errado} Já existe um ticket aberto! Por favor, confira as atualizações na sua DM**`,
                                                    components: []
                                                }
                                            )

                                            return
                                        }

                                        const canalSuporte = await serverSuporte.channels.create(
                                            {
                                                name: `suporte-${p1_2.user.username}`,
                                                parent: catSuporte,
                                                permissionOverwrites: [
                                                    {
                                                        id: serverSuporte.roles.everyone,
                                                        deny: ["ViewChannel"]
                                                    }
                                                ],
                                                topic: `${p1_2.user.id}`,
                                                position: 99
                                            }
                                        )

                                        await canalSuporte.send(
                                            {
                                                content: `## **Novo pedido de suporte - Parcerias**\n\n**Informações:**\n> **Usuário:** ${p1_2.user} [\`${p1_2.user.id}\`]\n\n>>> **Descrição:** \n\`\`\`${descricao}\`\`\``
                                            }
                                        )

                                        const dmUser = await p1_2.user.createDM(true)

                                        await dmUser.send(
                                            {
                                                embeds: [
                                                    new EmbedBuilder()
                                                    .setColor(colors.certo)
                                                    .setDescription(`> **${emojis.certo} O teu pedido foi registado.**`),

                                                    new EmbedBuilder()
                                                    .setColor(colors.normal)
                                                    .setDescription(`> **As atualizações do teu pedido de suporte serão recebidas via este canal. Por favor, não feches as tuas DM's.**`)
                                                ]
                                            }
                                        ).catch(async () => {
                                            const a1 = await p1_2.editReply(
                                                {
                                                    content: `> **${emojis.errado} Erro ao tentar enviuar mensagem para as tuas DM's! Por favor, abre-as para receberes atualizações.**`,
                                                    components: [
                                                        new ActionRowBuilder<ButtonBuilder>()
                                                        .setComponents(
                                                            new ButtonBuilder()
                                                            .setCustomId("retry")
                                                            .setLabel("Tentar denovo")
                                                            .setStyle(ButtonStyle.Secondary)
                                                        )
                                                    ],
                                                }
                                            )

                                            a1.createMessageComponentCollector(
                                                {
                                                    componentType: ComponentType.Button,
                                                    time: 120000,
                                                    idle: 45000
                                                }
                                            ).on("collect", async (i) => {

                                                const dmUser = await p1_2.user.createDM(true)

                                                await dmUser.send(
                                                    {
                                                        embeds: [
                                                            new EmbedBuilder()
                                                            .setColor(colors.certo)
                                                            .setDescription(`> **${emojis.certo} O teu pedido foi registado.**`),

                                                            new EmbedBuilder()
                                                            .setColor(colors.normal)
                                                            .setDescription(`> **As atualizações do teu pedido de suporte serão recebidas via este canal. Por favor, não feches as tuas DM's.**`)
                                                        ]
                                                    }
                                                ).catch(async () => {
                                                    return await i.update(`> **Erro ao reenviar... Tentativa de suporte falhada. Tente reenviar suporte dentro de alguns minutos**`)
                                                })

                                                await dmUser.send(`**Mensagem enviada:** ${descricao}`)

                                                await p1_2.editReply(
                                                    {
                                                        content: `> **${emojis.certo} Formulário enviado! As atualizações chegarão às tuas mensagens privadas! (Se não as tiveres abertas, não receberás ajuda!)**`,
                                                        components: []
                                                    }
                                                )

                                                const clientDoc = await client.db.findClient(
                                                    {
                                                        _id: client.user.id
                                                    },
                                                    true
                                                )
        
                                                let tickets = clientDoc.tickets || new Map()
        
                                                tickets = tickets.set(canalSuporte.id, ctx.user.id)
        
                                                await client.db.updateClient(
                                                    {
                                                        _id: client.user.id
                                                    },
                                                    {
                                                        $set: {
                                                            "tickets": tickets
                                                        }
                                                    }
                                                )
                                            }).on("end", async () => await a1.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))
                                        })

                                        await dmUser.send(`**Mensagem enviada:** ${descricao}`)

                                        await p1_2.editReply(
                                            {
                                                content: `> **${emojis.certo} Formulário enviado! As atualizações chegarão às tuas mensagens privadas! (Se não as tiveres abertas, não receberás ajuda!)**`,
                                                components: []
                                            }
                                        )

                                        const clientDoc = await client.db.findClient(
                                            {
                                                _id: client.user.id
                                            },
                                            true
                                        )

                                        let tickets = clientDoc.tickets || new Map()

                                        tickets = tickets.set(canalSuporte.id, ctx.user.id)

                                        await client.db.updateClient(
                                            {
                                                _id: client.user.id
                                            },
                                            {
                                                $set: {
                                                    "tickets": tickets
                                                }
                                            }
                                        )

                                        break
                                    }

                                    case "dados_pessoais": {

                                        await p1.showModal(
                                            new ModalBuilder()
                                            .setCustomId("modal_dadospessoais")
                                            .setTitle("Dados Pessoais")
                                            .setComponents(
                                                new ActionRowBuilder<TextInputBuilder>()
                                                .addComponents(
                                                    new TextInputBuilder()
                                                    .setCustomId("descrição")
                                                    .setLabel("Descrição do seu pedido")
                                                    .setRequired(true)
                                                    .setStyle(TextInputStyle.Paragraph),
                                                )
                                            )
                                        )
                                        
                                        const p1_2 = await p1.awaitModalSubmit(
                                            {
                                                time: 400000,
                                                filter: (u) => u.user.id === ctx.user.id
                                            }
                                        )

                                        const descricao = p1_2.fields.getTextInputValue("descrição")

                                        await p1_2.deferUpdate()

                                        // ALTERAR DEPOIS
                                        const serverSuporte = client.guilds.cache.get("1133531362419281940")
                                        const catSuporte = "1263939514779566244"

                                        const verificar = serverSuporte.channels.cache.find(c => c.type === ChannelType.GuildText && c.topic?.includes(`${p1_2.user.id}`))

                                        if (verificar) {
                                            await p1_2.editReply(
                                                {
                                                    content: `> **${emojis.errado} Já existe um ticket aberto! Por favor, confira as atualizações na sua DM**`,
                                                    components: []
                                                }
                                            )

                                            return
                                        }

                                        const canalSuporte = await serverSuporte.channels.create(
                                            {
                                                name: `suporte-${p1_2.user.username}`,
                                                parent: catSuporte,
                                                permissionOverwrites: [
                                                    {
                                                        id: serverSuporte.roles.everyone,
                                                        deny: ["ViewChannel"]
                                                    }
                                                ],
                                                topic: `${p1_2.user.id}`,
                                                position: 99
                                            }
                                        )

                                        await canalSuporte.send(
                                            {
                                                content: `## **Novo pedido de suporte - Dados Pessoais**\n\n**Informações:**\n> **Usuário:** ${p1_2.user} [\`${p1_2.user.id}\`]\n\n>>> **Descrição:** \n\`\`\`${descricao}\`\`\``
                                            }
                                        )

                                        const dmUser = await p1_2.user.createDM(true)

                                        await dmUser.send(
                                            {
                                                embeds: [
                                                    new EmbedBuilder()
                                                    .setColor(colors.certo)
                                                    .setDescription(`> **${emojis.certo} O teu pedido foi registado.**`),

                                                    new EmbedBuilder()
                                                    .setColor(colors.normal)
                                                    .setDescription(`> **As atualizações do teu pedido de suporte serão recebidas via este canal. Por favor, não feches as tuas DM's.**`)
                                                ]
                                            }
                                        ).catch(async () => {
                                            const a1 = await p1_2.editReply(
                                                {
                                                    content: `> **${emojis.errado} Erro ao tentar enviuar mensagem para as tuas DM's! Por favor, abre-as para receberes atualizações.**`,
                                                    components: [
                                                        new ActionRowBuilder<ButtonBuilder>()
                                                        .setComponents(
                                                            new ButtonBuilder()
                                                            .setCustomId("retry")
                                                            .setLabel("Tentar denovo")
                                                            .setStyle(ButtonStyle.Secondary)
                                                        )
                                                    ],
                                                }
                                            )

                                            a1.createMessageComponentCollector(
                                                {
                                                    componentType: ComponentType.Button,
                                                    time: 120000,
                                                    idle: 45000
                                                }
                                            ).on("collect", async (i) => {

                                                const dmUser = await p1_2.user.createDM(true)

                                                await dmUser.send(
                                                    {
                                                        embeds: [
                                                            new EmbedBuilder()
                                                            .setColor(colors.certo)
                                                            .setDescription(`> **${emojis.certo} O teu pedido foi registado.**`),

                                                            new EmbedBuilder()
                                                            .setColor(colors.normal)
                                                            .setDescription(`> **As atualizações do teu pedido de suporte serão recebidas via este canal. Por favor, não feches as tuas DM's.**`)
                                                        ]
                                                    }
                                                ).catch(async () => {
                                                    return await i.update(`> **Erro ao reenviar... Tentativa de suporte falhada. Tente reenviar suporte dentro de alguns minutos**`)
                                                })

                                                await dmUser.send(`**Mensagem enviada:** ${descricao}`)

                                                await p1_2.editReply(
                                                    {
                                                        content: `> **${emojis.certo} Formulário enviado! As atualizações chegarão às tuas mensagens privadas! (Se não as tiveres abertas, não receberás ajuda!)**`,
                                                        components: []
                                                    }
                                                )

                                                const clientDoc = await client.db.findClient(
                                                    {
                                                        _id: client.user.id
                                                    },
                                                    true
                                                )
        
                                                let tickets = clientDoc.tickets || new Map()
        
                                                tickets = tickets.set(canalSuporte.id, ctx.user.id)
        
                                                await client.db.updateClient(
                                                    {
                                                        _id: client.user.id
                                                    },
                                                    {
                                                        $set: {
                                                            "tickets": tickets
                                                        }
                                                    }
                                                )
                                            }).on("end", async () => await a1.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))
                                        })

                                        await dmUser.send(`**Mensagem enviada:** ${descricao}`)

                                        await p1_2.editReply(
                                            {
                                                content: `> **${emojis.certo} Formulário enviado! As atualizações chegarão às tuas mensagens privadas! (Se não as tiveres abertas, não receberás ajuda!)**`,
                                                components: []
                                            }
                                        )

                                        const clientDoc = await client.db.findClient(
                                            {
                                                _id: client.user.id
                                            },
                                            true
                                        )

                                        let tickets = clientDoc.tickets || new Map()

                                        tickets = tickets.set(canalSuporte.id, ctx.user.id)

                                        await client.db.updateClient(
                                            {
                                                _id: client.user.id
                                            },
                                            {
                                                $set: {
                                                    "tickets": tickets
                                                }
                                            }
                                        )

                                        break
                                    }
                                }
                            }).on("end", async () => await pergunta1.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))
                        }).on("end", async () => await msg2.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))

                        break
                    }

                    case "bugs": {

                        const msg2 = await msg1.edit(
                            {
                                content: `> Para reportar um bug, preencha um breve formulário para que a ajuda seja o mais precisa possível.`,
                                components: [
                                    new ActionRowBuilder<ButtonBuilder>()
                                    .setComponents(
                                        new ButtonBuilder()
                                        .setCustomId("começar")
                                        .setLabel("Começar Formulário")
                                        .setStyle(ButtonStyle.Secondary)
                                    )
                                ]
                            }
                        )

                        const collector2 = msg2.createMessageComponentCollector(
                            {
                                componentType: ComponentType.Button,
                                time: 120000,
                                idle: 45000
                            }
                        )

                        collector2.on("collect", async (i2) => {

                            if (i2.customId !== "começar") return

                            const modal = new ModalBuilder()
                            .setCustomId("modal_bugs")
                            .setTitle("Bug")
                            .setComponents(
                                new ActionRowBuilder<TextInputBuilder>()
                                .addComponents(
                                    new TextInputBuilder()
                                    .setCustomId("descrição")
                                    .setLabel("Descreva o bug")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Paragraph)
                                )
                            )

                            await i2.showModal(modal)

                            const i2_1 = await i2.awaitModalSubmit(
                                {
                                    time: 120000,
                                    idle: 45000,
                                    filter: (u) => u.user.id === ctx.user.id
                                }
                            )

                            const descrição = i2_1.fields.getTextInputValue("descrição")

                            await i2_1.deferUpdate()

                            // ALTERAR DEPOIS
                            const serverSuporte = client.guilds.cache.get("1133531362419281940")
                            const catSuporte = "1263939514779566244"

                            const verificar = serverSuporte.channels.cache.find(c => c.type === ChannelType.GuildText && c.topic?.includes(`${i2_1.user.id}`))

                            if (verificar) {
                                await i2_1.editReply(
                                    {
                                        content: `> **${emojis.errado} Já existe um ticket aberto! Por favor, confira as atualizações na sua DM**`,
                                        components: []
                                    }
                                )

                                return
                            }

                            const canalSuporte = await serverSuporte.channels.create(
                                {
                                    name: `bug-${i2_1.user.username}`,
                                    parent: catSuporte,
                                    permissionOverwrites: [
                                        {
                                            id: serverSuporte.roles.everyone,
                                            deny: ["ViewChannel"]
                                        }
                                    ],
                                    topic: `${i2_1.user.id}`,
                                    position: 99
                                }
                            )

                            await canalSuporte.send(
                                {
                                    content: `## **Nova divulgação de bug**\n\n**Informações:**\n> **Usuário:** ${i2_1.user} [\`${i2_1.user.id}\`]\n\n>>> **Descrição:** \n\`\`\`${descrição}\`\`\``
                                }
                            )

                            const dmUser = await i2_1.user.createDM(true)

                            await dmUser.send(
                                {
                                    embeds: [
                                        new EmbedBuilder()
                                        .setColor(colors.certo)
                                        .setDescription(`> **${emojis.certo} O teu pedido foi registado.**`),

                                        new EmbedBuilder()
                                        .setColor(colors.normal)
                                        .setDescription(`> **As atualizações do teu pedido de suporte serão recebidas via este canal. Por favor, não feches as tuas DM's.**`)
                                    ]
                                }
                            ).catch(async () => {
                                const a1 = await i2_1.editReply(
                                    {
                                        content: `> **${emojis.errado} Erro ao tentar enviar mensagem para as tuas DM's! Por favor, abre-as para receberes atualizações.**`,
                                        components: [
                                            new ActionRowBuilder<ButtonBuilder>()
                                            .setComponents(
                                                new ButtonBuilder()
                                                .setCustomId("retry")
                                                .setLabel("Tentar denovo")
                                                .setStyle(ButtonStyle.Secondary)
                                            )
                                        ],
                                    }
                                )

                                a1.createMessageComponentCollector(
                                    {
                                        componentType: ComponentType.Button,
                                        time: 120000,
                                        idle: 45000
                                    }
                                ).on("collect", async (i) => {

                                    const dmUser = await i2_1.user.createDM(true)

                                    await dmUser.send(
                                        {
                                            embeds: [
                                                new EmbedBuilder()
                                                .setColor(colors.certo)
                                                .setDescription(`> **${emojis.certo} O teu pedido foi registado.**`),

                                                new EmbedBuilder()
                                                .setColor(colors.normal)
                                                .setDescription(`> **As atualizações do teu pedido de suporte serão recebidas via este canal. Por favor, não feches as tuas DM's.**`)
                                            ]
                                        }
                                    ).catch(async () => {
                                        return await i.update(`> **Erro ao reenviar... Tentativa de suporte falhada. Tente reenviar suporte dentro de alguns minutos**`)
                                    })

                                    await dmUser.send(`**Mensagem enviada:** ${descrição}`)

                                    await i2_1.editReply(
                                        {
                                            content: `> **${emojis.certo} Formulário enviado! As atualizações chegarão às tuas mensagens privadas! (Se não as tiveres abertas, não receberás ajuda!)**`,
                                            components: []
                                        }
                                    )

                                    const clientDoc = await client.db.findClient(
                                        {
                                            _id: client.user.id
                                        },
                                        true
                                    )

                                    let tickets = clientDoc.tickets || new Map()

                                    tickets = tickets.set(canalSuporte.id, ctx.user.id)

                                    await client.db.updateClient(
                                        {
                                            _id: client.user.id
                                        },
                                        {
                                            $set: {
                                                "tickets": tickets
                                            }
                                        }
                                    )
                                }).on("end", async () => await a1.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))
                            })

                            await dmUser.send(`**Mensagem enviada:** ${descrição}`)

                            await i2_1.editReply(
                                {
                                    content: `> **${emojis.certo} Formulário enviado! As atualizações chegarão às tuas mensagens privadas! (Se não as tiveres abertas, não receberás ajuda!)**`,
                                    components: []
                                }
                            )

                            const clientDoc = await client.db.findClient(
                                {
                                    _id: client.user.id
                                },
                                true
                            )

                            let tickets = clientDoc.tickets || new Map()

                            tickets = tickets.set(canalSuporte.id, ctx.user.id)

                            await client.db.updateClient(
                                {
                                    _id: client.user.id
                                },
                                {
                                    $set: {
                                        "tickets": tickets
                                    }
                                }
                            )

                        }).on("end", async () => await msg2.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))

                        break
                    }
                }
            }).on("end", async () => await msg1.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))
        }
    } 
}

function findCategories (
    client: Tom5, 
    commands: Collection<string, ApplicationCommand>
) {
    const t = client.i18next.t

    const categories: string[] = []

    for (const [, cmd] of commands) {

        const category = client.utils.commands.get(cmd.name).category

        if (!categories.includes(t(`data:categories.${category}`))) categories.push(t(`data:categories.${category}`))
    }

    return categories
}

function filterCommands (
    client: Tom5, 
    commands: Collection<string, ApplicationCommand<{ guild: GuildResolvable }>>, 
    category: string
) {
    const t = client.i18next.t

    const collectedCommands = client.utils.commands

    const filteredCommands: {
        clientCommands: ApplicationCommand<{ guild: GuildResolvable }>[],
        cachedCommands: Map<string, CachedCommandOptions>
    } = {
        clientCommands: [],
        cachedCommands: new Map<string, CachedCommandOptions>()
    }

    const currentLanguage = client.i18next.language

    for (const [, cmd] of commands) {
        const collectedCommand = collectedCommands.get(cmd.name)

        if (t(`data:categories.${collectedCommand.category}`) === category) {

            const categoria = t(`data:categories.${collectedCommand.category}`)

            const checkSubCommands = client.utils.subcommands.get(collectedCommand.reference)

            if (checkSubCommands && checkSubCommands.size > 0) {
                for (const [, subOptions] of checkSubCommands) {

                    const reparing = subOptions.reparing ? `(${emojis.errado})` : `(${emojis.certo})`

                    let cmdDescription = subOptions.description

                    const findedOption = cmd.options.find(opt => opt.name === subOptions.name)

                    if (findedOption.descriptionLocalizations && findedOption.descriptionLocalizations[currentLanguage]) {
                        cmdDescription = cmd.options.find(opt=> opt.name === subOptions.name).descriptionLocalizations[currentLanguage]
                    }

                    cmdDescription = cmdDescription.replace(`[${categoria.toUpperCase()}] `, "")

                    const mainCommand = filteredCommands.cachedCommands.get(cmd.name)

                    if (!mainCommand) {
                        filteredCommands.cachedCommands.set(cmd.name, {
                            categoria: categoria,
                            description: "",
                            id: cmd.id,
                            name: cmd.name,
                            reparing: "",
                            usage: collectedCommand.usage,
                            subcommands: new Map()
                        })
                    }

                    filteredCommands.cachedCommands.get(cmd.name).subcommands.set(subOptions.name, {
                        categoria: categoria,
                        description: cmdDescription,
                        id: cmd.id,
                        name: `${cmd.name} ${subOptions.name}`,
                        reparing: reparing,
                        usage: subOptions.usage
                    })
                }
            } else {

                const reparing = collectedCommand.reparing ? `(${emojis.errado})` : `(${emojis.certo})`

                let cmdDescription = cmd.description

                if (cmd.descriptionLocalizations && cmd.descriptionLocalizations[currentLanguage]) {
                    cmdDescription = cmd.descriptionLocalizations[currentLanguage]
                }

                cmdDescription = cmdDescription.replace(`[${categoria.toUpperCase()}] `, "")

                if (filteredCommands.cachedCommands.get(cmd.name) && filteredCommands.cachedCommands.get(cmd.name)?.subcommands) {
                    filteredCommands.cachedCommands.set(cmd.name, 
                        {
                            categoria: categoria,
                            description: cmdDescription,
                            id: cmd.id,
                            name: `${cmd.name}`,
                            reparing: reparing,
                            usage: collectedCommand.usage,
                            subcommands: filteredCommands.cachedCommands.get(cmd.name).subcommands
                        }
                    )
                } else {
                    filteredCommands.cachedCommands.set(cmd.name, 
                        {
                            categoria: categoria,
                            description: cmdDescription,
                            id: cmd.id,
                            name: `${cmd.name}`,
                            reparing: reparing,
                            usage: collectedCommand.usage,
                            subcommands: new Map()
                        }
                    )
                }
            }

            filteredCommands.clientCommands.push(cmd)
        }
    }

    return filteredCommands
}

interface CachedCommandOptions {
    name: string,
    id: string,
    description: string,
    usage: string,
    categoria: string,
    reparing: string,
    subcommands?: Map<string, CachedCommandOptions>
}