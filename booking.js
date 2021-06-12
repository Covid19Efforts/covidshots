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
        this._g_booking_state_users_to_auto_book.add(parseInt(userId));
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
    $('#BookingAccountDetails,#BookingBookingSettings').show();
    GetAccountDetails();
    }).catch(error => {
        tata.error("OTP Error", "OTP incorrect or timed out");
        $('#BookingFormDimmer').removeClass('active');
    });

}

function AutoBookUserConfig(userid, inputControl)
{
    if(g_persistent_vars.g_bBooking_state_user_logged_in_get() == true)
    {
        if(inputControl.checked == true)
        {
            g_persistent_vars.g_booking_state_users_to_auto_book_add(userid);
        }
        else
        {
            g_persistent_vars.g_booking_state_users_to_auto_book_remove(userid);
        }
    }
}

//data.name + "</b><br/>" + data.refId
function BookingDialogUsersRender(data, type)
{//render method
    let refId = data.refId;
    let secret = refId.substring(refId.length - 4);
    let refIds = refId.substring(0, refId.length - 4);
    let name = data.name;
    let userAge = parseInt(dayjs().format('YYYY')) - parseInt(data.birthYear);
    let html = "<span id=\"BookingDialogUsersRender\"><p style=\"display:inline; font-size:medium;\">" + name + "</p><br/><p style=\"display:inline\">" + refIds + "</p><p style=\"display:inline\" class=\"BookingDialogUsersRenderSecret\">" + secret + "</p><br/><p style=\"display:inline\" class=\"BookingDialogUsersRenderAge\">Age: " + userAge + "</p></span>";
    return html;
}

function BookingDialogPhotoIdRender(data, type)
{
    let idType = data.type;
    let idNumber = data.number;
    let html = "<span id=\"BookingDialogUsersRender\"><p style=\"display:inline; font-size:medium;\">" + idType + "</p><br/><p style=\"display:inline\">(" + idNumber + ")</p></span>";
    return html;
}

