import * as Solid from "solid-js"
import * as SolidWeb from "solid-js/web"
import * as Styled from "solid-styled-components"

import { VowelSynth } from "./vowelSynth.ts"
import { VowelChart } from "./VowelChart.tsx"
import { AnalysisChart } from "./AnalysisChart.tsx"
import { RecordingPanel } from "./RecordingPanel.tsx"

import "./test.ts"


function Page()
{
    const [synth, setSynth] = Solid.createSignal<VowelSynth>(undefined!)
    VowelSynth.create().then(setSynth)

    return <Solid.Show when={ !!synth() }>
        <div style={{
            "width": "min(700px, calc(100dvw - 2em))",
            "height": "100dvh",
            "margin": "auto",
            "text-align": "center",
        }}>
            Click and drag around the top chart to synthesize vowel sounds via formant frequencies.<br/>
            <br/>
            Red: extracted frequency-domain data from waveform<br/>
            Blue: extracted formant frequencies from waveform<br/>
            <br/>
            <VowelChart synth={ synth() }/>
            <br/>
            <AnalysisChart synth={ synth() }/>
            <br/>
            <RecordingPanel synth={ synth() }/>
            { " " }
            <button onclick={ () => synth().toggleMic() }>
                Toggle Microphone
            </button>
        </div>
    </Solid.Show>
}


SolidWeb.render(
    Page,
    document.getElementById("app")!)