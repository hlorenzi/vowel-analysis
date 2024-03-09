import { forwardLinearPrediction } from "./lpc.ts"
import { findRoots, Complex } from "./roots.ts"


// From: https://www.mathworks.com/help/signal/ug/formant-estimation-with-lpc-coefficients.html
export function extractFormants(
    sample: Float32Array,
    samplingFrequency: number)
    : number[]
{
    const sampleWindowed =
        sample.map((s, i) => s * hammingWindow(i, sample.length))

    const sampleFiltered =
        preemphasisFilter(sampleWindowed)

    const lpc =
        forwardLinearPrediction(sampleFiltered, 8)

    const roots = findRoots(lpc)
        .filter(c => c.imag >= 0)
        
    const angles = roots
        .map(c => Math.atan2(c.imag, c.real))

    const frequencies = angles
        .map(a => a * (samplingFrequency / (2 * Math.PI)))

    const complexMagnitude =
        (c: Complex) => Math.sqrt(c.real * c.real + c.imag * c.imag)

    const bandwidths = roots
        .map(r => -0.5 * (samplingFrequency / (2 * Math.PI)) * Math.log(complexMagnitude(r)))

    const formants = []
    for (let i = 0; i < angles.length; i++)
    {
        const frequency = frequencies[i]
        const bandwidth = bandwidths[i]
        //if (frequency > 90 && frequency < 3500 && bandwidth < 1000)
            formants.push(frequency)
    }

    formants.sort((a, b) => a - b)
    return formants
}


function hammingWindow(
    n: number,
    nMax: number)
{
    const a0 = 25 / 46
    return a0 - (1 - a0) * Math.cos(2 * Math.PI * n / nMax)
}


function preemphasisFilter(
    array: Float32Array)
{
    const result = new Float32Array(array.length)

    const a0 = 1
    const a1 = 0.63

    result[0] = a0 * array[0]

    for (let i = 1; i < array.length; i++)
        result[i] = a0 * array[i] - a1 * result[i - 1]
    
    return result
}