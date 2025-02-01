import Tom5 from "../../classes/Tom5.js";
import { EventsData, Event } from "../interfaces/generateEventInterfaces.js";
import defaultCompanies from "../others/defaultCompanies.js";
import { Company } from "../types/company.js";

const events: EventsData = {
    names: [
        { name: "Lançamento de um Novo Produto", effect: 0.10 },
        { name: "Parceria Estratégica", effect: 0.12 },
        { name: "Resultados Financeiros", effect: 0.08 },
        { name: "Expansão Internacional", effect: 0.10 },
        { name: "Expansão Nacional", effect: 0.06 },
        { name: "Aquisição", effect: 0.03 },
        { name: "Problemas Legais", effect: -0.12 },
        { name: "Recall de Produtos", effect: -0.10 },
        { name: "Perda de Parceria", effect: -0.07 },
        { name: "Mau Desempenho Financeiro", effect: -0.09 },
        { name: "Desastre Natural", effect: -0.11 },
        { name: "Inovação Tecnológica", effect: 0.12 },
        { name: "Investimento de Capital", effect: 0.15 },
        { name: "Reconhecimento Nacional", effect: 0.08 },
        { name: "Reconhecimento Internacional", effect: 0.13 },
        { name: "Descida no ranking Nacional", effect: -0.09 },
        { name: "Descida no ranking Internacional", effect: -0.19 },
        { name: "Expansão de Mercado", effect: 0.06 },
        { name: "Melhoria de Infraestruturas", effect: 0.03 },
        { name: "Aumento de Produção", effect: 0.06 },
        { name: "Queda nas Vendas", effect: -0.10 },
        { name: "Concorrência Agressiva", effect: -0.08 },
        { name: "Mudanças Regulatórias", effect: -0.09 },
        { name: "Perda de Licenciamento", effect: -0.06 },
        { name: "Protestos e Greves", effect: -0.09 },
        { name: "Corrupção", effect: -0.13 }
    ],
    probabilities: {
        positive: 0.45,
        negative: 0.35,
        neutral: 0.2
    }
};

function weightedRandom(probabilities: number[]): number {

    let sum = 0;
    const r = Math.random();

    for (let i = 0; i < probabilities.length; i++) {
        sum += probabilities[i];

        if (r <= sum) {
            return i;
        }
    }
    
    return 0;
}

function chooseEventType(): "positive" | "negative" | "neutral" {

    const types = Object.keys(events.probabilities) as Array<"positive" | "negative" | "neutral">;
    const probabilities = Object.values(events.probabilities) as Array<number>;

    return types[weightedRandom(probabilities)];
}

function chooseEvent(eventType: "positive" | "negative" | "neutral"): Event {

    const isPositive = eventType === "positive";
    const isNegative = eventType === "negative";

    const filteredEvents = events.names.filter(event => {
        return (isPositive && event.effect > 0) || (isNegative && event.effect < 0) || (!isPositive && !isNegative && event.effect === 0);
    });

    return filteredEvents[Math.floor(Math.random() * filteredEvents.length)];
}

export function generateEvent(): Event {
    const eventType = chooseEventType();
    const event = chooseEvent(eventType);

    return event
}

export async function applyEvent(client: Tom5, event: Event, companyArgs: [string, Company]) {

    const companies: Map<string, Company> = await client.db.findClient(
        {
            _id: client.user.id
        }
    ).then(doc => doc.companies as Map<string, Company>)

    if (companyArgs && companies.get(companyArgs[0])) {

        const company = companies.get(companyArgs[0])

        company.historyPrices.push(company.price);
        company.price = Math.max(1, company.price + (company.price * event.effect));

        companies.set(companyArgs[0], company)

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

        return true
    } else {
        return false
    }
}