const g_booking_config_encryption_secret1 = "b5cab167-7977-4df1-8027-a63aa144f04e";
const g_booking_config_encryption_secret2 = "CoWIN@$#&*(!@%^&";//Key
const g_booking_config_secret = "U2FsdGVkX194jQCChEwkQBXzvshC6bewrzI96RXGqwopnQMmteiKcarRFTwVmjraC1fqnT6TjpzR3tg0A8DdzQ==";

const g_booking_config_dose2_gap = 84; //no. of days between dose1, and dose2

const g_booking_config_prompt_for_otp_on_logout = true;
const g_booking_config_verify_otp_pending_payloads_attr_name = "data-state-bProcessPendingPayloads";

/*
consider a scenario where auto refersh has been looking for slots for many hours,
and when it finds one the user session has expired. The plan is to keep the info
cached and prompt user for new OTP (code would auto trigger generate OTP beforehand).
As soon as user enters OTP we login and try booking with pending info.
each element of this array will be an object - { "userId": userId, "centreName": centreName, "payload": payload };
*/
g_booking_state_pending_payloads = [];

g_booking_state_last_transaction_id = "";
g_booking_state_auto_booking_on = false;//autobook button is clicked and autobook is active currently


//handles
g_booking_handle_data_table_user_details = null;
/*when user clicks on vaccine info in table we show a book button dimmer. 
When user clicks on some other vaccine's we should close the previous one.
Also when user scrolls page or clicks somewhere else, we close it.
*/
g_booking_handle_info_card_dimmer = null;

function ChangeNumberClicked()
{
    $('#InputMobileNumber').show();
    $('#BookingFormgetOtpBtn').show();
    $('#InputOtpToVerify').hide();
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

    let oldMobNum = g_persistent_vars.g_booking_state_user_mobile_get();
    if (oldMobNum != String(mobileNumInt))
    {
        console.info("mobile number changed", oldMobNum, mobileNumInt);
        g_persistent_vars.g_booking_state_user_mobile_set(mobileNumInt);
        g_persistent_vars.g_booking_state_users_to_auto_book_clear();
        g_persistent_vars.g_booking_state_users_to_auto_book_settings_clear();

    }

    if (WebViewBridgeJs2Java.IsInWebView()) {
        WebViewBridgeJs2Java.SendMobileNumber(mobileNumInt);
        return;
    }

    GetOtpInternal(false);
}

function GetOtpInternal(bProcessPendingPayloads = false/*A booking attempt was interrupted. need to reloign and retry*/)
{
    let mobileNumStr = $('#BookingFormOtpMobileNumber')[0].value;
    let mobileNumInt = parseInt(mobileNumStr);
    if(isNaN(mobileNumInt))
    {
        tata.error("Error", "Invalid Mobile number");
        return;
    }

    $('#otpMobileNumberLabel')[0].innerText = " (" + mobileNumInt + ")";

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
    
        if (bProcessPendingPayloads == true)
        {
            $('#InputOtpToVerify').attr(g_booking_config_verify_otp_pending_payloads_attr_name, true);
        }
        else {
            $('#InputOtpToVerify').removeAttr(g_booking_config_verify_otp_pending_payloads_attr_name);
    }
        
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
    LogInUser(data["token"]);
    }).catch(error => {
        tata.error("OTP Error", "OTP incorrect or timed out");
        $('#BookingFormDimmer').removeClass('active');
    });

}

function LogInUser(bearerTokenStr)
{
    $('#BookingFormDimmer').removeClass('active');
    g_persistent_vars.g_booking_state_auth_bearer_token_set(bearerTokenStr);
    g_persistent_vars.g_bBooking_state_user_logged_in_set(true);
    tata.success("Login success", "You have successfully logged in");
    $('#InputOtpToVerify').hide();
    let bProcessPendingPayloads = false;
    let attrtVal = $('#InputOtpToVerify').attr(g_booking_config_verify_otp_pending_payloads_attr_name);
    if ((g_booking_state_pending_payloads.length > 0) && (attrtVal.toLowerCase() === "true"))
    {
        bProcessPendingPayloads = true;
    }
    else
    {
        bProcessPendingPayloads = false;
        $('#InputOtpToVerify').removeAttr(g_booking_config_verify_otp_pending_payloads_attr_name);
        g_booking_state_pending_payloads = [];
    }

    if (bProcessPendingPayloads == true)
    {
        g_booking_state_pending_payloads.forEach(payload => {
            //{ "userId": userId, "centreName": centreName, "payload": payload }
            let userId = payload.userId;
            let centreName = payload.centreName;
            let userPayload = payload.payload;
            TryAutoBookInternal(userPayload, userId, centreName, true);
        });
    }

    $('#UserLoggedIn').show();
    $('#BookingAccountDetails,#BookingBookingSettings').show();
    GetAccountDetails();
}

//render user details column
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

