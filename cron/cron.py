import urllib.request
contents = urllib.request.urlopen("https://cdn-api.co-vin.in/api/v2/admin/location/states")
print(contents)