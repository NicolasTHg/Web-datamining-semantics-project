//Paris
var lat = 48.856614;
var lon = 2.3522219;
//Initialization of the map;
var mymap = L.map('mapid');
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1Ijoibmljb3RoZyIsImEiOiJja21xZTlrNTcxcTV3MndyejkyamtsMGhjIn0.54h_HAn6vdlIKvhv_8jvLA'
}).addTo(mymap)
var layerGroup = L.layerGroup().addTo(mymap); //layer where we can place/remove markers
displayMap(lat,lon);

//Change position on the map
function displayMap(latitude, longitude){
  mymap.setView([latitude, longitude], 13);
}


var popup = L.popup();
//User click on the map
function onMapClick(e) {
  var latitude =e.latlng.lat;
  var longitude =e.latlng.lng;

  var query=`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX ns: <http://www.owl-ontologies.com/unnamed.owl#>

  SELECT ?name ?adress ?latitude ?longitude ?type
  WHERE `;
  query += createQueryAdress(latitude,longitude);
  layerGroup.clearLayers();
  getData(query).then(function(results){
    console.log("Buildings :",results);
    results.forEach(function (building){
      //Add marker on the map
      addMarker(building);
    })
    popup
        .setLatLng(e.latlng)
        .setContent(`${results.length} Buildings around !`)
        .openOn(mymap);
  });
  displayWeatherAQI(latitude,longitude);
}

mymap.on('click', onMapClick);

//User submit a city and check building types
var button = document.getElementById("submitbutton");
button.addEventListener('click',function(event){
  event.preventDefault();
  var form = document.getElementById("formcity");
  var city = form.elements.city.value;//get the input
  if(city != ""){
    city = city.toUpperCase();
    city = city.replaceAll(" ","-");
    getCoordCity(city).then(function(json_city){
      console.log(json_city)
      var lat_city = json_city.geometry.coordinates['1'];
      var lon_city = json_city.geometry.coordinates['0'];
      var postrelay = form.elements.postrelay.checked;
      var postoffice = form.elements.postoffice.checked;
      var postalagency = form.elements.postalagency.checked;
      var publiclibrary = form.elements.publiclibrary.checked;
      var highereducationlibrary = form.elements.highereducationlibrary.checked;
      console.log(city,lat_city,lon_city,postrelay,postoffice,postalagency,publiclibrary,highereducationlibrary);
      displayMap(lat_city,lon_city);
      if(postrelay==false&&postoffice==false&&postalagency==false&&publiclibrary==false&&highereducationlibrary==false){
        displayAlert("city");
      } else{
        var query=`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX ns: <http://www.owl-ontologies.com/unnamed.owl#>

        SELECT ?name ?adress ?latitude ?longitude ?type
        WHERE {`;
        var lst = [postrelay,postoffice,postalagency,publiclibrary,highereducationlibrary];
        var nb_checked = lst.filter(Boolean).length;
        city = city.replaceAll("-"," ");
        for(i=0;i<lst.length;i++){
          if(lst[i]==true){
            switch(i){
              case 0: //postrelay
                query += createQuery(city,"MerchantPostRelay");
                break;
              case 1: //postoffice
                query += createQuery(city,"PostOffice");
                break;
              case 2: //postalagency
                query += createQuery(city,"MunicipalPostalAgency");
                query += createQuery(city,"IntermunicipalPostalAgency");
                query += createQuery(city,"MilitaryPostalAgency");
                break;
              case 3: //publiclibrary
                query += createQuery(city,"MunicipalLibrary");
                query += createQuery(city,"DepartmentalLibrary");
                query += createQuery(city,"ListedMunicipalLibrary");
                break;
              case 4: //highereducationlibrary
                query += createQuery(city,"HigherEducationLibrary");
                break;
            }
          }
        }
        query = query +"}";
        query = query.replaceAll("}{","} UNION {");
        //console.log(query);
      }
      layerGroup.clearLayers();
      getData(query).then(function(results){
        console.log(results);
        results.forEach(function (building){
          //Add marker on the map
          addMarker(building);
        })
      });
      displayWeatherAQI(lat_city,lon_city);
    });
  }
});
//User submit adress
var button_adress = document.getElementById("submitadress");
button_adress.addEventListener('click',function(event){
  event.preventDefault();
  var formadress = document.getElementById("formadress");
  var adress = formadress.elements.adress.value;//get the input
  if(adress != ""){
    getCoordAdress(adress).then(function(json_adress){
      console.log(json_adress)
      var lat_adress = json_adress.geometry.coordinates['1'];
      var lon_adress= json_adress.geometry.coordinates['0'];
      console.log(adress,lat_adress,lon_adress);
      displayMap(lat_adress,lon_adress);

      var query=`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX ns: <http://www.owl-ontologies.com/unnamed.owl#>

      SELECT ?name ?adress ?latitude ?longitude ?type
      WHERE `;

      query += createQueryAdress(lat_adress,lon_adress);
      layerGroup.clearLayers();
      getData(query).then(function(results){
        console.log(results);
        results.forEach(function (building){
          //Add marker on the map
          addMarker(building);
        })
      });
      displayWeatherAQI(lat_adress,lon_adress);
    });
  } else{
    displayAlert("adress");

  }
});
//Get all building of type in a city
function createQuery(city, buildingtype){
  let query =
  `{
    ?city ns:cityname "${city}".
    ?location ns:city ?city.
    ?building ns:location ?location.
    ?building rdf:type ns:${buildingtype}.
    ?building rdf:type ?type.
    ?building ns:name ?name.
    ?location ns:adress ?adress.
    ?location ns:latitude ?latitude.
    ?location ns:longitude ?longitude.
  }`;
  return query;
}

