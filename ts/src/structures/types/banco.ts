export type Banco = {
    name: string,
    taxas: {
        transações: {
            internacionais: number,
            nacionais: number
        },
        juros: {
            saldo: number
        }
    },
    saldo: number
}