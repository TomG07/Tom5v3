import { BaseMessageOptions, ChatInputCommandInteraction, Guild, GuildMember, InteractionReplyOptions, Message } from "discord.js"
import { TFunction } from "i18next"

export default class CommandContext {

    args: string[] | []
    interaction: Message | ChatInputCommandInteraction
    t: TFunction

    constructor(
        interaction: Message | ChatInputCommandInteraction,
        t: TFunction,
        args?: string[]
    ) {
        this.interaction = interaction
        this.t = t
        this.args = args
    }

    async reply(opts: BaseMessageOptions | InteractionReplyOptions) {

        if (this.interaction instanceof ChatInputCommandInteraction) {

            if (this.interaction.replied) {
                return await this.interaction.followUp(
                    Object.assign(opts, { withResponse: true }) as InteractionReplyOptions
                )
            }

            if (this.interaction.deferred) {
                await this.interaction.editReply({ content: "", embeds: [], components: [], files: [] })

                return await this.interaction.editReply(
                    Object.assign(opts, { withResponse: true }) as InteractionReplyOptions
                )
            }
            return await this.interaction.reply(
                Object.assign(opts, { withResponse: true }) as InteractionReplyOptions
            )
        } else {
            
            const check  = (await this.interaction.channel.messages.fetch()).filter(msg => 
                msg.reference 
                && msg.reference.messageId === this.interaction.id 
                && msg.author.id === this.interaction.client.user.id
            ).map(x => x)[0]

            if (check) {
                await check.edit({ content: "", embeds: [], components: [], files: [] })
                return await check.edit(opts as BaseMessageOptions)
            } else {
                return await this.interaction.reply(opts as BaseMessageOptions)
            }
        }
    }

    async delete() {
        
        if (this.interaction instanceof Message) {
            return await this.interaction.delete().catch(err => {})
        } else {
            return await this.interaction.deleteReply().catch(err => {})
        }
    }

    get getSubcommand() {

        if (this.interaction instanceof ChatInputCommandInteraction) {
            return this.interaction.options.getSubcommand()
        } else {
            return false
        }
    }
    
    get user() {
        
        if (this.interaction instanceof Message) {
            return this.interaction.author
        } else {
            return this.interaction.user
        }
    }

    get member() {
        return this.interaction.member as GuildMember
    }

    get guild() {
        return this.interaction.guild as Guild
    }
}