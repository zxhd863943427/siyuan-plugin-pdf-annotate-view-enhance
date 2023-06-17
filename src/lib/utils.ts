import { getFrontend, showMessage } from "siyuan"
const frontEnd = getFrontend();
export const isMobile = (frontEnd === "mobile" || frontEnd === "browser-mobile")

export function getCurrentPage() {

    if (isMobile){
        return document.querySelector('#editor .protyle-content')
    }
    try {
        //判断是否打开dialog
        let currentScreen = document.querySelector(".b3-dialog--open")
        if (currentScreen === null)
            currentScreen = document.querySelector(".layout__wnd--active"); //获取当前屏幕
        //获取当前页面
        let currentPage = currentScreen.querySelector(
            ".item--focus"
        );
        return currentPage;
    }
    catch (e) {
        showMessage(`未能获取到页面焦点！`)
    }
    throw new Error("未能获取到页面焦点！");
}