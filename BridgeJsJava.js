class WebViewBridgeJs2Java
{
    static IsInWebView()
    {
        return navigator.userAgent.includes('wv');
    }

    static SendMobileNumber(mobileNumber)
    {
        let mobJsonStr = JSON.stringify({ name:"mobileNumber", value: mobileNumber });
        this.SendData(mobJsonStr);
    }

    static SendButtonEventAutoBook(bButtonState)
    {
        let jsonStr = JSON.stringify({ name:"buttonEventAutoBook", value: bButtonState });
        this.SendData(jsonStr);
    }

    static SendData(jsonStr)
    {
        try {
            JavaScriptInterface.getData(jsonStr);
        }
        catch (e)
        {
            return;
        }
    }
}