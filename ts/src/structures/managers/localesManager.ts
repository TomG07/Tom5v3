import i18nextFsBackend from "i18next-fs-backend";
import fs from "fs"
import Tom5 from "../../classes/Tom5.js";

export default class LocalesManager {

    client: Tom5

    constructor(client: Tom5) {
        this.client = client
    }

    async loadLocales() {

        this.client.log(
            {
                color: "yellow",
                content: "a carregar",
                shardId: this.client.shardId,
                name: "locales"
            }
        )

        await this.client.i18next
        .use(i18nextFsBackend)
        .init(
            {
                ns: ['commands', 'events', 'data'],
                preload: fs.readdirSync('public/langs'),
                backend: {
                    loadPath: 'public/langs/{{lng}}/{{ns}}.json',
                },
                load: 'all',
                interpolation: {
                    escapeValue: false,
                    useRawValueToEscape: true
                },
                returnEmptyString: false,
                returnObjects: true,
            }
        )

        this.client.log(
            {
                color: "green",
                content: "carregados",
                shardId: this.client.shardId,
                name: "locales"
            }
        )
    }
}