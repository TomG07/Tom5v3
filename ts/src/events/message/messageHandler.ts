import { EmbedBuilder } from "discord.js";
import Event from "../../classes/Event.js";
import Tom5 from "../../classes/Tom5.js";
import emojis from "../../structures/others/emojis.js";
import CommandContext from "../../structures/classes/commandContext.js";
import { Languages } from "../../structures/enums/langsEnum.js";
import webhookLog from "../../structures/functions/webhookLog.js";
import colors from "../../structures/others/colors.js";

export class Evento extends Event<"messageCreate"> {

    client: Tom5;

    constructor(client: Tom5) {
        super({ name: "messageCreate" });
        this.client = client;

        this.execute = async (message) => {

            if (message.author.bot) return;

            const [userDoc, guildDoc] = await Promise.all([
                this.client.db.findUser({ _id: message.author.id }, true),
                message.guild ? this.client.db.findGuild({ _id: message.guild.id }, true) : undefined
            ]);

            let lang = Languages[message.guild?.preferredLocale] || Languages["en-US"];

            if (userDoc.lang) {
                lang = userDoc.lang;
            } else if (guildDoc && guildDoc.lang) {
                lang = guildDoc.lang;
            }

            let t = this.client.i18next.t;

            if (lang === Languages["pt-BR"]) {
                t = await this.client.i18next.changeLanguage("pt-BR");
            } else if (lang === Languages["en-US"]) {
                t = await this.client.i18next.changeLanguage("en-US");
            }

            let prefix;

            const mentionRegex = message.content.match(new RegExp(`^<@!?(${this.client.user.id})> `, 'gi'))

            if (mentionRegex) {
                prefix = String(mentionRegex);
                message.mentions.users.delete(this.client.user.id);
                message.mentions.members.delete(this.client.user.id);
            } else {
                prefix = message.guild && process.env.ENVIRONMENT === "run"
                    ? guildDoc?.prefix || "t."
                    : process.env.ENVIRONMENT === "dev" ? "t," : "t.";
            }

            if (!message.content.toLowerCase().startsWith(prefix)) return;

            const args = message.content.slice(prefix.length).trim().split(" ");
            const messageCommand = args.shift().toLowerCase();
            if (!messageCommand) return;

            try {

                const comando = this.client.utils.commands.get(messageCommand) || this.client.utils.aliases.get(messageCommand);

                if (!comando?.execute) {
                    return await message.reply({
                        embeds: [new EmbedBuilder().setColor(colors.errado).setDescription(t("events:notExists", { errado: emojis.errado, comando: messageCommand }))]
                    });
                }

                if (comando.botPerms) {
                    const botPerms = message.guild?.members.me?.permissions;
                    
                    if (!botPerms.has('Administrator') && (!botPerms.has('AttachFiles') || !botPerms.has('UseExternalEmojis'))) {
                        return await message.reply({ content: t("events:basicPerms", { errado: emojis.errado }) });
                    }

                    if (comando.botPerms.some(perm => !botPerms.has(perm) && !botPerms.has('Administrator'))) {
                        return await message.reply({
                            embeds: [new EmbedBuilder().setColor(colors.errado).setDescription(t("events:botPerms", { errado: emojis.errado, perm: comando.botPerms.find(perm => !botPerms.has(perm)) }))]
                        });
                    }
                }

                if (this.client.cooldown.has(message.author.id)) {
                    return await message.reply({
                        embeds: [new EmbedBuilder().setColor(colors.errado).setDescription(t("events:cooldown", { errado: emojis.errado }))]
                    });
                }

                if (comando.devOnly && !this.client.devs.includes(message.author.id)) {
                    return await message.reply({
                        embeds: [new EmbedBuilder().setColor(colors.errado).setDescription(t("events:devOnly", { errado: emojis.errado }))]
                    });
                }

                if (comando.userPerms && comando.userPerms.some(perm => !message.guild.members.cache.get(message.author.id)?.permissions.has(perm) && !message.guild.members.cache.get(message.author.id)?.permissions.has('Administrator'))) {
                    return await message.reply({
                        embeds: [new EmbedBuilder().setColor(colors.errado).setDescription(t("events:userPerms", { errado: emojis.errado, perm: comando.userPerms.find(perm => !message.guild.members.cache.get(message.author.id)?.permissions.has(perm)) }))]
                    });
                }

                if (comando.reparing && process.env.ENVIRONMENT === "run") {
                    return await message.reply({
                        embeds: [new EmbedBuilder().setColor(colors.errado).setDescription(t("events:commandReparing", { errado: emojis.errado }))]
                    });
                }

                const ctx = new CommandContext(message, t, args);
                await comando.execute({ client: this.client, ctx });

                if (comando.cooldown) {
                    this.client.addCooldown(message.author.id, comando.cooldown)
                }

                await webhookLog({ client: this.client, interaction: message, type: "interaction" });

            } catch (err) {
                this.client.log({ color: "red", content: "erro de execução", shardId: this.client.shardId, aditional: `${err}`, name: "process" });

                await message.reply({
                    embeds: [new EmbedBuilder().setColor(colors.errado).setDescription(t("events:error", { errado: emojis.errado }))]
                }).catch(() => {});
            }
        };
    }
}
