import { Document } from "mongoose";
import { TransactionsType } from "../types/transactionsType.js";
import { Banco } from "../types/banco.js";

export interface UserDocument extends Document<string> {
    lang: number,
    vip: {
        active: boolean,
        end: number,
        type: "bronze" | "prata" | "ouro" | "diamante"
    },
    remembers: {
        daily: boolean
    },
    economia: {
        transacoes: Array<TransactionsType>,
        carteira: number,
        banco: Banco,
        ultimaMudancaBanco: number,
        acoes: Array<unknown>,
        ticketsComprados: number,
        daily: {
            proximo: number,
            ultimo: number
        }
    }
}