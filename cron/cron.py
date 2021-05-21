import urllib.request
import json
from time import sleep
from datetime import datetime

custom_states = [5 #Bihar
, 6 #Chandigarh
, 9 #Delhi
, 12 #Haryana
, 28 #Punjab
, 34 #UP
, 21 #Maharashtra
]

time1=datetime.now()

print("time1", time1)

url = "https://cdn-api.co-vin.in/api/v2/admin/location/states";
url_headers={
    'User-Agent'                : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
    "authority"                 : "cdn-api.co-vin.in",
    "scheme"                    :"https",
    "accept"                    :"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "accept-encoding"           : "gzip, deflate, br",
    "accept-language"           :"en-US,en;q=0.9,hi-IN;q=0.8,hi;q=0.7,en-GB;q=0.6",
    "upgrade-insecure-requests" : "1"

}
urlReq = urllib.request.Request(url, headers=url_headers)
response = urllib.request.urlopen(urlReq)
stateJson = json.load(response)
stateJson = stateJson["states"]

districts = []
centres = []

all_states = []

for state in stateJson:
    stateId = state["state_id"]
    all_states.append(stateId)

requestCount = 0

try:
    for stateId in all_states:
    #for stateId in custom_states:
        print(stateId)
        #sleep(5)
        url = "https://cdn-api.co-vin.in/api/v2/admin/location/districts/" + str(stateId)
        urlReq = urllib.request.Request(url, headers=url_headers)
        requestCount += 1
        response = urllib.request.urlopen(urlReq)
        distJson = json.load(response)
        distJson = distJson["districts"]
        for dist in distJson:
            distId = dist["district_id"]
            districts.append(distId)
            print("\tdistrict ",distId, stateId)
            #sleep(5)
            url = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=" + str(distId) + "&date=17-05-2021"
            urlReq = urllib.request.Request(url, headers=url_headers)
            requestCount += 1
            response = urllib.request.urlopen(urlReq)
            centresJson = json.load(response)
            centresJson = centresJson["centers"]
            for centre in centresJson:
                centreId = centre["center_id"]
                print("\t\tcentre ",centreId, distId, stateId)
                centres.append(centreId)
        #print(distJson)
except:
    print("exception")
finally:
    time2=datetime.now()
    print(len(districts))
    print(len(centres))
    print("time1", time1)
    print("time2", time2)
    print("requestCount", requestCount)