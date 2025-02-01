import { ClientEvents } from "discord.js";
import EventOptions from "../structures/interfaces/eventOptions.js";

export default class Event<T extends keyof ClientEvents> implements EventOptions {

    name: string;
    execute: (...args: ClientEvents[T]) => unknown

    constructor(opt: EventOptions) {
        this.name = opt.name
        this.execute = (...args: ClientEvents[T]) => {}
    }
}