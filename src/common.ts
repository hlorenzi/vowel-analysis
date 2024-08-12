export const f1Min = 200
export const f1Max = 1200
export const f2Min = 500
export const f2Max = 3500


export const colorSynth = "#284"
export const colorFormants = "#02f"
export const colorFrequencyDomain = "#f20"


export function canvasResize(canvas: HTMLCanvasElement)
{
    const pixelRatio = window.devicePixelRatio || 1

    const rect = canvas.getBoundingClientRect()
    const w =
        Math.round(pixelRatio * rect.right) -
        Math.round(pixelRatio * rect.left)
    const h =
        Math.round(pixelRatio * rect.bottom) -
        Math.round(pixelRatio * rect.top)
    
    canvas.width = w
    canvas.height = h
}