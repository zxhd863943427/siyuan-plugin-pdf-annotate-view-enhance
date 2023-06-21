This may be the most laggy PDF annotation view in note-taking software, which carries a bunch of useless features, including:

1. Automatically open the annotation popup for the corresponding page
2. Fit PDF zoom (with delay)
3. Mouse hover to enlarge display
    ![Alt text](asset/%E6%82%AC%E6%B5%AE%E6%94%BE%E5%A4%A7.png)
4. Click to update the annotation popup
    ![Alt text](asset/%E6%9B%B4%E6%96%B0%E6%A0%87%E6%B3%A8%E6%B5%AE%E7%AA%97.gif)

Also includes a bunch of issues, including:

1. The popup may cover the dock
2. The popup may not respond to zoom changes immediately
3. The position of the popup may be incorrect after zooming (can be solved by slight zooming)

And, it is very laggy, especially when you have a lot of annotation popups open and frequently zoom. Each zoom requires redrawing all popups.
(The testing condition is when 133 popups are opened at the same time, it lags. After loading, scrolling is not noticeably laggy)

Question: Why would you dare to release such a semi-finished product?
Because the maximum speed of using the popup interface of SourceSlate is like this, and there is no way to improve it. But it is still useful when there are not many popups.