//Get all building  around a point(latitude, longitude)
function createQueryAdress(latitude,longitude){
  let query =
  `{
  ?building ns:location ?location.
  ?building rdf:type ?type.
  ?building ns:name ?name.
  ?location ns:adress ?adress.
  ?location ns:latitude ?latitude.
  ?location ns:longitude ?longitude.
  FILTER(?latitude < ${latitude+0.08}) .
  FILTER(?latitude > ${latitude-0.08}) .
  FILTER(?longitude <${longitude+0.1}) .
  FILTER(?longitude >${longitude-0.1}) .
} `;
  return query;
}

function addMarker(building){
  var marker = null;
  let building_type = building.type.value;
  building_type = building_type.replace("http://www.owl-ontologies.com/unnamed.owl#","")
  //Create marker and change color according the building type
  switch (building_type){
    case "MunicipalLibrary":
    case "DepartmentalLibrary":
    case "ListedMunicipalLibrary":
      marker = L.marker([building.latitude.value, building.longitude.value],{icon: blueMarker}).addTo(layerGroup);
      break;
    case "MunicipalPostalAgency":
    case "IntermunicipalPostalAgency":
    case "MilitaryPostalAgency":
      marker = L.marker([building.latitude.value, building.longitude.value],{icon: orangeMarker}).addTo(layerGroup);
      break;
    case "HigherEducationLibrary":
      marker = L.marker([building.latitude.value, building.longitude.value],{icon: purpleMarker}).addTo(layerGroup);
      break;
    case "PostOffice":
      marker = L.marker([building.latitude.value, building.longitude.value],{icon: redMarker}).addTo(layerGroup);
      break;
    case "MerchantPostRelay":
      marker = L.marker([building.latitude.value, building.longitude.value],{icon: greenMarker}).addTo(layerGroup);
      break;
   }
  marker.bindPopup(`<b>${building.name.value}</b><br>${building.adress.value}`);
}

function getCoordCity(city){
  //var url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=02f4323ca3d7b8df79a28c9d7f19179c`
  var url = `https://api-adresse.data.gouv.fr/search/?q=${city}`
  return fetch(url).then(function (response) {
    return response.text();
  }).then(function (text) {
      let outcome = JSON.parse(text);
      return outcome.features[0];
  }).catch(function (error) {
      console.log(error);
  });
}
function getCoordAdress(adress){
  var url = `https://api-adresse.data.gouv.fr/search/?q=${adress}`
  return fetch(url).then(function (response) {
    return response.text();
  }).then(function (text) {
      let outcome = JSON.parse(text);
      return outcome.features[0];
  }).catch(function (error) {
      console.log(error);
  });
}

