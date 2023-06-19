import { isMobile } from "./utils";
import { showMessage } from "siyuan";

export function getAnnotation(id: string, pdfID:string) {

    if (isMobile) {
        // 未适配移动端
        return document.querySelector('#editor')
    }
    try {
        //判断是否打开dialog
        // let currentScreen = document.querySelector(".b3-dialog--open")
        // if (currentScreen === null)
        //     currentScreen = document.querySelector(".layout__wnd--active"); //获取当前屏幕
        //获取当前pdf页面
        // let currentPage = document.querySelectorAll(`div[data-id='${pdfID}'] [data-node-id='${id}']`)
        let Annotation = document.querySelector(`div[data-id='${pdfID}'] [data-node-id='${id}']`)
        return Annotation;
    }
    catch (e) {
        showMessage(`未能获取到页面焦点！`)
    }
    throw new Error("未能获取到页面焦点！");
}

export function getCoordinates(elem: HTMLElement) {
    let rect = elem.getBoundingClientRect()
    return rect
}

export function getAnnotationCoordinates(id: string, pdfID:string) {
    // let annotation = getAnnotation(id)
    // if (!annotation) {
    //     return null
    // }
    // let firstAnnotation = annotation.querySelector(":scope > div:nth-child(1)")
    let coordinates = () => {
        let annotation = getAnnotation(id,pdfID)
        if (!annotation) {
            return null
        }
        let firstAnnotation = annotation.querySelector(":scope > div:nth-child(1)")
        return getCoordinates(firstAnnotation as HTMLElement)
    }
    return coordinates
}
