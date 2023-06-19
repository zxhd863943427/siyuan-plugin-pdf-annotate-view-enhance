import {
    Plugin,
    showMessage,
    getFrontend,
    getBackend,
    IModel
} from "siyuan";
import "@/index.scss";
import { getCurrentPage, setAddFloatLayer,addFloatLayer } from "./lib/utils";
import { getFileAnnotation } from "./api";
import { getAnnotationCoordinates } from "./lib/annotation";
import { initPagerenderedEvent, initPageScrollEvent, getCachedPageViews } from "./lib/pdfEvent";
import { getPageRefIDs } from "./lib/refBlock";
import { updateRefFloatBufferFactory, updateRefBlockCoord } from "./lib/refBlock";


const STORAGE_NAME = "menu-config";
const TAB_TYPE = "custom_tab";
const DOCK_TYPE = "dock_tab";
let currentPDF
let currentPDFID
let PDFIdToName = {}
let AnnotationData = {}
let RefData = {}
let hasOpenPdf = new Set([])

export default class PluginSample extends Plugin {

    private customTab: () => IModel;
    private isMobile: boolean;

    async onload() {
        window.getAnnotationCoordinates = getAnnotationCoordinates
        window.refData = RefData
        window.updateRefBlockCoord = updateRefBlockCoord

        this.data[STORAGE_NAME] = {readonlyText: "Readonly"};
        setAddFloatLayer(this.addFloatLayer)

        console.log("loading plugin-sample", this.i18n);

        const frontEnd = getFrontend();
        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";
        this.eventBus.on("click-pdf", this.mainPdfEvent)
    }

    onLayoutReady() {
        this.loadData(STORAGE_NAME);
        console.log(`frontend: ${getFrontend()}; backend: ${getBackend()}`);
    }

    onunload() {
        console.log(this.i18n.byePlugin);
        showMessage("Goodbye SiYuan Plugin");
        console.log("onunload");
    }


    private mainPdfEvent({detail}: any) {
        console.log(detail);
        let page = getCurrentPage() as HTMLElement
        // console.log(page)
        currentPDF = page.innerText
        currentPDFID = page.getAttribute("data-id")
        PDFIdToName[currentPDFID] = currentPDF
        console.log(currentPDFID)
        window.getCachedPageViews = getCachedPageViews
        let CachedPage = getCachedPageViews(currentPDFID)
        console.log(CachedPage)
        
        getFileAnnotation(currentPDF).then(data=>{
            let Annotation = JSON.parse(data.data)
            console.log(Annotation)
            AnnotationData[currentPDF] = getPageAnnotation(Annotation)
            console.log(AnnotationData[currentPDF])
            initPdfEvent()
        })
    }
}


function getPageAnnotation(AnnotationData:any){
    let PageAnnotation = {}
    let keys = Object.keys(AnnotationData)
    for (let id of keys){
        let pageData = AnnotationData[id].pages[0]
        addPageDataToDict(PageAnnotation,id,pageData,AnnotationData[id])
    }
    return PageAnnotation
}

function addPageDataToDict(dict:any,id:string,pageData:any,AnnotationData:any){
    let pageIndex = pageData.index
    if (dict[pageIndex] === undefined){
        dict[pageIndex] = []
    }
    dict[pageIndex].push({
        defId:id,
        positions:pageData.positions,
        Data:AnnotationData},)
}


function eventBusLog(ev:any){
    console.log(ev)
    let pageRef = getPageRefIDs(currentPDF,AnnotationData,ev.pageNumber-1)
    pageRef.then(data=>console.log(data))
}

function initPdfEvent(){
    if (hasOpenPdf.has(currentPDFID))
        return
    hasOpenPdf.add(currentPDFID)
    initPagerenderedEvent(currentPDFID,eventBusLog)
    initPagerenderedEvent(currentPDFID,updateRefFloatBufferFactory(
                                            currentPDFID, 
                                            RefData,
                                            PDFIdToName, 
                                            AnnotationData))
    initPageScrollEvent(currentPDFID,()=>updateRefBlockCoord(RefData,currentPDFID))
}