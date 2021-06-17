const g_booking_config_encryption_secret1 = "b5cab167-7977-4df1-8027-a63aa144f04e";
const g_booking_config_encryption_secret2 = "CoWIN@$#&*(!@%^&";//Key
const g_booking_config_secret = "U2FsdGVkX194jQCChEwkQBXzvshC6bewrzI96RXGqwopnQMmteiKcarRFTwVmjraC1fqnT6TjpzR3tg0A8DdzQ==";

g_booking_state_last_transaction_id = "";
g_booking_state_auto_booking_on = false;//autobook button is clicked and autobook is active currently


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
    tata.success("Login success", "You have successfully logged in");
    $('#InputOtpToVerify').hide();
    $('#UserLoggedIn').show();
    $('#BookingAccountDetails,#BookingBookingSettings').show();
    GetAccountDetails();
    }).catch(error => {
        tata.error("OTP Error", "OTP incorrect or timed out");
        $('#BookingFormDimmer').removeClass('active');
    });

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

    }).catch(error => {
        error.then(resText => {
            let bLogOut = true;
            if(resText == "Unauthenticated access!")
            {
                console.error("Unauthenticated access");
                tata.error("Error", "Unauthenticated access");
                bLogOut = true;
            } else
            {
                try {
                    resTextJ = JSON.parse(resText);
                    if ((resTextJ.errorCode == "APPOIN0019") || (resText.error.includes("No beneficiary found for provided beneficiary mobile number") == true))
                    {
                        $('#NoUsersRegisteredMessage').show();
                        tata.warn("No beneficiaries", "Add beneficiaries using CoWin portal");
                        bLogOut = false;
                    }
                }
                catch (e)
                {
                    console.error("error parsing response text", resText);
                    bLogOut = true;
                }
            }
            if (bLogOut) {
                BookingLogOut();
            }
        });
    });
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
    $('#BookingSettings .menu .item').tab({history:false});
    $('#btn_auto_book').click(OnAutoBookClick);
    $('#BookingFormLogOut').click(BookingLogOut);
    $('#BookingDialogBookingSettingsDelay').dropdown();
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
                                        TryAutoBookInternal(bookPayload, userId, name);
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
        g_persistent_vars.g_booking_state_users_to_auto_book_settings_remove(userId);

        if (g_persistent_vars.g_booking_state_users_to_auto_book_get().size == 0)
        {
            StopAutoBook();
        }

        tata.success("Slot booked", userDetails.name + "<br />" + centreName + "<br/>" + payload.slot, {holding:true});
        
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