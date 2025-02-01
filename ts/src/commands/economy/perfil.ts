import { ActionRowBuilder, ApplicationCommandOptionType, AttachmentBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, EmbedBuilder, StringSelectMenuBuilder, User } from "discord.js";
import Command from "../../classes/Command.js";
import Canvas, { CanvasRenderingContext2D } from "canvas"
import Stack from "stackblur-canvas"
import emojis from "../../structures/others/emojis.js";
import brilho from "../../structures/functions/brilho.js";
import roundRect from "../../structures/functions/roundRect.js";
import { fillTextWithTwemoji, CanvacordEmojiParser } from "@canvacord/emoji-parser";
import defaultBanks from "../../structures/others/defaultBanks.js";
import paginator from "../../structures/functions/paginator.js";
import colors from "../../structures/others/colors.js";
import numbersEmojis from "../../structures/others/numbers.js";
import capitalize from "../../structures/functions/capitalize.js";
import manageNumber from "../../structures/functions/manageNumber.js";

Canvas.registerFont("public/fonts/Archivo/Archivo-Black.ttf", { family: "Archivo" });
export class Comando extends Command {

    constructor() {
        super(
            {
                name: "perfil",
                aliases: ["profile", "pr", "saldo", "atm", "ui", "userinfo"],
                botPerms: [],
                category: "economy",
                description: "Veja o seu perfil",
                devOnly: false,
                options: [
                    {
                        name: "user",
                        description: "Usuário para ver o perfil",
                        descriptionLocalizations: {
                            "pt-BR": "Usuário para ver o perfil",
                            "en-US": "User target"
                        },
                        type: ApplicationCommandOptionType.User,
                        required: false
                    }
                ],
                reference: null,
                reparing: false,
                subCommand: null,
                usage: "/perfil",
                userPerms: [],
                nameLocalizations: {
                    "en-US": "profile",
                    "pt-BR": "perfil"
                },
                descriptionLocalizations: {
                    "en-US": "[ECONOMY] See your profile",
                    "pt-BR": "[ECONOMIA] Veja o seu perfil"
                },
                cooldown: 5000
            }
        )

        this.execute = async ({ client, ctx }) => {

            let user: User;

            if (ctx.interaction instanceof ChatInputCommandInteraction) {
                if (ctx.interaction.options.getUser("user")) {
                    user = ctx.interaction.options.getUser("user")
                }
            } else {
                const isMention = ctx.interaction.mentions.users.first()

                if (isMention && !isMention.bot) {
                    user = isMention
                } else if (!isMention && ctx.args) {
                    
                    const findUser = client.users.cache.find(u => u.id === ctx.args[0])

                    if (findUser && !findUser.bot) {
                        user = findUser
                    }
                }
            }

            if (!user) {
                user = ctx.user
            }

            const msg = await ctx.reply(
                {
                    content: `**(${emojis.load}) A imagem está a ser gerada...**`
                }
            )

            async function generateImage (user: User) {

                const userDoc = await client.db.findUser(
                    {
                        _id: user.id
                    }
                )
    
                const clientCompanies = await client.db.findClient(
                    {
                        _id: client.user.id
                    }
                ).then(doc => (doc.companies?.size === 0 || !doc.companies) ? null : doc.companies)
                 
                const wallet = userDoc.economia.carteira || 0
                const userVip = userDoc.vip ? userDoc.vip : null
                const userBank = userDoc.economia.banco || null
                const userCompanies = clientCompanies ? Array.from(clientCompanies.values()).filter(c => c.owner === user.id).length : 0
                const capital = userCompanies ? Array.from(clientCompanies.values()).filter(c => c.owner === user.id).map(a => a.invested).reduce((a, b) => a + b) : 0
                
                const clientBanner = await fetch(`https://discord.com/api/v10/applications/${client.user.id}`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bot ${client.token}`
                    }
                }).then(async res => {
                    const response = await res.json()
                    
                    const clientBannerHash = response.bot.banner
    
                    return `https://cdn.discordapp.com/banners/${client.user.id}/${clientBannerHash}.png?size=1024`
                })
    
                const canvas = Canvas.createCanvas(600, 400)
                const ctxCanvas = canvas.getContext("2d")
                
                ctxCanvas.drawImage(
                    await Canvas.loadImage(clientBanner), 0, 0, 600, 400
                )
                brilho(ctxCanvas, 0, 0, 600, 400, .5)
    
                ctxCanvas.putImageData(
                    Stack.imageDataRGBA(
                        ctxCanvas.getImageData(0, 0, 600, 400) as unknown as ImageData,
                        0, 0, 600, 400, 20
                    ),
                    0, 0
                )

                const vipsEmojis: { [key: string]: string } = {
                    "bronze": "<:bronze:1280123875685826583>",
                    "prata": "<:prata:1280123881138683904>",
                    "ouro": "<:ouro:1280123878265454623>",
                    "diamante": "<:diamante:1280123883231510548>"
                }
                
                await centralizeUserInfos(canvas, ctxCanvas, user)
    
                await centralizeText(canvas, ctxCanvas, `<:icons_library:1264592504544563322> Carteira: ${manageNumber(wallet)}`, 1, "left")
                await centralizeText(canvas, ctxCanvas, `<:tom5_icons_serverinsight:1013547577477701744> Empresas: ${userCompanies}`, 2, "left")
                await centralizeText(canvas, ctxCanvas, `<:tom5_icons_colorserverpartner:1145743444636094597> Vip: ${userVip["active"] ? `${capitalize(userVip.type)} ${vipsEmojis[userVip.type]}` : "Não"}`, 3, "left")
    
                await centralizeText(canvas, ctxCanvas, `<:bank:1145745293564981399> Banco: ${userBank ? manageNumber(userBank.saldo) : "N/D"}`, 1, "right")
                await centralizeText(canvas, ctxCanvas, `<:tom5_icons_archive:1145743446334771342> Ações: ${userCompanies}`, 2, "right")
                await centralizeText(canvas, ctxCanvas, `<:dollar:1146037895271026781> Capital: ${manageNumber(capital)}`, 3, "right")
                
                const buffer = canvas.toBuffer("image/png")
    
                const attachment = new AttachmentBuilder(buffer).setName("profile.png")

                if (user.id !== ctx.user.id) {
                    return {
                        files: [attachment],
                        components: []
                    }
                } else {
                    const components1 = [
                        new ActionRowBuilder<StringSelectMenuBuilder>()
                        .setComponents(
                            new StringSelectMenuBuilder()
                            .setCustomId("menu_perfil")
                            .setOptions(
                                [
                                    {
                                        label: "Pagar",
                                        value: "pagar",
                                        description: "Pague a aluém/alguma empresa.",
                                        emoji: "<:creditcard:1264590339436576768>"
                                    }
                                ]
                            )
                        )
                    ]
        
                    if (!userBank) {
                        components1[0].components[0].addOptions([
                            {
                                label: "Configurar Conta Bancária",
                                value: "config_bank",
                                emoji: "<:bank:1145745293564981399>"
                            }
                        ])
                    } else {
                        components1[0].components[0].addOptions([
                            {
                                label: "Depositar",
                                value: "depositar",
                                description: "Deposite dinheiro do seu saldo de carteira",
                                emoji: "<:djoin:1264590902995849297>",
                            },
                            {
                                label: "Levantar",
                                value: "levantar",
                                description: "Levante dinheiro do seu saldo bancário",
                                emoji: "<:dleave:1264590921878732851>"
                            },
                            {
                                label: "Mudar de banco",
                                value: "mudar_banco",
                                emoji: "<:bank:1145745293564981399>"
                            },
                            {
                                label: "Informações do seu Banco",
                                value: "infos_banco",
                                emoji: "<:tom5_icons_info:1119648642488356907>"
                            }
                        ])
                    }
    
                    return {
                        files: [attachment],
                        components: components1
                    }
                }
            }

            const res = await generateImage(user)

            if (!res.components || res.components.length < 1) {
                return await msg.edit(
                    {
                        content: "",
                        files: res.files
                    }
                )
            }

            const msg1 = await msg.edit(
                {
                    content: "",
                    files: res.files,
                    components: res.components
                }
            )

            msg1.createMessageComponentCollector(
                {
                    time: 120000,
                    idle: 45000,
                    componentType: ComponentType.StringSelect
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

                await i1.deferReply({ flags: ["Ephemeral"] })

                switch (i1.values[0]) {

                    case "config_bank": {

                        const components1 = [
                            new ActionRowBuilder<StringSelectMenuBuilder>()
                            .setComponents(
                                new StringSelectMenuBuilder()
                                .setCustomId("menu_bancos")
                            )
                        ]

                        Object.entries(defaultBanks).forEach(([bancoId, banco], index) => {
                            components1[0].components[0].addOptions(
                                {
                                    label: banco.name,
                                    value: bancoId,
                                    emoji: numbersEmojis[index + 1]
                                }
                            )
                        })

                        components1[0].components[0].addOptions(
                            {
                                label: "Saber Mais",
                                emoji: "<:tom5_icons_question:1013546739170558135>",
                                description: "Saiba mais acerca de cada banco.",
                                value: "mais"
                            }
                        )

                        const msg2 = await i1.editReply(
                            {
                                content: `**(${emojis.load}) Por favor, selecione no menu abaixo o Banco que deseja entrar.**`,
                                components: components1
                            }
                        )

                        msg2.createMessageComponentCollector(
                            {
                                time: 120000,
                                idle: 45000,
                                componentType: ComponentType.StringSelect
                            }
                        ).on("collect", async (i2) => {

                            const value = i2.values[0]

                            await i2.deferUpdate()

                            if (value === "mais") {

                                const banks = Object.entries(defaultBanks)

                                const data: string[] = banks.map(([, banco]) => {
                                    return `<:bank:1145745293564981399> | **Banco:** ${banco.name}\n\n<:tom5_icons_OAuth2:1013547865194377338> | **Taxas**\n> <:tom5_icons_globe:1119638376044298270> | **Transações Internacionais:** \`${banco.taxas.transações.internacionais * 100}%\`\n> <:tom5_icons_generalinfo:1013547554228686920> | **Transações Nacionais**: \`${banco.taxas.transações.nacionais * 100}%\`\n\n<:tom5_icons_discordbughunter:1013546788722057236> | **Juros**\n> <:bank:1145745293564981399> | **Saldo Bancário:** \`${banco.taxas.juros.saldo * 100}%\`\n\n-# Transações Interacionais -> Fora do servidor\n-# Transações Nacionais -> Dentro do servidor`
                                })

                                let paginatorData = paginator(
                                    {
                                        data: data,
                                        perPage: 1,
                                        page: 1
                                    }
                                )

                                const msg3 = await i2.followUp(
                                    {
                                        content: `**(${emojis.certo}) Aqui estão as informações sobre os bancos.**`,
                                        embeds: [
                                            new EmbedBuilder()
                                            .setColor(colors.normal)
                                            .setDescription(paginatorData.pageData.join(` `))
                                        ],
                                        components: paginatorData.components,
                                        flags: ["Ephemeral"]
                                    }
                                )

                                msg3.createMessageComponentCollector(
                                    {
                                        time: 120000,
                                        idle: 45000,
                                        componentType: ComponentType.Button
                                    }
                                ).on("collect", async (i3) => {

                                    await i3.deferUpdate()

                                    switch (i3.customId) {

                                        case "voltar": {
                                            paginatorData = paginator(
                                                {
                                                    data: data,
                                                    perPage: 1,
                                                    page: paginatorData.page - 1
                                                }
                                            )
                    
                                            await i3.editReply(
                                                {
                                                    content: `**(${emojis.certo}) Aqui estão as informações sobre os bancos.**`,
                                                    embeds: [
                                                        new EmbedBuilder()
                                                        .setColor(colors.normal)
                                                        .setDescription(paginatorData.pageData.join(` `))
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
                                                    perPage: 1,
                                                    page: paginatorData.page + 1
                                                }
                                            )
                    
                                            await i3.editReply(
                                                {
                                                    content: `**(${emojis.certo}) Aqui estão as informações sobre os bancos.**`,
                                                    embeds: [
                                                        new EmbedBuilder()
                                                        .setColor(colors.normal)
                                                        .setDescription(paginatorData.pageData.join(` `))
                                                    ],
                                                    components: paginatorData.components
                                                }
                                            )
                    
                                            break
                                        }
                                    }
                                }).on("end", async () => await msg3.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))
                            } else {

                                for (const [bancoId, banco] of Object.entries(defaultBanks)) {
                                
                                    if (value === bancoId) {
                                        await client.db.updateUser(
                                            {
                                                _id: user.id
                                            },
                                            {
                                                $set: {
                                                    "economia.banco": banco,
                                                    "economia.ultimaMudancaBanco": Date.now()
                                                }
                                            }
                                        )
        
                                        await i1.editReply(
                                            {
                                                content: `**(${emojis.certo}) Conta bancária aberta no banco __${banco.name}__ com sucesso.**`,
                                                components: []
                                            }
                                        )
        
                                        const res1 = await generateImage(user)
        
                                        await msg1.edit(
                                            {
                                                files: res1.files,
                                                components: res1.components
                                            }
                                        )
        
                                        break
                                    }
                                }
                            }
                        })

                        break
                    }

                    case "mudar_banco": {

                        const últimaMudança = await client.db.findUser(
                            {
                                _id: user.id
                            }
                        ).then(doc => doc.economia.ultimaMudancaBanco)

                        const próximaMudança = últimaMudança + (15 * 24 * 60 * 60 * 1000)

                        if (próximaMudança > Date.now()) {
                            await i1.editReply(
                                {
                                    content: `**(${emojis.errado}) Próxima mudança de banco disponível <t:${~~(próximaMudança / 1000)}:R>.**`
                                }
                            )

                            await msg1.edit(
                                {
                                    components: (await msg1.fetch()).components
                                }
                            )

                            return
                        }

                        const components1 = [
                            new ActionRowBuilder<StringSelectMenuBuilder>()
                            .setComponents(
                                new StringSelectMenuBuilder()
                                .setCustomId("menu_bancos")
                            )
                        ]

                        Object.entries(defaultBanks).forEach(([bancoId, banco], index) => {
                            components1[0].components[0].addOptions(
                                {
                                    label: banco.name,
                                    value: bancoId,
                                    emoji: numbersEmojis[index + 1]
                                }
                            )
                        })

                        components1[0].components[0].addOptions(
                            {
                                label: "Saber Mais",
                                emoji: "<:tom5_icons_question:1013546739170558135>",
                                description: "Saiba mais acerca de cada banco.",
                                value: "mais"
                            }
                        )

                        const msg2 = await i1.editReply(
                            {
                                content: `**(${emojis.load}) Por favor, selecione no menu abaixo o Banco que deseja entrar.**`,
                                components: components1
                            }
                        )

                        msg2.createMessageComponentCollector(
                            {
                                time: 120000,
                                idle: 45000,
                                componentType: ComponentType.StringSelect
                            }
                        ).on("collect", async (i2) => {

                            const value = i2.values[0]

                            await i2.deferUpdate()

                            if (value === "mais") {

                                const banks = Object.entries(defaultBanks)

                                const data: string[] = banks.map(([, banco]) => {
                                    return `<:bank:1145745293564981399> | **Banco:** ${banco.name}\n\n<:tom5_icons_OAuth2:1013547865194377338> | **Taxas**\n> <:tom5_icons_globe:1119638376044298270> | **Transações Internacionais:** \`${banco.taxas.transações.internacionais * 100}%\`\n> <:tom5_icons_generalinfo:1013547554228686920> | **Transações Nacionais**: \`${banco.taxas.transações.nacionais * 100}%\`\n\n<:tom5_icons_discordbughunter:1013546788722057236> | **Juros**\n> <:bank:1145745293564981399> | **Saldo Bancário:** \`${banco.taxas.juros.saldo * 100}%\`\n\n-# Transações Interacionais -> Fora do servidor\n-# Transações Nacionais -> Dentro do servidor`
                                })

                                let paginatorData = paginator(
                                    {
                                        data: data,
                                        perPage: 1,
                                        page: 1
                                    }
                                )

                                const msg3 = await i2.followUp(
                                    {
                                        content: `**(${emojis.certo}) Aqui estão as informações sobre os bancos.**`,
                                        embeds: [
                                            new EmbedBuilder()
                                            .setColor(colors.normal)
                                            .setDescription(paginatorData.pageData.join(` `))
                                        ],
                                        components: paginatorData.components,
                                        flags: ["Ephemeral"]
                                    }
                                )

                                msg3.createMessageComponentCollector(
                                    {
                                        time: 120000,
                                        idle: 45000,
                                        componentType: ComponentType.Button
                                    }
                                ).on("collect", async (i3) => {

                                    await i3.deferUpdate()

                                    switch (i3.customId) {

                                        case "voltar": {
                                            paginatorData = paginator(
                                                {
                                                    data: data,
                                                    perPage: 1,
                                                    page: paginatorData.page - 1
                                                }
                                            )
                    
                                            await i3.editReply(
                                                {
                                                    content: `**(${emojis.certo}) Aqui estão as informações sobre os bancos.**`,
                                                    embeds: [
                                                        new EmbedBuilder()
                                                        .setColor(colors.normal)
                                                        .setDescription(paginatorData.pageData.join(` `))
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
                                                    perPage: 1,
                                                    page: paginatorData.page + 1
                                                }
                                            )
                    
                                            await i3.editReply(
                                                {
                                                    content: `**(${emojis.certo}) Aqui estão as informações sobre os bancos.**`,
                                                    embeds: [
                                                        new EmbedBuilder()
                                                        .setColor(colors.normal)
                                                        .setDescription(paginatorData.pageData.join(` `))
                                                    ],
                                                    components: paginatorData.components
                                                }
                                            )
                    
                                            break
                                        }
                                    }
                                }).on("end", async () => await msg3.edit({ components: [ new ActionRowBuilder<ButtonBuilder>({ components: [ new ButtonBuilder({ customId: "a", label: "Watcher Interrompido", disabled: true, style: ButtonStyle.Secondary }) ] }) ] }))
                            } else {

                                for (const [bancoId, banco] of Object.entries(defaultBanks)) {

                                    banco.saldo = await client.db.findUser(
                                        {
                                            _id: user.id
                                        }
                                    ).then(doc => doc.economia.banco.saldo)
                                
                                    if (value === bancoId) {
                                        await client.db.updateUser(
                                            {
                                                _id: user.id
                                            },
                                            {
                                                $set: {
                                                    "economia.banco": banco,
                                                    "economia.ultimaMudancaBanco": Date.now()
                                                }
                                            }
                                        )
        
                                        await i1.editReply(
                                            {
                                                content: `**(${emojis.certo}) Conta bancária aberta no banco __${banco.name}__ com sucesso.**`,
                                                components: []
                                            }
                                        )
        
                                        const res1 = await generateImage(user)
        
                                        await msg1.edit(
                                            {
                                                files: res1.files,
                                                components: res1.components
                                            }
                                        )
        
                                        break
                                    }
                                }
                            }
                        })

                        break
                    }

                    case "depositar": {

                        await i1.editReply(
                            {
                                content: `**(${emojis.load}) Por favor, envie a quantia que deseja depositar, por mensagem**`
                            }
                        )

                        const collector2 = await i1.channel.awaitMessages(
                            {
                                max: 1,
                                time: 120000,
                                idle: 45000,
                                filter: (u) => u.author.id === ctx.user.id
                            }
                        )

                        const i2 = collector2.first()

                        if (isNaN(Number(manageNumber(i2.content, "multiplier"))) || !isFinite(Number(manageNumber(i2.content, "multiplier"))) || Number(manageNumber(i2.content, "multiplier")) <= 0) {
                            await i2.delete().catch(() => {})
    
                            await i1.editReply(
                                {
                                    content: `**(${emojis.errado}) Erro ao processar a mensagem enviada. Por favor verifique o seu conteúdo.**`
                                }
                            )

                            await msg1.edit(
                                {
                                    components: (await msg1.fetch()).components
                                }
                            )

                            return
                        }

                        const num = Number(manageNumber(i2.content, "multiplier"))

                        const userEconomyDoc = await client.db.findUser(
                            {
                                _id: ctx.user.id
                            }
                        ).then(doc => doc.economia)
                        
                        if (num > userEconomyDoc.carteira) {
                            await i2.delete().catch(() => {})
                            
                            await i1.editReply(
                                {
                                    content: `**(${emojis.errado}) Impossível depositar um valor superior à sua carteira!**`
                                }
                            )

                            await msg1.edit(
                                {
                                    components: (await msg1.fetch()).components
                                }
                            )

                            return
                        }

                        const bancoAtualizado = userEconomyDoc.banco.saldo + num
                        const carteiraAtualizada = userEconomyDoc.carteira - num

                        await client.db.updateUser(
                            {
                                _id: ctx.user.id
                            },
                            {
                                $set: {
                                    "economia.carteira": carteiraAtualizada,
                                    "economia.banco.saldo": bancoAtualizado
                                }
                            }
                        )

                        await i1.editReply(
                            {
                                content: `**(${emojis.certo}) ${manageNumber(num)} TomBits depositados com sucesso.**`
                            }
                        )

                        await i2.delete().catch(() => {})

                        const res1 = await generateImage(user)

                        await msg1.edit(
                            {
                                files: res1.files,
                                components: res1.components
                            }
                        )

                        break
                    }

                    case "levantar": {

                        await i1.editReply(
                            {
                                content: `**(${emojis.load}) Por favor, envie a quantia que deseja levantar, por mensagem**`
                            }
                        )

                        const collector2 = await i1.channel.awaitMessages(
                            {
                                max: 1,
                                time: 120000,
                                idle: 45000,
                                filter: (u) => u.author.id === ctx.user.id
                            }
                        )

                        const i2 = collector2.first()

                        if (isNaN(Number(manageNumber(i2.content, "multiplier"))) || !isFinite(Number(manageNumber(i2.content, "multiplier"))) || Number(manageNumber(i2.content, "multiplier")) <= 0) {
                            await i2.delete().catch(() => {})
    
                            await i1.editReply(
                                {
                                    content: `**(${emojis.errado}) Erro ao processar a mensagem enviada. Por favor verifique o seu conteúdo.**`
                                }
                            )

                            await msg1.edit(
                                {
                                    components: (await msg1.fetch()).components
                                }
                            )

                            return
                        }

                        const num = Number(manageNumber(i2.content, "multiplier"))
                        
                        const userEconomyDoc = await client.db.findUser(
                            {
                                _id: ctx.user.id
                            }
                        ).then(doc => doc.economia)

                        if (num > userEconomyDoc.banco.saldo) {
                            await i2.delete().catch(() => {})
                            
                            await i1.editReply(
                                {
                                    content: `**(${emojis.errado}) Impossível levantar um valor superior ao seu banco!**`
                                }
                            )

                            await msg1.edit(
                                {
                                    components: (await msg1.fetch()).components
                                }
                            )

                            return
                        }

                        const bancoAtualizado = userEconomyDoc.banco.saldo - num
                        const carteiraAtualizada = userEconomyDoc.carteira + num

                        await client.db.updateUser(
                            {
                                _id: ctx.user.id
                            },
                            {
                                $set: {
                                    "economia.carteira": carteiraAtualizada,
                                    "economia.banco.saldo": bancoAtualizado
                                }
                            }
                        )
                        
                        await i1.editReply(
                            {
                                content: `**(${emojis.certo}) ${manageNumber(num)} TomBits levantados com sucesso.**`
                            }
                        )
                        
                        await i2.delete().catch(() => {})

                        const res1 = await generateImage(user)
                        
                        await msg1.edit(
                            {
                                files: res1.files,
                                components: res1.components
                            }
                        )

                        break
                    }

                    case "pagar": {

                        await i1.editReply(
                            {
                                content: `**(${emojis.load}) Sistema em desenvolvimento...**`
                            }
                        )

                        break
                    }

                    case "infos_banco": {

                        const bancoAtual = await client.db.findUser(
                            {
                                _id: user.id
                            }
                        ).then(doc => doc.economia.banco)

                        await i1.editReply(
                            {
                                content: `**(${emojis.certo}) Aqui estão as informações do seu banco.**`,
                                embeds: [
                                    new EmbedBuilder()
                                    .setColor(colors.normal)
                                    .setDescription(`<:bank:1145745293564981399> | **Banco:** ${bancoAtual.name}\n\n<:tom5_icons_OAuth2:1013547865194377338> | **Taxas**\n> <:tom5_icons_globe:1119638376044298270> | **Transações Internacionais:** \`${bancoAtual.taxas.transações.internacionais * 100}%\`\n> <:tom5_icons_generalinfo:1013547554228686920> | **Transações Nacionais**: \`${bancoAtual.taxas.transações.nacionais * 100}%\`\n\n<:tom5_icons_discordbughunter:1013546788722057236> | **Juros**\n> <:bank:1145745293564981399> | **Saldo Bancário:** \`${bancoAtual.taxas.juros.saldo * 100}%\`\n\n-# Transações Interacionais -> Fora do servidor\n-# Transações Nacionais -> Dentro do servidor`)
                                ]
                            }
                        )

                        break
                    }
                }
            })
        }
    }
}

