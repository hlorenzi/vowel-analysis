interface AudioWorkletProcessor {
    readonly port: MessagePort;
}

interface AudioWorkletProcessorImpl extends AudioWorkletProcessor {
    process(
        inputs: Float32Array[][],
        outputs: Float32Array[][],
        parameters: Record<string, Float32Array>
    ): boolean;
}

declare var AudioWorkletProcessor: {
    prototype: AudioWorkletProcessor;
    new (options?: AudioWorkletNodeOptions): AudioWorkletProcessor;
};

type AudioParamDescriptor = {
    name: string,
    automationRate: AutomationRate,
    minValue: number,
    maxValue: number,
    defaultValue: number
}

interface AudioWorkletProcessorConstructor {
    new (options?: AudioWorkletNodeOptions): AudioWorkletProcessorImpl;
    parameterDescriptors?: AudioParamDescriptor[];
}

declare function registerProcessor(
    name: string,
    processorCtor: AudioWorkletProcessorConstructor,
): void;


const buffer = new Float32Array(1024)


class WaveformCaptureProcessor extends AudioWorkletProcessor
{
    constructor()
    {
        super()
    }


    process(
        inputs: Float32Array[][],
        outputs: Float32Array[][],
        parameters: Record<string, Float32Array>)
    {
        const data = inputs[0][0]
        for (let i = 0; i < data.length; i++)
            buffer[i] = data[i]

        this.port.postMessage({
            buffer,
            length: data.length
        })
        
        return true
    }
}

registerProcessor("waveformCapture", WaveformCaptureProcessor)