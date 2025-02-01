import { ChannelType, EmbedBuilder } from "discord.js";
import Event from "../../classes/Event.js";
import Tom5 from "../../classes/Tom5.js";
import emojis from "../../structures/others/emojis.js";
import CommandContext from "../../structures/classes/commandContext.js";
import { Languages } from "../../structures/enums/langsEnum.js";
import webhookLog from "../../structures/functions/webhookLog.js";
import colors from "../../structures/others/colors.js";

export class Evento extends Event<"interactionCreate"> {

    client: Tom5;

    constructor(client: Tom5) {
        super({ name: "interactionCreate" });
        this.client = client;

        this.execute = async (message) => {

            if (message.user.bot || !message.isChatInputCommand()) return;

            if (!message.inCachedGuild()) return

            if (!message.guild || message.channel.type !== ChannelType.GuildText) return

            const [userDoc, guildDoc] = await Promise.all([
                this.client.db.findUser({ _id: message.user.id }, true),
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

            const messageCommand = message.commandName;

            try {

                const comando = this.client.utils.commands.get(messageCommand) || this.client.utils.aliases.get(messageCommand);

                if (!comando?.execute) {
                    return await message.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setColor(colors.errado)
                            .setDescription(t("events:notExists", { errado: emojis.errado, comando: messageCommand }))
                        ]
                    });
                }

                if (comando.botPerms) {
                    const botPerms = message.guild?.members.me?.permissions.toArray();
                    if (!botPerms.includes('Administrator')) {
                        const missingPerms = comando.botPerms.filter(perm => !botPerms.includes(perm));
                        if (missingPerms.length > 0) {
                            return await message.reply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor(colors.errado)
                                        .setDescription(t("events:botPerms", { errado: emojis.errado, perm: missingPerms.join(', ') }))
                                ]
                            });
                        }
                    }
                }

                if (this.client.cooldown.has(message.user.id)) {
                    return await message.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(colors.errado)
                                .setDescription(t("events:cooldown", { errado: emojis.errado }))
                        ]
                    });
                }

                if (comando.devOnly && !this.client.devs.includes(message.user.id)) {
                    return await message.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(colors.errado)
                                .setDescription(t("events:devOnly", { errado: emojis.errado }))
                        ]
                    });
                }

                if (comando.userPerms) {
                    const permsMembro = message.guild?.members.cache.get(message.user.id)?.permissions.toArray() || [];
                    const missingPerms = comando.userPerms.filter(perm => !permsMembro.includes(perm) && !permsMembro.includes('Administrator'));
                    if (missingPerms.length > 0) {
                        return await message.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(colors.errado)
                                    .setDescription(t("events:userPerms", { errado: emojis.errado, perm: missingPerms.join(', ') }))
                            ]
                        });
                    }
                }

                if (comando.reparing && process.env.ENVIRONMENT === "run") {
                    return await message.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(colors.errado)
                                .setDescription(t("events:commandReparing", { errado: emojis.errado }))
                        ]
                    });
                }

                const ctx = new CommandContext(message, t);
                await comando.execute({ client: this.client, ctx });

                if (comando.cooldown) {
                    this.client.addCooldown(message.user.id, comando.cooldown)
                }
                
                await webhookLog({ client: this.client, interaction: message, type: "interaction" });

            } catch (err) {
                this.client.log({
                    color: "red",
                    content: "erro de execução",
                    shardId: this.client.shardId,
                    aditional: `${err}`,
                    name: "process"
                });

                return await message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(colors.errado)
                            .setDescription(t("events:error", { errado: emojis.errado }))
                    ]
                }).catch(() => {});
            }
        }
    }
}
