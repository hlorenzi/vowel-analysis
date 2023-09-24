export interface Complex
{
    real: number
    imag: number
}


// Bairstow method, from: http://catc.ac.ir/mazlumi/jscodes/bairstow.php
export function findRoots(coeff: number[])
{
    const result: Complex[] = []
    const epsilon = 1e-6

    const b = new Array<number>(coeff.length).fill(0)
    const c = new Array<number>(coeff.length).fill(0)

    let r = 0
    let s = 0

    while (coeff.length > 3)
    {
        const n = coeff.length

        b[n - 1] = 1
        b[n - 2] = 1

        let budget = 100

        while ((Math.abs(b[n - 1]) + Math.abs(b[n - 2])) > epsilon &&
            budget > 0)
        {
            budget--

            b[0] = coeff[0]
            b[1] = coeff[1] + r * b[0]

            for (let i = 2; i < n; i++)
                b[i] = coeff[i] + r * b[i - 1] + s * b[i - 2]

            c[0] = b[0]
            c[1] = b[1] + r * c[0]

            for (let i = 2; i < n - 1; i++)
                c[i] = b[i] + r * c[i - 1] + s * c[i - 2]

            const h =
                (-b[n - 2] * c[n - 3] + b[n - 1] * c[n - 4]) /
                (c[n - 3] * c[n - 3] - c[n - 2] * c[n - 4])
            
            const k =
                (-b[n - 1] * c[n - 3] + b[n - 2] * c[n - 2]) /
                (c[n - 3] * c[n - 3] - c[n - 2] * c[n - 4])

            r += h
            s += k
        }

        result.push(...solveQuadratic(1, -r, -s))

        coeff = b.slice(0, n - 2)
    }

    if (coeff.length == 3)
        result.push(...solveQuadratic(coeff[0], coeff[1], coeff[2]))
    else
        result.push({ real: -coeff[1] / coeff[0], imag: 0 })

    return result
}


function solveQuadratic(
    a: number,
    b: number,
    c: number)
    : [Complex, Complex]
{
    const det = b * b - 4 * a * c

    if (det < 0)
    {
        const real = -b / (2 * a)
        const imag = Math.sqrt(-det) / (2 * a)

        return [
            { real, imag:  imag },
            { real, imag: -imag },
        ]
    }
    else
    {
        const detSqrRoot = Math.sqrt(det)

        return [
            { real: (-b + detSqrRoot) / (2 * a), imag: 0 },
            { real: (-b - detSqrRoot) / (2 * a), imag: 0 },
        ]
    }
}