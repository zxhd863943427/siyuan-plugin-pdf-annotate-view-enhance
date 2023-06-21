export function getModelsById(id:string){
    const models = [];
    const getTabs = (layout) => {
        for (let i = 0; i < layout.children.length; i++) {
            const item = layout.children[i];
            // 没有children则认为是tab
            if (!item.children) {
                const model = item.model;
                if (item.id === id) {
                    models.push(model)
                }

            } else {
                getTabs(item);
            }
        }
    };

    if (window.siyuan.layout.layout) {
        getTabs(window.siyuan.layout.layout);
    }
    return models;
}

export function getPdfViewer(id:string){
    let model = getModelsById(id)[0]
    let pdfViewer = model.pdfObject.pdfViewer
    return pdfViewer
}

export function initPagerenderedEvent(id:string,callback:Function){
    let pdfViewer = getPdfViewer(id)
    pdfViewer.eventBus.on("textlayerrendered",callback)
}
export function initscaleChangeEvent(id:string,callback:Function){
    let pdfViewer = getPdfViewer(id)
    pdfViewer.eventBus.on("scalechanging",callback)
}

export function initPageScrollEvent(id:string,callback:Function){
    let model = getModelsById(id)[0]
    let viewerContainer = model.element.querySelector("#viewerContainer")
    viewerContainer.addEventListener('scroll',callback)
}

export function getCachedPageViews(id:string){
    let model = getModelsById(id)[0]
    // let pdfViewer = model.pdfObject.pdfViewer
    
    // let currentPageNumber = model.pdfObject.page
    // let pageCount = model.pdfObject.pagesCount
    
    // let CachedPage = []
    // // let isPageCached = pdfViewer.isPageCached
    
    // let minPage = Math.max(1,currentPageNumber - 10)
    // let maxPage = Math.min(pageCount, currentPageNumber + 10)
    // for (let i = minPage; i <= maxPage; i++){
    //     if (pdfViewer.isPageCached(i))
    //         CachedPage.push(i)
    // }
    let pdfElement = model.element
    let CachedPage = Array.from(pdfElement.querySelectorAll(".page:has(.textLayer:not([hidden]))")).map((elem:HTMLElement)=>parseInt(elem.getAttribute("data-page-number")))
    return new Set(CachedPage)
}