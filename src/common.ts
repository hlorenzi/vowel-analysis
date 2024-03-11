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