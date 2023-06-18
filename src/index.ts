import {
    Plugin,
    showMessage,
    getFrontend,
    getBackend,
    IModel
} from "siyuan";
import "@/index.scss";
import { getCurrentPage } from "./lib/utils";
import { getFileAnnotation } from "./api";


const STORAGE_NAME = "menu-config";
const TAB_TYPE = "custom_tab";
const DOCK_TYPE = "dock_tab";
let currentPDF
let AnnotationData = {}

export default class PluginSample extends Plugin {

    private customTab: () => IModel;
    private isMobile: boolean;

    async onload() {
        this.data[STORAGE_NAME] = {readonlyText: "Readonly"};

        console.log("loading plugin-sample", this.i18n);

        const frontEnd = getFrontend();
        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";
        this.eventBus.on("click-pdf", this.eventBusLog)
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


    private eventBusLog({detail}: any) {
        console.log(detail);
        let page = getCurrentPage() as HTMLElement
        currentPDF = page.innerText
        console.log(page.innerText)
        getFileAnnotation(currentPDF).then(data=>{
            AnnotationData[currentPDF] = JSON.parse(data.data)
            console.log(AnnotationData[currentPDF])
            console.log(getPageAnnotation(AnnotationData[currentPDF]))
        })
    }
}


function getPageAnnotation(AnnotationData:any){
    let PageAnnotation = {}
    let keys = Object.keys(AnnotationData)
    for (let id of keys){
        let pageData = AnnotationData[id].pages[0]
        addPageDataToDict(PageAnnotation,id,pageData)
    }
    return PageAnnotation
}

function addPageDataToDict(dict:any,id:string,pageData:any){
    let pageIndex = pageData.index
    if (dict[pageIndex] === undefined){
        dict[pageIndex] = []
    }
    dict[pageIndex].push({
        refId:id,
        positions:pageData.positions})
}