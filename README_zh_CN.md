
# PDF 高级标注视图

[English](./README.md)


这可能是笔记软件中最卡的pdf标注查看视图，它携带了一堆没啥用的功能，包括：

1. 自动打开对应页面的标注浮窗
2. 适应pdf缩放（有延后）
3. 鼠标悬浮放大显示
![Alt text](asset/%E6%82%AC%E6%B5%AE%E6%94%BE%E5%A4%A7.png)
4. 点击更新标注浮窗
![Alt text](asset/%E6%9B%B4%E6%96%B0%E6%A0%87%E6%B3%A8%E6%B5%AE%E7%AA%97.gif)

同时附赠一堆问题，包括：
1. 浮窗会遮挡dock
2. 浮窗可能跟随缩放不及时
3. 可能缩放后浮窗位置不对（稍微再缩放一次可以解决）
4. 标注浮窗关掉pdf后没有一起关掉
   
以及————非常的卡，指你有很多标注浮窗，并且频繁缩放的情况下。每次缩放都要重绘全部浮窗。
（测试的情况是同时打开133个浮窗时，会卡，加载完毕后滑动不会明显的卡）

提问：为啥这样一个半成品也敢丢上来？
因为使用思源的浮窗接口速度上限就这样了，改进不了啥的。但是在浮窗不多的情况下还是好用的。
总之，摆烂道，堂堂连载！
