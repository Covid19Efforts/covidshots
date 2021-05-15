    //config
    const g_config_daystoShow = 7;
    
    //filters
    g_filter_count = 0; //count of enabled filters
    g_filter_age_18to45         = new Boolean(false);
    g_filter_age_45plus         = new Boolean(false);
    g_filter_vaccine_covishield = new Boolean(false);
    g_filter_vaccine_covaxin    = new Boolean(false);
    
    //cache
    g_cache_all_centres = []; // data fetched from xhr. before applying filters.
    g_cache_state_id_map = {};
    g_cache_district_id_map = {};
    
    //other variable
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
        AddRemoveUrlParam(true, 'districts', value);
        g_districtsSelected.add(value);
    }
    
    function onDistrictRemove(value, text, $selectedItem)
    {
        AddRemoveUrlParam(false, 'districts', value);
        g_districtsSelected.delete(value);
    }
    
    function filterData(data)
    {
        if(g_filter_count == 0)
        {
            return data;
        }
        else
        {
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
            filteredData.push({name:centre["name"], sessions:filteredSessions});
            });
            
            return filteredData;
        }
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
    
    function CreateTable()
    {
        let tableColumns = [{data: 'name', title: 'Centre name'}];
            let selectedDate = new Date($('#dateInput')[0].value);
            for(let day = 0; day < g_config_daystoShow ; day++)
            {
                let nextDate = new Date(selectedDate);
                nextDate.setDate(nextDate.getDate() + day);
                tableColumns.push({data: "day" + day, title:nextDate.toDateString(), "orderSequence": [ "desc", "asc"],
                type:"html-num-fmt",
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
            
            let filteredData = filterData(g_cache_all_centres);
            console.log("filteredData", filteredData);
            let tableData = convertDataToTable(filteredData);
            
            $('#centreList').DataTable({
                destroy:true,
                data:tableData,
                lengthMenu:[[50, 100, -1], [50, 100, "All"]],
                pageLength: 50,
                columns: tableColumns,
            });
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
            console.log("here3", data);
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
    
    function RefreshAll()
    {
        GetCentresData(CreateTable);
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
                    if(!isNaN(parseInt(val, 10)))
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
        let sString = window.location.search;

        SanitizeUrl(sString, false);
        
        let uSp = new URLSearchParams(sString);
        let uVal = uSp.getAll('states').join(',');
        
        if(uVal != null && uVal != "")
        {
            if(uVal.match(/[0-9,]+/i) != null)
            {
                let stateIds = new Set(uVal.split(","));//unique
                stateIds.forEach(stateIdStr => 
                {
                    let stateIdInt = parseInt(stateIdStr, 10);
                    if(!isNaN(stateIdInt))
                    {
                        g_statesSelected.add(stateIdInt);
                    }
                    else
                    {
                        console.error("error parsing string as int", stateIdStr);
                    }
                });
            }
        }

        uVal = uSp.getAll('districts').join(',');
        
        if(uVal != null && uVal != "")
        {
            if(uVal.match(/[0-9,]+/i) != null)
            {
                let districtIds = new Set(uVal.split(","));//unique
                districtIds.forEach(districtIdStr => 
                {
                    let districtIdInt = parseInt(districtIdStr, 10);
                    if(!isNaN(districtIdInt))
                    {
                        g_districtsSelected.add(districtIdInt);
                    }
                    else
                    {
                        console.error("error parsing string as int", districtIdStr);
                    }
                });
            }
            GetDistricts();
        }

        uVal = uSp.get('date');//can't use get all. there can only be a single date parameter.
        
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
                AddRemoveUrlParam(false, 'date', uVal);
            }
        }
    }

    function AddRemoveUrlParam(/*bool*/ bAdd, paramName, paramValue)//eg. 1,states,10 to add state ID 10
    {
        let sString = window.location.search;
        let uSp = new URLSearchParams(sString);
        let uVal = uSp.get(paramName);
        
        if(bAdd)
        {
            if( uVal == null || uVal == "")
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
                }

                if(uVal == "")
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
            AddRemoveUrlParam(true, 'states', value);
            g_statesSelected.add(value);
        },
        onRemove: function(value, text, $selectedItem)
        {
            AddRemoveUrlParam(false, 'states', value);
            g_statesSelected.delete(value);
        },
        });
        });
    }
    
function OnDateChange(e)
{
    AddRemoveUrlParam(true, 'date', $('#dateInput')[0].value);
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
    
    if(filterOn == true)
    {
        g_filter_count++;
    }
    else
    {
        g_filter_count--;
    }
    
    console.log(e.currentTarget.id, filterOn, g_filter_count);
    
    let bValidFilter = true;
    switch(e.currentTarget.id)
    {
        case "filter_age_18_45":
            g_filter_age_18to45 = filterOn;
        break;
        case "filter_age_45_plus":
            g_filter_age_45plus = filterOn;
        break;
        case "filter_vaccine_covishield":
            g_filter_vaccine_covishield = filterOn;
        break;
        case "filter_vaccine_covaxin":
            g_filter_vaccine_covaxin = filterOn;
        break;
        default:
        bValidFilter = false;
        console.error("invalid filter");
        break;
    }
    
    if(bValidFilter)
    {
        CreateTable();
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

$(document).ready( function () {

$('#dateInput').change(OnDateChange);

$('.ui.button.toggle').state();

$('.ui.button.toggle.filter').click(OnFilterClicked);

ProcessQueryParams();

if($('#dateInput')[0].value == "")
{
    $('#dateInput')[0].valueAsDate = new Date();
}
 
 $('#getCentresBtn').click(function(){
    OnDateChange();
     RefreshAll();
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
            title: "Share, Save, Bookmark Results",
            intro: "<img src=\"images/tour_url.png\" /> The address link contains input parameters so that you can share the state with others or bookmark it for quick reference. <br /> <b>example</b> <br/><div class='ui mini action input'><input type='text' value='https://lihas.github.io/vaccinetracker/?states=9,12&date=2021-05-15&districts=631,143'><button class='ui teal right labeled icon button'><i class='copy icon'></i>Copy</button></div>"
         }

        ]
      }).start();
 });

 
 GetStates();
    
});    
