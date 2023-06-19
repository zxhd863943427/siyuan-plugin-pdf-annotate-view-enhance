import { fetchSyncPost } from "siyuan"
import { addFloatLayer } from "./utils"
import { getAnnotationCoordinates } from "./annotation"
import { getCachedPageViews } from "./pdfEvent"
// 获取标注的块引
let getRefIDs = async (id) => (await fetchSyncPost("api/block/getRefIDsByFileAnnotationID",{id: id})).data.refIDs

// 获取当前页面的块引用
export async function getPageRefIDs(pdf:string,AnnotationData:any, pageNumber:number){
    let pageRefIDs = []
    // console.log(AnnotationData)
    let PageAnnotationData = AnnotationData[pdf][pageNumber]
    if (!PageAnnotationData){
        return pageRefIDs
    }
    for (let annotation of PageAnnotationData){
        let data = await getRefIDs(annotation.defId)
        pageRefIDs.push({
            defId:annotation.defId,
            refIDs:data
        })
    }
    return pageRefIDs
}

// 更新当前页面的标注浮窗群
export function updateRefFloatBufferFactory(PdfID:string,RefDict:any,pdfIdDict:any,AnnotationData:any){
    // let pdfName = pdfIdDict[PdfID]
    return (ev:any)=>{
        let CachedPage = getCachedPageViews(PdfID)
        let pageNumber = ev.pageNumber
        // 获取已渲染的页面列表，如果 RefDict[PdfID] 不存在则说明未开始打开浮窗，返回空列表
        let renderedPageRef = RefDict[PdfID] ? Object.keys(RefDict[PdfID]) : []
        let currentPageNoOpen = renderedPageRef.indexOf(String(pageNumber)) === -1
        if (currentPageNoOpen)
            openPageRefFloatAndUpdateRefDict(PdfID, RefDict, pdfIdDict, AnnotationData, pageNumber)
        console.log(RefDict)
    }
}
//打开对应页面的浮窗，并把打开的页面浮窗写入RefDict
function openPageRefFloatAndUpdateRefDict(PdfID:string, RefDict:any, pdfIdDict:any, AnnotationData:any, pageNumber:number){
    let pdfName = pdfIdDict[PdfID]
    let pageRefData = []
    getPageRefIDs(pdfName, AnnotationData, pageNumber-1)
    .then(pageRefIDs=>{
        for (let item of pageRefIDs){
            if (item.refIDs.length === 0) continue;

            addFloatLayer({
                ids: item.refIDs,
                defIds: [item.defId],
                x: window.innerWidth,
                y: 2 * window.outerHeight + 100
            })
            let floatLayer = getArrayLast(window.siyuan.blockPanels)
            setRefBlockPin(floatLayer)
            setRefBlockAnnotation(floatLayer,PdfID)
            pageRefData.push({
                id:item.defId,
                getAnnotationCoord:getAnnotationCoordinates(item.defId,PdfID),
                floatLayer:floatLayer
            })
        }
    })
    updateRefDict(RefDict, PdfID, pageRefData, pageNumber)
}


function getArrayLast(array:Array<any>){
    let length = array.length
    return array[length-1]
}

function updateRefDict(RefDict:any,pdfID:string,pageData:any, pageNumber:number){
    if (!RefDict[pdfID]){
        RefDict[pdfID] = {}
    }
    RefDict[pdfID][pageNumber] = pageData
}

function setRefBlockPin(floatLayer){
    floatLayer.element.setAttribute("data-pin","true")
}
function setRefBlockAnnotation(floatLayer,pdfID:string){
    floatLayer.element.setAttribute("annotation",pdfID)
}

export function updateRefBlockCoord(RefData:any, pdfId:string){
    let pdfRefData = RefData[pdfId]
    if (!pdfRefData)
        return
    let keys = Object.keys(pdfRefData)
    for (let pageNumber of keys){
        let pageRefData = pdfRefData[pageNumber]
        for (let item of pageRefData){
            let floatLayerElement = item.floatLayer.element
            let clentY = item.getAnnotationCoord()['y']
            let width = item.getAnnotationCoord()['width']
            if (width === 0)
                return
            floatLayerElement.style.top = `${clentY}px`
        }
    }
}