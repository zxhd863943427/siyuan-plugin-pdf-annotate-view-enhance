import { fetchSyncPost } from "siyuan"
// 获取标注的块引
let getRefIDs = async (id) => (await fetchSyncPost("api/block/getRefIDsByFileAnnotationID",{id: id})).data.refIDs

// 获取当前页面的块引用
export async function getPageRefIDs(pdf:string,AnnotationData:any, pageNumber:number){
    let pageRefIDs = []
    console.log(AnnotationData)
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