    //config
    const g_config_daystoShow = 7;
    const g_config_refresh_interval_default = 5;
    const g_config_refresh_interval_min     = 2;
    const g_config_refresh_interval_max     = 600;
    
    //filters
    g_filter_count = 0; //count of enabled filters
    g_filter_age_18to45                         = new Boolean(false);
    g_filter_age_45plus                         = new Boolean(false);
    g_filter_vaccine_covishield                 = new Boolean(false);
    g_filter_vaccine_covaxin                    = new Boolean(false);
    g_filter_vaccine_sputnikv                   = new Boolean(false);
    g_filter_vaccine_dose_1                     = new Boolean(false);
    g_filter_vaccine_dose_2                     = new Boolean(false);
    
    //cache
    g_cache_all_centres = []; // data fetched from xhr. before applying filters.
    g_cache_filtered_data = []; //filtered data shown in table. useful for comparing changes in filtered data
    g_cache_state_id_map = {};
    g_cache_district_id_map = {};

    //switch/states/option
    g_switch_alarm_on = false;
    g_state_refresh_interval_current_val_minutes = g_config_refresh_interval_default;
    g_state_content_frame_loaded = false;
    g_state_auto_refresh_on = false;
    g_option_table_centres_show_all = false;
    g_option_table_centres_cell_show_details = false;

    //persistent switches
    g_switch_persistent_settings_auto_scroll = true;
    
    //special strings
    const g_url_param_value_remove_all = "url_param_value_remove_all";//if used as value in AddRemoveUrlParam() value will remove whole param from url, and not just a single value

    //stats
    g_stats_num_available_vaccines = 0

    //handles
    //set interval handle
    g_handle_data_table = null;//handle to vaccine table
    g_handle_refresh_interval_timer = null; //timer to auto refresh table
    g_handle_refresh_text_interval_timer = null;//timer shows count down seconds to next refersh
    g_handle_audio_alarm            = null; //so that only one audio plays at a time

    //states and districts
    g_statesSelected = new Set();
    g_districtsSelected = new Set();
    g_districtsAvailable = [];
    
    /*Start  https://stackoverflow.com/a/11381730/981766*/
