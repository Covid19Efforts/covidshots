- [Looking for contributors !!!](#looking-for-contributors-)
    - [UX, QA, Dev, Misc](#ux-qa-dev-misc)
  - [Use this website to find free vaccine slots, Set alarms](#use-this-website-to-find-free-vaccine-slots-set-alarms)
    - [Search across multiple districts (and states) at once](#search-across-multiple-districts-and-states-at-once)
    - [Sort data (Highest number of available vaccines on top)](#sort-data-highest-number-of-available-vaccines-on-top)
    - [Filter results](#filter-results)
    - [Monitor vaccine availability continuously (Auto refresh)](#monitor-vaccine-availability-continuously-auto-refresh)
    - [View availability statistics](#view-availability-statistics)
    - [Set audio alarm/ Receive notifications](#set-audio-alarm-receive-notifications)
    - [Disadvantages over Cowin](#disadvantages-over-cowin)
- [Development](#development)
  - [Building locally](#building-locally)
  - [Contributing](#contributing)
  - [Mock API](#mock-api)
- [Credits](#credits)

# Looking for contributors !!!
### UX, QA, Dev, Misc

![Join us](images/joinTeam.png)

## Use this website to find free vaccine slots, Set alarms
<img src="https://raw.githubusercontent.com/Covid19Efforts/covidshots/gh-pages/assets/help_vaccine_info.jpg" width="250px">

### Search across multiple districts (and states) at once
<!--![Select multiple states at once](images/tour_states.png)-->
<!--![Select multiple districts at once](images/tour_districts.png)-->
<img src="https://raw.githubusercontent.com/Covid19Efforts/covidshots/gh-pages/images/tour_states.png" width="500px">
<img src="https://raw.githubusercontent.com/Covid19Efforts/covidshots/gh-pages/images/tour_districts.png" width="500px">


### Sort data (Highest number of available vaccines on top)
<!--![Sort table data](images/vaccine_table_sort.png)-->
<img src="https://raw.githubusercontent.com/Covid19Efforts/covidshots/gh-pages/images/vaccine_table_sort.png" width="500px">

### Filter results
<!--![Auto refresh](images/tour_filters.png)-->
<img src="https://raw.githubusercontent.com/Covid19Efforts/covidshots/gh-pages/images/tour_filters.png" width="500px">

### Monitor vaccine availability continuously (Auto refresh)
![Auto refresh](images/auto_refresh_time.png)
<!--![Auto refresh](images/tour_auto_refresh_not_clicked.png)-->
<!--![Auto refresh](images/tour_auto_refresh_clicked.png)-->
<img src="https://raw.githubusercontent.com/Covid19Efforts/covidshots/gh-pages/images/tour_auto_refresh_not_clicked.png" width="150px">
<img src="https://raw.githubusercontent.com/Covid19Efforts/covidshots/gh-pages/images/tour_auto_refresh_clicked.png" width="150px">

### View availability statistics
<!--![Vaccine stats](images/stats_graph.png)-->
<!--![Vaccine stats](images/stats.png)-->
<img src="https://raw.githubusercontent.com/Covid19Efforts/covidshots/gh-pages/images/stats_graph.png" width="500px">
<img src="https://raw.githubusercontent.com/Covid19Efforts/covidshots/gh-pages/images/stats.png" width="500px">


### Set audio alarm/ Receive notifications
<!--![Audio alarm](images/tour_alarm_not_clicked.png)-->
<!--![Audio alarm](images/tour_alarm_clicked.png)-->
<!--![Notification](images/notification.png)-->
<img src="https://raw.githubusercontent.com/Covid19Efforts/covidshots/gh-pages/images/tour_alarm_not_clicked.png" width="150px">
<img src="https://raw.githubusercontent.com/Covid19Efforts/covidshots/gh-pages/images/tour_alarm_clicked.png" width="150px">
<img src="https://raw.githubusercontent.com/Covid19Efforts/covidshots/gh-pages/images/notification.png" width="300px">

<!--
### Advantages over Cowin
1. Auto book!
1. You can query across sevaral states, and districts at once. Eg. All vaccination centres in Delhi which have covishield available
1. You can be alerted when a vaccination slot becomes available.
1. You can sort data to quickly find centres with large number of free slots

![Select multiple states at once](images/tour_states.png)
![Select multiple districts at once](images/tour_districts.png)
-->

### Disadvantages over Cowin
~~1. Cannot be used to book slots. For that you will have to use Cowin, et al. (Work in progress? Please join as a contributor)~~

# Development
## Building locally
1. Clone this repo
2. Open git bash (search google for git bash to download)
3. run `bundle install`
4. run `jekyll serve`
5. The site will be available at `http://localhost:4000`

More info : [Building your site locally](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/testing-your-github-pages-site-locally-with-jekyll#building-your-site-locally)

## Contributing
1. Fork this repo to you github profile
2. Make changes in your forked version of this repo. You can make as many commits as you want
3. Raise a pull request so that this repo will get notified about your changes, and your changes can be merged with this site.

## Mock API
Uisng mock API can help in testing. When mock API is in use the data is fetched from our ngrok API instead of cowin servers.

1. Enable usage of mock API
Open developer settings in chrome, and run the following funtion.
```
MockApi.IsMockEnabled()
```
2. Disable
```
MockApi.DisableMockApi()
```

# Credits
<a href="https://www.freepik.com/vectors/business">Business vector created by pikisuperstar - www.freepik.com</a>
