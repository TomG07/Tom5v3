import { ChannelType } from "discord.js";
import Command from "../../classes/Command.js";
import emojis from "../../structures/others/emojis.js";

export class Comando extends Command {

    constructor() {
        super(
            {
                name: "automod",
                description: "Configura as regras do automod no servidor",
                aliases: [],
                botPerms: [
                    "ManageGuild"
                ],
                category: "developers",
                devOnly: true,
                options: [],
                reference: null,
                reparing: false,
                subCommand: null,
                usage: "/automod",
                userPerms: [],
                descriptionLocalizations: {
                    "en-US": "[DEVELOPERS] Set up the automod rules",
                    "pt-BR": "[DESENVOLVEDORES] Configura as regras do automod"
                }
            }
        )

        this.execute = async ({ client, ctx }) => {

            if (ctx.interaction.channel.type !== ChannelType.GuildText) return

            const msg1 = await ctx.reply(
                {
                    content: `**(${emojis.load}) A carregar as regras...**`
                }
            )

            try {
                const promises = client.guilds.cache.map(async (guild) => {
                    const automodTypes = [1, 3, 4, 5]
        
                    const promises = []

                    for (let i = 0; i < 7; i++) {
                        promises.push(
                            guild.autoModerationRules.create({
                                name: 'Automod Badge by Tom5',
                                enabled: true,
                                eventType: 1,
                                triggerType: 1,
                                triggerMetadata: {
                                    presets: [1, 2, 3],
                                },
                                actions: [
                                    {
                                        type: 1,
                                        metadata: {
                                            customMessage: 'This message was blocked by Tom5',
                                        },
                                    },
                                ],
                            })
                            .catch(() =>
                                console.log(`[!] — Automod of type 1 already exists in ${guild.name}.`)
                            )
                        );
                    }

                    automodTypes.forEach((type) => {

                        if (type === 1) return;

                        promises.push(
                            guild.autoModerationRules.create({
                                name: 'Automod Badge By Tom5',
                                enabled: true,
                                eventType: 1,
                                triggerType: type,
                                triggerMetadata: {
                                    presets: [1, 2, 3],
                                },
                                actions: [
                                    {
                                        type: 1,
                                        metadata: {
                                            customMessage: 'This message was blocked by Tom5',
                                        },
                                    },
                                ],
                            })
                            .catch(() =>
                                console.log(`[!] — Automod of type ${type} already exists in ${guild.name}.`)
                            )
                        );
                    });

                    return Promise.all(promises)
                })

                await Promise.all(promises)

                await msg1.edit(
                    {
                        content: `**(${emojis.certo}) \`${promises.length}\` Regras criadas com sucesso.**`
                    }
                )
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) {
                await msg1.edit(
                    {
                        content: `**(${emojis.errado}) Impossível criar as regras devido a um erro.**`
                    }
                )
            }
        }
    }
}