//render photo ID column
function BookingDialogPhotoIdRender(data, type)
{
    let idType = data.type;
    let idNumber = data.number;
    let html = "<span id=\"BookingDialogUsersRender\"><p style=\"display:inline; font-size:medium;\">" + idType + "</p><br/><p style=\"display:inline\">(" + idNumber + ")</p></span>";
    return html;
}

//render vaccine status column
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

    let appointmentTitle = "Appointments: ";
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

function GetAccountDetails(SUCCESS_CALLBACK=null, FAILURE_CALLBACK=null/* Function to execute if failed - eg. when user not logged in */)
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
        $('#NoUsersRegisteredMessage').hide();

        let tableColumns=[
            {data:"User_name", title:"User", render:BookingDialogUsersRender},
            {data:"photo_id", title:"Photo ID", render: BookingDialogPhotoIdRender},
            {data:"vaccination_status", title:"Vaccination", render:BookingDialogVaccineStatusRender},
        ];
        let tableData = [];
        data.beneficiaries.forEach(person => {
            g_persistent_vars.g_booking_state_users_details_set(person);
            let personData = { "User_name": { name: person.name, refId: person.beneficiary_reference_id, birthYear:person.birth_year}, "photo_id": { type: person.photo_id_type, number: person.photo_id_number }, "vaccine_dose": "", "vaccination_status": { status:person.vaccination_status, dose1:person.dose1_date, dose2:person.dose2_date, appointments:person.appointments}};
            tableData.push(personData);

            CreateUserSettingsCard(person);
        });
        let bIsMobileDevice = window.mobileCheck();

        g_booking_handle_data_table_user_details = $('#bookingAccountDetails').DataTable({
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

        g_booking_handle_data_table_user_details.columns.adjust().responsive.recalc();//This will be missed in tab's onFirstLoad if user switches to tab before table has been redered. Another case is when user switches to accounts tab and then to bookings all too quickly. then even this wont work. The best solution would be to show these two tabs when data is available after fetch, and table is rendered.

        if (SUCCESS_CALLBACK != null)
        {
            SUCCESS_CALLBACK(tableData);
        }

    }).catch(error => {
        error.then(resText => {
            let errorCode = STATUS.S_OK;
            let bLogOut = true;
            if(resText == "Unauthenticated access!")
            {
                console.error("Unauthenticated access");
                tata.error("Error", "Unauthenticated access");
                bLogOut = true;
                errorCode = STATUS.E_SESSION_EXPIRE;
            } else
            {
                try {
                    resTextJ = JSON.parse(resText);
                    if ((resTextJ.errorCode == "APPOIN0019") || (resText.error.includes("No beneficiary found for provided beneficiary mobile number") == true))
                    {
                        $('#NoUsersRegisteredMessage').show();
                        tata.warn("No beneficiaries", "Add beneficiaries using CoWin portal");
                        bLogOut = false;
                        errorCode = STATUS.E_NO_USERS;
                    }
                }
                catch (e)
                {
                    console.error("error parsing response text", resText);
                    bLogOut = true;
                    errorCode = STATUS.E_UNKNOWN;
                }
            }
            if (bLogOut) {
                BookingLogOut();
            }

            if(FAILURE_CALLBACK != null)
            {
                FAILURE_CALLBACK(errorCode);
            }
        });
    });
    }
    else {
        if(FAILURE_CALLBACK != null)
        {
            FAILURE_CALLBACK(STATUS.E_LOGOUT);
        }
    }
}

function BookingLogOut()
{
    g_persistent_vars.g_bBooking_state_user_logged_in_set(false);
    g_persistent_vars.g_booking_state_auth_bearer_token_set("");
    tata.warn("Logged out", "Refreshing site ...", {onClose:function(){
        window.location.reload();
    }});
}

function ShowBookingDialog(e, t) {
    ShowBookingDialogInternal(false);
}

function ShowBookingDialogInternal(bProcessPendingPayloads = false/*A booking attempt was interrupted. need to reloign and retry*/){
    
    if (bProcessPendingPayloads == false) {
        if (g_persistent_vars.g_bBooking_state_user_logged_in_get() == true) {
            $('#BookingAccountDetails,#BookingBookingSettings').show();
            $('#UserLoggedIn').show();
            $('#InputOtpToVerify').hide();
            $('#InputMobileNumber').hide();
            $('#BookingFormgetOtpBtn').hide();
            GetAccountDetails();
        }
        else {
            $('#BookingAccountDetails,#BookingBookingSettings').hide();
            $('#UserLoggedIn').hide();
        }
    }
    else
    {
        if (g_booking_state_pending_payloads.length > 0)
        {
            PlayAudio();
            tata.warn("Log in again", "Enter the OTP you have received", { position: 'tr', holding: true, onClick: PauseAudio, onClose: PauseAudio });
            GetOtpInternal(true);
            $('#InputMobileNumber').hide();
            $('#BookingFormgetOtpBtn').hide();
            $('#InputOtpToVerify').show();
            $('#otpObtained')[0].value = "";//clear previous OTP
            $('#BookingFormDimmer').removeClass('active');
            $('#BookingSettings .menu .item').tab('change tab', 'Login');
            $('#BookingAccountDetails,#BookingBookingSettings').hide();
        }
    }

    $('#BookingSettings').modal('setting', 'closable', true).modal('show');
}

