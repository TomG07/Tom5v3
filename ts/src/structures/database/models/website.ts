import { model, Schema } from "mongoose";
import WebsiteDocument from "../../interfaces/websiteDocument";

const schema = new Schema(
    {
        _id: String,
        access_token: { type: String, default: null },
        refesh_token: { type: String, default: null },
        expires_in: { type: Number, default: 0 },
        secretAccessKey: { type: String, default: null }
    }
)

export default model<WebsiteDocument>("websites", schema)