function getAirQuality(latitude,longitude){
  var url = `https://api.waqi.info/feed/geo:${latitude};${longitude}/?token=d1fb420161ae4f19929951b67def3f162230b7f0`
  return fetch(url).then(function (response) {
    return response.text();
  }).then(function (text) {
      let outcome = JSON.parse(text);
      return outcome.data.aqi;
  }).catch(function (error) {
      console.log(error);
  });
}
function getWeather(latitude,longitude){
  var url = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=02f4323ca3d7b8df79a28c9d7f19179c&units=metric`
  return fetch(url).then(function (response) {
    return response.text();
  }).then(function (text) {
      let outcome = JSON.parse(text);
      return outcome;
  }).catch(function (error) {
      console.log(error);
  });
}

function displayWeatherAQI(latitude, longitude){
  getWeather(latitude,longitude).then(function(json){
    console.log("Weather :",json);
    document.getElementById("weather").innerText = `${json.weather[0].main} with ${json.main.temp}°`;
    if(json.main.temp<0){
      document.getElementById("weather").style.background = "powderBlue";
    } else if(0<= json.main.temp && json.main.temp<10){
      document.getElementById("weather").style.background = "skyBlue";
    } else if(10<=json.main.temp && json.main.temp<15){
      document.getElementById("weather").style.background = "yellow";
    } else if(15<=json.main.temp && json.main.temp<20){
      document.getElementById("weather").style.background = "orange";
    }else {
      document.getElementById("weather").style.background = "orangeRed";
    }
    document.getElementById("weather").style.color = "white";
  });
  getAirQuality(latitude,longitude).then(function(aqi){
    console.log("AQI",aqi);
    document.getElementById("aqi").innerText = `${aqi}`;

    if(0<=aqi && aqi<=50){
      document.getElementById("aqi").style.background = "yellowGreen";
    } else if(51<=aqi && aqi<=100){
      document.getElementById("aqi").style.background = "yellow";
    } else if(101<=aqi && aqi<=150){
      document.getElementById("aqi").style.background = "orange";
    } else {
      document.getElementById("aqi").style.background = "red";
    }
    document.getElementById("aqi").style.color = "white";
  });
}

var url_to_endpoint = 'http://localhost:3030/webdata_project/sparql'
/////////////////////////////////////////
//Get list of all cities for the choice input
var query_cities = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX ns: <http://www.owl-ontologies.com/unnamed.owl#>
SELECT distinct ?name
WHERE {
  ?city rdf:type ns:City.
  ?city ns:cityname ?name.
}
order by asc(UCASE(str(?name)))`;
var select_city = document.getElementById("city");

var queryUrl = url_to_endpoint + "?query="+ encodeURIComponent(query_cities) + "&format=json";
fetch(queryUrl).then(function (response) {
  return response.text();
}).then(function (text) {
    let outcome = JSON.parse(text);
    //console.log(outcome.results.bindings)
    outcome.results.bindings.forEach(function (city){
      let opt = document.createElement("option");
      opt.setAttribute("value",city.name.value)
      opt.innerText = city.name.value;
      select_city.appendChild(opt);
    })
}).catch(function (error) {
    console.log(error);
});
///////////////////////////////////////////////

//SPARQL query to the Jena fuseki server
function getData(query){
  var queryUrl = url_to_endpoint + "?query="+ encodeURIComponent(query) + "&format=json";
  return fetch(queryUrl).then(function (response) {
    return response.text();
  }).then(function (text) {
      let outcome = JSON.parse(text);
      return outcome.results.bindings; //return array of buildings
  }).catch(function (error) {
      console.log(error);
  });
}

function displayAlert(type){
  const alertdiv = document.createElement("div");
  alertdiv.setAttribute("class","alert" );
  if(type=="city"){
    alertdiv.textContent = "Check at least once !";
  } else{
    alertdiv.textContent = "Enter an adress !";
  }
  document.body.insertBefore(alertdiv, document.body.firstChild);
  const x = document.createElement("span");
  x.setAttribute("class","closebtn");
  x.innerHTML="&times;";
  alertdiv.appendChild(x);
  x.setAttribute("onclick","this.parentElement.style.display='none';");
}


//When submit the form, we click and redirect to the button event listerner
function clickOnSubmitButton(){
  var button = document.getElementById("submitbutton");
  button.click();
}
function clickOnSubmitButtonAdress(){
  var button_adress = document.getElementById("submitadress");
}

/////////////////////////////////
//Create markers
// Creates a red marker with the coffee icon
var redMarker = L.AwesomeMarkers.icon({
  markerColor: 'red'
});
var blueMarker = L.AwesomeMarkers.icon({
  markerColor: 'blue'
});
var greenMarker = L.AwesomeMarkers.icon({
  markerColor: 'green'
});
var orangeMarker = L.AwesomeMarkers.icon({
  markerColor: 'orange'
});
var purpleMarker = L.AwesomeMarkers.icon({
  markerColor: 'purple'
});
