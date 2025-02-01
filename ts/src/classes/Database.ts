import { FilterQuery, UpdateQuery } from "mongoose"
import clients from "../structures/database/models/clients.js"
import guilds from "../structures/database/models/guilds.js"
import users from "../structures/database/models/users.js"
import { UserDocument } from "../structures/interfaces/userDocument.js"
import { GuildDocument } from "../structures/interfaces/guildDocument.js"
import { ClientDocument } from "../structures/interfaces/clientDocument.js"
import websiteDocument from "../structures/interfaces/websiteDocument.js"
import website from "../structures/database/models/website.js"

export default class Database {

    async findUser (filter: FilterQuery<UserDocument>, force?: boolean) {
        
        let res = await users.findOne(filter)
        
        if (!res && force) {
            res = await users.create(filter)
        }

        return res
    }
    
    async findManyUsers (filter: FilterQuery<UserDocument> = {}, limit?: number) {
        
        let res = await users.find(filter)
        
        if (limit) {
            res = await users.find(filter).limit(limit)
        }

        return res
    }

    async findGuild (filter: FilterQuery<GuildDocument>, force?: boolean) {

        let res = await guilds.findOne(filter)

        if (!res && force) {
            res = await guilds.create(filter)
        }

        return res
    }

    async findManyGuilds (filter: FilterQuery<GuildDocument> = {}, limit?: number) {
        
        let res = await guilds.find(filter)
        
        if (limit) {
            res = await guilds.find(filter).limit(limit)
        }

        return res
    }

    async findClient (filter: FilterQuery<ClientDocument>, force?: boolean) {
        
        let res = await clients.findOne(filter)

        if (!res && force) {
            res = await clients.create(filter)
        }

        return res
    }

    async findManyClients (filter: FilterQuery<ClientDocument> = {}, limit?: number) {
        
        let res = await clients.find(filter)
        
        if (limit) {
            res = await clients.find(filter).limit(limit)
        }

        return res
    }

    async findWebData (filter: FilterQuery<websiteDocument>, force?: boolean) {
        
        let res = await website.findOne(filter)
        
        if (!res && force) {
            res = await website.create(filter)
        }

        return res
    }

    async findManyWebData (filter: FilterQuery<websiteDocument> = {}, limit?: number) {
        
        let res = await website.find(filter)
        
        if (limit) {
            res = await website.find(filter).limit(limit)
        }

        return res
    }

    async updateUser (filter: FilterQuery<UserDocument>, newSchema: UpdateQuery<UserDocument>) {
        return await users.updateOne(filter, newSchema)
    }

    async updateManyUsers (filter: FilterQuery<UserDocument> = {}, newSchema: UpdateQuery<UserDocument>) {
        return await users.updateMany(filter, newSchema)
    }

    async updateGuild (filter: FilterQuery<GuildDocument>, newSchema: UpdateQuery<GuildDocument>) {
        return await guilds.updateOne(filter, newSchema)
    }

    async updateManyGuilds (filter: FilterQuery<GuildDocument> = {}, newSchema: UpdateQuery<GuildDocument>) {
        return await guilds.updateMany(filter, newSchema)
    }

    async updateClient (filter: FilterQuery<ClientDocument>, newSchema: UpdateQuery<ClientDocument>) {
        return await clients.updateOne(filter, newSchema)
    }

    async updateWebData (filter: FilterQuery<websiteDocument>, newSchema: UpdateQuery<websiteDocument>) {
        return await website.updateOne(filter, newSchema)
    }

    async updateManyWebData(filter: FilterQuery<websiteDocument> = {}, newSchema: UpdateQuery<websiteDocument>) {
        return await website.updateMany(filter, newSchema)
    }

    async deleteUser (filter: FilterQuery<UserDocument>) {
        return await users.deleteOne(filter)
    }

    async deleteManyUsers (filter: FilterQuery<UserDocument> = {}) {
        return await users.deleteMany(filter)
    }

    async deleteGuild (filter: FilterQuery<GuildDocument>) {
        return await guilds.deleteOne(filter)
    }

    async deleteManyGuilds (filter: FilterQuery<GuildDocument> = {}) {
        return await guilds.deleteMany(filter)
    }

    async deleteClient (filter: FilterQuery<ClientDocument>) {
        return await clients.deleteOne(filter)
    }

    async deleteWebData (filter: FilterQuery<websiteDocument>) {
        return await website.deleteOne(filter)
    }

    async deleteManyWebData (filter: FilterQuery<websiteDocument> = {}) {
        return await website.deleteMany(filter)
    }
}