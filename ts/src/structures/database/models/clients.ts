import { Schema, model } from "mongoose";
import { ClientDocument } from "../../interfaces/clientDocument";

const schema = new Schema(
    {
        _id: String,
        blacklist: Map,
        parcerias: Map,
        logsChannel: String,
        tickets: Map,
        ticketsFechados: Map,

        rifasAtivas: Array,
        rifasSorteadas: Array,

        companies: Map
    }
)

export default model<ClientDocument>("clients", schema)