import { fetchSyncPost } from "siyuan"
import { addFloatLayer } from "./utils"
import { getAnnotationCoordinates } from "./annotation"
import { getCachedPageViews, getModelsById } from "./pdfEvent"
declare const index:any;
const BlockRefWidth = 300
// 获取标注的块引
let getRefIDs = async (id) => (await fetchSyncPost("api/block/getRefIDsByFileAnnotationID",{id: id})).data.refIDs

// 获取当前页面的块引用
export async function getPageRefIDs(pdf:string,AnnotationData:AllAnnotationData, pageNumber:number){
    let pageRefIDs:PageAnnotationData = []
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
//初始化当前已渲染页面的浮窗
export function initRefFloat(PdfID:string,RefDict:AllRefBlock,pdfIdDict:any,AnnotationData:AllAnnotationData){

        let CachedPage = getCachedPageViews(PdfID)

        // 获取已渲染的页面列表，如果 RefDict[PdfID] 不存在则说明未开始打开浮窗，返回空列表
        let renderedPageRef = RefDict[PdfID] ? Object.keys(RefDict[PdfID]) : []

        let renderPage = diff(CachedPage, renderedPageRef.map(a=>parseInt(a)))
        console.log("已渲染的页面：",renderedPageRef,
        "\n已存在的页面：",CachedPage,
        "\n将渲染页面：",renderPage)
        for (let renderPageNumber of renderPage){
            openPageRefFloatAndUpdateRefDict(PdfID, RefDict, pdfIdDict, AnnotationData, renderPageNumber)
            console.log("render page:", renderPageNumber, "\n now refDict :",RefDict[PdfID])
        }

}
// 更新当前页的标注浮窗
export function updatePageRefFloat(PdfID:string, RefData:AllRefBlock, pdfIdDict:any, AnnotationData:AllAnnotationData){
    let pdfName = pdfIdDict[PdfID]
    let pageRefData:pageRefBlock = []
    let  pageNumber:number = getModelsById(PdfID)[0].pdfObject.page
    window.setEqual = setEqual
    getPageRefIDs(pdfName, AnnotationData, pageNumber-1)
    .then(pageRefIDs=>{
        console.log("pageRefIDs", pageRefIDs)
        //如果RefDict中pdf存在，对应页数存在，且ref存在，且ref未更新，则返回
        //如果RefDict中pdf存在，对应页数存在，且ref存在，且ref更新，曾先销毁之前的浮窗再重新生成
        // 其他情况直接生成新的浮窗

        for (let item of pageRefIDs){
            // console.log(item)
            if (RefData[PdfID] && RefData[PdfID][pageNumber] && isRefHasInRefData(RefData[PdfID][pageNumber],item)){

                if (!isRefUpdate(RefData[PdfID][pageNumber],item)){
                    let refBlock = (RefData[PdfID][pageNumber] as pageRefBlock).filter((x:refBlock)=>x.id === item.defId)[0]
                    pageRefData.push(refBlock)
                    continue;
                }
                let closeRefBlock = RefData[PdfID][pageNumber].filter((x:refBlock)=>x.id === item.defId)[0]
                closeOneRefFloat(RefData[PdfID][pageNumber],closeRefBlock)
            }
            if (item.refIDs.length === 0) continue;
            
            let refBlockData:refBlock= initFloat(item, PdfID);
            pageRefData.push(refBlockData)
        }
        updateRefDict(RefData, PdfID, pageRefData, pageNumber)
    })
    
}

// 更新当前pdf的标注浮窗群
export function updateRefFloatBufferFactory(PdfID:string,RefDict:AllRefBlock,pdfIdDict:any,AnnotationData:AllAnnotationData){
    // let pdfName = pdfIdDict[PdfID]
    return (ev:any)=>{
        let CachedPage = getCachedPageViews(PdfID)
        let pageNumber = ev.pageNumber
        // 获取已渲染的页面列表，如果 RefDict[PdfID] 不存在则说明未开始打开浮窗，返回空列表
        let renderedPageRef = RefDict[PdfID] ? Object.keys(RefDict[PdfID]) : []
        let currentPageNoOpen = renderedPageRef.indexOf(String(pageNumber)) === -1
        if (currentPageNoOpen)
            openPageRefFloatAndUpdateRefDict(PdfID, RefDict, pdfIdDict, AnnotationData, pageNumber)
        let cleanPage = diff(renderedPageRef.map(a=>parseInt(a)),CachedPage)
        console.log("已渲染的页面：",renderedPageRef,
        "\n已存在的页面：",CachedPage,
        "\n将清理页面：",cleanPage)
        for (let cleanPageNumber of cleanPage){
            closePageRefFloatAndUpdateRefDict(PdfID, RefDict, cleanPageNumber)
            console.log("clean page:",cleanPageNumber,"\n now refDict :",RefDict[PdfID])
        }
    }
}
//打开对应页面的浮窗，并把打开的页面浮窗写入RefDict
function openPageRefFloatAndUpdateRefDict(PdfID:string, RefDict:AllRefBlock, pdfIdDict:any, AnnotationData:AllAnnotationData, pageNumber:number){
    let pdfName = pdfIdDict[PdfID]
    let pageRefData = []
    getPageRefIDs(pdfName, AnnotationData, pageNumber-1)
    .then(pageRefIDs=>{
        for (let item of pageRefIDs){
            if (item.refIDs.length === 0) continue;

            let refBlockData: refBlock = initFloat(item, PdfID);
            pageRefData.push(refBlockData)
        }
    })
    updateRefDict(RefDict, PdfID, pageRefData, pageNumber)
}
//添加并初始化化refBlock。
function initFloat(item: oneAnnotationData, PdfID: string) {
    addFloatLayer({
        ids: item.refIDs,
        defIds: [item.defId],
        x: window.innerWidth,
        y: 2 * window.outerHeight + 100
    });
    let floatLayer = getArrayLast(window.siyuan.blockPanels);
    let refBlockData: refBlock = {
        id: item.defId,
        getAnnotationCoord: getAnnotationCoordinates(item.defId, PdfID),
        floatLayer: floatLayer,
        refIDs: item.refIDs
    };
    initRefBlockCoord(refBlockData, PdfID);
    setRefBlockPin(floatLayer);
    setRefBlockAnnotation(floatLayer, PdfID);
    setRefBlockScrollTopAndTop(floatLayer, PdfID)
    return refBlockData;
}

function initRefBlockCoord(item:refBlock,pdfID:string){
    let floatLayerElement = item.floatLayer.element

    let page = document.querySelector(`div[data-id='${pdfID}'] .page`)
    let pdfViewerContainer = getPdfViewer(pdfID)
    let {left:ContainerLeft,width:ContainerWidth}=pdfViewerContainer.getBoundingClientRect()

    let {left:pageLeft,width:pageWidth}= page.getBoundingClientRect()
    let {left:annotationLeft, width:annotationWidth, y:clentY} = item.getAnnotationCoord()

    let center = pageLeft + 0.5 * pageWidth

    let left;
    if (annotationLeft < center){
        left = Math.max(ContainerLeft-BlockRefWidth*2/3, pageLeft - BlockRefWidth)
    }
    else{
        left = Math.min(ContainerWidth - BlockRefWidth*1/3, pageLeft + pageWidth)
    }
    
    if (annotationWidth === 0)
        return
    floatLayerElement.style.top = `${clentY}px`
    floatLayerElement.style.left = `${left}px`
}

function getArrayLast(array:Array<any>){
    let length = array.length
    return array[length-1]
}

function updateRefDict(RefDict:AllRefBlock,pdfID:string,pageData:pageRefBlock, pageNumber:number){
    if (!RefDict[pdfID]){
        RefDict[pdfID] = {}
    }
    RefDict[pdfID][pageNumber] = pageData
}

function setRefBlockPin(floatLayer:floatLayer){
    floatLayer.element.setAttribute("data-pin","true")
}
function setRefBlockAnnotation(floatLayer:floatLayer,pdfID:string){
    floatLayer.element.setAttribute("annotation",pdfID)
}

function setRefBlockScrollTopAndTop(floatLayer:floatLayer,pdfID:string){
    let pdfViewerContainer = getPdfViewer(pdfID)
    let scrollTop = pdfViewerContainer.scrollTop
    let {top:elementTop} = floatLayer.element.getBoundingClientRect()
    floatLayer.element.setAttribute("scroll-top",scrollTop)
    floatLayer.element.setAttribute("init-top",String(elementTop))
}

export function updateRefBlockCoord(RefData:AllRefBlock, pdfId:string){
    let pdfRefData = RefData[pdfId]
    if (!pdfRefData)
        return
    let keys = Object.keys(pdfRefData)
    let pdfViewerContainer = getPdfViewer(pdfId)
    let newScrollTop = pdfViewerContainer.scrollTop
    let DomQueque = []
    for (let pageNumber of keys){
        let pageRefData = pdfRefData[pageNumber]
        for (let item of pageRefData){
            let floatLayerElement = item.floatLayer.element
            // let rectDom = item.getAnnotationCoord()
            // if (!floatLayerElement || !rectDom){
            //     closeOneRefFloat(pageRefData, item)
            //     return;
            // }
            // let clentY = rectDom['y']
            // let width = rectDom['width']
            // if (width === 0)
            //     return
            // // floatLayerElement.style.top = `${clentY}px`
            // DomQueque.push({
            //     newTop:clentY,
            //     floatLayerElement:floatLayerElement
            // })
            
            let scrollTop = parseFloat(floatLayerElement.getAttribute("scroll-top"))
            let initTop = parseFloat(floatLayerElement.getAttribute("init-top"))
            let newTop = initTop + (scrollTop - newScrollTop)
            DomQueque.push({
                newTop:newTop,
                floatLayerElement:floatLayerElement
            })
        }
    }
    for (let {newTop,floatLayerElement} of DomQueque){
        floatLayerElement.style.top = `${newTop}px`
    }
}

let diff = (a:Array<number>|Set<number>,b:Array<number>|Set<number>)=>{
    let c = new Set([...a])
    let d = new Set([...b])
    return new Set([...c].filter(x => !d.has(x)))}

let diffWeak = (a:Array<any>|Set<any>,b:Array<any>|Set<any>)=>{
    let c = new Set([...a])
    let d = new Set([...b])
    return new Set([...c].filter(x => !d.has(x)))}

let setEqual = (a:Array<any>|Set<any>,b:Array<any>|Set<any>)=>{
    let diff1 = diffWeak(a,b)
    let diff2 = diffWeak(b,a)
    return (diff1.size === 0 && diff2.size === 0)
}

function closePageRefFloatAndUpdateRefDict(PdfID:string, RefDict:AllRefBlock, pageNumber:number){
    let cleanPageRefData = [... RefDict[PdfID][pageNumber]]
    for (let refFloat of cleanPageRefData){
        closeOneRefFloat(RefDict[PdfID][pageNumber],refFloat)
    }
    delete  RefDict[PdfID][pageNumber]
}
// 传入打算关闭的页面的cleanPageRefData，和单一的refItem
function closeOneRefFloat(cleanPageRefData:pageRefBlock,refItem:refBlock){
    let deleteIndex = cleanPageRefData.indexOf(refItem)
    if (refItem.floatLayer.element && refItem.floatLayer.destroy)
        refItem.floatLayer.destroy()
    cleanPageRefData.splice(deleteIndex,1)
    return cleanPageRefData
}
//判断该ref是否已存在
function isRefHasInRefData(pageRefData:pageRefBlock, refItem:oneAnnotationData){
    let defId = refItem.defId
    let searchRefData = pageRefData.filter(x=>x.id === defId)
    return searchRefData.length === 1
}

//判断该ref是否更新了
function isRefUpdate(pageRefData:pageRefBlock, refItem:oneAnnotationData){
    let defId = refItem.defId
    let searchRefData = pageRefData.filter(x=>x.id === defId)
    if (searchRefData.length > 1){
        console.error("unVaild RefData!",defId,pageRefData)
    }
    let searchRefIds = searchRefData[0]
    return !setEqual(searchRefIds.refIDs,refItem.refIDs)
}

const pdfViewerContainerDict = {} as Map<string,HTMLElement>
function getPdfViewer(id:string){
    let pdfViewerContainer
    if (!pdfViewerContainerDict[id]){
        pdfViewerContainer = document.querySelector(`[data-id="${id}"] #viewerContainer`)
        pdfViewerContainerDict[id] = pdfViewerContainer
    }
    pdfViewerContainer = pdfViewerContainerDict[id]
    return pdfViewerContainer
}