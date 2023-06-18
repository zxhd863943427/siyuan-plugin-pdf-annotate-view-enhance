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
    pdfViewer.eventBus.on("pagerendered",callback)
}

export function initPageScrollEvent(id:string,callback:Function){
    let model = getModelsById(id)[0]
    let viewerContainer = model.element.querySelector("#viewerContainer")
    viewerContainer.addEventListener('scroll',callback)
}