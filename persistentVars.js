class g_persistent_vars
{
    static _g_booking_state_auth_bearer_token = "";
    static _g_bBooking_state_user_logged_in = false;
    static _g_booking_state_users_to_auto_book = new Set();
    static _g_booking_state_users_to_auto_book_settings = {};//stores autobook related settings(configured from autobook settings cards) for user which has autobook on
    static _g_booking_state_users_details = {};

    static g_booking_state_auth_bearer_token_set(value)
    {
        this._g_booking_state_auth_bearer_token = value;
        localStorage.setItem("_g_booking_state_auth_bearer_token", this._g_booking_state_auth_bearer_token);
    }

    static g_booking_state_auth_bearer_token_get()
    {
        if(this._g_booking_state_auth_bearer_token == "")
        {
            this._g_booking_state_auth_bearer_token = localStorage.getItem("_g_booking_state_auth_bearer_token");
        }
        if(this._g_booking_state_auth_bearer_token == null)
        {
            console.error("Error getting bearer token from local storage");
        }
        return this._g_booking_state_auth_bearer_token;
    }

    static g_bBooking_state_user_logged_in_set(value)
    {
        this._g_bBooking_state_user_logged_in = value;
        localStorage.setItem("_g_bBooking_state_user_logged_in", this._g_bBooking_state_user_logged_in);
    }

    static g_bBooking_state_user_logged_in_get()
    {
        let userLoggedInStr = localStorage.getItem("_g_bBooking_state_user_logged_in");
        if(userLoggedInStr == null)
        {
            this._g_bBooking_state_user_logged_in = false;
        }
        else
        {
            this._g_bBooking_state_user_logged_in = (userLoggedInStr.toLowerCase() == "true");
        }
        return this._g_bBooking_state_user_logged_in
    }

    static g_booking_state_users_to_auto_book_add(userId)
    {
        this._g_booking_state_users_to_auto_book.add(parseInt(userId));
        localStorage.setItem("_g_booking_state_users_to_auto_book", JSON.stringify([...this._g_booking_state_users_to_auto_book]));
    }

    static g_booking_state_users_to_auto_book_remove(userId)
    {
        this._g_booking_state_users_to_auto_book.delete(parseInt(userId));
        localStorage.setItem("_g_booking_state_users_to_auto_book", JSON.stringify([...this._g_booking_state_users_to_auto_book]));
    }

    static g_booking_state_users_to_auto_book_get()
    {
        this._g_booking_state_users_to_auto_book = new Set(JSON.parse(localStorage.getItem("_g_booking_state_users_to_auto_book")));
        return this._g_booking_state_users_to_auto_book;
    }

    ///
    static g_booking_state_users_details_set(userDetails)
    {
        this._g_booking_state_users_details[userDetails.beneficiary_reference_id] = userDetails;
        localStorage.setItem("_g_booking_state_users_details", JSON.stringify(this._g_booking_state_users_details));
    }

    static g_booking_state_users_details_get()
    {
        this._g_booking_state_users_details = JSON.parse(localStorage.getItem("_g_booking_state_users_details"));
        return this._g_booking_state_users_details;
    }

    static g_booking_state_users_details_get_by_user_id(userId/*Beneficiary reference ID*/)
    {
        this._g_booking_state_users_details = JSON.parse(localStorage.getItem("_g_booking_state_users_details"));
        let retVal = this._g_booking_state_users_details[userId];
        if(retVal == undefined)
        {
            console.error("userId not found",userId, this._g_booking_state_users_details);
        }
        return retVal;
    }

    ///
    static g_booking_state_users_to_auto_book_settings_set(userId, userDetails) {
        this._g_booking_state_users_to_auto_book_settings[userId] = userDetails;
        localStorage.setItem("_g_booking_state_users_to_auto_book_settings", JSON.stringify(this._g_booking_state_users_to_auto_book_settings));
    }

    static g_booking_state_users_to_auto_book_settings_get_by_user_id(userId/*Beneficiary reference ID*/)
    {
        this._g_booking_state_users_to_auto_book_settings = JSON.parse(localStorage.getItem("_g_booking_state_users_to_auto_book_settings"));
        let retVal = this._g_booking_state_users_to_auto_book_settings[userId];
        if(retVal == undefined)
        {
            console.error("userId not found",userId, this._g_booking_state_users_to_auto_book_settings);
        }
        return retVal;
    }

    static g_booking_state_users_to_auto_book_settings_remove(userId/*Beneficiary reference ID*/)
    {
        this._g_booking_state_users_to_auto_book_settings = JSON.parse(localStorage.getItem("_g_booking_state_users_to_auto_book_settings"));
        delete this._g_booking_state_users_to_auto_book_settings[userId];
        localStorage.setItem("_g_booking_state_users_to_auto_book_settings", JSON.stringify(this._g_booking_state_users_to_auto_book_settings));
    }
}