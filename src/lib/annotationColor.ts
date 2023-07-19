import { getModelsById } from "./pdfEvent";
import ColorPannel from "@/components/color-pannel.svelte"

export function extendAnnotationColor(currentPDFID){
    let model = getModelsById(currentPDFID)[0]
    let annotationColorElement = model.element.querySelector(".pdf__util.b3-menu > .fn__flex")
    annotationColorElement.innerHTML= ""
    new ColorPannel({
        target: annotationColorElement
    })
}