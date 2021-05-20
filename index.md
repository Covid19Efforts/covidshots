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
  <a href="https://lihas.github.io/vaccinetracker" class="item" target="_self" rel="noopener noreferrer">Home</a>
  <!--<a class="item"></a>-->
  <div class="right menu">
    <a class="item" id="siteTour">Tour</a>
    <a href="https://github.com/lihas/vaccinetracker/blob/gh-pages/Readme.md" class="item" target="_blank" rel="noopener noreferrer">Help</a>
<!---->
  <div class="ui dropdown item" id="navbarMoreBtn">
    More
    <i class="dropdown icon"></i>
    <div class="menu">
      <a class="item" href="https://github.com/lihas/vaccinetracker/issues" target="_blank" rel="noopener noreferrer"><i class="bug icon"></i>Report bug</a>
      <a class="item" href="https://github.com/lihas/vaccinetracker/issues" target="_blank" rel="noopener noreferrer"><i class="magic icon"></i>Request feature</a>
    </div>
  </div>
<!---->
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
<button class="ui toggle button filter grey basic" id="filter_age_18_45">18-45</button>
<button class="ui toggle button filter grey basic" id="filter_age_45_plus">45+</button>
<button class="ui toggle button filter grey basic" id="filter_vaccine_covishield">Covishield</button>
<button class="ui toggle button filter grey basic" id="filter_vaccine_covaxin">Covaxin</button>
<br /><br />
<button class="ui toggle button filter grey basic" id="filter_table_centres_show_all">Show all Centres</button>

<h5 class="ui header">Auto refresh table</h5>

<div class="toggle ui animated button" tabindex="0" id="btn_auto_refresh" style="float:left">
      <div class="hidden content">Auto Refresh</div>
      <div class="visible content">
      <i class="big sync alternate icon"></i>
      </div>
</div>

<button class="circular ui icon button" id="alarm_vaccine">
  <i class="big bell slash icon" id="alarm_vaccine_icon"></i>
</button>

<br />

Refresh interval (minutes):
<div class="ui right labeled input disabled" id="input_auto_refresh_interval_parent">
<input type="number" placeholder="Enter time.." id="input_auto_refresh_interval" name="input_auto_refresh_interval" min="5" max="600" value="5">
<div class="ui basic label">
minutes
</div>
</div>

<br />
<table id="centreList" class="display" width="100%"><thead></thead></table>

<script src="index.js"></script>
