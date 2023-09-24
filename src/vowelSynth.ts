export class VowelSynth
{
    ctx: AudioContext
    nodeSource: OscillatorNode
    nodeFormant1Filter: BiquadFilterNode
    nodeFormant1Gain: GainNode
    nodeFormant2Filter: BiquadFilterNode
    nodeFormant2Gain: GainNode
    nodeAnalyser: AnalyserNode
    nodeAnalyserData: Uint8Array
    nodeAnalyserTimeDomainData: Float32Array
    nodeMicSrc?: MediaStreamAudioSourceNode
    nodeMicFilter: BiquadFilterNode
    
    
    constructor()
    {
        this.ctx = new AudioContext()


        this.nodeAnalyser = this.ctx.createAnalyser()
        this.nodeAnalyser.fftSize = 2048
        this.nodeAnalyser.maxDecibels = -20
        this.nodeAnalyser.minDecibels = -90
        this.nodeAnalyser.smoothingTimeConstant = 0.8
        this.nodeAnalyserData = new Uint8Array(this.nodeAnalyser.frequencyBinCount)
        this.nodeAnalyserTimeDomainData = new Float32Array(this.nodeAnalyser.frequencyBinCount)

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


        this.nodeSource = this.ctx.createOscillator()
        this.nodeSource.type = "sawtooth"
        this.nodeSource.frequency.value = 120
        this.nodeSource.connect(this.nodeFormant1Filter)
        this.nodeSource.connect(this.nodeFormant2Filter)
        this.nodeSource.start()
    }


    resume()
    {
        this.ctx.resume()
    }


    setGain(gain: number)
    {
        this.nodeFormant1Gain.gain.value = gain * 0.25
        this.nodeFormant2Gain.gain.value = gain * 0.25 * 0.8
    }


    setFrequencies(formant1Freq: number, formant2Freq: number)
    {
        this.nodeFormant1Filter.frequency.value = formant1Freq
        this.nodeFormant2Filter.frequency.value = formant2Freq
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


    async openMic()
    {
        if (this.nodeMicSrc)
            return
        
        return new Promise<void>((resolve, reject) => {

            const callback = (stream: MediaStream) => {
                this.nodeMicSrc = this.ctx.createMediaStreamSource(stream)
                this.nodeMicSrc.connect(this.nodeMicFilter)
                resolve()
            }

            navigator.getUserMedia(
                { audio: true },
                callback,
                reject)
        })
    }
}