function BookingDialogVaccineStatusRender(data, type)
{
    let vaccineImage = "assets/nounProject/";
    let vaccineStatus = data.status;
    let fontColor = "";
    if (vaccineStatus.toLocaleLowerCase() == "Not Vaccinated".toLocaleLowerCase())
    {
        vaccineImage += "vaccine48_red.png";
    }
    else if (vaccineStatus.toLocaleLowerCase() == "Partially Vaccinated".toLocaleLowerCase())
    {
        vaccineImage += "vaccine48_yellow.png";
    }
    else if (vaccineStatus.toLocaleLowerCase() == "Vaccinated".toLocaleLowerCase())
    {
        vaccineImage += "vaccine48_green.png";
    }
    else
    {
        console.error("Unexpected vaccine status");
    }

    let appointmentTitle = "Next appointment: ";
    let apptDescText = "";
    let nextAppStyle = "display:none;";
    let apps = data.appointments;
    if (apps.length > 0)
    {
        let appt = apps[0];
        let apptDate = dayjs(appt.date, 'DD-MM-YYYY');
        if (IsDateInPastDjs(apptDate) == false) {
            nextAppStyle = "font-size:small;";//should not be hidden
            appointmentTitle += apptDate.format('ddd, MMM DD');

            let apptBlockName = appt.block_name;
            if (apptBlockName.toLocaleLowerCase() == "Not Applicable".toLowerCase()) {
                apptBlockName = "";
            }
            else
            {
                apptBlockName += ", ";
            }

            let apptSlot = appt.slot.replaceAll(":00", "");
            apptDescText += apptSlot;
            apptDescText += "<br />";
            apptDescText += "<b>" + appt.name + "</b>";
            apptDescText += "<br />";
            apptDescText += apptBlockName + appt.district_name + ", " + appt.state_name;
        }
    }

    let html = "<div class=\"ui middle aligned list\"><div class=\"item\"><img class=\"ui avatar image\" src=\"" + vaccineImage + "\"><div class=\"content\"><div class=\"header\">" + vaccineStatus + "</div><div class=\"description\" style=\"dipslay:none;\"><!--desc--></div></div></div><div class=\"item\" style=\"" + nextAppStyle + "\"><img class=\"ui avatar image\" src=\"\" style=\"display:none;\"><div class=\"content\"><div class=\"header\">" + appointmentTitle + "</div><div class=\"description\">" + apptDescText + "</div></div></div></div>";
    return html;
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
        console.error("error getting details");
        throw resText;
    }
    return response.json();
    }).then(data => {
        console.log("Account details", data);
        let tableColumns=[
            {data:"User_name", title:"User", render:BookingDialogUsersRender},
            {data:"photo_id", title:"Photo ID", render: BookingDialogPhotoIdRender},
            /*{data:"vaccine_dose", title:"Dose"},*/
            {data:"vaccination_status", title:"Vaccination", render:BookingDialogVaccineStatusRender},
            /*{data:"User_name", title:"Enable Auto-book", render:function(data, type){
                let checked = " ";
                let userId = data.refId;
                if(g_persistent_vars.g_booking_state_users_to_auto_book_get().has(parseInt(userId)))
                {
                    checked = "checked";
                }
                return "<div class=\"ui checkbox\"><input type=\"checkbox\" onclick=\"AutoBookUserConfig(" + userId + ",this)\" " + checked + "><label></label></div>";
            }
            }*/
        ];
        let tableData = [];
        data.beneficiaries.forEach(person => {
            g_persistent_vars.g_booking_state_users_details_set(person);
            let personData = { "User_name": { name: person.name, refId: person.beneficiary_reference_id, birthYear:person.birth_year}, "photo_id": { type: person.photo_id_type, number: person.photo_id_number }, "vaccine_dose": "", "vaccination_status": { status:person.vaccination_status, dose1:person.dose1_date, dose2:person.dose2_date, appointments:person.appointments}};
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
    tata.warn("Logged out", "Refreshing site ...", {onClose:function(){
        window.location.reload();
    }});
}

function ShowBookingDialog(e,t){
    if(g_persistent_vars.g_bBooking_state_user_logged_in_get() == true)
    {
        $('#BookingAccountDetails,#BookingBookingSettings').show();
        $('#UserLoggedIn').show();
        $('#InputOtpToVerify').hide();
        $('#InputMobileNumber').hide();
        $('#BookingFormgetOtpBtn').hide();
        GetAccountDetails();
    }
    else
    {
        $('#BookingAccountDetails,#BookingBookingSettings').hide();
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
            GetAccountDetails();//This is to recheck if user still logged in, as it forces page refresh when not
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
        g_booking_state_auto_booking_on = false;
        $('#btn_auto_refresh').removeClass('active');
        OnAutoRefreshClickInternal(false);
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
    $('#BookingFormLogOut').click(BookingLogOut);
}

function TryAutoBook(notifyInfo)
{
    if(g_persistent_vars.g_bBooking_state_user_logged_in_get() == true)
    {
        let usersToBook = Array.from(new Set(g_persistent_vars.g_booking_state_users_to_auto_book_get()));
        if(usersToBook.length > 0)
        {
            let notifyInfoClone = JSON.parse(JSON.stringify(notifyInfo));
            for (let ui = 0; ui < usersToBook.length; ui++)
            {
                let bMoveToNextUser = false;//processing for this user is done, move to next
                let userId = usersToBook[ui];
                let centreNames = Object.keys(notifyInfoClone);
                if(centreNames.length > 0)
                {
                    for (let ci = 0; ci < centreNames.length; ci++)
                    {
                        let name = centreNames[ci];
                        let sessions = notifyInfoClone[name].sessions;
                        let centreId = notifyInfoClone[name].centreId;
                        let userDetails = g_persistent_vars.g_booking_state_users_details_get_by_user_id(userId);
                        let userAge = parseInt(dayjs().format('YYYY')) - parseInt(userDetails.birth_year);
                        for (let si = 0; si < sessions.length; si++)
                        {
                            let session = sessions[si];
                            let sessionMinAge = parseInt(session.min_age_limit);
                            let ageCategory = 45;
                            if (userAge >= 45)
                            {
                                ageCategory = 45;
                            }
                            else if (userAge >= 18)
                            {//eg. a user with age 60 can't book in 18-45 slot
                                ageCategory = 18;
                            }
                            else
                            {
                                console.error("Invalid user age", userDetails);
                                return;
                            }

                            if(ageCategory == sessionMinAge && session.capacity_to_show > 0)
                            {
                                let dose = 1;
                                if(userDetails["dose1_date"] != "")
                                {//user has already taken dose 1
                                    dose = 2;
                                }

                                if ((dose == 1 && session.available_capacity_dose1 > 0) || (dose == 2 && session.available_capacity_dose2 > 0))
                                {
                                    let bookPayload = { center_id: centreId, session_id: session.session_id, beneficiaries: [String(userId)], slot: session.slots[0], dose: dose };
                                    console.info("Found a slot!", name, centreId, session, notifyInfoClone[name]);
                                    TryAutoBookInternal(bookPayload, userId, name);
                                    bMoveToNextUser = true;
                                    break;
                                }
                            }
                        }
                        if (bMoveToNextUser == true)
                        {
                            break;
                        }
                    }
                }

            }
        }
    }
}

function TryAutoBookInternal(payload, userId, centreName)
{
    let payloadStr = JSON.stringify(payload);
    let userDetails = g_persistent_vars.g_booking_state_users_details_get_by_user_id(userId);
        let bearerToken = g_persistent_vars.g_booking_state_auth_bearer_token_get();
        fetch("https://cdn-api.co-vin.in/api/v2/appointment/schedule", {
        "headers": {
                "authorization": "Bearer " + bearerToken,
                "content-type": "application/json",
            },
        "method": "POST",
        "mode": "cors",
        "body": payloadStr,
    }).then(response => {
    if(response.status >= 400)
    {
        let resText = response.text();//returns a promise
        console.error("error getting details");
        throw resText;
    }
    return response.json();
    }).then(data => {
        console.log("Booking details", data, userDetails.name, centreName, payload);
        g_persistent_vars.g_booking_state_users_to_auto_book_remove(userId);
        tata.success("Slot booked", userDetails.name + "<br />" + centreName + "<br/>" + payload.slot);
        
    }).catch(error => {
        tata.error("Error", "Error Booking");
        error.then(resText => {
            if(resText == "Unauthenticated access!")
            {
                console.error("Unauthenticated access");
            }
            BookingLogOut();
        });
    });
}