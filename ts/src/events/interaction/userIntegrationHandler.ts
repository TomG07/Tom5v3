import { EmbedBuilder } from "discord.js";
import Event from "../../classes/Event.js";
import Tom5 from "../../classes/Tom5.js";
import { Languages } from "../../structures/enums/langsEnum.js";
import colors from "../../structures/others/colors.js";
import emojis from "../../structures/others/emojis.js";
import CommandContext from "../../structures/classes/commandContext.js";
import webhookLog from "../../structures/functions/webhookLog.js";

export class Evento extends Event<"interactionCreate"> {

    client: Tom5

    constructor(client: Tom5) {
        super(
            {
                name: "interactionCreate"
            }
        )

        this.client = client

        this.execute = async (interaction) => {

            if (!interaction.isCommand() || interaction.inCachedGuild() || !interaction.isChatInputCommand()) return

            const [userDoc] = await Promise.all([
                this.client.db.findUser({ _id: interaction.user.id }, true),
            ]);

            let lang = 2

            if (userDoc.lang) {
                lang = userDoc.lang as number;
            }

            // TEMPORARIO: Forçando lang para 1
            // lang = 1;

            let t = this.client.i18next.t;

            if (lang === Languages["pt-BR"]) {
                t = await this.client.i18next.changeLanguage("pt-BR");
            } else if (lang === Languages["en-US"]) {
                t = await this.client.i18next.changeLanguage("en-US");
            }

            const interactionCommand = interaction.commandName;

            try {

                const comando = this.client.utils.commands.get(interactionCommand) || this.client.utils.aliases.get(interactionCommand);

                if (!comando.userIntegration) {
                    return await interaction.reply(
                        {
                            embeds: [
                                new EmbedBuilder()
                                .setColor(colors.errado)
                                .setDescription(`**(${emojis.errado}) Comando apenas disponível para uso em servidores!**`)
                            ]
                        }
                    )
                }

                if (!comando?.execute) {
                    return await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setColor(colors.errado)
                            .setDescription(t("events:notExists", { errado: emojis.errado, comando: interactionCommand }))
                        ]
                    });
                }

                if (this.client.cooldown.has(interaction.user.id)) {
                    return await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(colors.errado)
                                .setDescription(t("events:cooldown", { errado: emojis.errado }))
                        ]
                    });
                }

                if (comando.devOnly && !this.client.devs.includes(interaction.user.id)) {
                    return await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(colors.errado)
                                .setDescription(t("events:devOnly", { errado: emojis.errado }))
                        ]
                    });
                }

                if (comando.reparing && process.env.ENVIRONMENT === "run") {
                    return await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(colors.errado)
                                .setDescription(t("events:commandReparing", { errado: emojis.errado }))
                        ]
                    });
                }

                const ctx = new CommandContext(interaction, t);
                await comando.execute({ client: this.client, ctx });

                if (comando.cooldown) {
                    this.client.addCooldown(interaction.user.id, comando.cooldown)
                }

                await webhookLog({ client: this.client, interaction: interaction, type: "interaction" });

            } catch (err) {
                this.client.log({
                    color: "red",
                    content: "erro de execução",
                    shardId: this.client.shardId,
                    aditional: `${err}`,
                    name: "process"
                });

                return await interaction.reply({
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