<script src="https://code.jquery.com/jquery-3.1.1.min.js" integrity="sha256-hVVnYaiADRTO2PzUGmuLJr8BLUSjGIZsDYGmIJLv2b8=" crossorigin="anonymous"></script>
<link rel="stylesheet" type="text/css" href="semantic.min.css">
<script src="semantic.min.js"></script>


<select name="states" multiple="" class="ui fluid dropdown" id="states">
</select>

<select name="states" multiple="" class="ui fluid dropdown disabled" id="districts">
    <option>Select districts</option>
</select>

<table id="table_id" class="display">
    <thead>
        <tr>
            <th>Column 1</th>
            <th>Column 2</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Row 1 Data 1</td>
            <td>Row 1 Data 2</td>
        </tr>
        <tr>
            <td>Row 2 Data 1</td>
            <td>Row 2 Data 2</td>
        </tr>
    </tbody>
</table>

<script>
    g_statesSelected = new Set();
    g_districtsSelected = new Set();
    
    function toggleDistricts()
    {
        if(g_statesSelected.size > 0)
        {
            $('#districts').parent().removeClass("disabled");
        }
        else
        {
            $('#districts').parent().addClass("disabled");
        }
    }
    
$(document).ready( function () {
 
 fetch("https://cdn-api.co-vin.in/api/v2/admin/location/states", {

  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": null,
  "method": "GET",
  "mode": "cors",
  "credentials": "omit"
}).then(response => response.json())
  .then(data => {console.log(data);
  let stateList = [];
  data["states"].forEach((state, index) => {
  console.log(index, state);
  stateList.push({name:state["state_name"], value:state["state_id"]});
  });
  $('#states').dropdown({values:stateList, placeholder:"Select states",
  onChange: function(value, text, $selectedItem){console.log("onChange", value, text, $selectedItem);},
  onAdd: function(value, text, $selectedItem)
  {
    console.log("onAdd", value, text, $selectedItem); g_statesSelected.add(value);
    toggleDistricts();
    
  },
  onRemove: function(value, text, $selectedItem)
  {
    console.log("onRemove", value, text, $selectedItem); g_statesSelected.delete(value);
    toggleDistricts();
  },
  });
  });
  
  $('#districts').dropdown({
      onShow : function()
  {
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
            console.log("here1 ", data);
        });
  });
  }
  });
    
} );    
</script>
