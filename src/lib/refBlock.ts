import { fetchSyncPost } from "siyuan"
import { addFloatLayer } from "./utils"
import { getAnnotationCoordinates } from "./annotation"
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

// 返回一个打开标注并更新字典的函数
export function openRefFactory(PdfID:string,RefDict:any,pdfIdDict:any,AnnotationData:any){
    let pdfName = pdfIdDict[PdfID]
    return (ev:any)=>{
        let pageRefData = []
        getPageRefIDs(pdfName, AnnotationData, ev.pageNumber-1)
        .then(pageRefIDs=>{
            for (let item of pageRefIDs){
                if (item.refIDs.length === 0) continue;

                addFloatLayer({
                    ids: item.refIDs,
                    defIds: [item.defId],
                    x: window.innerWidth - 768 - 120,
                    y: window.innerHeight + 100
                })
                let floatLayer = getArrayLast(window.siyuan.blockPanels)
                setRefBlockPin(floatLayer)
                setRefBlockAnnotation(floatLayer,PdfID)
                pageRefData.push({
                    id:item.defId,
                    getAnnotationCoord:getAnnotationCoordinates(item.defId),
                    floatLayer:floatLayer
                })
            }
        })
        updateRefDict(RefDict, PdfID, pageRefData, ev.pageNumber)
    }
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
            floatLayerElement.style.top = `${clentY}px`
        }
    }
}