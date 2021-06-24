var helpDoc = `
README
1. Start flask server using-> Python3 app.y
2. Once your local server is started on http://127.0.0.1:5000
3. Run ngrok on the same system using -> ./ngrok http http://127.0.0.1:5000/
4. You will get a url on that console. Use that url and call endpoints
5. Set this url in mockApi code on website. eg. MockApi.SetMockServerUrl("https://e84e775ffe60.ngrok.io")
6. Enabled mockApi -> MockApi.EnableMockApi()

Some queries that work -> http://localhost:4000/?states=9&date=2021-06-26&districts=145
Changing date in appointments.json-> sed 's/"24-06-2021"/"26-06-2021"/' appointments.json > appointments2.json

 `;

class MockApi
{
    static _g_mock_server_url = "";//this will change on every run on ngrok binary
    static _g_prod_server_url = "https://cdn-api.co-vin.in";
    static _g_bMockEnabled = "false";//string because of local storage

    static GetMockServerUrl()
    {
        this._g_mock_server_url = localStorage.getItem("_g_mock_server_url");
        if (this._g_mock_server_url == null)
        {
            this._g_mock_server_url = "";
        }
        return this._g_mock_server_url;
    }

    static SetMockServerUrl(urlStr)
    {
        this._g_mock_server_url = urlStr;
        localStorage.setItem("_g_mock_server_url", this._g_mock_server_url);
    }

    static GetProdServerUrl()
    {
        return this._g_prod_server_url;
    }

    static GetServerUrl()
    {
        let serverUrl = this.GetProdServerUrl();
        if (this.IsMockEnabled() == true)
        {
            serverUrl =  this.GetMockServerUrl();
        }
        return serverUrl;
    }

    static EnableMockApi() {
        if (this.GetMockServerUrl() != "") {
            this._g_bMockEnabled = "true";
            localStorage.setItem("_g_bMockEnabled", this._g_bMockEnabled);
            return true;
        }
        console.error("Mock url not set. see MockApi.Help().");
        this.Help();
        return false;
    }

    static clear() {
        this.DisableMockApi();
    }

    static PauseMockApi() {
        this._g_bMockEnabled = "false";
        localStorage.removeItem("_g_bMockEnabled");
    }

    static DisableMockApi() {
        this.PauseMockApi();
        localStorage.removeItem("_g_mock_server_url");
    }

    static Help() {
        console.info(helpDoc);
    }

    static IsMockEnabled()
    {
        let bIsMockEnabled = localStorage.getItem("_g_bMockEnabled");
        if (bIsMockEnabled == null)
        {
            this._g_bMockEnabled = "false";
        }
        else
        {
            this._g_bMockEnabled = bIsMockEnabled;
        }

        return (this._g_bMockEnabled == "true");
    }
};