window.mobileCheck = function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  };

  window.mobileAndTabletCheck = function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  };
  /*End*/

    /*Perf. Initially update chart frequently so that user doesn't feel that it is hung,
        reduce rate to be in sync with refresh interval so that we dont load chart
        with too much data.*/
    function PostChartUpdateIntervalMins()
    {
        $('#viewStatsContent')[0].contentWindow.postMessage({type:"chartUpdateIntervalMins", id:"parentFrame", g_state_refresh_interval_current_val_minutes:g_state_refresh_interval_current_val_minutes});
    }

    function PostNumVaccines()
    {
        $('#viewStatsContent')[0].contentWindow.postMessage({type:"avaialablevaccinesNum", id:"parentFrame", g_stats_num_available_vaccines:g_stats_num_available_vaccines});
    }

    function toggleDistricts()
    {
        if(g_statesSelected.size > 0)
        {
            $('#districts').removeClass("disabled");
            $('#districts').parent().removeClass("disabled");
        }
        else
        {
            $('#districts').addClass("disabled");
        }
    }
    
    function onDistrictAdd(value, text, $selectedItem)
    {
        let distInt = parseInt(value);
        if(!isNaN(distInt))
        {
            AddRemoveUrlParam(true, 'districts', distInt);
            g_districtsSelected.add(distInt);
        }
        else
        {
            console.error("invalid value", value, distInt);
        }
    }
    
    function onDistrictRemove(value, text, $selectedItem)
    {
        let distInt = parseInt(value);
        if(!isNaN(distInt))
        {
            AddRemoveUrlParam(false, 'districts', distInt);
            g_districtsSelected.delete(distInt);
        }
        else
        {
            console.error("invalid value", value, distInt);
        }
    }
    
    function filterData(data)
    {
        g_stats_num_available_vaccines = 0;

        let bAgeFilterApplied = false;
        let validAges = [];
        
        let bVaccineFilterApplied = false;
        let validVaccines = [];

        if(g_filter_age_18to45 == true)
        {
            validAges.push(18);
        }

        if(g_filter_age_45plus == true)
        {
            validAges.push(45);
        }

        if(validAges.length > 0)
        {
            bAgeFilterApplied = true;
        }

        if(g_filter_vaccine_covishield == true)
        {
            validVaccines.push("COVISHIELD");
        }

        if(g_filter_vaccine_covaxin == true)
        {
            validVaccines.push("COVAXIN");
        }

        if(g_filter_vaccine_sputnikv == true)
        {
            validVaccines.push("SPUTNIK V");
        }

        if(validVaccines.length > 0)
        {
            bVaccineFilterApplied = true;
        }

        /*g_filter_table_centres_show_all is now g_option_table_centres_show_all */
        /*since introduction of g_filter_table_centres_show_all flag filtering is done even when g_filter_count is 0
        Unlike other filters when g_filter_table_centres_show_all is ON it increases the number of rows in the result
        table rather than descreasing them
        */
        //let bSkipFiltering = (g_filter_count == 0);
        //if(bSkipFiltering)
        //{
        //    return data;
        //}
        //else
        //{
            let filteredData = [];
            data.forEach((centre, index) => {
                let filteredSessions = [];
                centre["sessions"].forEach((session, index) => {
                    let bAgeFilterPass = false;
                    let bVaccineFilterPass = false;

                    if((bAgeFilterApplied == false) || (validAges.includes(session["min_age_limit"])))
                    {
                        bAgeFilterPass = true;
                    }

                    if((bVaccineFilterApplied == false) || (validVaccines.includes(session["vaccine"])))
                    {
                        bVaccineFilterPass = true;
                    }

                    let availableCapacityTotal = session.available_capacity;
                    let availableCapacityDose1 = session.available_capacity_dose1;
                    let availableCapacityDose2 = session.available_capacity_dose2;
                    let availableCapacityToShow = availableCapacityTotal;
                    //sanity
                    if(availableCapacityTotal !== availableCapacityDose1 + availableCapacityDose2)
                    {
                        console.error("total vaccines != sum of dose 1, and 2", centre["name"], availableCapacityTotal, availableCapacityDose1, availableCapacityDose2);
                    }

                    if(g_filter_vaccine_dose_1 == true && g_filter_vaccine_dose_2 == false)
                    {
                        availableCapacityToShow = availableCapacityDose1;
                    }
                    else if(g_filter_vaccine_dose_1 == false && g_filter_vaccine_dose_2 == true)
                    {
                        availableCapacityToShow = availableCapacityDose2;
                    }

                    session["capacity_to_show"] = availableCapacityToShow;

                    if(bAgeFilterPass && bVaccineFilterPass)
                    {
                        filteredSessions.push(session);
                    }

                });

                let bVaccineAvailable = false;
                filteredSessions.forEach( session => 
                    {
                        let availableCapacityToShow = session["capacity_to_show"];
                        if(availableCapacityToShow > 0)
                        {
                            g_stats_num_available_vaccines += availableCapacityToShow;
                            bVaccineAvailable = true;
                        }
                    });

                if(g_option_table_centres_show_all == true || bVaccineAvailable == true)
                {
                    filteredData.push({name:centre["name"], sessions:filteredSessions});
                }
            });
            
            PostNumVaccines();
            return filteredData;
        //}
    }
    
    function convertDataToTable(data)
    {
        let selectedDate = dayjs($('#dateInput')[0].value, 'YYYY-MM-DD');
        let tableData = [];
        data.forEach((centre, index) => {
            let sessions = centre["sessions"];
            let daysData = {};
            for(let day = 0; day < g_config_daystoShow ; day++)
            {//generate calendar entries for 7 days of the week
                let calendarDate = selectedDate.add(day, 'day');
                let dayStr = "day" + day;
                daysData[dayStr] = {vaccine:"", available: -1, minAge: -1, slots:[]};
                sessions.forEach(session => 
                {
                    if(calendarDate.isSame(session.date, 'day') == true)
                    {
                            daysData[dayStr].vaccine = session["vaccine"];
                            daysData[dayStr].available = session["capacity_to_show"];//could be available_capacity, or available_capacity_dose1/available_capacity_dose2 depending on filters
                            daysData[dayStr].minAge = session["min_age_limit"];
                            daysData[dayStr].slots = session["slots"];
                    }
                })
            }
            centreData = Object.assign({}, {name:centre["name"]}, daysData);
            tableData.push(centreData);
        });
        
        return tableData;
        
    }
    
    function DetectChange(newData, oldData)
    {
        console.log(newData, oldData);
        let notifyInfo = {};
        for(let i = 0; i < newData.length ; i++)
        {
            let bExistingCentre = false;
            let newCentre = newData[i];
            for(let j = 0; j < oldData.length ; j++)
            {
                let oldCentre = oldData[j];

                if(newCentre.name == oldCentre.name)
                {
                    bExistingCentre = true;
                    let sessionsToNotify = [];
                    for(let l = 0; l < newCentre.sessions.length; l++)
                    {
                        let newSession = newCentre.sessions[l];
                        let notifyUser = true;//notify user if this is a new session (of existing centre) or an existing session has more vaccines available
                        if(newSession.capacity_to_show == 0)
                        {
                            notifyUser = false;
                        }
                        for(let m = 0; m < oldCentre.sessions.length; m++)
                        {
                            let oldSession = oldCentre.sessions[m];
                            if(newSession.date.isSame(oldSession.date, 'day') && newSession.session_id == oldSession.session_id)
                            {
                                if(newSession.capacity_to_show <= oldSession.capacity_to_show)
                                {
                                    notifyUser = false;
                                }
                                else
                                {
                                    console.log("new vaccines", newCentre.name, "diff", newSession.capacity_to_show - oldSession.capacity_to_show,newSession, oldSession);
                                }
                            }
                        }

                        if(notifyUser == true)
                        {
                            console.log(newSession);
                            sessionsToNotify.push(newSession);
                        }
                    }
                    if(sessionsToNotify.length > 0)
                    {
                        notifyInfo[newCentre.name] = sessionsToNotify;
                    }
                    break;
                }
            }

            if(bExistingCentre == false)
            {//new centre
                console.log("new centre", newCentre);
                let sessionsToNotify = [];
                for(let l = 0; l < newCentre.sessions.length; l++)
                {
                    let newSession = newCentre.sessions[l];
                    if(newSession.capacity_to_show > 0)
                    {
                        sessionsToNotify.push(newSession);
                    }
                }
                if(sessionsToNotify.length > 0)
                {
                    notifyInfo[newCentre.name] = sessionsToNotify;
                }
            }
        }
        let centreNames = Object.keys(notifyInfo);
        if(centreNames.length > 0)
        {
            let title = "New Vaccines Available!";
            let caption = "";
            centreNames.forEach(name => {
                caption += name;
                caption += "\t";
                let sessions = notifyInfo[name];
                sessions.forEach(
                    session => {
                        caption += session.date.format("D MMM");
                        caption += "\t";
                    }
                );
                caption += "<br />";
            });

            let stopAudio = function(){g_handle_audio_alarm.pause();};
            if(g_handle_audio_alarm != null)
            {
                if(g_handle_audio_alarm.ended == false)
                {
                    stopAudio();
                }
            
                g_handle_audio_alarm.loop = true;
                if(g_switch_alarm_on == true)
                {
                    g_handle_audio_alarm.play();
                }
            }
            
            tata.success(title, caption, {position:'br', holding:true, onClick: stopAudio, onClose: stopAudio});
            
            
            console.log(notifyInfo);
        }
    }

    function CreateTable(bCallAlarm = false /*Show notification, and sound alarm*/, bAutoScroll = true /*Auto scroll down to results table*/, bShowScrollNotif = true/*Show notification that you may have to scroll*/)
    {
        let tableColumns = [{data: 'name', title: 'Centre name'}];
            let selectedDate = new Date($('#dateInput')[0].value);
            for(let day = 0; day < g_config_daystoShow ; day++)
            {
                let nextDate = new Date(selectedDate);
                nextDate.setDate(nextDate.getDate() + day);
                nextDateDjs = dayjs(nextDate);
                tableColumns.push({data: "day" + day, title:nextDateDjs.format('ddd MMM DD'), "orderSequence": [ "desc", "asc"],
                //type:"html-num-fmt",
                type:"format_cust_vacc_available" /*So that sorting is handled by $.fn.dataTable.ext.type.order[format_cust_vacc_available-pre]*/,
                render: function(data, type)
                {
                    let numAvail = data["available"];
                    let btnClr = "grey";
                    let btnContent = "NA";
                    switch(numAvail)
                    {
                        case -1:
                            btnClr = "grey";
                            btnContent = "NA";
                            break;
                        case 0:
                            btnClr = "red";
                            btnContent = "0";
                            break;
                        default:
                        if(numAvail < 10)
                        {
                            btnClr = "yellow";
                            btnContent = String(numAvail);
                        }
                        else if(numAvail >= 10)
                        {
                            btnClr = "green";
                            btnContent = String(numAvail);
                        }
                        else
                        {
                            console.error("Unexpected number of available slots");
                        }
                    }
                    
                    /*Modify $.fn.dataTable.ext.type.order regex when chaning this*/
                    let btnHtml = '<span>' + '<button style=" cursor: default;" class="mini ui ' + btnClr + ' button">' + btnContent + '</button>' +  '</span>';
                    return btnHtml;
                }
                });
            }
            
            let newFilteredData = filterData(g_cache_all_centres);
            let oldFiltereddata = g_cache_filtered_data;

            if(bCallAlarm == true)
            {
                let bAutoRefreshOn = ($('#input_auto_refresh_interval_parent').hasClass('disabled') == false);
                if(bAutoRefreshOn == true)
                {
                    DetectChange(newFilteredData, oldFiltereddata);
                }
            }

            g_cache_filtered_data = newFilteredData.slice();
            
            let tableData = convertDataToTable(newFilteredData);
            
            $.fn.dataTable.ext.type.order['format_cust_vacc_available-pre'] = function ( data ) 
            {
                let numVacs = data.match(/(<span><button style=".+?" class=".+?">)(?<numVac>.+?)(<\/button><\/span>)/i).groups.numVac;
                if(numVacs === "NA" )
                {
                    return -1;
                }
                else
                {
                    numVacsInt = parseInt(numVacs);
                    if(!isNaN(numVacsInt))
                    {
                        return numVacsInt;
                    }
                    else
                    {
                        console.error("Error ordering. invalid value in cell", numVacs, data);
                    }
                }
            };

            let bIsMobileDevice = window.mobileCheck();
            console.info("bIsMobileDevice", bIsMobileDevice);
            let showAllBtnClasses = "ui toggle button filter basic tableOptionsButtonInner";
            if(g_option_table_centres_show_all == true)
            {
                showAllBtnClasses += " active";
            }
            else
            {
                showAllBtnClasses += " grey";
            }

            let showDetailsBtnClasses = "ui toggle button filter basic tableOptionsButtonInner";
            if(g_option_table_centres_cell_show_details == true)
            {
                showDetailsBtnClasses += " active";
            }
            else
            {
                showDetailsBtnClasses += " grey";
            }

            g_handle_data_table = $('#centreList').DataTable({
                destroy:true,
                data:tableData,
                responsive: bIsMobileDevice,
                scrollX: true,
                lengthMenu:[[50, 100, -1], [50, 100, "All"]],
                pageLength: 50,
                columns: tableColumns,
                language: {
                    "search" : "",
                    "searchPlaceholder" : "Search..."
                },
                dom: 'Blfrtip',
                buttons: [{
                    extend: 'collection',
                    className: 'ui toggle button filter grey basic tableOptionsButtonOuter',
                    text: '☰',
                    background : false,
                    autoClose : false,
                    buttons : [{
                        text : "Show all",
                        className: showAllBtnClasses,
                        action : onTableOptionsButtonInnerClicked,
                        attr: {
                            id:"option_table_centres_show_all"
                        }
                    },
                    //{
                    //    text:"Show Details",
                    //    className: showDetailsBtnClasses
                    //}
                    ]
                }],
            });

            //g_handle_data_table.columns.adjust().responsive.recalc();
        
            if(bShowScrollNotif == true)
            {
                tata.info('Results obtained', '<p style="cursor:pointer">You may have to scroll down to view them, or <b>click here</b></p>',{onClick:function()
                {
                    $('html, body').animate({scrollTop: $("#centreList_wrapper").offset().top -100}, 600);
                }});                
            }

            if(g_switch_persistent_settings_auto_scroll == true && bAutoScroll == true)
            {
                let scrollAnim = $('html, body').animate({scrollTop: $("#centreList_wrapper").offset().top -100}, 2000);
                let animStop = function(){scrollAnim.stop();};
                $(window).click(animStop);
                $(window).bind('mousewheel', function(event){
                    if(event.originalEvent.wheelDelta >= 0)
                    {//scroll up
                        animStop();
                    }
                });
            }

            console.log("stats", g_stats_num_available_vaccines, dayjs().toString());
            $('#vaccinesAvailableNumBlock').show();
            $('#vaccinesAvailableNum')[0].textContent = g_stats_num_available_vaccines;
    }
    
    function GetCentresData(callback_func)
    {
        let dateArr = $('#dateInput')[0].value.split('-');
        let dateStr = dateArr[2] + '-' + dateArr[1] + '-' + dateArr[0];
        let promises = [...g_districtsSelected].map(dist => { return fetch("https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=" + String(dist) +"&date=" + dateStr, {"referrerPolicy": "strict-origin-when-cross-origin", "body": null, "method": "GET", "mode": "cors",  "credentials": "omit"});});
        Promise.all(promises).then(responses => {return Promise.all(responses.map(response => {return response.json();}));})
        .then(function(data) 
        {
            let centresTable = [];
            data.forEach(centres => {
                centres.centers.forEach(centre => {
                    let cName = centre["name"];
                    let cSessions = centre["sessions"];
                    let cSessions2 = [];
                    cSessions.forEach(session => {
                        let cDate = session["date"];
                        let cDateObj = dayjs(cDate, 'DD-MM-YYYY');
                        session["date"] = cDateObj;
                        cSessions2.push(session);
                    });
                    
                    let cInfo = {name:cName, sessions:cSessions2};
                    centresTable.push(cInfo);
                });
            });

            g_cache_all_centres = centresTable;
            callback_func();
        });
    }
    
    function RefreshAll(bCallAlarm = false, bScroll = true/*Scroll to results table*/)
    {
        GetCentresData(function (){CreateTable(bCallAlarm, bScroll);});
    }

    function RefreshAllTimer()
    {
        tata.info('Timer', 'Auto refresh data', {duration:5000});
        console.info('Timer', 'Auto refresh data');
        RefreshAll(true, false);
        
        $('#AutoRefreshRecordTimeRemaing')[0].textContent = g_state_refresh_interval_current_val_minutes * 60;
        
        PostChartUpdateIntervalMins();
    }
    
    function IsValidFilterString(filterStr)
    {
        let bValid = false;

        if(filterStr.match(/filter_.+/i) != null)
        {
            bValid = true;
        }
        return bValid;
    }

    /*Sanity - remove duplicates, etc.*/
    function SanitizeUrl(urlString, pushState)
    {
        if($.type(urlString) !== 'string')
        {
            tata.error('Code error', 'Check console for details', {duration:5000});
            console.error("expect urlString to be a string", urlString, $.type(urlString), typeof urlString);
            return;
        }

        let uSp = new URLSearchParams(urlString);
        let params = (new Set(Array.from(uSp.keys())));
        let uSp2 = new URLSearchParams("");
        params.forEach( param => 
        {
            let uVal  = uSp.getAll(param).join(",");
            let uValSet = new Set(uVal.split(","));
            let uVal2 = [];
            uValSet.forEach(val => 
                {
                    let bValidVal = false;
                    if(param == 'filters' && IsValidFilterString(val))
                    {
                        bValidVal = true;
                    }
                    if(!isNaN(parseInt(val, 10)))
                    {
                        bValidVal = true;
                    }

                    if(bValidVal == true)
                    {
                        uVal2.push(val);
                    }
                    else
                    {
                        console.error("invalid param",uVal2, uVal);
                    }
                });
            let uVal2Str = uVal2.join(",");
            uSp2.set(param, uVal2Str);
        });

        if(pushState == true)
        {
            history.pushState(null, "", "?" + decodeURIComponent(uSp2.toString()));
        }
        else
        {
            history.replaceState(null, "", "?" + decodeURIComponent(uSp2.toString()));
        }
    }

    function ProcessQueryParams()
    {
        let bValidStatesParams = false;
        let bValidDistrictsParams = false;

        let sString = window.location.search;

        SanitizeUrl(sString, false);

        sString = window.location.search; //re-init as sanity might have changed things
        let uSp = new URLSearchParams(sString);

        //more sanity
        let validUrlParams = ['states', 'districts', 'date', 'filters'];
        let allUrlParams = Array.from(uSp.keys());
        allUrlParams.forEach(urlParam => 
            {
                if(!validUrlParams.includes(urlParam))
                {
                    console.error("Unsupported parameter", urlParam, allUrlParams);
                    AddRemoveUrlParam(false, urlParam, g_url_param_value_remove_all);
                }
            });

        sString = window.location.search; //re-init as sanity might have changed things
        uSp = new URLSearchParams(sString);

        validUrlParams.forEach(urlParam => 
            {
                let uVal = "";
                if(urlParam == 'date')
                {
                    uVal = uSp.get(urlParam);//can't use get all. there can only be a single date parameter, and also a single value
                }
                else
                {
                    uVal = uSp.getAll(urlParam).join(',');
                }

                let listToModify = [];

                switch(urlParam)
                {
                    case 'states':
                        listToModify = g_statesSelected;
                        break;
                    case 'districts':
                        listToModify = g_districtsSelected;
                        break;
                    case 'date':
                    case 'filters':
                        listToModify = null;
                        break;
                    default:
                        console.error("unexpected urlParam. Sanitization code failed?", urlParam);
                }

                if(urlParam == 'states' || urlParam == 'districts')
                {
                    if(uVal != null && uVal != "")
                    {
                        if(uVal.match(/[0-9,]+/i) != null)
                        {
                            let vals = new Set(uVal.split(","));//unique
                            vals.forEach(valStr => 
                            {
                                let valInt = parseInt(valStr, 10);
                                if(!isNaN(valInt))
                                {
                                    listToModify.add(valInt);

                                    if(urlParam == 'states')
                                    {
                                        bValidStatesParams = true;
                                    }
                                    else if(urlParam == 'districts')
                                    {
                                        bValidDistrictsParams = true;
                                    }
                                }
                                else
                                {
                                    console.error("error parsing string as int", valStr);
                                }
                            });
                        }
                        if(urlParam == 'districts' && bValidDistrictsParams == true)
                        {
                            GetDistricts();
                        }
                        else if(urlParam == 'states' && bValidStatesParams == true)
                        {
                            GetStates();
                        }
                    }
                }else 
                if(urlParam == 'date')
                {
                    if(uVal != null && uVal != "")
                    {
                        let bValidDate = false;
                        if(dayjs(uVal, 'YYYY-MM-DD', true).isValid() == true)
                        {
                            if(!isNaN(Date.parse(uVal)))
                            {
                                if(IsDateInPast(uVal) == true)
                                {
                                    tata.error('Date error','The past can\'t hurt you anymore, unless you let it <i>~V.</i>', {duration:5000});
                                    let today = new Date();
                                    $('#dateInput')[0].valueAsDate = today;
                                    uVal = dayjs(today).format('YYYY-MM-DD');
                                    AddRemoveUrlParam(true, urlParam, uVal);
                                }
                                bValidDate = true;
                                $('#dateInput')[0].value = uVal;
                            }
                        }
                    
                        if(bValidDate == false)
                        {
                            tata.error('Invalid date', 'Check console for details', {duration:5000});
                            console.error('Invalid date', uVal);
                            AddRemoveUrlParam(false, urlParam, uVal);
                        }
                    }
                }else
                if(urlParam == 'filters')
                {
                    if(uVal != null && uVal != "")
                    {
                        let vals = new Set(uVal.split(","));//unique
                        vals.forEach(val => 
                            {
                                if(IsValidFilterString(val))
                                {
                                    SwitchFilter(true, val, false, true);
                                }
                                else
                                {
                                    console.error("Invalid filter", val);
                                    AddRemoveUrlParam(false, urlParam, val);
                                }
                            });
                    }
                }
            });

            if(bValidStatesParams == true && bValidDistrictsParams == true)
            {
                RefreshAll(false, true);
            }
    }

    function AddRemoveUrlParam(/*bool*/ bAdd, paramName, paramValue)//eg. 1,states,10 to add state ID 10
    {
        let sString = window.location.search;
        let uSp = new URLSearchParams(sString);
        let uVal = uSp.get(paramName);
        
        if(bAdd)
        {
            if( uVal == null || uVal == "" || paramName == 'date')
            {
                uSp.set(paramName, String(paramValue));
            }
            else
            {
                /*prevent duplicates*/
                let vals = new Set(uVal.split(","));
                
                if(vals.has(paramValue) == false)
                {
                    uSp.set(paramName, uVal + "," + String(paramValue));
                }
            }
        }
        else
        {
            if( uVal != null)
            {
                uVal = uVal.replace(paramValue, "");
                uVal = uVal.replace(",,", ",");//remove any consequent ,
                
                if(uVal != "")
                {
                    if(uVal == ",")
                    {
                        uVal="";
                    }
                    else if(uVal[0] == ",")
                    {
                        uVal = uVal.substring(1);
                    }
                    else if(uVal.endsWith(",") == true)
                    {
                        uVal = uVal.slice(0,-1);
                    }
                }

                if(uVal == ""  || paramName == 'date' || paramValue == g_url_param_value_remove_all)
                {
                    uSp.delete(paramName)
                }
                else
                {
                    uSp.set(paramName, uVal);
                }
            }
        }
        
        SanitizeUrl(decodeURIComponent(uSp.toString()), true);
    }
    
    function GetStates()
    {
        fetch("https://cdn-api.co-vin.in/api/v2/admin/location/states", {
        
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "omit"
        }).then(response => {return response.json();})
        .then(data => {
        let stateList = [];
        data["states"].forEach((state, index) => 
        {
            let stateId = state["state_id"];
            let stateName = state["state_name"];
            
            g_cache_state_id_map[stateId] = stateName;
            let bSelected = false;
            if(g_statesSelected.has(stateId) == true)//already selected for eg. due to query string parameters
            {
                bSelected = true;
            }
            stateList.push({name:stateName, value:stateId, selected:bSelected});
        });
        
        localStorage.setItem('g_cache_state_id_map', JSON.stringify(g_cache_state_id_map));
        
        $('#states').dropdown({values:stateList, placeholder:"Select states",
        onChange: function(value, text, $selectedItem){console.log("onChange", value, text, $selectedItem);},
        onAdd: function(value, text, $selectedItem)
        {
            let stateInt = parseInt(value);
            if(!isNaN(stateInt))
            {
                AddRemoveUrlParam(true, 'states', stateInt);
                g_statesSelected.add(stateInt);
            }else
            {
                console.error("invalid value", value, stateInt);
            }
        },
        onShow : function(){console.log("onshow");},
        onHide : function(){console.log("onhide");},
        onRemove: function(value, text, $selectedItem)
        {
            let stateInt = parseInt(value);
            if(!isNaN(stateInt))
            {
                AddRemoveUrlParam(false, 'states', stateInt);
                g_statesSelected.delete(stateInt);
            }
            else
            {
                console.error("invalid value", value, stateInt);
            }
        },
        });
        }).catch(error => {
            tata.error("Network error", "Error connecting to cowin servers<br/ >Retry after some time", {holding:true});
            console.error(error);
        });
    }
    
    function IsDateInPast(dateStr)
    {
        let today = new Date();
        let todayDjs = dayjs(today);
        let dateDjs = dayjs(dateStr, 'YYYY-MM-DD');
        //isSame(session.date, 'day')
        if(dateDjs.isBefore(todayDjs, 'day') == true)
        {
            return true;
        }
        return false;
    }

    function OnDateChange(e)
    {
        let selectedDate = $('#dateInput')[0].value;
        if(IsDateInPast(selectedDate) == true)
        {
            let today = new Date();
            $('#dateInput')[0].valueAsDate = today;
            
            let todayDjs = dayjs(today);
            $('#dateInput').attr("min", todayDjs.format('YYYY-MM-DD'));

            tata.error('Date error','The past can\'t hurt you anymore, unless you let it <i>~V.</i>', {duration:5000});
        }
        else
        {
            AddRemoveUrlParam(true, 'date', selectedDate);
        }
    }

    /*TODO: need to make this idempotent in case prog a filter is attempted to be enabled twice g_filter_count will increment
    unnecessarily. Do this only if you see a bug.*/
    function SwitchFilter(bFilterOn/*true to turn on*/, filterString /*string: name of filter*/, bUpdateUrl, bUpdateUi = false)
    {
        let bValidFilter = IsValidFilterString(filterString);

        if(bValidFilter == true)
        {
            switch(filterString)
            {
                case "filter_age_18_45":
                    g_filter_age_18to45 = bFilterOn;
                break;
                case "filter_age_45_plus":
                    g_filter_age_45plus = bFilterOn;
                break;
                case "filter_vaccine_covishield":
                    g_filter_vaccine_covishield = bFilterOn;
                break;
                case "filter_vaccine_covaxin":
                    g_filter_vaccine_covaxin = bFilterOn;
                break;
                case "filter_vaccine_sputnikv":
                    g_filter_vaccine_sputnikv = bFilterOn;
                break;
                case "filter_vaccine_dose_1":
                    g_filter_vaccine_dose_1 = bFilterOn;
                break;
                case "filter_vaccine_dose_2":
                    g_filter_vaccine_dose_2 = bFilterOn;
                break;
                default:
                    bValidFilter = false;
                    console.error("invalid filter");
                break;
            }
        }

        if(bUpdateUi == true && bValidFilter == true)
        {
            if(bFilterOn)
            {
                $("#" + filterString).removeClass('grey');
                $("#" + filterString).removeClass('basic');
                $("#" + filterString).addClass('active');
            }
            else
            {
                $("#" + filterString).addClass('grey');
                $("#" + filterString).addClass('basic');
                $("#" + filterString).removeClass('active');
            }
        }

        if(bValidFilter === true)
        {
            if(bFilterOn === true)
            {
                g_filter_count++;
            }
            else
            {
                g_filter_count--;
            }

            if(bUpdateUrl === true)
            {
                AddRemoveUrlParam(bFilterOn, 'filters', filterString);
            }

            if(g_cache_all_centres.length > 0)
            {//recreate table if valid data present
                CreateTable(false, false);
            }
        }

        console.log(bFilterOn, g_filter_count);
    }

