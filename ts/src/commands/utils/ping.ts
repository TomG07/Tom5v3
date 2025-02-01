import { EmbedBuilder } from "discord.js";
import Command from "../../classes/Command.js";
import colors from "../../structures/others/colors.js";
import mongoose from "mongoose";

export class Comando extends Command {

    constructor() {
        super(
            {
                name: "ping",
                description: "[ÚTEIS] Vê a minha latência!",
                aliases: [],
                botPerms: [],
                category: "utils",
                devOnly: false,
                options: [],
                reference: null,
                reparing: false,
                subCommand: null,
                usage: "/ping",
                userPerms: [],
                descriptionLocalizations: {
                    "pt-BR": "[ÚTEIS] Vê a minha latência!",
                    "en-US": "[USEFUL] View my latency!"
                },
                userIntegration: true
            }
        )

        this.execute = async ({ client, ctx }) => {
            
            const lat = Date.now() - ctx.interaction.createdTimestamp
            
            const websocketPing = client.ws.ping || 0
            const shards = client.shard.count
            
            let wskt = "<:tom5_icons_createintegration:1013547482493489222> | **Discord API:** "
            let l = "<:tom5_icons_code:1013546693997891615> | **Latência:** "
            let db = "<:tom5_icons_clouddown:1119643920956145814> | **DataBase:** "

            if (websocketPing < 150) {
                wskt += `\`${websocketPing}\` ms (<:tom5_icons_goodping:1119638423964229694>)`
            } else if (websocketPing < 400) {
                wskt += `\`${websocketPing}\` ms (<:tom5_icons_idelping:1119638419774132365>)`
            } else {
                wskt += `\`${websocketPing}\` ms (<:tom5_icons_badping:1119638367563419729>)`
            }

            if (lat < 600) {
                l += `\`${lat}\` ms (<:tom5_icons_goodping:1119638423964229694>)`
            } else if (lat < 850) {
                l += `\`${lat}\` ms (<:tom5_icons_idelping:1119638419774132365>)`
            } else {
                l += `\`${lat}\` ms (<:tom5_icons_badping:1119638367563419729>)`
            }

            const dbStart = Date.now()
            await mongoose.connection.db.admin().ping()
            const dbEnd = Date.now()

            const dbPing = dbEnd - dbStart

            if (dbPing < 100) {
                db += `\`${dbPing}\` ms (<:tom5_icons_goodping:1119638423964229694>)`
            } else if (dbPing < 200) {
                db += `\`${dbPing}\` ms (<:tom5_icons_goodping:1119638423964229694>)`
            } else {
                db += `\`${dbPing}\` ms (<:tom5_icons_goodping:1119638423964229694>)`
            }

            await ctx.reply(
                {
                    content: `## Pong! 🏓`,
                    embeds: [
                        new EmbedBuilder()
                        .setColor(colors.normal)
                        .setDescription(`${wskt}\n${l}\n${db}\n<:tom5_icons_spark:1013546758208507945> | **Shard:** \`${client.shardId}/${shards}\``)
                    ]
                }    
            )
        }
    }
}