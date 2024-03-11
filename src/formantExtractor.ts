import { forwardLinearPrediction } from "./lpc.ts"
import { findRoots, Complex } from "./roots.ts"


// From: https://www.mathworks.com/help/signal/ug/formant-estimation-with-lpc-coefficients.html
// From: https://github.com/praat/praat/blob/master/fon/Sound_to_Formant.cpp
export function extractFormants(
    /// An array of samples in the range [-1, 1]
    sample: Float32Array,
    /// The sampling frequency in hertz
    samplingFrequency: number)
    /// Returns the frequencies of the formants in hertz
    : number[]
{
    const sampleWindowed =
        //sample.map((s, i) => s * hammingWindow(i, sample.length))
        sample.map((s, i) => s * praatGaussianWindow(i, sample.length))

    const sampleFiltered =
        //preemphasisFilter(sampleWindowed)
        praatPreemphasis(sampleWindowed, samplingFrequency)

    const lpc =
        forwardLinearPrediction(sampleFiltered, 10)

    const roots = findRoots(lpc)
        .filter(c => c.imag >= 0)
        .map(c => praatFixRootToUnitCircle(c))
        
    const angles = roots
        .map(c => Math.atan2(c.imag, c.real))

    const frequencies = angles
        .map(a => a * samplingFrequency / 2 / Math.PI)

    const bandwidths = roots
        .map(r => -Math.log(complexMagnitude(r)) * samplingFrequency / 2 / Math.PI)

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


function complexMagnitude(c: Complex): number
{
    return Math.sqrt(c.real * c.real + c.imag * c.imag)
}


function complexConjugate(c: Complex): Complex
{
    return {
        real: c.real,
        imag: -c.imag,
    }
}


function complexDivide(a: Complex, b: Complex): Complex
{
    const d = (b.imag * b.imag + b.real * b.real)
    return {
        real: (a.real * b.real - a.imag * b.imag) / d,
        imag: (a.imag * b.real - a.real * b.imag) / d,
    }
}


function hammingWindow(
    n: number,
    nMax: number)
{
    const a0 = 25 / 46
    return a0 - (1 - a0) * Math.cos(2 * Math.PI * n / nMax)
}


function praatGaussianWindow(
    n: number,
    nMax: number)
{
    const nMid = 0.5 * (nMax + 1)
    const edge = Math.exp(-12.0)
    return (Math.exp(-48.0 * (n - nMid) * (n - nMid) / (nMax + 1) / (nMax + 1)) - edge) /
        (1.0 - edge)
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


function praatPreemphasis(
    array: Float32Array,
    samplingFrequency: number)
{
    const result = new Float32Array(array)

    const frequency = 50
    const dx = 1 / samplingFrequency
    const preEmphasis = Math.exp(-2.0 * Math.PI * frequency * dx)

    for (let i = array.length - 1; i >= 2; i--)
        result[i] -= preEmphasis * result[i - 1]

    return result
}


function praatFixRootToUnitCircle(root: Complex)
{
    if (complexMagnitude(root) <= 1)
        return root
     
    return complexDivide(
        { imag: 0, real: 1 },
        complexConjugate(root))
}