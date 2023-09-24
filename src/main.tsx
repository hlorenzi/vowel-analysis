import * as Solid from "solid-js"
import * as SolidWeb from "solid-js/web"
import * as Styled from "solid-styled-components"

import { VowelSynth } from "./vowelSynth.ts"
import { VowelChart } from "./VowelChart.tsx"
import { AnalysisChart } from "./AnalysisChart.tsx"


function Page()
{
    const synth = new VowelSynth()

    return <div style={{
        "width": "100vw",
        "height": "100vh",
        "margin": "auto",
        "text-align": "center",
    }}>
        <br/>
        <br/>
        Click and drag to synthesize vowel sounds.<br/>
        The blue bars on the bottom chart indicate formant frequencies. (Work-in-progress)
        <br/>
        <br/>
        <VowelChart synth={ synth }/>
        <br/>
        <AnalysisChart synth={ synth }/>
        <br/>
        <button onclick={ () => synth.openMic() }>
            Listen from Microphone
        </button>
    </div>
}


SolidWeb.render(
    Page,
    document.getElementById("app")!)