export default interface LogsManagerInterface {
    name?: string,
    color: "red" | "green" | "yellow",
    shardId: number,
    content: string,
    aditional?: string
}