import * as Solid from "solid-js"
import { VowelSynth } from "./vowelSynth.ts"
import * as Data from "./data.ts"
//import * as Styled from "solid-styled-components"


const logScale = 10


export function VowelChart(props: {
    synth: VowelSynth,
})
{
    const state: State = {
        canvas: undefined!,
        ctx: undefined!,
        synth: props.synth,
        mouseDown: false,
        mousePosNormalized: { x: 0, y: 0 },
        mousePosFormants: { f1: 0, f2: 0 },
        mousePath: [],
    }

    const [width, setWidth] = Solid.createSignal(700)
    const [height, setHeight] = Solid.createSignal(400)


    Solid.onMount(() => {
        state.ctx = state.canvas.getContext("2d")!

        state.canvas.addEventListener("mousedown", (ev) => mouseDown(state, ev))
        window.addEventListener("mousemove", (ev) => mouseMove(state, ev))
        window.addEventListener("mouseup", (ev) => mouseUp(state, ev))
        state.canvas.addEventListener("touchstart", (ev) => mouseDown(state, ev));
        window.addEventListener("touchend", (ev) => mouseUp(state, ev));
        window.addEventListener("touchcancel", (ev) => mouseUp(state, ev));
        window.addEventListener("touchmove", (ev) => mouseMove(state, ev));
        window.requestAnimationFrame(() => draw(state))
    })


    return <canvas
        ref={ state.canvas }
        style={{
            "width": "min(700px, calc(100dvw - 2em))",
            "height": "min(400px, 60dvh)",
            "border-radius": "0.5em",
        }}
    />
}


interface Position
{
    x: number
    y: number
}


interface PathPoint
{
    x: number
    y: number
    timer: number
}


interface State
{
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    synth: VowelSynth

    mouseDown: boolean
    mousePosNormalized: Position
    mousePosFormants: {
        f1: number
        f2: number
    }
    mousePath: PathPoint[]
}


function updateMousePos(
    state: State,
    ev: MouseEvent | TouchEvent)
{
    const rect = state.canvas.getBoundingClientRect()

    const [clientX, clientY] = "touches" in ev ?
        [ev.touches.item(0)?.clientX ?? 0, ev.touches.item(0)?.clientY ?? 0] :
        [ev.clientX, ev.clientY]

    const x = (clientX - rect.x) / rect.width
    const y = (clientY - rect.y) / rect.height

    state.mousePosNormalized = { x, y }

    state.mousePosFormants = {
        f1: Math.floor(mapViewToValue(y, Data.f1Min, Data.f1Max)),
        f2: Math.floor(mapViewToValue(1 - x, Data.f2Min, Data.f2Max)),
    }

    /*console.log(
        "mouse:",
        "F1 = ", state.mousePosFormants.f1, "Hz",
        "F2 = ", state.mousePosFormants.f2, "Hz")*/

    if (state.mouseDown)
    {
        state.mousePath.push({ ...state.mousePosNormalized, timer: 1 })
        while (state.mousePath.length > 200)
            state.mousePath.splice(0, 1)
    }
    
    state.synth.setFrequencies(
        state.mousePosFormants.f1,
        state.mousePosFormants.f2)
}


function mapViewToValue(x: number, min: number, max: number)
{
    const p = (Math.pow(logScale, x) - 1) / (logScale - 1)
    return min + (max - min) * p
}


function mapValueToView(x: number, min: number, max: number)
{
    const p = (x - min) / (max - min)
    return Math.log((logScale - 1) * p + 1) / Math.log(logScale)
}


function mouseDown(
    state: State,
    ev: MouseEvent | TouchEvent)
{
    ev.preventDefault()
    state.mouseDown = true
    state.synth.resume()
    state.synth.setGain(1)
    state.mousePath = []
    updateMousePos(state, ev)
}


function mouseMove(
    state: State,
    ev: MouseEvent | TouchEvent)
{
    ev.preventDefault()
    updateMousePos(state, ev)
}


function mouseUp(
    state: State,
    ev: MouseEvent | TouchEvent)
{
    ev.preventDefault()
    state.mouseDown = false
    state.synth.setGain(0)
    updateMousePos(state, ev)
}


const ipaVowels = [
    { symbol: "i", f1: 255, f2: 2890 }, //f1: 262, f2: 2287 },
    { symbol: "u", f1: 260, f2: 593 }, //f1: 304, f2: 878 },
    { symbol: "a", f1: 1072, f2: 1449 }, //f1: 913, f2: 1506 },
    { symbol: "o", f1: 500, f2: 800 }, //f1: 570, f2: 837 },
    { symbol: "ɔ", f1: 664, f2: 907 }, //f1: 570, f2: 837 },
    { symbol: "ɛ", f1: 709, f2: 2105 }, //f1: 527, f2: 1853 },
    { symbol: "e", f1: 408, f2: 2253 },
    { symbol: "ə", f1: 600, f2: 1200 },//f1: 544, f2: 1296 },
    { symbol: "ɪ", f1: 347, f2: 2629 }, //f1: 391, f2: 1992 },
    { symbol: "ʊ", f1: 434, f2: 1024 },
    { symbol: "ʌ", f1: 731, f2: 1127 }, //f1: 633, f2: 1194 },
    { symbol: "ɑ", f1: 970, f2: 984 }, //f1: 717, f2: 1094 },
    { symbol: "æ", f1: 902, f2: 1730 }, //f1: 656, f2: 1730 },
    { symbol: "y", f1: 252, f2: 2120 },
]