function OnFilterClicked(e,t)
{
    let filterOn = new Boolean(false);
    if(e.currentTarget.classList.contains("active"))
    {
        filterOn = true;
        console.log("filer activated");
    }
    else
    {
        filterOn = false;
        console.log("filer deactivated");
    }
    
    console.log(e.currentTarget.id);
    
    let filterStr = e.currentTarget.id;

    SwitchFilter(filterOn, filterStr, true, true);

}

function onTableOptionsButtonInnerClicked(e,t)
{
    let buttons = g_handle_data_table.buttons();

    for(let i = 0; i < buttons.length ; i++)
    {
        if(buttons[i].node.id == 'option_table_centres_show_all')
        {
            if(g_option_table_centres_show_all == true)
            {//was active, is to be deactivated now
                g_option_table_centres_show_all = false;
                buttons[i].node.classList.add('grey');
                buttons[i].node.classList.remove('active');
            }
            else
            {
                g_option_table_centres_show_all = true;
                buttons[i].node.classList.add('active');
                buttons[i].node.classList.remove('grey');
            }

            if(g_cache_all_centres.length > 0)
            {//recreate table if valid data present
                CreateTable(false, false, false);
            }
        }
    }
}

function GetDistricts()
{
    
    g_districtsAvailable = [];
  
    g_statesSelected.forEach((state, index) => 
    {
      fetch("https://cdn-api.co-vin.in/api/v2/admin/location/districts/" + String(state), {
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "omit"
          }).then(response => response.json())
          .then(data => 
          {
              let dists = data["districts"];
              let distSelected = new Set(g_districtsSelected);
              let bFoundSelectedDist = false;
              dists.forEach((dist, index) => 
              {
                  let distName = dist["district_name"];
                  let distId = dist["district_id"];

                  g_cache_district_id_map[distId] = distName;

                  let bSelected = false;
                  if(distSelected.has(distId) == true)//already selected for eg. due to query string parameters
                  {
                      distSelected.delete(distId);
                      bSelected = true;
                      bFoundSelectedDist = true;
                  }

                  g_districtsAvailable.push({name:distName, value:distId, selected:bSelected});
              });

              if(distSelected.size > 0)
              {
                  //console.error()
              }

              let districtIdMap = {};
              let districtIdMapStr = localStorage.getItem('g_cache_district_id_map');

              if( districtIdMapStr != null)
              {
                  districtIdMap = JSON.parse(districtIdMapStr);
              }

              g_cache_district_id_map = Object.assign({}, districtIdMap, g_cache_district_id_map);
              localStorage.setItem('g_cache_district_id_map', JSON.stringify(g_cache_district_id_map));

              let distSelectedNames = [];
              if(bFoundSelectedDist == true)
              {
                g_districtsSelected.forEach(distId => 
                  {
                      let distName = g_cache_district_id_map[distId];
                      distSelectedNames.push(distName);
                  });
              }

              $('#districts').dropdown({values:g_districtsAvailable, placeholder:"Select districts", onAdd:onDistrictAdd, onRemove:onDistrictRemove});
              $('#districts').dropdown("setup menu", {values:g_districtsAvailable});
              if(distSelectedNames.length > 0)
              {
                $('#districts').dropdown("set exactly", distSelectedNames);
              }
              toggleDistricts();
          });
    });
}

    function OnAutoRefreshIntervalChange(e,t)
    {
        if(g_handle_refresh_interval_timer != null)
        {
            clearInterval(g_handle_refresh_interval_timer);
            g_handle_refresh_interval_timer = null;
        }

        let intervalTimeMinsStr = ($('#input_auto_refresh_interval')[0].value);
        let intervalTimeMinsInt = parseInt(intervalTimeMinsStr);
        if(isNaN(intervalTimeMinsInt) || intervalTimeMinsInt < g_config_refresh_interval_min || intervalTimeMinsInt > g_config_refresh_interval_max)
        {
            intervalTimeMinsInt = g_config_refresh_interval_default;
            $('#input_auto_refresh_interval')[0].value = intervalTimeMinsInt;
        }
        
        g_state_refresh_interval_current_val_minutes = intervalTimeMinsInt;
        let intervalTimeMilliSecInt = g_state_refresh_interval_current_val_minutes * 60 * 1000;
        g_handle_refresh_interval_timer = setInterval(RefreshAllTimer, intervalTimeMilliSecInt);

        $('#AutoRefreshRecordTimeRemaing')[0].textContent = g_state_refresh_interval_current_val_minutes * 60 ;
        
    }

    function UpdateTimerText()
    {
        let text = $('#AutoRefreshRecordTimeRemaing')[0].textContent;
        if(text!="")
        {
            textInt = parseInt(text);
            if(!isNaN(textInt))
            {
                textInt -= 1;
                if(textInt<=0)
                {
                    textInt = 0;
                }
                $('#AutoRefreshRecordTimeRemaing')[0].textContent = textInt;
            }
        }
    }

    function SetAlarmOn(bTurnOn)
    {
        if(bTurnOn)
        {
           $("#alarm_vaccine_icon").removeClass("slash");
           $("#alarm_vaccine_icon").addClass("green");
           g_switch_alarm_on = true;
        }
        else
        {
           $("#alarm_vaccine_icon").addClass("slash");
           $("#alarm_vaccine_icon").removeClass("green");
           g_switch_alarm_on = false;
        }
    }
 
    function OnAutoRefreshClick(e,t)
    {
        let buttonOn = new Boolean(false);
        if(e.currentTarget.classList.contains("active"))
        {
            buttonOn = true;
        }
        else
        {
            buttonOn = false;
        }

        if(g_handle_refresh_interval_timer != null)
        {
            clearInterval(g_handle_refresh_interval_timer);
            g_handle_refresh_interval_timer = null;
        }

        if(g_handle_refresh_text_interval_timer != null)
        {
            clearInterval(g_handle_refresh_text_interval_timer);
            g_handle_refresh_text_interval_timer = null;
        }

        g_state_auto_refresh_on = buttonOn;

        SetAlarmOn(buttonOn)
        if(buttonOn === true)
        {
            $('#input_auto_refresh_interval_parent').removeClass('disabled');
            let intervalTimeMinsStr = ($('#input_auto_refresh_interval')[0].value);//interval in minutes
            let intervalTimeMinsInt = parseInt(intervalTimeMinsStr);
            if(!isNaN(intervalTimeMinsInt))
            {
                let intervalTimeMilliSecInt = intervalTimeMinsInt * 60 * 1000;
                g_state_refresh_interval_current_val_minutes = intervalTimeMinsInt;
                $('#AutoRefreshRecordTimeRemaing')[0].textContent = g_state_refresh_interval_current_val_minutes * 60;
                g_handle_refresh_interval_timer = setInterval(RefreshAllTimer, intervalTimeMilliSecInt);
                g_handle_refresh_text_interval_timer = setInterval(UpdateTimerText, 1000);
            }
            else
            {
                console.error("invalid value for interval", intervalTimeMinsStr, intervalTimeMinsInt);
            }
        }
        else
        {
            $('#input_auto_refresh_interval_parent').addClass('disabled');
            $('#viewStatsContent').hide();
        }

        $('#topBar').sidebar('toggle');
    }

