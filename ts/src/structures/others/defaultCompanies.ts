import { Company } from "../types/company.js"

const defaultCompanies: { [key: string]: Company } = {
    "NetGen": {
        "ipo": true,
        "shares": Math.round(Math.random() * 7),
        "price": Math.floor((Math.random() * 3000) + 500),
    },
    "InfoSys": {
        "ipo": true,
        "shares": Math.round(Math.random() * 7),
        "price": Math.floor((Math.random() * 3000) + 500),
    },
    "QuantumTech": {
        "ipo": true,
        "shares": Math.round(Math.random() * 7),
        "price": Math.floor((Math.random() * 3000) + 500),
    },
    "LearnSphere": {
        "ipo": true,
        "shares": Math.round(Math.random() * 7),
        "price": Math.floor((Math.random() * 3000) + 500),
    },
    "KnowledgeWorks": {
        "ipo": true,
        "shares": Math.round(Math.random() * 7),
        "price": Math.floor((Math.random() * 3000) + 500),
    },
    "SkillMaster": {
        "ipo": true,
        "shares": Math.round(Math.random() * 7),
        "price": Math.floor((Math.random() * 3000) + 500),
    },
    "MediCore": {
        "ipo": true,
        "shares": Math.round(Math.random() * 7),
        "price": Math.floor((Math.random() * 3000) + 500),
    },
    "WellnessWave": {
        "ipo": true,
        "shares": Math.round(Math.random() * 7),
        "price": Math.floor((Math.random() * 3000) + 500),
    },
    "HealthGen": {
        "ipo": true,
        "shares": Math.round(Math.random() * 7),
        "price": Math.floor((Math.random() * 3000) + 500),
    },
    "GreenEnergy": {
        "ipo": true,
        "shares": Math.round(Math.random() * 7),
        "price": Math.floor((Math.random() * 3000) + 500),
    },
    "EcoPower": {
        "ipo": true,
        "shares": Math.round(Math.random() * 7),
        "price": Math.floor((Math.random() * 3000) + 500),
    },
    "Solaris": {
        "ipo": true,
        "shares": Math.round(Math.random() * 7),
        "price": Math.floor((Math.random() * 3000) + 500),
    },
    "FinTech Solutions": {
        "ipo": true,
        "shares": Math.round(Math.random() * 7),
        "price": Math.floor((Math.random() * 3000) + 500),
    },
    "CrediLink": {
        "ipo": true,
        "shares": Math.round(Math.random() * 7),
        "price": Math.floor((Math.random() * 3000) + 500),
    },
    "TradeNet": {
        "ipo": true,
        "shares": Math.round(Math.random() * 7),
        "price": Math.floor((Math.random() * 3000) + 500),
    },
    "MarketMax": {
        "ipo": true,
        "shares": Math.round(Math.random() * 7),
        "price": Math.floor((Math.random() * 3000) + 500),
    },
    "RetailPro": {
        "ipo": true,
        "shares": Math.round(Math.random() * 7),
        "price": Math.floor((Math.random() * 3000) + 500),
    },
    "MoneyWave": {
        "ipo": true,
        "shares": Math.round(Math.random() * 7),
        "price": Math.floor((Math.random() * 3000) + 500),
    }
}

for (const [companyName, companyOptions] of Object.entries(defaultCompanies)) {
    defaultCompanies[companyName].availableShares = companyOptions.shares
    defaultCompanies[companyName].invested = 0
}

export default defaultCompanies