/* eslint-disable no-undef */
import { exec, spawn } from "node:child_process"

exec('npx --version', (err, _, stderr) => {
    if (err) {
        console.log("Erro ao verificar npm: " + err.message)
        return
    }

    if (stderr) {
        console.error("Erro: " + stderr)
        return
    }

    spawn(process.platform === "win32" ? 'npm.cmd' : 'npm', ['run', 'start'], { stdio: "inherit", shell: true })
})