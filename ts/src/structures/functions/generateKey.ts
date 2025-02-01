export default function generateKey(keyLength: number, prefix: string = "", sufix: string = "") {

    const chars = "abcdefghijklmnopqrstuvwxyz0123456789"

    const random = (min: number = 0, max: number = chars.length) => Math.floor(Math.random() * (max - min) + min)

    const randChars: string[] = []

    for (let i = 0; i < keyLength; i++) {
        randChars.push(chars[random()])
    }

    const key = `${prefix}${randChars.join(``)}${sufix}`

    return key
}