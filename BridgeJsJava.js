class WebViewBridgeJs2Java
{
    static IsInWebView()
    {
        return navigator.userAgent.includes('wv');
    }

    static SendMobileNumber(mobileNumber)
    {
        let mobJsonStr = JSON.stringify({ number: mobileNumber });
        try {
            JavaScriptInterface.getData(mobJsonStr);
        }
        catch (e)
        {
            return;
        }
    }
}