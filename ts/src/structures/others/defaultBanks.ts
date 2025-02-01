import { Banco } from "../types/banco.js";

const defaultBanks: { [key: string]: Banco } = {
    "global_trust": {
        name: "GlobalTrust Bank 🌍💼",
        saldo: 0,
        taxas: {
            transações: {
                internacionais: 0.5,
                nacionais: 0.3
            },
            juros: {
                saldo: 0.01
            }
        },
    },
    "nexis_financial": {
        name: "Nexis Financial 📊🏦",
        saldo: 0,
        taxas: {
            transações: {
                internacionais: 0.7,
                nacionais: 0.1
            },
            juros: {
                saldo: 0.02
            }
        }
    },
    "altura_capital": {
        name: "Altura Capital 📈🏢",
        saldo: 0,
        taxas: {
            transações: {
                internacionais: 0.3,
                nacionais: 0.7
            },
            juros: {
                saldo: 0.005
            }
        }
    },
    "nova_sphere": {
        name: "NovaSphere Bank 🌌💳",
        saldo: 0,
        taxas: {
            transações: {
                internacionais: 0.8,
                nacionais: 0.05
            },
            juros: {
                saldo: 0.015
            }
        }
    }
}

export default defaultBanks;
