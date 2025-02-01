import { model, Schema } from "mongoose";
import { UserDocument } from "../../interfaces/userDocument.js";

const schema = new Schema(
    {
        _id: String,
        lang: { type: Number, default: 1 },

        vip: {
            active: { type: Boolean, default: false },
            end: { type: Number, default: 0 },
            type: { type: String, default: false },
        },

        remembers: {
            daily: { type: Boolean, default: false },
        },

        economia: {
            transacoes: { type: Array, default: false },

            carteira: { type: Number, default: 0 },
            banco: { type: Object, default: false },
            ultimaMudancaBanco: { type: Number, default: 0 },
            ações: { type: Array, default: []},

            ticketsComprados: { type: Number, default: 0 },

            daily: {
                proximo: { type: Number, default: 0 },
                ultimo: { type: Number, default: 0 }
            }
        }
    }
)

export default model<UserDocument>("users", schema)