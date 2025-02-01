import ScheduleJob from "../../classes/ScheduleJob.js";
import Tom5 from "../../classes/Tom5.js";
import { generateEvent, applyEvent } from "../functions/generateEvent.js";
import defaultCompanies from "../others/defaultCompanies.js";
import { Company } from "../types/company.js";

export default class Job extends ScheduleJob {

    client: Tom5

    constructor(client: Tom5) {
        super(
            "0 0 0 */1 * *",
            async (data) => {

                const clientDoc = await client.db.findClient(
                    {
                        _id: client.user.id
                    }
                )
            
                let companies: Map<string, Company> = new Map<string, Company>();
            
                if (!clientDoc.companies) {
                    Object.entries(defaultCompanies).forEach(([companyName, companyOptions]) => companies.set(companyName, companyOptions))
            
                    await client.db.updateClient(
                        {
                            _id: client.user.id
                        },
                        {
                            $set: {
                                "companies": companies
                            }
                        }
                    )
                } else {
                    companies = clientDoc.companies as Map<string, Company>
                }

                for(const company of companies) {
                    await applyEvent(client, generateEvent(), company)
                }
            }
        )
    }
}