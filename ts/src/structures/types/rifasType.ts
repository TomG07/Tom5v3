export type RifasType = {
    id: string,
    premio: number,
    tickets: {
        userId: string,
        entries: number,
    }[],
    winner?: string,
    dataFinal: Date,
    maxUsers?: number,
    minUsers?: number,
    minTickets?: number,
    owner?: string,
    logsChannel?: string,
    global?: boolean
}