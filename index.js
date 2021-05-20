    //config
    const g_config_daystoShow = 7;
    
    //filters
    g_filter_count = 0; //count of enabled filters
    g_filter_age_18to45                         = new Boolean(false);
    g_filter_age_45plus                         = new Boolean(false);
    g_filter_vaccine_covishield                 = new Boolean(false);
    g_filter_vaccine_covaxin                    = new Boolean(false);
    g_filter_table_centres_show_all             = new Boolean(false);
    
    //cache
    g_cache_all_centres = []; // data fetched from xhr. before applying filters.
    g_cache_filtered_data = []; //filtered data shown in table. useful for comparing changes in filtered data
    g_cache_state_id_map = {};
    g_cache_district_id_map = {};

    //switch/states
    g_switch_alarm_on = false;
    
    //special strings
    const g_url_param_value_remove_all = "url_param_value_remove_all";//if used as value in AddRemoveUrlParam() value will remove whole param from url, and not just a single value

    //set interval handle
    g_handle_refresh_interval_timer = null;

    //states and districts
    g_statesSelected = new Set();
    g_districtsSelected = new Set();
    g_districtsAvailable = [];
    
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
    
    g_temp_numvac = [];
    function filterData(data)
    {
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
                    if(g_filter_age_18to45 == true && g_filter_age_45plus == false)
                    {
                        if(session["min_age_limit"] == 18)
                        {
                            filteredSessions.push(session);
                        }
                    }
                    else if(g_filter_vaccine_covishield == true && g_filter_vaccine_covaxin == false)
                    {
                        if(session["vaccine"].toUpperCase() == "COVISHIELD")
                        {
                            filteredSessions.push(session);
                        }
                    }
                    else if(g_filter_vaccine_covishield == false && g_filter_vaccine_covaxin == true)
                    {
                        if(session["vaccine"].toUpperCase() == "COVAXIN")
                        {
                            filteredSessions.push(session);
                        }
                    }
                    else
                    {
                        filteredSessions.push(session);
                    }
                });
                let bVaccineAvailable = false;
                filteredSessions.forEach( session => 
                    {
                        g_temp_numvac.push(session.available_capacity);
                        if(session.available_capacity > 0)
                        {
                            bVaccineAvailable = true;
                        }
                    });

                if(g_filter_table_centres_show_all == true || bVaccineAvailable == true)
                {
                    filteredData.push({name:centre["name"], sessions:filteredSessions});
                }
            });
            
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
                            daysData[dayStr].available = session["available_capacity"];
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
            for(let j = 0; j < oldData.length ; j++)
            {
                let newCentre = newData[i];
                let oldCentre = oldData[i];

                if(newCentre.name == oldCentre.name)
                {
                    let sessionsToNotify = [];
                    for(let l = 0; l < newCentre.sessions.length; l++)
                    {
                        let newSession = newCentre.sessions[l];
                        let notifyUser = true;//notify user if this is a new session or an existing session has more vaccines available
                        if(newSession.available_capacity == 0)
                        {
                            notifyUser = false;
                        }
                        for(let m = 0; m < oldCentre.sessions.length; m++)
                        {
                            let oldSession = oldCentre.sessions[m];
                            if(newSession.date.isSame(oldSession.date, 'day') && newSession.session_id == oldSession.session_id)
                            {
                                if(newSession.available_capacity < oldSession.available_capacity)
                                {
                                    notifyUser = false;
                                }
                                else
                                {
                                    console.log(newSession, oldSession);
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
                        caption += session.format("D MMM");
                        caption += "\t";
                    }
                );
                caption += "<br />";
            });
            tata.success(title, caption, {position:'br', holding:true});
            let alarmSound = new Audio('misc/mixkit-musical-reveal-961.wav');
            alarmSound.loop = true;
            alarmSound.play();
            console.log(notifyInfo);
        }
    }

    function CreateTable(bCallAlarm = false)
    {
        let tableColumns = [{data: 'name', title: 'Centre name'}];
            let selectedDate = new Date($('#dateInput')[0].value);
            for(let day = 0; day < g_config_daystoShow ; day++)
            {
                let nextDate = new Date(selectedDate);
                nextDate.setDate(nextDate.getDate() + day);
                tableColumns.push({data: "day" + day, title:nextDate.toDateString(), "orderSequence": [ "desc", "asc"],
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
                    
                    let btnHtml = '<span>' + '<button class="mini ui ' + btnClr + ' button">' + btnContent + '</button>' +  '</span>';
                    return btnHtml;
                }
                });
            }
            
            let newFilteredData = filterData(g_cache_all_centres);
            let oldFiltereddata = g_cache_filtered_data;

            if(bCallAlarm == true)
            {
                let bAutoRefreshOn = ($('#input_auto_refresh_interval_parent').hasClass('disabled') == false);
                if(bAutoRefreshOn == true && g_switch_alarm_on == true)
                {
                    DetectChange(newFilteredData, oldFiltereddata);
                }
            }

            g_cache_filtered_data = newFilteredData.slice();
            
            let tableData = convertDataToTable(newFilteredData);
            
            $.fn.dataTable.ext.type.order['format_cust_vacc_available-pre'] = function ( data ) 
            {
                let numVacs = data.match(/(<span><button class=".+"?>)(?<numVac>.+?)(<\/button><\/span>)/i).groups.numVac;
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

            $('#centreList').DataTable({
                destroy:true,
                data:tableData,
                lengthMenu:[[50, 100, -1], [50, 100, "All"]],
                pageLength: 50,
                columns: tableColumns,
            });
        
            tata.info('Results obtained', '<p style="cursor:pointer">You may have to scroll down to view them, or <b>click here</b></p>',{duration:5000, onClick:function()
                {
                    $('#centreList_wrapper')[0].scrollIntoView({behavior: 'smooth' });
                }});
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
    
    function RefreshAll(bCallAlarm = false)
    {
        GetCentresData(function (){CreateTable(bCallAlarm);});
    }

    function RefreshAllTimer()
    {
        tata.info('Timer', 'Auto refresh data', {duration:5000});
        console.info('Timer', 'Auto refresh data');
        RefreshAll(true);
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
                        if(urlParam == 'districts')
                        {
                            GetDistricts();
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
                RefreshAll(false);
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
        }).then(response => response.json())
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
        });
    }
    
    function OnDateChange(e)
    {
        AddRemoveUrlParam(true, 'date', $('#dateInput')[0].value);
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
                case "filter_table_centres_show_all":
                    g_filter_table_centres_show_all = bFilterOn;
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
                CreateTable(false);
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
        if(!isNaN(intervalTimeMinsInt))
        {
            let intervalTimeMilliSecInt = intervalTimeMinsInt * 60 * 1000;
            g_handle_refresh_interval_timer = setInterval(RefreshAllTimer, intervalTimeMilliSecInt);
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

        if(buttonOn === true)
        {
            $('#input_auto_refresh_interval_parent').removeClass('disabled');
            let intervalTimeMinsStr = ($('#input_auto_refresh_interval')[0].value);//interval in minutes
            let intervalTimeMinsInt = parseInt(intervalTimeMinsStr);
            if(!isNaN(intervalTimeMinsInt))
            {
                let intervalTimeMilliSecInt = intervalTimeMinsInt * 60 * 1000;
                g_handle_refresh_interval_timer = setInterval(RefreshAllTimer, intervalTimeMilliSecInt);
            }
            else
            {
                console.error("invalid value for interval", intervalTimeMinsStr, intervalTimeMinsInt);
            }
        }
        else
        {
            $('#input_auto_refresh_interval_parent').addClass('disabled');
        }
    }

$(document).ready( function () 
{
    /*from https://stackoverflow.com/a/66407003/981766 */
document.head.appendChild(Object.assign(document.createElement("link"), {rel: "icon", href: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💉</text></svg>"}))

$('#dateInput').change(OnDateChange);

$('.ui.button.toggle').state();

$('.ui.button.toggle.filter').click(OnFilterClicked);
$('#btn_auto_refresh').click(OnAutoRefreshClick);
$('#input_auto_refresh_interval').change(OnAutoRefreshIntervalChange);

ProcessQueryParams();

if($('#dateInput')[0].value == "")
{
    $('#dateInput')[0].valueAsDate = new Date();
}
 
 $('#getCentresBtn').click(function(){
    OnDateChange();
     RefreshAll(false);
        });
 
 $('#getDistrictsBtn').click(function()
 {
    GetDistricts();
 });

 $('#siteTour').click(function()
 {
    introJs().setOptions({
        steps: [{
        title : "Vaccine tracker 💉",
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
            intro: "<img src=\"images/tour_auto_refresh_not_clicked.png\" /> <img src=\"images/tour_auto_refresh_clicked.png\" /> Refresh table every 5 minutes. Refresh interval can be configured"
         },
         {
            element: document.querySelector('#alarm_vaccine'),
            title: "Sound alarm",
            intro: "<img src=\"images/tour_alarm_not_clicked.png\" /> <img src=\"images/tour_alarm_clicked.png\" /> <p> When new vaccine slots become available</p>"
         },
         {
            title: "Share, Save, Bookmark Results",
            intro: "<img src=\"images/tour_url.png\" /> The address link contains input parameters so that you can share the state with others or bookmark it for quick reference. <br /> <b>example</b> <br/><div class='ui mini action input'><input type='text' value='https://lihas.github.io/vaccinetracker/?states=9,12&date=2021-05-15&districts=631,143'><button class='ui teal right labeled icon button'><i class='copy icon'></i>Copy</button></div>"
         }

        ]
      }).start();
 });

 
 GetStates();
 $('#navbarMoreBtn').dropdown({on:'hover'});
 $('#filter_table_centres_show_all').popup({content:"Show filtered centres which dont have vaccine available for the given days"});
 $('#alarm_vaccine').popup({content:"Ring an alarm when new slots are found"});
 $('#alarm_vaccine').click(function(e,t){
     let bAutoRefreshOn = ($('#input_auto_refresh_interval_parent').hasClass('disabled') == false);
     if(bAutoRefreshOn == true)
     {
        if($("#alarm_vaccine_icon").hasClass("slash") == true)
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
 });
});    
