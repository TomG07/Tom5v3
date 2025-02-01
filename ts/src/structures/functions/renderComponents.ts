import { ActionRowBuilder, ActionRowComponentData, ActionRowData, AnyComponentBuilder, ComponentType } from "discord.js";
import Tom5 from "../../classes/Tom5.js";

export default function renderComponents (client: Tom5, search: string) {

    const res = client.i18next.t(search, { returnObjects: true }) as { type: number, components: { label: string, custom_id: string, type: number, style: number, emoji?: string }[] }[]

    const data: ActionRowBuilder<AnyComponentBuilder>[] = []

    for (const actionRow of res) {
        data.push(
            new ActionRowBuilder({ components: actionRow.components, type: actionRow.type })
        )
    }

    return data
}