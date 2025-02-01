import { Document } from "mongoose";
import { RifasType } from "../types/rifasType.js";
import { Company } from "../types/company.js";

export interface ClientDocument extends Document<string> {
    blacklist: Map<string, object>,
    parcerias: Map<string, unknown>,
    logsChannel: string,
    tickets: Map<string, unknown>,
    ticketsFechados: Map<string, object>,
    rifasAtivas: Array<RifasType>,
    rifasSorteadas: Array<RifasType>,
    companies: Map<string, Company>
}