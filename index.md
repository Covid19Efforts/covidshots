---
layout: default
classes: wide
title: Covid vaccine tracker
---

<style>
.filter{}
</style>

<link rel="stylesheet" type="text/css" href="semantic.min.css">
<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.24/css/jquery.dataTables.min.css">
<link rel="stylesheet" type="text/css" href="https://unpkg.com/intro.js@3.4.0/minified/introjs.min.css">

<script src="https://code.jquery.com/jquery-3.5.1.min.js" crossorigin="anonymous"></script>
<script src="semantic.min.js"></script>
<script src="components/state.min.js"></script>
<script src="js/tablesort.js"></script>
<script src="js/tata.js"></script>
<script src="https://cdn.datatables.net/1.10.24/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.datatables.net/1.10.24/js/dataTables.semanticui.min.js"></script>

<script src="https://unpkg.com/dayjs@1.8.21/dayjs.min.js"></script>
<script src="https://unpkg.com/dayjs@1.8.21/plugin/customParseFormat.js"></script>
<script>dayjs.extend(window.dayjs_plugin_customParseFormat);</script>

<script src="https://unpkg.com/intro.js@3.4.0/minified/intro.min.js"></script>

<div class="ui blue inverted menu">
  <a class="item">Home</a>
  <!--<a class="item"></a>-->
  <div class="right menu">
    <a class="item" id="siteTour">Tour</a>
    <a class="item">Help</a>
  </div>
</div>

<h5 class="ui header">States</h5>
<select name="states" multiple="" class="ui fluid dropdown" id="states">
</select>

<button class="ui primary button" id="getDistrictsBtn">
  Get districts
</button>

<h5 class="ui header">Districts</h5>
<select name="districts" multiple="" class="ui fluid dropdown disabled" id="districts">
    <option>Select districts</option>
</select>


<label for="dateInput">Date:</label>
<input type="date" id="dateInput" name="dateInput" />

<button class="ui primary button" id="getCentresBtn">
  Get centres
</button>


<h5 class="ui header">Filters</h5>
<button class="ui toggle button filter" id="filter_age_18_45">18-45</button>
<button class="ui toggle button filter" id="filter_age_45_plus">45+</button>
<button class="ui toggle button filter" id="filter_vaccine_covishield">Covishield</button>
<button class="ui toggle button filter" id="filter_vaccine_covaxin">Covaxin</button>

<h5 class="ui header">Auto refresh table</h5>

<div class="toggle ui animated button" tabindex="0" id="btn_auto_refresh">
      <div class="hidden content">Auto Refresh</div>
      <div class="visible content">
      <i class="big sync alternate icon"></i>
</div>
</div>

<br />

Refresh interval (minutes):
<div class="ui right labeled input disabled">
<input type="number" placeholder="Enter time.." id="ref_interval" name="ref_interval" min="1" max="600" value="5">
<div class="ui basic label">
minutes
</div>
</div>

<br />
<table id="centreList" class="display" width="100%"><thead></thead></table>

<script src="index.js"></script>
