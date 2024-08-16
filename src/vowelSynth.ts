const recordingBufferLength = 80000


export class VowelSynth
{
    ctx: AudioContext
    nodeSource: OscillatorNode
    nodeFormant1Filter: BiquadFilterNode
    nodeFormant1Gain: GainNode
    nodeFormant2Filter: BiquadFilterNode
    nodeFormant2Gain: GainNode
    nodeFormant3Filter: BiquadFilterNode
    nodeFormant3Gain: GainNode
    nodeFormant4Filter: BiquadFilterNode
    nodeFormant4Gain: GainNode
    nodeAnalyser: AnalyserNode
    nodeAnalyserData: Uint8Array
    nodeAnalyserTimeDomainData: Float32Array
    nodeMicSrc?: MediaStreamAudioSourceNode
    nodeMicFilter: BiquadFilterNode
    recordingBuffer: AudioBuffer
    nodeRecordingSrc?: AudioBufferSourceNode
    recordingPlaybackStartTime: number
    waveformCaptureNode: AudioWorkletNode
    waveformBuffer: Float32Array
    waveformBufferReturn: Float32Array
    waveformBufferIndex: number

    cachedFormants: number[]


    static async create(): Promise<VowelSynth>
    {
        const ctx = new AudioContext({ sampleRate: 11000 })
        await ctx.audioWorklet.addModule("build/audioWorklet.js")
        return new VowelSynth(ctx)
    }

    
    private constructor(ctx: AudioContext)
    {
        this.ctx = ctx


        this.waveformCaptureNode = new AudioWorkletNode(this.ctx, "waveformCapture")
        this.waveformCaptureNode.port.onmessage = (ev) => this.captureWaveform(ev)
        this.waveformCaptureNode.connect(this.ctx.destination)

        this.nodeAnalyser = this.ctx.createAnalyser()
        this.nodeAnalyser.fftSize = 2048
        this.nodeAnalyser.maxDecibels = -20
        this.nodeAnalyser.minDecibels = -90
        this.nodeAnalyser.smoothingTimeConstant = 0.8
        this.nodeAnalyserData = new Uint8Array(this.nodeAnalyser.fftSize)
        this.nodeAnalyserTimeDomainData = new Float32Array(this.nodeAnalyser.fftSize)
        this.nodeAnalyser.connect(this.waveformCaptureNode)

        this.waveformBuffer = new Float32Array(80000)
        this.waveformBufferIndex = 0

        this.nodeMicFilter = this.ctx.createBiquadFilter()
        this.nodeMicFilter.type = "lowpass"
        this.nodeMicFilter.frequency.value = 3000
        this.nodeMicFilter.Q.value = 25
        this.nodeMicFilter.connect(this.nodeAnalyser)


        this.nodeFormant1Gain = this.ctx.createGain()
        this.nodeFormant1Gain.gain.value = 0
        this.nodeFormant1Gain.connect(this.nodeAnalyser)
        this.nodeFormant1Gain.connect(this.ctx.destination)

        this.nodeFormant1Filter = this.ctx.createBiquadFilter()
        this.nodeFormant1Filter.type = "bandpass"
        this.nodeFormant1Filter.frequency.value = 0
        this.nodeFormant1Filter.Q.value = 5
        this.nodeFormant1Filter.connect(this.nodeFormant1Gain)

        
        this.nodeFormant2Gain = this.ctx.createGain()
        this.nodeFormant2Gain.gain.value = 0
        this.nodeFormant2Gain.connect(this.nodeAnalyser)
        this.nodeFormant2Gain.connect(this.ctx.destination)

        this.nodeFormant2Filter = this.ctx.createBiquadFilter()
        this.nodeFormant2Filter.type = "bandpass"
        this.nodeFormant2Filter.frequency.value = 0
        this.nodeFormant2Filter.Q.value = 5
        this.nodeFormant2Filter.connect(this.nodeFormant2Gain)

        
        this.nodeFormant3Gain = this.ctx.createGain()
        this.nodeFormant3Gain.gain.value = 0
        this.nodeFormant3Gain.connect(this.nodeAnalyser)
        this.nodeFormant3Gain.connect(this.ctx.destination)

        this.nodeFormant3Filter = this.ctx.createBiquadFilter()
        this.nodeFormant3Filter.type = "bandpass"
        this.nodeFormant3Filter.frequency.value = 0
        this.nodeFormant3Filter.Q.value = 5
        this.nodeFormant3Filter.connect(this.nodeFormant3Gain)

        
        this.nodeFormant4Gain = this.ctx.createGain()
        this.nodeFormant4Gain.gain.value = 0
        this.nodeFormant4Gain.connect(this.nodeAnalyser)
        this.nodeFormant4Gain.connect(this.ctx.destination)

        this.nodeFormant4Filter = this.ctx.createBiquadFilter()
        this.nodeFormant4Filter.type = "bandpass"
        this.nodeFormant4Filter.frequency.value = 0
        this.nodeFormant4Filter.Q.value = 5
        this.nodeFormant4Filter.connect(this.nodeFormant4Gain)


        this.nodeSource = this.ctx.createOscillator()
        this.nodeSource.type = "sawtooth"
        this.nodeSource.frequency.value = 90
        this.nodeSource.connect(this.nodeFormant1Filter)
        this.nodeSource.connect(this.nodeFormant2Filter)
        //this.nodeSource.connect(this.nodeFormant3Filter)
        //this.nodeSource.connect(this.nodeFormant4Filter)
        this.nodeSource.start()


        this.recordingBuffer = this.ctx.createBuffer(1, recordingBufferLength, this.ctx.sampleRate)
        this.recordingPlaybackStartTime = 0

        this.cachedFormants = []
    }