const isMobile = window.matchMedia("(pointer: coarse)").matches


function draw(
    state: State)
{
    window.requestAnimationFrame(() => draw(state))

    const pixelRatio = window.devicePixelRatio
    const rect = state.canvas.getBoundingClientRect()
    const w =
        Math.round(pixelRatio * rect.right) -
        Math.round(pixelRatio * rect.left)
    const h =
        Math.round(pixelRatio * rect.bottom) -
        Math.round(pixelRatio * rect.top)
    state.canvas.width = w
    state.canvas.height = h

    // Clear background
    state.ctx.save()
    state.ctx.translate(0.5, 0.5)

    state.ctx.clearRect(0, 0, w, h)
    state.ctx.fillStyle = "#eee"
    state.ctx.fillRect(0, 0, w, h)

    // Draw invalid region
    state.ctx.fillStyle = "#ccc"
    state.ctx.beginPath()
    state.ctx.moveTo(w, h)
    for (let freq = Data.f2Min; freq <= Data.f1Max; freq += 100)
    {
        const x = w - mapValueToView(freq, Data.f2Min, Data.f2Max) * w
        const y = mapValueToView(freq, Data.f1Min, Data.f1Max) * h
        state.ctx.lineTo(x, y)
    }
    state.ctx.fill()

    // Draw gradation lines
    state.ctx.lineWidth = 1
    state.ctx.strokeStyle = "#aaa"
    state.ctx.fillStyle = "#aaa"
    state.ctx.font = `${ isMobile ? "1.5em" : "0.75em" } Times New Roman`
    state.ctx.fillStyle = "#000"
    state.ctx.textAlign = "left"
    state.ctx.textBaseline = "top"
    for (let freq = Data.f2Min + 500; freq < Data.f2Max; freq += 500)
    {
        const x = Math.floor(w - mapValueToView(freq, Data.f2Min, Data.f2Max) * w)
        state.ctx.beginPath()
        state.ctx.moveTo(x, 0)
        state.ctx.lineTo(x, h)
        state.ctx.stroke()
        state.ctx.fillText(
            freq == Data.f2Min + 500 ? `F2 = ${ freq } Hz` : `${ freq }`,
            x + 2,
            2)
    }
    state.ctx.textBaseline = "bottom"
    for (let freq = Data.f1Min + 200; freq <= Data.f1Max; freq += 200)
    {
        const y = Math.floor(mapValueToView(freq, Data.f1Min, Data.f1Max) * h)
        state.ctx.beginPath()
        state.ctx.moveTo(0, y)
        state.ctx.lineTo(w, y)
        state.ctx.stroke()
        state.ctx.fillText(
            freq == Data.f1Max ? `F1 = ${ freq } Hz` : `${ freq }`,
            2,
            y - 2)
    }

    // Draw IPA symbols
    state.ctx.font = `${ isMobile ? "2.5em" : "2em" } Times New Roman`
    state.ctx.fillStyle = "#000"
    state.ctx.textAlign = "center"
    state.ctx.textBaseline = "middle"
    for (const vowel of ipaVowels)
    {
        const x = Math.floor(w - mapValueToView(vowel.f2, Data.f2Min, Data.f2Max) * w)
        const y = Math.floor(mapValueToView(vowel.f1, Data.f1Min, Data.f1Max) * h)
        state.ctx.fillText(vowel.symbol, x, y)
    }

    // Draw mouse path
    state.ctx.strokeStyle = "#048"
    state.ctx.lineWidth = 2
    for (let p = 1; p < state.mousePath.length; p++)
    {
        state.ctx.beginPath()
        const timer = Math.max(0, state.mousePath[p].timer)
        state.ctx.strokeStyle = `rgb(0 40 255 / ${ 0.25 + 0.75 * timer })`

        const pA = state.mousePath[p - 1]
        const pB = state.mousePath[p]
        state.ctx.moveTo(pA.x * w, pA.y * h)
        state.ctx.lineTo(pB.x * w, pB.y * h)

        const vecX = (pB.x - pA.x) * w
        const vecY = (pB.y - pA.y) * h
        const vecMagn = Math.sqrt(vecX * vecX + vecY * vecY)
        const vecXN = vecX / vecMagn
        const vecYN = vecY / vecMagn
        const crossSize = 3
        state.ctx.moveTo(pA.x * w - vecYN * crossSize, pA.y * h + vecXN * crossSize)
        state.ctx.lineTo(pA.x * w + vecYN * crossSize, pA.y * h - vecXN * crossSize)

        state.ctx.stroke()
    }

    state.mousePath.forEach((p) => p.timer -= 1 / 30)
    
    // Draw mouse
    if (state.mouseDown)
    {
        state.ctx.strokeStyle = "rgb(0 40 255)"
        state.ctx.lineWidth = 2
        state.ctx.beginPath()
        state.ctx.arc(
            state.mousePosNormalized.x * w,
            state.mousePosNormalized.y * h,
            2,
            0,
            Math.PI * 2)
        state.ctx.stroke()

        state.ctx.font = `${ isMobile ? "1.5em" : "0.75em" } Times New Roman`
        state.ctx.textAlign = "center"
        state.ctx.textBaseline = "bottom"
        state.ctx.fillText(
            `(${ state.mousePosFormants.f1 }, ` +
            `${ state.mousePosFormants.f2 } Hz)`,
            state.mousePosNormalized.x * w,
            state.mousePosNormalized.y * h + (isMobile ? -120 : -10))
    }

    state.ctx.restore()
}