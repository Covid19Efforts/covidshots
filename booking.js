const g_booking_config_encryption_secret1 = "b5cab167-7977-4df1-8027-a63aa144f04e";
const g_booking_config_encryption_secret2 = "CoWIN@$#&*(!@%^&";//Key
const g_booking_config_secret = "U2FsdGVkX194jQCChEwkQBXzvshC6bewrzI96RXGqwopnQMmteiKcarRFTwVmjraC1fqnT6TjpzR3tg0A8DdzQ==";

g_booking_state_last_transaction_id = "";
g_booking_state_auto_booking_on = false;//autobook button is clicked and autobook is active currently

class g_persistent_vars
{
    static _g_booking_state_auth_bearer_token = "";
    static _g_bBooking_state_user_logged_in = false;
    static _g_booking_state_users_to_auto_book = new Set();
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
        this._g_booking_state_users_to_auto_book.add(userId);
        localStorage.setItem("_g_booking_state_users_to_auto_book", JSON.stringify([...this._g_booking_state_users_to_auto_book]));
    }

    static g_booking_state_users_to_auto_book_remove(userId)
    {
        this._g_booking_state_users_to_auto_book.delete(userId);
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

    static g_booking_state_users_to_auto_book_get()
    {
        this._g_booking_state_users_details = JSON.parse(localStorage.getItem("_g_booking_state_users_details"));
        return this._g_booking_state_users_details;
    }

    static g_booking_state_users_to_auto_book_get_by_user_id(userId/*Beneficiary reference ID*/)
    {
        this._g_booking_state_users_details = JSON.parse(localStorage.getItem("_g_booking_state_users_details"));
        let retVal = this._g_booking_state_users_details[userId];
        if(retVal == undefined)
        {
            console.error("userId not found",userId, this._g_booking_state_users_details);
        }
        return retVal;
    }
}