function StopAutoBook()
{
    g_booking_state_auto_booking_on = false;
    $('#btn_auto_refresh').removeClass('active');
    OnAutoRefreshClickInternal(false);
    $('#btn_auto_book').removeClass('bookingButtonSwitched');
}

function OnAutoBookClick(e,t)
{
    let bIsInWebView = WebViewBridgeJs2Java.IsInWebView();

    if(g_booking_state_auto_booking_on == false)
    {
        if(g_persistent_vars.g_bBooking_state_user_logged_in_get() == true && g_persistent_vars.g_booking_state_users_to_auto_book_get().size > 0)
        {
            GetAccountDetails();//This is to recheck if user still logged in, as it forces page refresh when not
            if($('#btn_auto_refresh').hasClass('active') == false)
            {
                g_booking_state_auto_booking_on = true;
                $('#btn_auto_refresh').addClass('active');
                if (bIsInWebView == false) {
                    OnAutoRefreshClickInternal(true);
                }
            }
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
        StopAutoBook();
    }

    if(g_booking_state_auto_booking_on == true)
    {
        $('#btn_auto_book').addClass('bookingButtonSwitched');
    }
    else
    {
        $('#btn_auto_book').removeClass('bookingButtonSwitched');
    }

    if (bIsInWebView == true) {
        WebViewBridgeJs2Java.SendButtonEventAutoBook(g_booking_state_auto_booking_on);
    }
}

function BookingInit()
{
    $('#BookingSettings_btn').click(ShowBookingDialog);
    $('#BookingSettingsDialogButton').click(ShowBookingDialog);
    $('#BookingFormgetOtpBtn').click(GetOtpClicked);
    $('#BookingFormResendOtpBtn').click(GetOtpClicked);
    $('#BookingFormResendOtpBtn').click(GetOtpClicked);
    $('#BookingFormChangeNumberBtn').click(ChangeNumberClicked);
    $('#BookingFormVerifyOtpBtn').click(VerifyOtpClicked);
    $('#BookingSettings .menu .item').tab({
        history: false,
        onFirstLoad: function (tabPath, parameterArray, historyEvent) { if (tabPath == "accounts") { if (g_booking_handle_data_table_user_details != null) { g_booking_handle_data_table_user_details.columns.adjust().responsive.recalc();}}}
    });
    $('#btn_auto_book').click(OnAutoBookClick);
    $('#BookingFormLogOut').click(BookingLogOut);
    $('#BookingDialogBookingSettingsDelay').dropdown();

    
    $(document).click(function (e, t) {
        if (g_booking_handle_info_card_dimmer != null) {
            //clicked outside currently open dimmer?
            let rootParentNode = $(g_booking_handle_info_card_dimmer).closest(".tableVaccineInfoRootParent");
            if (rootParentNode[0].contains(e.target) == false) {
                HideVaccineInfoCardDimmer();
            }
        }
    });
    //$(window).bind('mousewheel', HideVaccineInfoCardDimmer);//handle touch start, etc. on mobile too
}

function TryAutoBook(notifyInfo)
{
    if(g_persistent_vars.g_bBooking_state_user_logged_in_get() == true)
    {
        let usersToBook = Array.from(new Set(g_persistent_vars.g_booking_state_users_to_auto_book_get()));
        if(usersToBook.length > 0)
        {
            //let notifyInfoClone = JSON.parse(JSON.stringify(notifyInfo));//messes up dayjs objects
            let notifyInfoClone = notifyInfo;
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
                        let userDetails  = g_persistent_vars.g_booking_state_users_details_get_by_user_id(userId);
                        let userSettings = g_persistent_vars.g_booking_state_users_to_auto_book_settings_get_by_user_id(userId);
                        let userAge = parseInt(dayjs().format('YYYY')) - parseInt(userDetails.birth_year);
                        for (let si = 0; si < sessions.length; si++)
                        {
                            let session = sessions[si];
                            let sessionMinAge = parseInt(session.min_age_limit);
                            
                            if (userSettings.vaccines.length != 0 && userSettings.vaccines.indexOf("any") == -1) {
                                let sessionVaccine = session.vaccine.toLowerCase();
                                sessionVaccine = sessionVaccine.replace(" ", "");//eg. "sputnik v" to "sputnikv"
                                if (userSettings.vaccines.indexOf(sessionVaccine) == -1)
                                {
                                    continue;//this is a vaccine in which user is not interested
                                }
                            }

                            let sessionDate = session.date;
                            if (IsDateInPastDjs(sessionDate) == true)
                            {
                                continue;
                            }

                            let today = dayjs();
                            let bIsSessionToday = false;
                            if(sessionDate.isSame(today, 'day') == true)
                            {
                                bIsSessionToday = true;
                            }
                            
                             if (userSettings.delay == "tomorrow" && bIsSessionToday)//dont book today's slots
                            {
                                 continue;
                            }

                            let ageCategory = GetAgeCategory(userAge);

                            if(ageCategory == sessionMinAge && session.capacity_to_show > 0)
                            {
                                let dose = 1;
                                if(userDetails["dose1_date"] != "")
                                {//user has already taken dose 1
                                    dose = 2;
                                }

                                if ((dose == 1 && session.available_capacity_dose1 > 0) || (dose == 2 && session.available_capacity_dose2 > 0))
                                {
                                    let slotIndex = 1;
                                    if (userSettings.delay == "today")
                                    {
                                        slotIndex = 0;
                                    }

                                    let slotTimeSelected = "";
                                    if (bIsSessionToday == true) {
                                        for (let iSlot = 0; iSlot < session.slots.length; iSlot++) {
                                            let slotTime = session.slots[iSlot].split("-")[slotIndex];
                                            let slotTimeHr = parseInt(slotTime.split(":")[0]);
                                            let slotTimeMn = parseInt(slotTime.substring(0, slotTime.length - 2).split(":")[1]);
                                            if ((slotTimeHr != 12) && (slotTime.substring(slotTime.length - 2).toLowerCase() == "pm")) {
                                                slotTimeHr += 12;
                                            }
                                            let timeNow = new Date();
                                            let timeNowH = timeNow.getHours();
                                            let timeNowM = timeNow.getMinutes();

                                            if (timeNowH < slotTimeHr) {
                                                slotTimeSelected = session.slots[iSlot];
                                                break;
                                            } else if (timeNowH == slotTimeHr && timeNowM < slotTimeMn) {
                                                slotTimeSelected = session.slots[iSlot];
                                                break;
                                            }
                                        }
                                    }
                                    else
                                    {
                                        slotTimeSelected = session.slots[0];
                                    }
                                    
                                    if (slotTimeSelected != "") {
                                        let bookPayload = { center_id: centreId, session_id: session.session_id, beneficiaries: [String(userId)], slot: slotTimeSelected, dose: dose };
                                        console.info("Found a slot!", name, centreId, session, notifyInfoClone[name]);
                                        TryAutoBookInternal(bookPayload, userId, name, false);
                                        bMoveToNextUser = true;
                                        break;
                                    }
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

function TryAutoBookInternal(payload, userId, centreName, bProcessingPendingPayloads = false/*To prevent infinite recursion. If true it means that we are already on retry code path*/, SUCCESS_CALLBACK = null, FAILURE_CALLBACK = null)
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
        g_persistent_vars.g_booking_state_users_to_auto_book_settings_remove(userId);

        if (g_persistent_vars.g_booking_state_users_to_auto_book_get().size == 0)
        {
            StopAutoBook();
        }

        g_booking_state_pending_payloads = g_booking_state_pending_payloads.filter(ele => ele.userId != userId);//remove user

        tata.success("Slot booked", userDetails.name + "<br />" + centreName + "<br/>" + payload.slot, { holding: true });
        
        if (SUCCESS_CALLBACK != null)
        {
            SUCCESS_CALLBACK();
        }
        
    }).catch(error => {
        tata.error("Error", "Error Booking");
        if(FAILURE_CALLBACK != null)
        {
            FAILURE_CALLBACK();
        }
        error.then(resText => {
            bTriggerLogout = true;
            if(resText == "Unauthenticated access!")
            {
                console.error("Unauthenticated access");
                if ((g_booking_config_prompt_for_otp_on_logout == true) && (bProcessingPendingPayloads == false/*Not on retry path*/))
                {
                    bTriggerLogout = false;
                    //payload, userId, centreName
                    let userDetails = { "userId": userId, "centreName": centreName, "payload": payload };
                    if (g_booking_state_pending_payloads.find(elem => elem.userId == userId) == undefined) {//unique
                        g_booking_state_pending_payloads.push(userDetails);
                        if ($('#BookingSettings').modal('is active') == false) {
                            ShowBookingDialogInternal(true);
                        }
                    }
                }
            }
            else
            {
                console.error("Unknown access", resText);
            }
            if (bTriggerLogout == true) {
                BookingLogOut();
            }
        });
    });
}

function SaveUserAutoBookConfig(userId, bAddUser /*Add/remove user from autobook list*/)
{
    if (bAddUser == true)
    {
        let userDetails = { vaccines: ["any"], delay: "now" };
        let parentCard = $('.BkgDlgBookingSettings.ui.card[data-card-user=' + userId + ']');
        let VaccineAny = parentCard.find("#BookingDialogBookingVaccineAny_" + userId)[0];
        if (VaccineAny.checked == false)
        {
            userDetails.vaccines = [];
            let vacs = ["BookingDialogBookingVaccineCovishield", "BookingDialogBookingVaccineCovaxin", "BookingDialogBookingVaccineSputnikV"];
            vacs.forEach(function (vac) {
                let vacInput = parentCard.find("#" + vac + "_" + userId)[0];
                if (vacInput.checked)
                {
                    let vacName = vac.replace("BookingDialogBookingVaccine", "").toLowerCase();
                    userDetails.vaccines.push(vacName);
                }
            });
        }
        if (userDetails.vaccines.length == 0)
        {
            userDetails.vaccines = ["any"];
        }
        let delayVal = parentCard.find("#BookingDialogBookingSettingsDelay_" + userId).find("input")[0].value.toLowerCase();
        if (delayVal != "")
        {
            userDetails.delay = delayVal;
        }
        g_persistent_vars.g_booking_state_users_to_auto_book_add(userId);
        g_persistent_vars.g_booking_state_users_to_auto_book_settings_set(userId, userDetails);
        
    }
    else
    {
        g_persistent_vars.g_booking_state_users_to_auto_book_remove(userId);
        g_persistent_vars.g_booking_state_users_to_auto_book_settings_remove(userId);
    }
}

function OnClickBookingDialogBookingSettingEnabledAutoBook(emt)
{
    let parentCard = $(emt).closest('.BkgDlgBookingSettings.ui.card');
    let dimmerNode = parentCard.find('#BookingDialogBookingSettingDimmer');
    let userId = parentCard.attr('data-card-user');
    if (emt.checked == true)
    {
        dimmerNode.dimmer('show');
        dimmerNode.dimmer('hide');//a bug in dimmer doesn't let it hide before calling show - first time
        SaveUserAutoBookConfig(userId, true);
    }
    else
    {
        SaveUserAutoBookConfig(userId, false);
        dimmerNode.dimmer('show');
    }
}

function OnBkgDlgSettingVaccine(that)
{
    let parentCard = $(that).closest('.BkgDlgBookingSettings.ui.card');
    let userId = parentCard.attr('data-card-user');

    if ($(that).attr("data-vaccine-name") == "any")
    {
        if (that.checked == true)
        {
            let vacs = ["BookingDialogBookingVaccineCovishield", "BookingDialogBookingVaccineCovaxin", "BookingDialogBookingVaccineSputnikV"];
            vacs.forEach(function (vac) {
                let vacInput = parentCard.find("#" + vac + "_" + userId);
                vacInput[0].checked = false;//dont use semantic ui checkbox to uncheck it messes with inputs native onclick. vacInput.parent().checkbox("uncheck");
            });
        } 
    }
    else
    {
        if (that.checked == true) {
            let vacInput = parentCard.find("#BookingDialogBookingVaccineAny_" + userId);
            vacInput[0].checked = false;
        }
    }
    SaveUserAutoBookConfig(userId, true);
}

function CreateUserSettingsCard(person)
{
    let userId = parseInt(person.beneficiary_reference_id);
    let userCard = $('.BkgDlgBookingSettings.ui.card[data-card-user=' + userId + ']');
    if (userCard.length == 0) {//create the card only if it doesn't exist already
        let templateNode = $('#BkgDlgBkgStngCardTemplate')[0];
        let cloneNode = templateNode.content.cloneNode(true);
        let cloneNodej = $(cloneNode);
        let cardEle = cloneNodej.find('.BkgDlgBookingSettings.ui.card');
        cardEle.attr('data-card-user', userId);
        cardEle.find('div[data-card-tag="userName"]').text(person.name);
    
        //fix label-for associations
        let inputIds = ['BookingDialogBookingSettingEnabledAutoBook', 'BookingDialogBookingVaccineAny', 'BookingDialogBookingVaccineCovishield', 'BookingDialogBookingVaccineCovaxin', 'BookingDialogBookingVaccineSputnikV'];
        inputIds.forEach(function (inputId) {
            let newId = inputId + "_" + userId;
            cardEle.find('#' + inputId).attr("id", newId);
            cardEle.find('label[for=' + inputId + ']').attr("for", newId);
        });

        let bkgDelayId = 'BookingDialogBookingSettingsDelay_' + userId;
        cardEle.find('#BookingDialogBookingSettingsDelay').attr("id", bkgDelayId);

        $('#BookingSettings div.tab.segment[data-tab="BookingTab"]').append(cloneNodej);
        $('#BookingSettings div.tab.segment[data-tab="BookingTab"]').find('#' + bkgDelayId).dropdown({ onChange: function (val, txt, obj) { SaveUserAutoBookConfig(userId, true); } });
    }

    //set state from persistence if any
    if (g_persistent_vars.g_bBooking_state_user_logged_in_get() == true && g_persistent_vars.g_booking_state_users_to_auto_book_get().size > 0)
    {
        let userSettings = g_persistent_vars.g_booking_state_users_to_auto_book_settings_get_by_user_id(userId);
        if (userSettings != undefined) {
            let parentCard = $('.BkgDlgBookingSettings.ui.card[data-card-user=' + userId + ']');
            parentCard.find('#BookingDialogBookingSettingEnabledAutoBook_' + userId)[0].checked = true;//this will not fire onchange event
            if (userSettings.vaccines.indexOf("any") == -1) {
                if (userSettings.vaccines.indexOf("covishield") != -1) {
                    let vacInput = parentCard.find("#BookingDialogBookingVaccineCovishield_" + userId);
                    vacInput[0].checked = true;
                }
                if (userSettings.vaccines.indexOf("covaxin") != -1) {
                    let vacInput = parentCard.find("#BookingDialogBookingVaccineCovaxin_" + userId);
                    vacInput[0].checked = true;
                }
                if (userSettings.vaccines.indexOf("sputnikv") != -1) {
                    let vacInput = parentCard.find("#BookingDialogBookingVaccineSputnikV_" + userId);
                    vacInput[0].checked = true;
                }
            
            }
            else {
                let vacInput = parentCard.find("#BookingDialogBookingVaccineAny_" + userId);
                vacInput[0].checked = true;
            }
            let delayDd = parentCard.find("#BookingDialogBookingSettingsDelay_" + userId);
            delayDd.dropdown('set selected', userSettings.delay);
            let dimmerNode = parentCard.find('#BookingDialogBookingSettingDimmer');
            dimmerNode.dimmer('show');
            dimmerNode.dimmer('hide');//a bug in dimmer doesn't let it hide before calling show - first time
        }
        
    }
}

/*hide the dimmer on page scroll, etc.*/
function HideVaccineInfoCardDimmer() {
    if (g_booking_handle_info_card_dimmer != null)
    {
        $(g_booking_handle_info_card_dimmer).dimmer('hide');
        g_booking_handle_info_card_dimmer = null;
    }
}

function VaccineInfoCardClicked(that) {
    let nodeDimmer = $(that).find("[data-type=bookDimmer]");
    HideVaccineInfoCardDimmer();
    g_booking_handle_info_card_dimmer = nodeDimmer;
    nodeDimmer.dimmer('show');
}

function VaccineInfoCardBookClicked(that)
{
    $('#BookViaTableCellClickModal [data-type*="_"]').hide();
    $('#BookViaTableCellClickModal [data-type=loading_anim] [data-type=circle_loading]').show();
    $('#BookViaTableCellClickModal [data-type=loading_anim] [data-type=tick_gif]').hide();
    $('#BookViaTableCellClickModal [data-type=loading_anim] .header')[0].innerText = "Loading details";
    $('#BookViaTableCellClickModal [data-type=loading_anim] p')[0].innerHTML = "Checking if the user is logged in, and loading account details.";
    $('#BookViaTableCellClickModal [data-type=loading_anim]').show();
    $('#BookViaTableCellClickModal [data-type=book_button]').addClass("disabled");
    $('#BookViaTableCellClickModal [data-type=book_button]').attr("data-book-payload", "");
    $('#BookViaTableCellClickModal').modal('setting', 'closable', true).modal('show');
    $('#BookViaTableCellClickModal [data-type=error_message_log_in_button]').hide();

    let sucfunc = function (usersDetails) {
        $('#BookViaTableCellClickModal [data-type=loading_anim]').hide();

        let vacRoot = $(that).closest('.tableVaccineInfoRootParent');
        let vacContainer = vacRoot.closest('[data-type=cellParent]');
        let centreId = parseInt(vacContainer.attr("data-centreId"));
        let centreName = g_cache_centre_slots[centreId].name;
        let dayStr = vacContainer.attr("data-daystr");
        let dateStr = vacContainer.attr("data-datestr");
        let dateStrJs = dayjs(vacContainer.attr("data-datestr"), 'YYYY-MM-DD');
        let vacName = vacRoot.attr("data-vac-name-internal");

        $('#BookViaTableCellClickModal [data-type=vaccine_name]')[0].innerText = vacName.toUpperCase();
        $('#BookViaTableCellClickModal [data-type=centre_name]')[0].innerText = centreName;

        let userVals = [];
        usersDetails.forEach((user) => {
            userVals.push(
                {
                    name: user.User_name.name,
                    value: user.User_name.refId,
                });
        });
        
        $('#BookViaTableCellClickModal [data-type=user_select] select').parent().dropdown('destroy');
        function closeDropDown() { $('#BookViaTableCellClickModal [data-type=user_select] select').dropdown('hide Menu'); };
        
        $('#BookViaTableCellClickModal [data-type=user_select] select').dropdown({
            placeholder: "Select Users",
            values: userVals,
            onChange: function (val, name, that) {
                if (val == "")
                {
                    return;//we may get onChange when control is initializing
                }
                let userId = val;
                let userDetails = g_persistent_vars.g_booking_state_users_details_get_by_user_id(userId);
                let userAge = parseInt(dayjs().format('YYYY')) - parseInt(userDetails.birth_year);
                let sessionInfo = g_cache_centre_slots[centreId][dayStr];

                let dose = 1;
                let dose1vaccine = "";
                let dose1Date = "";
                let dose2DateMin = "";
                if(userDetails["dose1_date"] != "")
                {//user has already taken dose 1
                    dose = 2;
                    dose1vaccine = userDetails["vaccine"];
                    dose1Date = dayjs(userDetails["dose1_date"], 'DD-MM-YYYY');
                    dose2DateMin = dose1Date.add(g_booking_config_dose2_gap, 'day');
                }

                let ageCategory = GetAgeCategory(userAge);
                
                let errorTitle = "Insufficient doses";
                let errorMessage = "";
                let vacInf = sessionInfo.vaccines[vacName][ageCategory];
                if (dose == 1)
                {
                    if (vacInf == undefined || vacInf.numDose1 < 1)
                    {
                        errorMessage = "User needs dose 1 vaccine, which is not available here."
                    }
                }else if (dose == 2)
                {
                    if (vacInf == undefined || vacInf.numDose2 < 1)
                    {
                        errorMessage = "User needs dose 2 vaccine, which is not available here."
                    } else if (dose1vaccine != vacName)
                    {
                        errorTitle = "Vaccine mismatch";
                        errorMessage = "User took " + dose1vaccine + " for first dose. Trying to book " + vacName;
                    } else if (dateStrJs.isBefore(dose2DateMin, 'day'))
                    {
                        errorTitle = "Too soon";
                        errorMessage = "There should be a gap of <b>" + g_booking_config_dose2_gap + " days</b> between the two doses."
                        errorMessage += "<br/>";
                        errorMessage += "First dose was taken on <b>" + dose1Date.format("D MMM") + "</b>. Second dose should be on (or after) <b>" + dose2DateMin.format("D MMM") + "</b>.";
                    }
                }

                if (errorMessage != "")
                {
                    $('#BookViaTableCellClickModal [data-type=error_message] .header')[0].innerText = errorTitle;
                    $('#BookViaTableCellClickModal [data-type=error_message_content]')[0].innerHTML = errorMessage;
                    $('#BookViaTableCellClickModal [data-type=error_message]').show();
                    $('#BookViaTableCellClickModal [data-type=error_message_content]').show();
                    $('#BookViaTableCellClickModal [data-type=slots_select] select').dropdown({ values: [] });
                    $('#BookViaTableCellClickModal [data-type=slots_select]').hide();

                    closeDropDown();
                    setTimeout(closeDropDown, 500);
                    return;
                }
                else
                {
                    let sessionId = sessionInfo.vaccines[vacName][ageCategory]["sessionId"];
                    $('#BookViaTableCellClickModal [data-type=error_message]').hide();
                    $('#BookViaTableCellClickModal [data-type=error_message_content]').hide();
                    let allSlots = [];
                    vacInf.slots.forEach(slot => {
                        allSlots.push({ name: slot, value: slot });
                    });
                    $('#BookViaTableCellClickModal [data-type=slots_select] select').dropdown('destroy');
                    $('#BookViaTableCellClickModal [data-type=slots_select] select').dropdown({
                        values: allSlots,
                        placeholder: "Select Slots ...",
                        onChange: function (val, name, that) {
                            if (val != "")
                            {
                                let slotTimeSelected = val;
                                let bookPayload = { center_id: centreId, session_id: sessionId, beneficiaries: [String(userId)], slot: slotTimeSelected, dose: dose };
                                $('#BookViaTableCellClickModal [data-type=book_button]').removeClass("disabled");
                                $('#BookViaTableCellClickModal [data-type=book_button]').attr("data-book-payload", JSON.stringify(bookPayload));
                                $('#BookViaTableCellClickModal [data-type=book_button]').attr("data-book-userId", userId);
                                $('#BookViaTableCellClickModal [data-type=book_button]').attr("data-book-centrename", centreName);
                                $('#BookViaTableCellClickModal [data-type=book_button]').attr("data-book-vaccine", vacName);
                            }
                            $('#BookViaTableCellClickModal [data-type=slots_select] select').dropdown('hide menu');
                        }
                    });
                    $('#BookViaTableCellClickModal [data-type=slots_select]').show();
                }
                
                closeDropDown();
                setTimeout(closeDropDown, 500);
             }
        });

        $('#BookViaTableCellClickModal [data-type=vaccine_name]').show();
        $('#BookViaTableCellClickModal [data-type=centre_name]').show();
        $('#BookViaTableCellClickModal [data-type=user_select]').show();
        $('#BookViaTableCellClickModal [data-type=book_button]').show();
        $('#BookViaTableCellClickModal [data-type=book_button]').attr("data-book-payload", "");
        $('#BookViaTableCellClickModal [data-type=book_button]').addClass("disabled");
    };

    let failfunc = function (status) {
        $('#BookViaTableCellClickModal [data-type=loading_anim]').hide();
        $('#BookViaTableCellClickModal [data-type=error_message_content]')[0].innerText = "Try after some time";
        $('#BookViaTableCellClickModal [data-type=book_button]').attr("data-book-payload", "");
        $('#BookViaTableCellClickModal [data-type=book_button]').addClass("disabled");

        if (status == STATUS.E_LOGOUT || status == STATUS.E_SESSION_EXPIRE) {
            $('#BookViaTableCellClickModal [data-type=error_message_content]')[0].innerText = "You are not logged in";
            $('#BookViaTableCellClickModal [data-type=error_message_log_in_button]').show();
            $('#BookViaTableCellClickModal [data-type=error_message_log_in_button]').click(function () {
                $('#BookViaTableCellClickModal').modal('hide');
                ShowBookingDialogInternal(false);
            });
        }
        $('#BookViaTableCellClickModal [data-type=error_message]').show();
        $('#BookViaTableCellClickModal [data-type=error_message_content]').show();
    };

    GetAccountDetails(sucfunc, failfunc);
}

function VaccineInfoCardFinalBookClicked(that)
{
    let payload = $('#BookViaTableCellClickModal [data-type=book_button]').attr("data-book-payload");
    if (payload != "")
    {
        try {
            payloadJson = JSON.parse(payload);
            let userId = $('#BookViaTableCellClickModal [data-type=book_button]').attr("data-book-userId");
            let centreName = $('#BookViaTableCellClickModal [data-type=book_button]').attr("data-book-centrename");
            let vacName = $('#BookViaTableCellClickModal [data-type=book_button]').attr("data-book-vaccine");

            $('#BookViaTableCellClickModal [data-type=loading_anim] .header')[0].innerText = "Booking ...";
            $('#BookViaTableCellClickModal [data-type=loading_anim] p')[0].innerHTML = "Wait while we book the slot for you.";
            $('#BookViaTableCellClickModal [data-type=loading_anim]').show();
            $('#BookViaTableCellClickModal [data-type=book_button]').addClass("disabled");
            $('#BookViaTableCellClickModal [data-type=book_button]').attr("data-book-payload", "");
            $('#BookViaTableCellClickModal [data-type=book_button]').hide();

            $('#BookViaTableCellClickModal [data-type=vaccine_name]').hide();
            $('#BookViaTableCellClickModal [data-type=centre_name]').hide();
            $('#BookViaTableCellClickModal [data-type=user_select]').hide();
            $('#BookViaTableCellClickModal [data-type=slots_select]').hide();
            
            let successFun = function () {
                let userName = g_persistent_vars.g_booking_state_users_details_get_by_user_id(userId).name;
                let slot = payloadJson.slot;
                $('#BookViaTableCellClickModal [data-type=loading_anim]').hide();
                $('#BookViaTableCellClickModal [data-type=loading_anim] .header')[0].innerText = "Booking successful!";
                $('#BookViaTableCellClickModal [data-type=loading_anim] p')[0].innerHTML = '<table class="ui small table"><tbody><tr><td><b>Name:</b></td><td>' + userName + '</td></tr><tr><td><b>Vaccine:</b></td><td>' + vacName + '</td></tr><tr><td><b>Slot:</b></td><td>' + slot + '</td></tr><tr><td><b>Centre:</b></td><td>' + centreName + '</td></tr></tbody></table>';
                $('#BookViaTableCellClickModal [data-type=loading_anim] [data-type=circle_loading]').hide();
                $('#BookViaTableCellClickModal [data-type=loading_anim] [data-type=tick_gif]').show();
                $('#BookViaTableCellClickModal [data-type=loading_anim]').show();
            };

            let failFun = function () {
                $('#BookViaTableCellClickModal [data-type=loading_anim]').hide();
                
                
                $('#BookViaTableCellClickModal [data-type=error_message] .header')[0].innerText = "Booking failed";
                $('#BookViaTableCellClickModal [data-type=error_message_content]')[0].innerHTML = "Error occured during booking. Try later";
                $('#BookViaTableCellClickModal [data-type=error_message]').show();
                $('#BookViaTableCellClickModal [data-type=error_message_content]').show();
            };

            TryAutoBookInternal(payloadJson, userId, centreName, false, successFun, failFun);
        }
        catch (e)
        {
            console.error("Error parsing booking payload", payload, that);
        }
        
    }
}