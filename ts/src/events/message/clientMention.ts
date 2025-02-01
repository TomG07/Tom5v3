import { ButtonStyle, ChannelType } from "discord.js";
import Event from "../../classes/Event.js";
import Tom5 from "../../classes/Tom5.js";
import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";
import { Languages } from "../../structures/enums/langsEnum.js";

export class Evento extends Event<"messageCreate"> {

    client: Tom5;

    constructor(client: Tom5) {
        super({ name: "messageCreate" });
        this.client = client;

        this.execute = async (message) => {

            if (message.author.bot || message.channel.type === ChannelType.DM || message.content !== `<@${this.client.user.id}>`) return;

            const [guildDoc, userDoc] = await Promise.all([
                this.client.db.findGuild({ _id: message.guild.id }, true),
                this.client.db.findUser({ _id: message.author.id }, true)
            ]);

            let prefix = guildDoc.prefix || "t.";
            if (process.env.ENVIRONMENT === "dev") prefix = "t,";

            let lang = Languages[message.guild.preferredLocale] || Languages["en-US"];
            if (userDoc.lang) lang = userDoc.lang;
            else if (guildDoc.lang) lang = guildDoc.lang;

            let t = this.client.i18next.t;
            if (lang === Languages["pt-BR"]) t = await this.client.i18next.changeLanguage("pt-BR");
            else if (lang === Languages["en-US"]) t = await this.client.i18next.changeLanguage("en-US");

            await message.reply({
                content: t("events:message:clientMention:reply.content", {
                    author: message.author.id,
                    prefix: prefix
                }),
                components: [
                    new ActionRowBuilder<ButtonBuilder>().addComponents(
                        new ButtonBuilder()
                        .setLabel(t("events:message:clientMention:reply:buttons:0.label"))
                        .setEmoji({ animated: false, id: '1119638417001685062', name: 'tom5_icons_link' })
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://discord.com/oauth2/authorize?client_id=${this.client.user.id}&permissions=3300683246647&scope=bot+applications.commands`),

                        new ButtonBuilder()
                        .setLabel(t("events:message:clientMention:reply:buttons:1.label"))
                        .setEmoji({ animated: false, id: "1023251390602162227", name: "tom5_icons_message" })
                        .setStyle(ButtonStyle.Link)
                        .setURL('https://discord.gg/tbsZVq5WEx')
                    )
                ]
            });
        };
    }
}
