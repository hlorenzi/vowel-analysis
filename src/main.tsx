import * as Solid from "solid-js"
import * as SolidWeb from "solid-js/web"
import * as Styled from "solid-styled-components"

import { VowelSynth } from "./vowelSynth.ts"
import { VowelChart } from "./VowelChart.tsx"
import { AnalysisChart } from "./AnalysisChart.tsx"
import { RecordingPanel } from "./RecordingPanel.tsx"


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
            Click and drag to synthesize vowel sounds via formant frequencies.<br/><br/>
            The blue bars on the bottom chart shows formant frequencies extracted from the waveform data. (Not working properly)
            <br/>
            <br/>
            <VowelChart synth={ synth() }/>
            <br/>
            <AnalysisChart synth={ synth() }/>
            <br/>
            <RecordingPanel synth={ synth() }/>
            { " " }
            <button onclick={ () => synth().openMic() }>
                Allow Microphone
            </button>
        </div>
    </Solid.Show>
}


SolidWeb.render(
    Page,
    document.getElementById("app")!)