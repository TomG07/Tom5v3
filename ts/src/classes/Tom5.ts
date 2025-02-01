import { ActivityType, Client, GatewayIntentBits, Options, Partials } from "discord.js";
import LogsManager from "../structures/managers/logsManager.js";
import LogsManagerInterface from "../structures/interfaces/logsManagerInterface.js";
import DatabaseManager from "../structures/managers/databaseManager.js";
import EventsManager from "../structures/managers/eventsManager.js";
import CommandsManager from "../structures/managers/commandsManager.js";
import CommandOptions from "../structures/interfaces/commandOptions.js";
import Database from "./Database.js"
import LocalesManager from "../structures/managers/localesManager.js";
import i18next, { i18n } from "i18next";
import ScheduleManager from "../structures/managers/scheduleManager.js";
import ScheduleJob from "./ScheduleJob.js";
import TopGGManager from "../structures/managers/topggManager.js";

let i = 0

export default class Tom5 extends Client {

    shardId: number;
    prefix: string;
    devs: string[];
    cooldown: Set<string>;
    db: Database
    i18next: i18n;

    managers: { 
        logsManager: LogsManager;
        databaseManager: DatabaseManager;
        eventsManager: EventsManager;
        commandsManager: CommandsManager;
        localesManager: LocalesManager;
        scheduleManager: ScheduleManager;
        topggManager: TopGGManager;
    };

    utils: {
        events: Map<string, object>
        commands: Map<string, CommandOptions>
        subcommands: Map<string, Map<string, CommandOptions>>
        aliases: Map<string, CommandOptions>
        schedule: Map<string, ScheduleJob>,
        usersScheduleJobs: Map<string, ScheduleJob>
    }

    log: (opt: LogsManagerInterface) => void;

    constructor() {
        super(
            {
                makeCache: Options.cacheWithLimits(
                    {
                        ApplicationCommandManager: Infinity,
                        AutoModerationRuleManager: Infinity,
                        BaseGuildEmojiManager: Infinity,
                        DMMessageManager: Infinity,
                        GuildBanManager: Infinity,
                        GuildEmojiManager: Infinity,
                        GuildForumThreadManager: 0,
                        GuildInviteManager: Infinity,
                        GuildMemberManager: Infinity,
                        GuildMessageManager: Infinity,
                        GuildScheduledEventManager: 0,
                        GuildStickerManager: 0,
                        GuildTextThreadManager: 0,
                        MessageManager: Infinity,
                        PresenceManager: 0,
                        ReactionManager: 0,
                        ReactionUserManager: 0,
                        StageInstanceManager: 0,
                        ThreadManager: 0,
                        ThreadMemberManager: 0,
                        UserManager: Infinity,
                        VoiceStateManager: Infinity
                    }
                ),
                intents: Object.keys(GatewayIntentBits).map(c => GatewayIntentBits[c]),
                partials: [
                    Partials.Channel,
                    Partials.GuildMember,
                    Partials.Message,
                    Partials.User
                ],
                presence: {
                    status: process.env.ENVIRONMENT === "dev" ? "idle" : "online"
                }
            }
        )

        this.prefix = "t."
        this.devs = ["541030181616222218"]
        this.cooldown = new Set<string>()
        this.db = new Database()
        this.i18next = i18next

        this.managers = {
            logsManager: new LogsManager(),
            databaseManager: new DatabaseManager(this),
            eventsManager: new EventsManager(this),
            commandsManager: new CommandsManager(this),
            localesManager: new LocalesManager(this),
            scheduleManager: new ScheduleManager(this),
            topggManager: new TopGGManager(this)
        }
        
        this.utils = {
            events: this.managers.eventsManager.events,
            commands: this.managers.commandsManager.commands,
            subcommands: this.managers.commandsManager.subCommands,
            aliases: this.managers.commandsManager.aliases,
            schedule: this.managers.scheduleManager.scheduleEvents,
            usersScheduleJobs: this.managers.scheduleManager.cachedEvents
        }
        
        this.log = this.managers.logsManager.create
        
        this.on("shardReady", async (shardId) => {
            this.shardId = shardId + 1
        })
    
        this.on("ready", async () => {
    
            this.log(
                {
                    color: "green",
                    content: "iniciado",
                    shardId: this.shardId,
                    name: "client"
                }
            )

            await this.loadModules()
    
            const activities = [
                {
                    state: "🧶 Start working!",
                    type: ActivityType.Custom
                },
                {
                    state:  "📦 Start your business now!",
                    type: ActivityType.Custom
                },
                {
                    state: "🧪 Support Server (link in bio)",
                    type: ActivityType.Custom
                },
                {
                    state: "🤖 TomLabs Project",
                    type: ActivityType.Custom
                }
            ]
    
            setInterval(() => {
                this.user.setActivity(
                    {
                        name: `Status`,
                        state: activities[i].state + ` | Shard ${this.shardId}/${this.shard.count}`,
                        type: activities[i].type,
                    }
                )
    
                if (i + 1 >= activities.length) {
                    i = 0
                } else {
                    i++
                }
            }, 15000)
        })
    }

    async init() {

        let token: string;
        
        if (process.env.ENVIRONMENT === "dev") {
            token = process.env.DISCORD_TOKEN_CANARY 
            this.prefix = "t,"
        } else {
            token = process.env.DISCORD_TOKEN
        }
        
        await this.login(token)
    }

    async loadModules() {
        await this.managers.databaseManager.init()
        await this.managers.eventsManager.setEvents()
        await this.managers.commandsManager.setCommands()
        await this.managers.localesManager.loadLocales()
        await this.managers.scheduleManager.setSchedule()

        if (process.env.ENVIRONMENT === "run") {
            this.managers.topggManager.postData()
        }
        
        // await import("../website/server.js")
    }

    addCooldown(userId: string, time: number) {
        this.cooldown.add(userId)

        setTimeout(() => {
            this.cooldown.delete(userId)
        }, time)
    }
}