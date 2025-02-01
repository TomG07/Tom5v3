import { CanvasRenderingContext2D } from "canvas";

export default function brilho (ctx: CanvasRenderingContext2D, px: number, py: number, imageW: number, imageH: number, multiplier: number) {

    const imageData = ctx.getImageData(px, py, imageW, imageH)

    for (let i = 0; i < imageData.data.length; i += 4) {

        const red = imageData.data[i]
        const green = imageData.data[i + 1]
        const blue = imageData.data[i + 2]

        const brilhoRed = multiplier * red
        const brilhoGreen = multiplier * green
        const brilhoBlue = multiplier * blue

        imageData.data[i] = brilhoRed
        imageData.data[i + 1] = brilhoGreen
        imageData.data[i + 2] = brilhoBlue
    }

    ctx.putImageData(imageData, px, py)

    return
}