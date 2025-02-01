import Tom5 from "./src/classes/Tom5.js";

export const client = new Tom5()
await client.init()

const log = client.log

process.on('unhandledRejection', (reason, p) => {
    log(
        {
            color: "red",
            content: "script Rejeitado",
            shardId: client.shardId,
            name: "process",
            aditional: `${reason}`
        }
    )
});

process.on("uncaughtException", (err, origin) => {
    log(
        {
            color: "red",
            content: "erro Capturado",
            shardId: client.shardId,
            name: "process",
            aditional: `Erro: \n${err}\n\nStack:\n${err.stack}`
        }
    )
})

process.on('uncaughtExceptionMonitor', (err, origin) => {
    log(
        {
            color: "red",
            content: "bloqueado",
            shardId: client.shardId,
            name: "process",
            aditional: `Erro:\n${err}\n\nStack:\n${err.stack}`
        }
    )
});

process.on("SIGINT", () => {
    log(
        {
            color: "red",
            content: "Processo Terminado. Adeus 👋",
            shardId: client.shardId,
            name: "process"
        }
    )

    process.exit(0);
});