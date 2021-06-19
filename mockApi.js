class MockApi
{
    static _g_mock_server_url = "https://925baedca28e.ngrok.io";
    static _g_prod_server_url = "https://cdn-api.co-vin.in";
    static _g_bMockEnabled = "false";//string because of local storage

    static GetMockServerUrl()
    {
        return this._g_mock_server_url;
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
        this._g_bMockEnabled = "true";
        localStorage.setItem("_g_bMockEnabled", this._g_bMockEnabled);
    }

    static clear() {
        this.DisableMockApi();
    }

    static DisableMockApi() {
        this._g_bMockEnabled = "false";
        localStorage.removeItem("_g_bMockEnabled");
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