import { forwardLinearPrediction, praatBurgMethod } from "./lpc.ts"
import { praatFixRootToUnitCircle, praatLpcToPolynomial, rootsToFormants } from "./formantExtractor.ts"
import { findRootsOfPolynomial, Complex } from "./roots.ts"


const data = [
    0.000000,
    0.000000,
    0.000000,
    -0.000000,
    0.000000,
    -0.000000,
    -0.000001,
    -0.000000,
    0.000000,
    0.000001,
    0.000001,
    0.000001,
    -0.000000,
    -0.000001,
    -0.000001,
    -0.000001,
    -0.000000,
    0.000000,
    0.000000,
    0.000000,
    0.000000,
    0.000000,
    0.000001,
    0.000001,
    0.000001,
    -0.000000,
    -0.000002,
    -0.000002,
    -0.000002,
    -0.000001,
    0.000002,
    0.000004,
    0.000004,
    0.000003,
    -0.000000,
    -0.000003,
    -0.000005,
    -0.000004,
    -0.000002,
    0.000001,
    0.000004,
    0.000005,
    0.000003,
    0.000001,
    -0.000001,
    -0.000003,
    -0.000003,
    -0.000003,
    -0.000002,
    -0.000001,
    0.000001,
    0.000002,
    0.000004,
    0.000005,
    0.000005,
    0.000001,
    -0.000003,
    -0.000007,
    -0.000008,
    -0.000006,
    -0.000000,
    0.000005,
    0.000011,
    0.000010,
    0.000007,
    -0.000001,
    -0.000005,
    -0.000011,
    -0.000008,
    -0.000006,
    0.000003,
    0.000005,
    0.000012,
    0.000006,
    0.000010,
    -0.000001,
    0.000002,
    -0.000011,
    -0.000002,
    -0.000013,
    0.000004,
    -0.000007,
    0.000017,
    0.000001,
    0.000027,
    -0.000005,
    0.000022,
    -0.000026,
    0.000016,
    -0.000043,
    0.000032,
    -0.000047,
    0.000073,
    -0.000065,
    0.000132,
    -0.000160,
    0.000293,
    -0.003321,
    -0.005079,
    -0.000271,
    0.003460,
    0.005808,
    0.004702,
    0.002030,
    -0.001402,
    -0.003154,
    -0.003376,
    -0.001871,
    -0.000428,
    0.000695,
    0.000682,
    0.000614,
    0.000507,
    0.001163,
    0.001616,
    0.001744,
    0.000553,
    -0.001139,
    -0.002977,
    -0.003386,
    -0.002406,
    0.000143,
    0.002556,
    0.004116,
    0.003532,
    0.001596,
    -0.001232,
    -0.003086,
    -0.003666,
    -0.002369,
    -0.000483,
    0.001581,
    0.002415,
    0.002409,
    0.001297,
    0.000254,
    -0.000814,
    -0.001095,
    -0.001255,
    -0.000872,
    -0.000685,
    -0.000125,
    0.000248,
    0.000936,
    0.001202,
    0.001383,
    0.000775,
    0.000057,
    -0.000995,
    -0.001420,
    -0.001487,
    -0.000669,
    0.000184,
    0.001181,
    0.001449,
    0.001332,
    0.000489,
    -0.000218,
    -0.000930,
    -0.000972,
    -0.000818,
    -0.000195,
    0.000239,
    0.000677,
    0.000681,
    0.000629,
    0.000309,
    0.000090,
    -0.000225,
    -0.000329,
    -0.000381,
    -0.000284,
    -0.000079,
    0.000121,
    0.000391,
    0.000436,
    0.000495,
    0.000200,
    0.000117,
    -0.000302,
    -0.000158,
    -0.000423,
    0.000100,
    -0.000138,
    0.000561,
    0.000013,
    0.000638,
    0.000127,
    -0.004668,
    -0.072371,
    -0.052466,
    0.015177,
    0.055771,
    0.067039,
    0.042813,
    0.008742,
    -0.021165,
    -0.030607,
    -0.025295,
    -0.010580,
    0.000130,
    0.005529,
    0.004165,
    0.003394,
    0.003745,
    0.007363,
    0.008728,
    0.007095,
    0.000035,
    -0.007453,
    -0.012974,
    -0.011777,
    -0.005824,
    0.003347,
    0.009741,
    0.011875,
    0.007960,
    0.001754,
    -0.004767,
    -0.007531,
    -0.007097,
    -0.003362,
    0.000382,
    0.003488,
    0.003946,
    0.003248,
    0.001234,
    -0.000104,
    -0.001284,
    -0.001288,
    -0.001335,
    -0.000750,
    -0.000571,
    0.000071,
    0.000327,
    0.000907,
    0.000902,
    0.000932,
    0.000301,
    -0.000121,
    -0.000752,
    -0.000755,
    -0.000705,
    -0.000128,
    0.000185,
    0.000615,
    0.000524,
    0.000454,
    0.000032,
    -0.000108,
    -0.000353,
    -0.000223,
    -0.000216,
    0.000038,
    0.000049,
    0.000202,
    0.000096,
    0.000147,
    -0.000001,
    0.000040,
    -0.000088,
    -0.000011,
    -0.000094,
    0.000013,
    -0.000044,
    0.000067,
    0.000004,
    0.000091,
    -0.000004,
    0.000060,
    -0.000048,
    0.000025,
    -0.000068,
    0.000034,
    -0.000055,
    0.000069,
    -0.000050,
    0.000103,
    -0.000104,
    0.000214,
    -0.001112,
    -0.003375,
    -0.001062,
    0.001113,
    0.002236,
    0.001966,
    0.000989,
    -0.000098,
    -0.000693,
    -0.000772,
    -0.000476,
    -0.000149,
    0.000063,
    0.000100,
    0.000074,
    0.000050,
    0.000081,
    0.000119,
    0.000126,
    0.000065,
    -0.000029,
    -0.000116,
    -0.000143,
    -0.000107,
    -0.000026,
    0.000052,
    0.000095,
    0.000087,
    0.000046,
    -0.000005,
    -0.000039,
    -0.000048,
    -0.000034,
    -0.000012,
    0.000009,
    0.000018,
    0.000017,
    0.000011,
    0.000003,
    -0.000002,
    -0.000004,
    -0.000004,
    -0.000003,
    -0.000002,
    -0.000001,
    0.000000,
    0.000001,
    0.000002,
    0.000002,
    0.000001,
    0.000000,
    -0.000001,
    -0.000001,
    -0.000001,
    -0.000001,
    -0.000000,
    0.000000,
    0.000001,
    0.000001,
    0.000000,
    -0.000000,
    -0.000000,
    -0.000000,
    -0.000000,
    -0.000000,
    0.000000,
    0.000000,
    0.000000,
    0.000000,
    0.000000,
    0.000000,
    -0.000000,
    -0.000000,
    -0.000000,
    -0.000000,
    -0.000000,
    0.000000,
    0.000000,
    0.000000,
    0.000000,
    0.000000,
    0.000000,
    -0.000000,
    -0.000000,
    -0.000000,
    -0.000000,
    -0.000000,
    0.000000,
    0.000000,
    0.000000
]


const lpc = praatBurgMethod(new Float32Array(data), 10)
console.log("lpc", lpc)

const polynomial = praatLpcToPolynomial(lpc)
console.log("polynomial", polynomial)
console.log("polynomial", polynomial.map((c, i) => c.toFixed(5) + "*x^" + i).join("+"))

const roots = findRootsOfPolynomial(polynomial)
console.log("roots", roots)

const fixedRoots = roots
    .filter(c => c.imag >= 0)
    .map(c => praatFixRootToUnitCircle(c))
console.log("fixedRoots", fixedRoots)

const formants = rootsToFormants(fixedRoots, 11000)
console.log("formants", formants)