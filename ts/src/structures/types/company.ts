export type Company = {
    owner?: string,
    ipo?: boolean,
    shares: number,
    availableShares?: number,
    price: number,
    historyPrices?: number[]
    invested?: number,
}