function OnClickSettingsAutoScroll(e,t)
{
    let settingOn = new Boolean(false);
    if($('#SettingAutoScrollInput')[0].checked == true)
    {
        settingOn = true;
    }
    else
    {
        settingOn = false;
    }

    if(settingOn == true)
    {
        $('#SettingAutoScrollInput')[0].checked = true;
        g_switch_persistent_settings_auto_scroll = true;
    }
    else
    {
        $('#SettingAutoScrollInput')[0].checked = false;
        g_switch_persistent_settings_auto_scroll = false;
    }

    localStorage.setItem('g_switch_persistent_settings_auto_scroll', g_switch_persistent_settings_auto_scroll);
}

function ProcessPersistentVariables()
{
    let settingVal = localStorage.getItem('g_switch_persistent_settings_auto_scroll');
    if( settingVal == null || settingVal.toLowerCase() == "true")
    {
        g_switch_persistent_settings_auto_scroll = true;
    }
    else
    {
        g_switch_persistent_settings_auto_scroll = false;
    }

    $('#SettingAutoScrollInput')[0].checked = g_switch_persistent_settings_auto_scroll;
}

function OnViewMoreStatsClick(){
    if(g_state_auto_refresh_on == true)
    {
        $('#viewStatsContent').attr('src', 'stats.html');
        if($('#viewStatsContent').is(':visible') == false)
        {
            $('#viewStatsContent').show();
            $('#viewStatsContent').css('transform','translateY(10px)');
        }
        else
        {
            $('#viewStatsContent').hide();
        }
    }
    else
    {
        if($('#viewStatsContent').is(':visible') == false)
        {
            tata.error("Error", "Stats available only when auto refresh is ON")
        }
        else
        {
            $('#viewStatsContent').hide();
        }
    }
}