function GetOtpClicked()
{
    let mobileNumStr = $('#BookingFormOtpMobileNumber')[0].value;
    let mobileNumInt = parseInt(mobileNumStr);
    if(isNaN(mobileNumInt))
    {
        tata.error("Error", "Invalid Mobile number");
        return;
    }

    $('#BookingFormDimmer').addClass('active');

    fetch("https://cdn-api.co-vin.in/api/v2/auth/generateMobileOTP", {
    "headers": {
            "content-type": "application/json",
          },
  "referrer": "https://selfregistration.cowin.gov.in/",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": "{\"secret\":\""+ g_booking_config_secret + "\",\"mobile\":" + mobileNumStr + "}",
  "method": "POST",
  "mode": "cors",
  "credentials": "omit"
}).then(response => {
    if(response.status >= 400)
    {
        console.error("OTP error");
        throw new Error("OTP Error");
    }
    return response.json();
}).then(data => {
        g_booking_state_last_transaction_id = data["txnId"];
        $('#InputMobileNumber').hide();
        $('#BookingFormgetOtpBtn').hide();
        $('#InputOtpToVerify').show();
        $('#BookingFormDimmer').removeClass('active');
    }).catch(error => {
        tata.error("OTP Error", "Error Generating OTP");
        $('#BookingFormDimmer').removeClass('active');
    });
}

function VerifyOtpClicked()
{
    let otpStr = $('#otpObtained')[0].value;
    let otpInt = parseInt(otpStr);
    if(isNaN(otpInt))
    {
        tata.error("Error", "Invalid OTP");
        return;
    }
    $('#BookingFormDimmer').addClass('active');

    let md = forge.md.sha256.create();
    md.update(otpStr);
    let otpDigestStr = md.digest().toHex();

    fetch("https://cdn-api.co-vin.in/api/v2/auth/validateMobileOtp", {
    "headers": {
    "content-type": "application/json",
    },
    "referrer": "https://selfregistration.cowin.gov.in/",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": "{\"otp\":\""+ otpDigestStr +"\",\"txnId\":\""+ g_booking_state_last_transaction_id +"\"}",
    "method": "POST",
    "mode": "cors",
    "credentials": "omit"
}).then(response => {
    if(response.status >= 400)
    {
        console.error("OTP error");
        throw new Error("OTP Error");
    }
    return response.json();
}).then(data => {
    $('#BookingFormDimmer').removeClass('active');
    g_persistent_vars.g_booking_state_auth_bearer_token_set(data["token"]);
    g_persistent_vars.g_bBooking_state_user_logged_in_set(true);
    tata.success("Login success", "You hav successfully logged in");
    $('#InputOtpToVerify').hide();
    $('#UserLoggedIn').show();
    $('#BookingAccountDetails').show();
    GetAccountDetails();
    }).catch(error => {
        tata.error("OTP Error", "OTP incorrect or timed out");
        $('#BookingFormDimmer').removeClass('active');
    });

}

function AutoBookUserConfig(userid)
{
    console.log("AutoBookUserConfig", userid);
    if(g_persistent_vars.g_bBooking_state_user_logged_in_get() == true)
    {
        g_persistent_vars.g_booking_state_users_to_auto_book_add(userid);
    }
}

function GetAccountDetails()
{
    if(g_persistent_vars.g_bBooking_state_user_logged_in_get() == true)
    {
        let bearerToken = g_persistent_vars.g_booking_state_auth_bearer_token_get();
    fetch("https://cdn-api.co-vin.in/api/v2/appointment/beneficiaries", {
  "headers": {
    "authorization": "Bearer " + bearerToken,
  },
  "body": null,
  "method": "GET",
  "mode": "cors",
    }).then(response => {
    if(response.status >= 400)
    {
        let resText = response.text();//returns a promise
        console.error("error getting deatils");
        throw resText;
    }
    return response.json();
    }).then(data => {
        console.log("Account details", data);
        let tableColumns=[
            {data:"User_name", title:"User", render:function(data, type){return "<b>" + data.name + "</b><br/>" + data.refId + "";}},
            {data:"photo_id", title:"Photo ID"},
            {data:"vaccine_dose", title:"Dose"},
            {data:"vaccination_status", title:"Vaccination Status"},
            {data:"User_name", title:"Enable Auto-book", render:function(data, type){return "<div class=\"ui checkbox\"><input type=\"checkbox\" onclick=\"AutoBookUserConfig(" + data.refId + ")\"><label></label></div>";}}
        ];
        let tableData = [];
        data.beneficiaries.forEach(person => {
            g_persistent_vars.g_booking_state_users_details_set(person);
            let personData = {"User_name": {name:person.name, refId: person.beneficiary_reference_id}, "photo_id":person.photo_id_type,"vaccine_dose":"", "vaccination_status":person.vaccination_status};
            tableData.push(personData);

            let bIsMobileDevice = window.mobileCheck();

            $('#bookingAccountDetails').DataTable({
                destroy:true,
                data:tableData,
                responsive: bIsMobileDevice,
                //scrollX: true,
                dom: 't',
                columns: tableColumns,
                bSort:false,
                columnDefs:[
                    {targets:'_all', className:'dt-body-center'},
                    {targets:'_all', className:'dt-head-center'},
            ]
            });
        });
    }).catch(error => {
        tata.error("Error", "Error getting details");
        error.then(resText => {
            if(resText == "Unauthenticated access!")
            {
                console.error("Unauthenticated access");
            }
            BookingLogOut();
        });
    });
    }
}

function BookingLogOut()
{
    return;
    g_persistent_vars.g_bBooking_state_user_logged_in_set(false);
    g_persistent_vars.g_booking_state_auth_bearer_token_set("");
    tata.warn("Logged out", "User logged out", {onClose:function(){
        window.location.reload();
    }});
}

function ShowBookingDialog(e,t){
    if(g_persistent_vars.g_bBooking_state_user_logged_in_get() == true)
    {
        $('#BookingAccountDetails').show();
        $('#UserLoggedIn').show();
        $('#InputOtpToVerify').hide();
        $('#InputMobileNumber').hide();
        $('#BookingFormgetOtpBtn').hide();
        GetAccountDetails();
    }
    else
    {
        $('#BookingAccountDetails').hide();
        $('#UserLoggedIn').hide();
    }
    $('#BookingSettings').modal('setting', 'closable', false).modal('show');
}

function OnAutoBookClick(e,t)
{
    if(g_booking_state_auto_booking_on == false)
    {
        if(g_persistent_vars.g_bBooking_state_user_logged_in_get() == true && g_persistent_vars.g_booking_state_users_to_auto_book_get().size > 0)
        {
            if($('#btn_auto_refresh').hasClass('active') == false)
            {
                $('#btn_auto_refresh').addClass('active');
                OnAutoRefreshClickInternal(true);
            }
            g_booking_state_auto_booking_on = true;
        }
        else
        {
            if(g_persistent_vars.g_bBooking_state_user_logged_in_get() != true)
            {
                tata.error('Error', 'User not logged in');
            }
            else if(g_persistent_vars.g_booking_state_users_to_auto_book_get().size <= 0)
            {
                tata.error('Error', 'No user selected for auto book');
            }
            g_booking_state_auto_booking_on = false;
            ShowBookingDialog();
        }
    }
    else
    {
        $('#btn_auto_refresh').removeClass('active');
        OnAutoRefreshClickInternal(false);
        g_booking_state_auto_booking_on = false;
    }

    if(g_booking_state_auto_booking_on == true)
    {
        $('#btn_auto_book').addClass('bookingButtonSwitched');
    }
    else
    {
        $('#btn_auto_book').removeClass('bookingButtonSwitched');
    }
}

function BookingInit()
{
    $('#BookingSettings_btn').click(ShowBookingDialog);
    $('#BookingSettingsDialogButton').click(ShowBookingDialog);
    $('#BookingFormgetOtpBtn').click(GetOtpClicked);
    $('#BookingFormResendOtpBtn').click(GetOtpClicked);
    $('#BookingFormVerifyOtpBtn').click(VerifyOtpClicked);
    $('#BookingSettings .menu .item').tab({history:false});
    $('#btn_auto_book').click(OnAutoBookClick);
}