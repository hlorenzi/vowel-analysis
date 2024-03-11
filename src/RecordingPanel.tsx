import * as Solid from "solid-js"
import { VowelSynth } from "./vowelSynth.ts"
import * as Data from "./data.ts"
import * as Common from "./common.ts"
import * as Wav from "./wavEncode.ts"
//import * as Styled from "solid-styled-components"


export function RecordingPanel(props: {
    synth: VowelSynth,
})
{
    const state: State = {
        canvas: undefined!,
        ctx: undefined!,
        synth: props.synth,

        sampleBuffer: new Float32Array(props.synth.recordingBuffer.length),

        recording: false,
        recordingIndex: 0,
        waveformBufferIndex: 0,

        playing: false,
        playingIndex: 0,
    }


    Solid.onMount(() => {
        state.ctx = state.canvas.getContext("2d")!

        window.requestAnimationFrame(() => draw(state))
    })


    return <>
        <canvas
            ref={ state.canvas }
            style={{
                "width": "100%",
                "height": "15dvh",
                "border-radius": "0.25em",
            }}
        />
        <br/>
        <button onclick={ () => recordingToggle(state) }>
            Record
        </button>
        { " " }
        <button onclick={ () => play(state) }>
            Play
        </button>
        { " " }
        <button onclick={ () => exportWav(state) }>
            Export .wav
        </button>
        { " " }
        <button onclick={ async () => importWav(state) }>
            Import .wav
        </button>
    </>
}


interface State
{
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    synth: VowelSynth

    /// Each sample is in the range [-1, 1].
    sampleBuffer: Float32Array

    recording: boolean
    recordingIndex: number
    waveformBufferIndex: number

    playing: boolean
    playingIndex: number
}


function recordingToggle(state: State)
{
    if (state.recording)
    {
        recordingFinish(state)
        return
    }

    state.sampleBuffer.fill(0)
    state.recording = true
    state.recordingIndex = 0
    state.waveformBufferIndex = state.synth.waveformBufferIndex

    window.requestAnimationFrame(() => recordingFrame(state))
}


function recordingFinish(state: State)
{
    state.recording = false
    state.synth.recordingBuffer.copyToChannel(state.sampleBuffer, 0, 0)
}


function recordingFrame(state: State)
{
    if (!state.recording)
        return

    const waveform = state.synth
        .getWaveform(state.waveformBufferIndex)
        .slice(0, state.sampleBuffer.length - state.recordingIndex)

    state.sampleBuffer.set(waveform, state.recordingIndex)
    state.recordingIndex += waveform.length
    state.waveformBufferIndex = state.synth.waveformBufferIndex

    if (state.recordingIndex >= state.sampleBuffer.length)
    {
        recordingFinish(state)
        return
    }

    window.requestAnimationFrame(() => recordingFrame(state))
}


function play(state: State)
{
    state.playing = true
    state.playingIndex = 0
    state.synth.playRecording()

    window.requestAnimationFrame(() => playFrame(state))
}


function playFrame(state: State)
{
    if (!state.playing)
        return
    
    const timeDelta = state.synth.ctx.currentTime - state.synth.recordingPlaybackStartTime
    state.playingIndex = timeDelta * state.synth.ctx.sampleRate

    if (state.playingIndex >= state.recordingIndex)
    {
        state.playing = false
        return
    }

    window.requestAnimationFrame(() => playFrame(state))
}


function exportWav(state: State)
{
    const data = Wav.encode(
        state.sampleBuffer.slice(0, state.recordingIndex),
        state.synth.ctx.sampleRate)

    const blob = new Blob([data], { type: "octet/stream" })
    const url = window.URL.createObjectURL(blob)

    const element = document.createElement("a")
    element.setAttribute("href", url)
    element.setAttribute("download", "recording.wav")

    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
}


async function importWav(state: State)
{
    const handles = await (window as any).showOpenFilePicker({
        multiple: false,
        types: [{
            description: "Audio files",
            accept: {
                "audio/wav": [".wav"],
            },
        }]
    })
    const handle = handles[0]
    const file: File = await handle.getFile()
    const bytes = await file.arrayBuffer()
    const buffer = await state.synth.ctx.decodeAudioData(bytes)

    const waveform = buffer
        .getChannelData(0)
        .slice(0, state.sampleBuffer.length)

    state.sampleBuffer.fill(0)
    state.sampleBuffer.set(waveform, 0)
    state.recordingIndex = waveform.length
    recordingFinish(state)
}


function draw(state: State)
{
    window.requestAnimationFrame(() => draw(state))

    Common.canvasResize(state.canvas)

    const w = state.canvas.width
    const h = state.canvas.height

    state.ctx.save()
    state.ctx.translate(0.5, 0.5)

    state.ctx.fillStyle = "#eee"
    state.ctx.fillRect(0, 0, w, h)

    const sampleIndexToX = (index: number) => {
        const margin = 20
        return (index / state.sampleBuffer.length) * (w - margin * 2) + margin
    }

    const sampleAmplitudeToY = (amplitude: number) => {
        const margin = 10
        return h / 2 - amplitude * (h / 2 - margin)
    }


    // Draw boundaries
    state.ctx.strokeStyle = "#000"
    state.ctx.lineWidth = 1
    state.ctx.beginPath()
    state.ctx.moveTo(sampleIndexToX(0), 0)
    state.ctx.lineTo(sampleIndexToX(0), h)
    state.ctx.moveTo(sampleIndexToX(state.sampleBuffer.length), 0)
    state.ctx.lineTo(sampleIndexToX(state.sampleBuffer.length), h)
    state.ctx.stroke()

    // Draw waveform
    state.ctx.strokeStyle = "#000"
    state.ctx.lineWidth = 1
    state.ctx.beginPath()
    state.ctx.moveTo(sampleIndexToX(0), sampleAmplitudeToY(0))
    for (let i = 0; i < state.recordingIndex; i++)
    {
        const amplitude = state.sampleBuffer.at(i) ?? 0
        state.ctx.lineTo(sampleIndexToX(i), sampleAmplitudeToY(amplitude))
    }
    state.ctx.lineTo(sampleIndexToX(state.recordingIndex), sampleAmplitudeToY(0))
    state.ctx.lineTo(sampleIndexToX(state.sampleBuffer.length), sampleAmplitudeToY(0))
    state.ctx.stroke()

    // Draw recording head
    if (state.recording)
    {
        state.ctx.strokeStyle = "#f00"
        state.ctx.lineWidth = 2
        state.ctx.beginPath()
        state.ctx.moveTo(sampleIndexToX(state.recordingIndex), 0)
        state.ctx.lineTo(sampleIndexToX(state.recordingIndex), h)
        state.ctx.stroke()
    }

    // Draw playing head
    if (state.playing)
    {
        state.ctx.strokeStyle = "#00f"
        state.ctx.lineWidth = 2
        state.ctx.beginPath()
        state.ctx.moveTo(sampleIndexToX(state.playingIndex), 0)
        state.ctx.lineTo(sampleIndexToX(state.playingIndex), h)
        state.ctx.stroke()
    }

    state.ctx.restore()
}