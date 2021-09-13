# Web-datamining-semantics-project
A Web datamining and semantics project by TRAN-HONG Nicolas

Objective : Make a Web application that integrates geospatial data from multiple sources, including dynamic data.
## Choice of datasets for static data
My goal is to make a web application where users can enter a location (city, address) and display different buildings around them on a map.
I choose these 3 datasets, from open data source for my static data, which contains data of different buildings. 
Higher Education Libraries 
(https://www.data.gouv.fr/fr/datasets/bibliotheques-de-lenseignement-superieur/#_)
Postal Contact Points (Merchant Post Relays, Post Offices and Postal Agencies)
(https://data.iledefrance.fr/explore/dataset/les_bureaux_de_poste_et_agences_postales_en_idf)
Public Libraries
(https://data.culturecommunication.gouv.fr/explore/dataset/adresses-des-bibliotheques-publiques)

 
## 	Web Application
In this part, I will present the different functionalities of our web application, made via  HTML, CSS and Javascript files.
To display a map, I use Leaflet (https://leafletjs.com/).
Here’s the interface of our web application.
 ![image](https://user-images.githubusercontent.com/74919761/133118951-0e0499b6-918e-443f-8002-ecc347e6dd1a.png)


•	First Functionality : Select a city and the type of buildings you want to see on the map
Thanks to the a SPARQL query, Users can select a city among all cities available in our database.
 ![image](https://user-images.githubusercontent.com/74919761/133118976-42b465c2-a254-4901-ada8-5dc63bb61dbe.png)

Below, I select Paris and check all type of building :
 ![image](https://user-images.githubusercontent.com/74919761/133119015-cd09cb36-6f05-4937-bd2a-65c95a3bdfee.png)

The map is zoomed to the city selected and all buildings in the city are then displayed on the map via a markers when you click on the “Submit” button. Each color represent a type of building : Blue for Public Libraries, Red for Post offices, Green for Merchant Post Relays, Yellow for Postal Agencies and Purple for Higher Education Libraries.
User can click on a marker to see the name and the address of a building.
I then keep “Paris” for the city and check only the libraries :
 ![image](https://user-images.githubusercontent.com/74919761/133118997-2357115e-6b82-4534-85e2-19dc6d838ccd.png)

Previous markers are removed when you click again on the submit button.
I you don’t check at least one type of building, an alert appear at the top :
 ![image](https://user-images.githubusercontent.com/74919761/133119032-10a96267-50ca-4564-b964-b709153ced58.png)

•	Second Functionality : Enter an address to display all buildings in a area of nearly 10 kms
Here I enter “18 Boulevard Victor Schoelcher” (which is in the city Busy-Saint-Georges) :
 ![image](https://user-images.githubusercontent.com/74919761/133119049-6633403a-601c-4620-a2f2-a9e47c00897d.png)

To get the coordinates of an address, I use the following API : https://geo.api.gouv.fr/adresse
•	Third Functionality : Click on the map to display all buildings in a area of nearly 10 kms
Here I clicked randomly on the map.
 ![image](https://user-images.githubusercontent.com/74919761/133119064-c1956bb6-be8a-4471-8402-95d24ee44f23.png)

A pop-up appears where you clicked and displays the number of buildings around.
•	Other Functionalities : The weather and the air quality of the location is displayed for all other functionalities.
 ![image](https://user-images.githubusercontent.com/74919761/133119077-87b13c94-8988-4f01-bb67-cd6b693949f4.png)
![image](https://user-images.githubusercontent.com/74919761/133119089-0eb5d185-cc97-4a74-a94d-598d06976df3.png)

 
2 color codes are used to represent the different levels of air quality and temperature.
I used two API to collect these information:
-	https://aqicn.org/api/ for the Air quality
-	https://openweathermap.org/current#other for the weather

Finally, here a video showcasing this web application :
https://www.youtube.com/watch?v=95uwnvcAIEU 

