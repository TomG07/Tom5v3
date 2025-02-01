import Tom5 from "../../classes/Tom5.js";
import { AutoPoster } from "topgg-autoposter"

export default class TopGGManager {

    client: Tom5

    constructor(client: Tom5) {
        this.client = client
    }

    postData () {

        const autoPost = AutoPoster(process.env.TOPGG_TOKEN, this.client, {
            interval: 900000
        })

        autoPost.once("posted", () => {
            this.client.log(
                {
                    color: "green",
                    content: "dados atualizados",
                    shardId: this.client.shardId,
                    name: "top.gg"
                }
            )
        })
    }
}