async function centralizeUserInfos (canvas: Canvas.Canvas, ctx: CanvasRenderingContext2D, user: User) {

    const canvasWidth = canvas.width
    const canvasHeigth = canvas.height

    const userName = user.displayName
    const username = user.username

    let textWidth: number = 0

    ctx.font = "30px Archivo"
    const userNameMetrics = ctx.measureText(userName)
    ctx.font = "20px Archivo"
    const usernameMetrics = ctx.measureText("@" + username)

    if (userNameMetrics.width > usernameMetrics.width) {
        textWidth = userNameMetrics.width
    } else {
        textWidth = usernameMetrics.width
    }

    const arcRadius = 50
    const padding = 5

    const totalWidth = (arcRadius * 2) + textWidth + (2 * padding) + 10
    const totalHeight = (arcRadius * 2) + (2 * padding)

    const canvas2 = Canvas.createCanvas(totalWidth, totalHeight)
    const ctx2 = canvas2.getContext("2d")

    const bgImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    ctx2.putImageData(bgImageData, -((canvasWidth - totalWidth) / 2), -(((canvasHeigth / 2) - totalHeight) / 2))

    ctx2.font = "30px Archivo"
    ctx2.textBaseline = "alphabetic"
    ctx2.fillStyle = "white"
    ctx2.fillText(userName, (arcRadius * 2) + padding + 10, (canvas2.height / 2) - 1.5)

    ctx2.font = "20px Archivo"
    ctx2.textBaseline = "top"
    ctx2.fillStyle = "rgba(184, 184, 184, 0.6)"
    ctx2.fillText("@" + username, (arcRadius * 2) + padding + 10, (canvas2.height / 2) + 1.5)


    const userAvatar = await Canvas.loadImage(user.displayAvatarURL({ extension: "png", forceStatic: true, size: 4096 }))

    ctx2.beginPath()
    ctx2.strokeStyle = "transparent"
    ctx2.lineWidth = 0
    ctx2.arc(padding + arcRadius, padding + arcRadius, arcRadius, 0, 360)
    ctx2.stroke()
    ctx2.clip()
    ctx2.drawImage(userAvatar, padding, padding, arcRadius * 2, arcRadius * 2)
    ctx2.closePath()

    const imageData = ctx2.getImageData(0, 0, canvas2.width, canvas2.height)
    ctx.putImageData(imageData, (canvasWidth - totalWidth) / 2, ((canvasHeigth / 2) - totalHeight) / 2)
}