$(document).ready( function () 
{
    /*from https://stackoverflow.com/a/66407003/981766 */
document.head.appendChild(Object.assign(document.createElement("link"), {rel: "icon", href: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💉</text></svg>"}))

let today = new Date();
if($('#dateInput')[0].value == "")
{
    $('#dateInput')[0].valueAsDate = today;
}
let todayDjs = dayjs(today);
$('#dateInput').attr("min", todayDjs.format('YYYY-MM-DD'));

$('#dateInput').change(OnDateChange);

$('.ui.button.toggle').state();

$('.ui.button.toggle.filter').click(OnFilterClicked);
$('#btn_auto_refresh').click(OnAutoRefreshClick);
$('#input_auto_refresh_interval').change(OnAutoRefreshIntervalChange);

ProcessPersistentVariables();

ProcessQueryParams();
 
 $('#getCentresBtn').click(function(){
    OnDateChange();
     RefreshAll(false, true);
        });
 
 $('#getDistrictsBtn').click(function()
 {
    GetDistricts();
 });

 $('#siteTour').click(function()
 {
    introJs().setOptions({
        steps: [{
        title : "Covid Shots 💉",
        intro: "Welcome to website tour"
        }, 
        {
          element: document.querySelector('#states').parentElement,
          title: "Select one or more states",
          intro: "<img src=\"images/tour_states.png\" />"
        }, 
        {
            element: document.querySelector('#districts').parentElement,
            title: "Select one or more districts",
            intro: "<img src=\"images/tour_districts.png\" /><br />You can select multiple districts at once across all states selected previously"
         },
         {
            element: document.querySelector('#getCentresBtn').parentElement,
            title: "Get all data in a table",
            intro: "<img src=\"images/tour_table.png\" /><br /> You can sort each column on the number of vaccines available"
         },
         {
            element: document.querySelector('#filter_age_18_45').parentElement,
            title: "Filter results",
            intro: "<img src=\"images/tour_filters.png\" />"
         },
         {
            element: document.querySelector('#btn_auto_refresh'),
            title: "Auto refresh table",
            intro: "<img src=\"images/auto_refresh_time.png\" /> <img src=\"images/tour_auto_refresh_not_clicked.png\" /> <img src=\"images/tour_auto_refresh_clicked.png\" /> Refresh table every 5 minutes. Refresh interval can be configured"
         },
         {
            element: document.querySelector('#alarm_vaccine'),
            title: "Sound alarm",
            intro: "<img src=\"images/tour_alarm_not_clicked.png\" /> <img src=\"images/tour_alarm_clicked.png\" /> <p> When new vaccine slots become available</p>"
         },
         {
            element: document.querySelector('#viewStatsImgBtn'),
            title: "View stats",
            intro: "<img src=\"images/stats.png\" /> <p>View vaccine availability statistics</p>"
         },
         {
            title: "Share, Save, Bookmark Results",
            intro: "<img src=\"images/tour_url.png\" /> The address link contains input parameters so that you can share the state with others or bookmark it for quick reference. <br /> <b>example</b> <br/><div class='ui mini action input'><input type='text' value='https://covidshots.in/?states=9,12&date=2021-05-15&districts=631,143'><button class='ui teal right labeled icon button'><i class='copy icon'></i>Copy</button></div>"
         }

        ]
      }).start();
 });

 $('#navbarMoreBtn').dropdown({on:'hover'});
 $('#alarm_vaccine').popup({content:"Ring an alarm when new slots are found"});
 $('#alarm_vaccine').click(function(e,t){
     let bAutoRefreshOn = ($('#input_auto_refresh_interval_parent').hasClass('disabled') == false);
     if(bAutoRefreshOn == true)
     {
        if($("#alarm_vaccine_icon").hasClass("slash") == true)
        {
            SetAlarmOn(true);
        }
        else
        {
            SetAlarmOn(false);
        }
     }
     else
     {
        tata.error("Error", "Alarm works only when auto refresh is ON")
     }
 });

$('#SettingsDialogButton').click(function(e,t){
    $('#SettingsDialogModal').modal('show');
});

$('#AboutDialogButton').click(function(e,t){
    $('#AboutDialogModal').modal('show');
});


$('#SettingAutoScroll').checkbox();
$('#SettingAutoScroll').click(OnClickSettingsAutoScroll);

$('.ui.accordion').accordion();

g_handle_audio_alarm = new Audio('misc/mixkit-musical-reveal-961.wav');

let opac = 1;
let animateRefresh = function(){
    if(opac == 0)
        opac = 1
    else
        opac = 0
    $('#AutoRefreshRecordGif').animate({opacity:opac}, 400, function(){
        animateRefresh();
    });
}

$('#topBar').sidebar('setting', {closable: false, transition:'overlay' /*Push messes up fixed elemets' positioning*/, dimPage:false, onShow:function(){
    animateRefresh();
}});//.sidebar('toggle');

$('#viewStatsImgBtn').popup({content:"View more stats. Only works with auto refresh."});
$('#viewStatsImgBtn').click(OnViewMoreStatsClick);

GetStates();
});    

/*START https://codepen.io/desirecode/pen/MJPJqV*/

$(document).ready(function(){ 
    $(window).scroll(function(){ 
        if ($(this).scrollTop() > 100) { 
            $('#scrollToTop').fadeIn(); 
        } else { 
            $('#scrollToTop').fadeOut(); 
        } 
    }); 
    $('#scrollToTop').click(function(){ 
        $("html, body").animate({ scrollTop: 0 }, 600); 
        return false; 
    }); 
});
/*END*/

window.addEventListener("message", event => {
    if(event.data !="" && event.data.type == "iframeStatsLoaded" && event.data.id == "viewStatsContent")
    {
        console.log("message from iframe", event, $('#viewStatsContent')[0].contentWindow.document.body.offsetHeight);
        $('#viewStatsContent').height($('#viewStatsContent')[0].contentWindow.document.body.offsetHeight * 1.05);
        g_state_content_frame_loaded = true;
        PostNumVaccines();
        setTimeout(PostChartUpdateIntervalMins, g_state_refresh_interval_current_val_minutes * 60 * 1000);
    }
});