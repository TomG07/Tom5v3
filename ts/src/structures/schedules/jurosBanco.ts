import ScheduleJob from "../../classes/ScheduleJob.js";
import Tom5 from "../../classes/Tom5.js";
import { TransactionsType } from "../types/transactionsType.js";

export default class Job extends ScheduleJob {

    client: Tom5

    constructor(client: Tom5) {
        super(
            "0 0 0 */1 * *",
            async (data) => {

                const users = await client.db.findManyUsers({ "economia.banco.saldo": { $exists: true, $gt: 0 } })

                for (const user of users) {
                    const jurosBancoUser = user.economia.banco.taxas.juros.saldo

                    const saldoTaxado = user.economia.banco.saldo * jurosBancoUser

                    const transType: TransactionsType = {
                        amount: saldoTaxado,
                        date: new Date(),
                        name: "Juros Banco",
                        type: "+"                 
                    }

                    await client.db.updateUser(
                        {
                            _id: user._id
                        },
                        {
                            $inc: {
                                "economia.banco.saldo": saldoTaxado
                            },
                            $push: {
                                "economia.transacoes": transType
                            }
                        }
                    )
                }
            }
        )
    }
}