// async function centralizeBadges (canvas: Canvas.Canvas, ctx: CanvasRenderingContext2D, text: string) {

//     ctx.font = "25px Archivo"
//     ctx.fillStyle = "rgba(255, 255, 255, 0.8)"

//     ctx.shadowColor = "rgba(0, 0, 0, 0.7)"
//     ctx.shadowBlur = 15
//     ctx.shadowOffsetX = 0
//     ctx.shadowOffsetY = 0
    
//     const canvasWidth = canvas.width
//     const canvasHeight = canvas.height

//     const paddingX = 15
//     const paddingY = 10

//     const textMetrics = CanvacordEmojiParser.measureText(ctx, text)

//     const boxWidth = textMetrics.width + (paddingX * 2)
//     const boxHeight = 25 + (paddingY * 2)

//     const bx = (canvasWidth - boxWidth) / 2
//     const by = (canvasHeight / 2) - 50

//     roundRect(ctx, bx, by, boxWidth, boxHeight, 25)

//     ctx.fillStyle = "white"
//     ctx.textBaseline = "middle"

//     await fillTextWithTwemoji(ctx, text, bx + paddingX, by + paddingY + (30 / 2))
// }

async function centralizeText (canvas: Canvas.Canvas, ctx: CanvasRenderingContext2D, text: string, index: number, p: "left" | "right") {

    const paddingX = 15
    const paddingY = 10

    ctx.font = "24px Archivo"
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
    ctx.textBaseline = "middle"

    ctx.shadowColor = "rgba(0, 0, 0, 0.7)"
    ctx.shadowBlur = 15
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    const textMetrics = CanvacordEmojiParser.measureText(ctx, text)

    const boxWidth = textMetrics.width + (2 * paddingX)
    const boxHeight = 24 + (2 * paddingY)

    const bx = p === "left" ? (canvas.width / 4) - (boxWidth / 2) : ((canvas.width / 4) * 3) - (boxWidth / 2)
    const by = (canvas.height / 2) + (24 + ((index - 1) * 50))

    roundRect(ctx, bx, by, boxWidth, boxHeight, 25)

    ctx.fillStyle = "white"
    ctx.textBaseline = "middle"

    await fillTextWithTwemoji(ctx, text, bx + paddingX, by + paddingY + (24 / 2))
}