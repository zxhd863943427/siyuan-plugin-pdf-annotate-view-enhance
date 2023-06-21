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
import { initPagerenderedEvent, initPageScrollEvent, getCachedPageViews, initscaleChangeEvent } from "./lib/pdfEvent";
import { getPageRefIDs } from "./lib/refBlock";
import { updateRefFloatBufferFactory, updateRefBlockCoord, initRefFloat, updatePageRefFloat, destroyAndReinitRefBlockFactory } from "./lib/refBlock";


const STORAGE_NAME = "menu-config";
const TAB_TYPE = "custom_tab";
const DOCK_TYPE = "dock_tab";
let currentPDF
let currentPDFID
let PDFIdToName = {}
let AnnotationData = {} as AllAnnotationData
let RefData = {} as AllRefBlock
let hasOpenPdf = new Set([])

export default class PluginSample extends Plugin {

    private customTab: () => IModel;
    private isMobile: boolean;

    async onload() {
        window.getAnnotationCoordinates = getAnnotationCoordinates
        window.refData = RefData
        window.AnnotationData = AnnotationData
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
        window.pdfId = currentPDFID
        let CachedPage = getCachedPageViews(currentPDFID)
        console.log(CachedPage)
        
        
        getFileAnnotation(currentPDF).then(data=>{
            let Annotation = JSON.parse(data.data)
            console.log(Annotation)
            AnnotationData[currentPDF] = getPageAnnotation(Annotation)
            console.log(AnnotationData[currentPDF])
            // if (hasOpenPdf.has(currentPDFID))
            //     updatePageRefFloat(currentPDFID, RefData, PDFIdToName, AnnotationData)
            initPdfEvent()
            updatePageRefFloat(currentPDFID, RefData, PDFIdToName, AnnotationData)
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
    initRefFloat(
        currentPDFID, 
        RefData,
        PDFIdToName, 
        AnnotationData)
    initPagerenderedEvent(currentPDFID,eventBusLog)
    initPagerenderedEvent(currentPDFID,updateRefFloatBufferFactory(
                                            currentPDFID, 
                                            RefData,
                                            PDFIdToName, 
                                            AnnotationData))
    initPageScrollEvent(currentPDFID, ()=>updateRefBlockCoord(RefData,currentPDFID))
    initscaleChangeEvent(currentPDFID, destroyAndReinitRefBlockFactory(
        currentPDFID, 
        RefData,
        hasOpenPdf
    ))
}

function throttle(func:Function, wait:number) {
    let timeout;
    return function() {
      let context = this;
      let args = arguments;
      if (!timeout) {
        timeout = setTimeout(() => {
          timeout = null;
          func.apply(context, args)
        }, wait)
      }
    }
}