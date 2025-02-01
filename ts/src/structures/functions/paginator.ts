import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";
import PaginatorOptions from "../interfaces/paginatorOptions";
import { ButtonStyle } from "discord.js";

export default function paginator<T>(opts: PaginatorOptions<T>) {

    const data = opts.data
    const perPage = opts.perPage
    const page = opts.page

    const offset = (page - 1) * perPage
    const totalPages = Math.ceil(data.length / perPage)

    const res = {
        pageData: new Array<T>(),
        page: 0,
        totalPages: 0,
        components: []
    }

    const pageData = data.slice(offset).slice(0, perPage)

    res.pageData = pageData,
    res.page = page,
    res.totalPages = totalPages

    res.components.push(
        new ActionRowBuilder()
        .setComponents(
            new ButtonBuilder()
            .setCustomId("voltar")
            .setLabel("<-")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page <= 1),

            new ButtonBuilder()
            .setCustomId('pages')
            .setLabel(`${page}/${totalPages}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),

            new ButtonBuilder()
            .setCustomId('proximo')
            .setLabel('->')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page >= totalPages)

        )
    )

    return res
}