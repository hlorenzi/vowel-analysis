import * as Solid from "solid-js"
import { VowelSynth } from "./vowelSynth.ts"
import { extractFormants } from "./formantExtractor.ts"
import * as Data from "./data.ts"


export function AnalysisChart(props: {
    synth: VowelSynth,
})
{
    let canvas: HTMLCanvasElement = undefined!
    let canvasCtx: CanvasRenderingContext2D = undefined!


    Solid.onMount(() => {
        canvasCtx = canvas.getContext("2d")!
        window.requestAnimationFrame(() => draw(props.synth, canvasCtx))
    })

    return <canvas
        ref={ canvas }
        style={{
            "width": "700px",
            "height": "120px",
            "border-radius": "0.5em",
        }}
    />
}


function mapValueToView(
    x: number,
    w: number)
{
    const min = Data.f1Min - 100
    const max = Data.f2Max + 500
    const p = (x - min) / (max - min)
    const logScale = 10
    const t = Math.log((logScale - 1) * p + 1) / Math.log(logScale)
    const xMargin = 10
    return xMargin + ((w - xMargin * 2) * t)
}


function draw(
    synth: VowelSynth,
    canvasCtx: CanvasRenderingContext2D)
{
    requestAnimationFrame(() => draw(synth, canvasCtx))

    const pixelRatio = window.devicePixelRatio
    const rect = canvasCtx.canvas.getBoundingClientRect()
    const w =
        Math.round(pixelRatio * rect.right) -
        Math.round(pixelRatio * rect.left)
    const h =
        Math.round(pixelRatio * rect.bottom) -
        Math.round(pixelRatio * rect.top)
    canvasCtx.canvas.width = w
    canvasCtx.canvas.height = h

    const freqData = synth.getAnalyserData()

    canvasCtx.save()
    canvasCtx.translate(0.5, 0.5)

    canvasCtx.fillStyle = "#eee"
    canvasCtx.fillRect(0, 0, w, h)

    const xMargin = 10

    canvasCtx.lineWidth = 1
    canvasCtx.strokeStyle = "#aaa"
    canvasCtx.fillStyle = "#aaa"
    canvasCtx.font = "0.75em Times New Roman"
    canvasCtx.fillStyle = "#000"
    canvasCtx.textAlign = "left"
    canvasCtx.textBaseline = "top"
    for (let freq = Data.f2Min + 500; freq <= Data.f2Max; freq += 500)
    {
        const x = Math.floor(mapValueToView(freq, w))
        
        canvasCtx.beginPath()
        canvasCtx.moveTo(x, 0)
        canvasCtx.lineTo(x, h)
        canvasCtx.stroke()
        canvasCtx.fillText(freq + " Hz", x + 2, 2)
    }

    canvasCtx.lineWidth = 2
    canvasCtx.strokeStyle = "#f20"
    canvasCtx.beginPath()
    for (let i = 0; i < freqData.length; i++)
    {
        const freq = i / freqData.length * (synth.ctx.sampleRate / 2)
        if (freq < Data.f1Min - 100)
            continue
        if (freq > Data.f2Max + 500)
            break

        const v = freqData[i] / 255
        const y = h - (v * h)
        const x = mapValueToView(freq, w)
        
        canvasCtx.moveTo(x, h)
        canvasCtx.lineTo(x, y)
    }
    canvasCtx.stroke()

    const timeData = synth.getAnalyserTimeData()

    canvasCtx.lineWidth = 2
    canvasCtx.strokeStyle = "#000"
    canvasCtx.beginPath()
    canvasCtx.moveTo(0, h / 2)
    for (let i = 0; i < timeData.length; i++)
    {
        const y = h / 2 - (timeData[i] * h / 2)

        const x =
            xMargin + (
                (w - xMargin * 2) *
                (i / timeData.length))
        
        canvasCtx.lineTo(x, y)
    }
    canvasCtx.lineTo(w, h / 2)
    canvasCtx.stroke()

    const formants = extractFormants(timeData, synth.ctx.sampleRate)
    canvasCtx.lineWidth = 2
    canvasCtx.strokeStyle = "#02f"
    canvasCtx.globalAlpha = 0.75
    canvasCtx.beginPath()
    for (let i = 0; i < formants.length; i++)
    {
        const x = mapValueToView(formants[i], w)
        
        canvasCtx.moveTo(x, 0)
        canvasCtx.lineTo(x, h)
    }
    canvasCtx.stroke()

    canvasCtx.globalAlpha = 1

    canvasCtx.restore()
}