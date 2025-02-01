import mongoose from "mongoose";
import Tom5 from "../../classes/Tom5.js";

export default class DatabaseManager {

    client: Tom5;

    constructor(client: Tom5) {
        this.client = client
    }

    async init() {
        mongoose.Promise = global.Promise

        mongoose.set("strictQuery", true)

        try {

            await mongoose.connect(
                process.env.DB_TOKEN as string,
                {
                    serverApi: {
                        version: "1",
                        strict: true,
                        deprecationErrors: true
                    },
                    dbName: "Tom5"
                }
            )

            await import('../database/imports.js')

            this.client.log(
                {
                    color: "green",
                    content: "conectada",
                    shardId: this.client.shardId,
                    name: "database"
                }
            )
        } catch (err) {
            this.client.log(
                {
                    color: "red",
                    content: "erro ao conectar",
                    shardId: this.client.shardId,
                    name: "database",
                    aditional: err
                }
            )

            setTimeout(() => this.init(), 10000)
        }
    }
}