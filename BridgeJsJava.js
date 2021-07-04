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
    static SendWindowUrl() {
        let jsonStr = JSON.stringify({ name:"stored_url", value: window.location.href });
        this.SendData(jsonStr);
    }

    static SendData(jsonStr)
    {
        try {
            if (WebViewBridgeJs2Java.IsInWebView()) {
                JavaScriptInterface.jsToAndroid(jsonStr);
            }
        }
        catch (e)
        {
            return;
        }
    }
}

function androidToJs(obj)
{
    console.log("androidToJs", obj);
    objJson = JSON.parse(obj);
    let bearerToken = objJson["token"];
    if (bearerToken != undefined)
    {
        LogInUser(LogInUser);
    }
}