    resume()
    {
        this.ctx.resume()
    }


    setGain(gain: number)
    {
        const generalGain = 0.5
        this.nodeFormant1Gain.gain.value = gain * generalGain
        this.nodeFormant2Gain.gain.value = gain * generalGain * 0.8
        this.nodeFormant3Gain.gain.value = gain * generalGain * 0.5
        this.nodeFormant4Gain.gain.value = gain * generalGain * 0.2
    }


    setFrequencies(formant1Freq: number, formant2Freq: number)
    {
        formant1Freq = Math.max(0, Math.min(5000, formant1Freq))
        formant2Freq = Math.max(0, Math.min(5000, formant2Freq))

        this.nodeFormant1Filter.frequency.value = formant1Freq
        this.nodeFormant2Filter.frequency.value = formant2Freq
        this.nodeFormant3Filter.frequency.value = 2700
        this.nodeFormant4Filter.frequency.value = 3500
    }


    captureWaveform(ev: MessageEvent)
    {
        const buffer = ev.data.buffer as Float32Array
        const length = ev.data.length as number
        //console.log("captureWaveform", this.waveformBufferIndex, buffer, length)

        for (let i = 0; i < length; i++)
        {
            const outputIndex = (this.waveformBufferIndex + i) % this.waveformBuffer.length
            this.waveformBuffer[outputIndex] = buffer[i]
        }

        this.waveformBufferIndex = (this.waveformBufferIndex + length) % this.waveformBuffer.length
    }


    getWaveform(fromSampleIndex: number): Float32Array
    {
        const length = Math.max(0,
            fromSampleIndex > this.waveformBufferIndex ?
                this.waveformBuffer.length - fromSampleIndex + this.waveformBufferIndex :
                this.waveformBufferIndex - fromSampleIndex)

        //console.log("getWaveform", fromSampleIndex, length)
        const result = new Float32Array(length)
        
        for (let i = 0; i < length; i++)
            result[i] = this.waveformBuffer[(fromSampleIndex + i) % this.waveformBuffer.length]

        return result
    }


    getWaveformLatest(latestNumSamples: number): Float32Array
    {
        return this.getWaveform(
            (this.waveformBufferIndex + this.waveformBuffer.length - latestNumSamples) % this.waveformBuffer.length)
    }


    cacheFormants(formants: number[])
    {
        this.cachedFormants = formants
    }


    getCachedFormants(): number[]
    {
        return this.cachedFormants
    }


    getAnalyserData(): Uint8Array
    {
        this.nodeAnalyser.getByteFrequencyData(this.nodeAnalyserData)
        return this.nodeAnalyserData
    }


    getAnalyserTimeData(): Float32Array
    {
        this.nodeAnalyser.getFloatTimeDomainData(this.nodeAnalyserTimeDomainData)
        return this.nodeAnalyserTimeDomainData
    }


    playRecording()
    {
        if (this.nodeRecordingSrc)
        {
            this.nodeRecordingSrc.stop()
            this.nodeRecordingSrc.disconnect()
            this.nodeRecordingSrc = undefined
        }

        this.nodeRecordingSrc = this.ctx.createBufferSource()
        this.nodeRecordingSrc.buffer = this.recordingBuffer
        this.nodeRecordingSrc.connect(this.nodeAnalyser)
        this.nodeRecordingSrc.connect(this.ctx.destination)
        this.nodeRecordingSrc.start()
        this.recordingPlaybackStartTime = this.ctx.currentTime
    }


    async toggleMic()
    {
        if (this.nodeMicSrc)
        {
            this.nodeMicSrc.disconnect()
            this.nodeMicSrc = undefined
            return
        }

        try
        {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            this.nodeMicSrc = this.ctx.createMediaStreamSource(stream)
            this.nodeMicSrc.connect(this.nodeMicFilter)
        }
        catch (e)
        {
            window.alert("Could not open the microphone.\n\n" + e)
            throw e
        }
    }
}