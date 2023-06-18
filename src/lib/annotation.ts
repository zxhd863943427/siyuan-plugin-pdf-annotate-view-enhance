import { isMobile } from "./utils";
import { showMessage } from "siyuan";

export function getAnnotation(id: string) {

    if (isMobile) {
        // 未适配移动端
        return document.querySelector('#editor')
    }
    try {
        //判断是否打开dialog
        let currentScreen = document.querySelector(".b3-dialog--open")
        if (currentScreen === null)
            currentScreen = document.querySelector(".layout__wnd--active"); //获取当前屏幕
        //获取当前pdf页面
        let currentPage = currentScreen.querySelector(
            ".layout-tab-container>div.fn__flex-1:not(.fn__none)"
        );
        let Annotation = currentPage.querySelector(`[data-node-id='${id}']`)
        return Annotation;
    }
    catch (e) {
        showMessage(`未能获取到页面焦点！`)
    }
    throw new Error("未能获取到页面焦点！");
}

export function getCoordinates(elem: HTMLElement) {
    return elem.getBoundingClientRect()
}

export function getAnnotationCoordinates(id: string) {
    let annotation = getAnnotation(id)
    if (!annotation) {
        return null
    }
    let firstAnnotation = annotation.querySelector(":scope > div:nth-child(1)")
    let coordinates = getCoordinates(firstAnnotation as HTMLElement)
    return coordinates
}
