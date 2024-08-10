export interface Complex
{
    real: number
    imag: number
}


// Bairstow method, from: http://catc.ac.ir/mazlumi/jscodes/bairstow.php
// Taking `coeffs` to be [a, b, c, ...],
// the polynomial represented is (a * x^0) + (b * x^1) + (c * x^2) + ...
export function findRootsOfPolynomial(coeffs: number[])
{
    const result: Complex[] = []
    const epsilon = 1e-6

    const b = new Array<number>(coeffs.length).fill(0)
    const c = new Array<number>(coeffs.length).fill(0)

    let r = 0
    let s = 0

    while (coeffs.length > 3)
    {
        const n = coeffs.length

        b[n - 1] = 1
        b[n - 2] = 1

        let budget = 100

        while ((Math.abs(b[n - 1]) + Math.abs(b[n - 2])) > epsilon &&
            budget > 0)
        {
            budget--

            b[0] = coeffs[0]
            b[1] = coeffs[1] + r * b[0]

            for (let i = 2; i < n; i++)
                b[i] = coeffs[i] + r * b[i - 1] + s * b[i - 2]

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

        result.push(...solveQuadratic(-s, -r, 1))

        coeffs = b.slice(0, n - 2)
    }

    if (coeffs.length == 3)
        result.push(...solveQuadratic(coeffs[0], coeffs[1], coeffs[2]))
    else
        result.push({ real: -coeffs[1] / coeffs[0], imag: 0 })

    return result
}


function solveQuadratic(
    a: number,
    b: number,
    c: number)
    : [Complex, Complex]
{
    const delta = b * b - 4 * a * c

    const s0 = -b / (2 * a)

    if (delta < 0)
    {
        const imag = Math.sqrt(-delta) / (2 * a)

        return [
            { real: s0, imag:  imag },
            { real: s0, imag: -imag },
        ]
    }
    else
    {
        const detSqrRoot = Math.sqrt(delta) / (2 * a)

        return [
            { real: s0 + detSqrRoot, imag: 0 },
            { real: s0 - detSqrRoot, imag: 0 },
        ]
    }
}

/* ORIGINAL PHP EXCERPT:

 function solvep2(coef) {
  var delta;
  var s = new Array(4);

  delta = coef[1] * coef[1] - 4 * coef[2] * coef[0];

  s[0] = -coef[1] / 2 / coef[2];
  s[2] = s[0];

  if (delta < 0) {

   s[1] = Math.sqrt(-delta) / 2 / coef[2];
   s[3] = -s[1];

  }
  else {

   s[1] = 0;
   s[3] = 0;

   s[0] = s[0] + Math.sqrt(delta) / 2 / coef[2];
   s[2] = s[2] - Math.sqrt(delta) / 2 / coef[2];

  }

  return s;
 }

 function bairstow(coef) {
  var a = coef.slice();
  var i;
  var N = a.length;
  var h, k;
  var result = new Array();

  var r = Math.random();
  var s = Math.random();

  var b = new Array(N);
  var c = new Array(N);

  a.reverse();

  while (N > 3) {

   b[N - 1] = 1;
   b[N - 2] = 1;

   while ((Math.abs(b[N - 1]) + Math.abs(b[N - 2])) > 1e-6) {

    b[0] = a[0];
    b[1] = a[1] + r * b[0];

    for(i = 2; i < N; i++) b[i] = a[i] + r * b[i - 1] + s * b[i - 2];

    c[0] = b[0];
    c[1] = b[1] + r * c[0];

    for(i = 2; i < N - 1; i++) c[i] = b[i] + r * c[i - 1] + s * c[i - 2];

    h = (-b[N - 2] * c[N - 3] + b[N - 1] * c[N - 4]) / (c[N - 3] * c[N - 3] - c[N - 2] * c[N - 4]);
    k = (-b[N - 1] * c[N - 3] + b[N - 2] * c[N - 2]) / (c[N - 3] * c[N - 3] - c[N - 2] * c[N - 4]);

    r = r + h;
    s = s + k;
   }

   result = result.concat(solvep2([-s, -r, 1]));

   a = b.slice(0, N - 2);
   N = a.length;
  }

  if (N == 3) {
   result = result.concat(solvep2(a.reverse()));
  }
  else {
   result = result.concat([-a[1] / a[0], 0]);
  }
 
  return result;
 }

*/