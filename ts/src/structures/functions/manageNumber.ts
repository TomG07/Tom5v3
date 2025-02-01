export default function manageNumber (number: number | string, type: "reduce" | "multiplier" = "reduce") {

    if (type === "multiplier") {
        let num = number.toString()
        const splitted = num.split('')
                
        const multiplier = splitted[splitted.length - 1]

        switch (multiplier) {
            default: {
                return Number(num)
            }

            case "k": {
                
                num = num.replace("k", "")

                const preNumber = num.includes(".") ? num.split(".")[0] : num.split(",")[0] || ""
                const posNumber = num.includes(".") ? num.split(".")[1] : num.split(",")[1] || ""
                
                return Number(`${preNumber}${posNumber}${"0".repeat(3 - posNumber.length)}`)
            }

            case "M": {
                num = num.replace("M", "")

                const preNumber = num.includes(".") ? num.split(".")[0] : num.split(",")[0] || ""
                const posNumber = num.includes(".") ? num.split(".")[1] : num.split(",")[1] || ""
                
                return Number(`${preNumber}${posNumber}${"0".repeat(6 - posNumber.length)}`)
            }

            case "B": {
                num = num.replace("M", "")

                const preNumber = num.includes(".") ? num.split(".")[0] : num.split(",")[0] || ""
                const posNumber = num.includes(".") ? num.split(".")[1] : num.split(",")[1] || ""
                
                return Number(`${preNumber}${posNumber}${"0".repeat(9 - posNumber.length)}`)
            }
        }
    } else {
        const num = number.toString()
        const splited = num.split("")

        let res = ""

        if (num.length < 4) {
            res = `${num}`

            return res
        } else if (num.length > 3 && num.length < 7) {

            const size = num.length
            const numerosImp = size - 3

            for (let i = 0; i < numerosImp; i++) {
                res += splited[i]
            }

            res += "."

            for (let i = numerosImp; i < numerosImp + 2; i++) {
                res += splited[i]
            }

            res += "k"

            return res

        } else if (num.length > 6 && num.length < 10) {

            const size = num.length
            const numerosImp = size - 6

            for (let i = 0; i < numerosImp; i++) {
                res += splited[i]
            }

            res += "."

            for (let i = numerosImp; i < numerosImp + 2; i++) {
                res += splited[i]
            }

            res += "M"

            return res

        } else {

            const size = num.length
            const numerosImp = size - 9

            for (let i = 0; i < numerosImp; i++) {
                res += splited[i]
            }

            res += "."

            for (let i = numerosImp; i < numerosImp + 2; i++) {
                res += splited[i]
            }

            res += "B"

            return res

        }
    }
}