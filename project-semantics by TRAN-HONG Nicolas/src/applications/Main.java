package applications;
import org.json.simple.parser.JSONParser;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import java.io.FileReader;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import com.hp.hpl.jena.rdf.model.Model;
import tools.JenaEngine;


public class Main {
	/**
	 * @param args
	 *            the command line arguments
	 */
	public static void main(String[] args) {
		
		String NS = "";
		
		// read the model from an ontology
		Model model = JenaEngine.readModel("data/project-ontology.owl");
		if (model != null) {
			//read the namespace from an ontology
			NS = model.getNsPrefixURI("");
			
			JSONParser parser = new JSONParser();
			
			try {
				
				//FOR THE FIRST JSON FILE
				//get the json array from the json file
				Object obj = parser.parse(new FileReader("data/points_de_contact_postaux.json"));
				JSONArray pts_list = (JSONArray) obj;
				//iterate over the json array
				Iterator i = pts_list.iterator();
		        while (i.hasNext()) {
		        	//Get the json object :
		            JSONObject pt = (JSONObject) i.next();
		            
		            //Get the interesting fields
		            JSONObject fields = (JSONObject)pt.get("fields");
		            String identifiant_du_site = (String) fields.get("identifiant_du_site");
		            String libelle_du_site = (String) fields.get("libelle_du_site");
		            String caracteristique_du_site = (String) fields.get("caracteristique_du_site");
		            String pays = (String) fields.get("pays");
		            String localite = (String) fields.get("localite");
		            String adresse = (String) fields.get("adresse");
		            String dep = (String) fields.get("dep");
		            String latitude = (String) fields.get("latitude"); 
		            String longitude = (String) fields.get("longitude");
		            
		            //Create Instance of a PostalContactPoint if coordinates exist
		            if(latitude != null && longitude != null) {
		            	
		            	//to avoid error
		            	if(adresse==null) {
		            		adresse= "";
		            	}
		            	//Change type
		            	
		            	int dept = Integer.parseInt(dep);
		            	float lat = Float.parseFloat(latitude);
			            float lg = Float.parseFloat(longitude);
			            
			            // Create instance of different class 
			            if(caracteristique_du_site.equals("Bureau de Poste")) {
			            	JenaEngine.createInstanceOfClass(model, NS, "PostOffice", identifiant_du_site);         	
			            } else if(caracteristique_du_site.equals("Relais poste commerçant")){
			            	JenaEngine.createInstanceOfClass(model, NS, "MerchantPostRelay", identifiant_du_site); 
			            } else if(caracteristique_du_site.equals("Agence postale communale")){
			            	JenaEngine.createInstanceOfClass(model, NS, "MunicipalPostalAgency", identifiant_du_site); ;
			            } else if(caracteristique_du_site.equals("Agence postale intercommunale")){
			            	JenaEngine.createInstanceOfClass(model, NS, "IntermunicipalPostalAgency", identifiant_du_site); 
			            } else if(caracteristique_du_site.equals("Agence postale militaire")){
			            	JenaEngine.createInstanceOfClass(model, NS, "MilitaryPostalAgency", identifiant_du_site);  //Don't exist because don't have coords
			            }
			            
			            JenaEngine.updateValueOfDataTypeProperty(model, NS, identifiant_du_site, "id", identifiant_du_site);
		            	JenaEngine.updateValueOfDataTypeProperty(model, NS, identifiant_du_site, "name", libelle_du_site);
		            	
		            	//Create instance of Location
		            	String loc = "location_"+identifiant_du_site;
		            	JenaEngine.createInstanceOfClass(model, NS, "Location", loc);
		            	JenaEngine.updateValueOfDataTypeProperty(model, NS, loc, "adress", adresse);
		            	JenaEngine.updateValueOfDataTypeProperty(model, NS, loc, "latitude", lat);
		            	JenaEngine.updateValueOfDataTypeProperty(model, NS, loc, "longitude", lg);
		            	
		            	
		            	//Create instance of City
		            	localite = replaceUnsupportedCharacters(localite);
		            	String city = localite.replaceAll("\\s+","_");
		            	JenaEngine.createInstanceOfClass(model, NS, "City", city);
		            	JenaEngine.updateValueOfDataTypeProperty(model, NS, city, "cityname", cleanCityName(localite));
		            	JenaEngine.updateValueOfDataTypeProperty(model, NS, city, "country", pays);
		            	JenaEngine.updateValueOfDataTypeProperty(model, NS, city, "department", dept);
		            	
		            	//Add a location to a Building
		            	//Add a city to a Location 
		            	JenaEngine.updateValueOfObjectProperty(model, NS, identifiant_du_site, "location", loc);
		            	JenaEngine.updateValueOfObjectProperty(model, NS, loc, "city", city);
		            } else {
		            	//System.out.println(libelle_du_site);
		            }
		            
		        }
				
		        
		        //FOR THE SECOND JSON FILE
		      //get the json array from the json file
				obj = parser.parse(new FileReader("data/bibliotheques_publiques.json"));
				JSONArray biblio_pub_list = (JSONArray) obj;
				i = biblio_pub_list.iterator();
		        while (i.hasNext()) {
		        	
		        	//Get the json object :
		            JSONObject pt = (JSONObject) i.next();
		            
		          //Get the interesting fields
		            JSONObject fields = (JSONObject)pt.get("fields");
		            Double identifiant_du_site = (Double) fields.get("code_bib");
		            String libelle_du_site = (String) fields.get("libelle1");
		            String caracteristique_du_site = (String) fields.get("comment");
		            String pays = "FRANCE";
		            String localite = (String) fields.get("adresse_ville");
		            String adresse = (String) fields.get("voie");
		            String dep = (String) fields.get("dept");
		            dep = dep.replaceAll("[^\\d.]", "");
		            String coordonnees = (String) fields.get("coordonnees_insee");
		            
		          //Create Instance of a Library if coordinates exist
		            if(coordonnees != null && caracteristique_du_site!=null && localite!=null) {
		            	
		            	//to avoid error
		            	if(adresse==null) {
		            		adresse= "";
		            	}
		            	//change type
		            	String id = String.valueOf(identifiant_du_site);
		            	int dept = Integer.parseInt(dep);
		            	localite =localite.toUpperCase();
		            	
		            	String[] coords = coordonnees.split(", "); //get latitude and longitude
		            	String latitude = coords[0];
		            	String longitude = coords[1];
		            	float lat = Float.parseFloat(latitude);
			            float lg = Float.parseFloat(longitude);
			            
			            // Create instance of different class 
			            if(caracteristique_du_site.equals("Bibliothèque municipale")) {
			            	JenaEngine.createInstanceOfClass(model, NS, "MunicipalLibrary", id);         	
			            } else if(caracteristique_du_site.equals("Bibliothèque départementale")){
			            	JenaEngine.createInstanceOfClass(model, NS, "DepartmentalLibrary", id); 
			            } else if(caracteristique_du_site.equals("Bibliothèque municipale classée")){
			            	JenaEngine.createInstanceOfClass(model, NS, "ListedMunicipalLibrary", id); ;
			            } else {
			            	//System.out.println(caracteristique_du_site);
			            }
			            
			            JenaEngine.updateValueOfDataTypeProperty(model, NS, id, "id", id);
		            	JenaEngine.updateValueOfDataTypeProperty(model, NS, id, "name", libelle_du_site);
		            	
		            	//Create instance of Location
		            	String loc = "location_"+id;
		            	JenaEngine.createInstanceOfClass(model, NS, "Location", loc);
		            	JenaEngine.updateValueOfDataTypeProperty(model, NS, loc, "adress", adresse);
		            	JenaEngine.updateValueOfDataTypeProperty(model, NS, loc, "latitude", lat);
		            	JenaEngine.updateValueOfDataTypeProperty(model, NS, loc, "longitude", lg);
		            	
		            	localite = replaceUnsupportedCharacters(localite);
		            	String city = localite.replaceAll("\\s+","_");
		            	//Create instance of City
		            	JenaEngine.createInstanceOfClass(model, NS, "City", city);
		            	JenaEngine.updateValueOfDataTypeProperty(model, NS, city, "cityname", cleanCityName(localite));
		            	JenaEngine.updateValueOfDataTypeProperty(model, NS, city, "country", pays);
		            	JenaEngine.updateValueOfDataTypeProperty(model, NS, city, "department", dept);
		            	
		            	//Add a location to a Building
		            	//Add a city to a Location 
		            	JenaEngine.updateValueOfObjectProperty(model, NS, id, "location", loc);
		            	JenaEngine.updateValueOfObjectProperty(model, NS, loc, "city", city);
		            } else {
		            	//System.out.println(libelle_du_site);
		            }
		        }
				
		        //FOR THE THIRD JSON FILE
		      //get the json array from the json file
				obj = parser.parse(new FileReader("data/bibliotheques_enseignement_superieur.json"));
				JSONArray biblio_sup_list = (JSONArray) obj;
				
				//iterate over the json array
				i = biblio_sup_list.iterator();
		        while (i.hasNext()) {
		        	
		        	//Get the json object :
		            JSONObject pt = (JSONObject) i.next();
		            
		          //Get the interesting fields
		            JSONObject fields = (JSONObject)pt.get("fields");
		            String identifiant_du_site = (String) fields.get("id");
		            String libelle_du_site = (String) fields.get("nomlong");
		            //String caracteristique_du_site = (String) fields.get("comment");
		            String pays = "FRANCE";
		            String localite = (String) fields.get("adresse_ville");
		            String adresse = (String) fields.get("adresse_adresse");
		            String dep = (String) fields.get("adresse_codepostal");
		            
		            JSONArray coordonnees = (JSONArray) fields.get("geo");
		            List<String> list = new ArrayList<String>();   
		            
		          //Create Instance of a HigherEducationLibrary if coordinates exist
		            if (coordonnees != null && dep!=null) {
		            	if(adresse==null) {
		            		adresse= "";
		            	}
		               int len = coordonnees.size();
		               for (int j=0;j<len;j++){ 
		                list.add(coordonnees.get(j).toString());
		               }
		               String latitude = list.get(0);
		               String longitude = list.get(1);
		               float lat = Float.parseFloat(latitude);
			           float lg = Float.parseFloat(longitude);
		               
		               dep = dep.substring(0,2);
		               int dept = Integer.parseInt(dep);
		               localite =localite.toUpperCase();

		               //create instance
			           JenaEngine.createInstanceOfClass(model, NS, "HigherEducationLibrary", identifiant_du_site);         				           
			            
			           JenaEngine.updateValueOfDataTypeProperty(model, NS, identifiant_du_site, "id", identifiant_du_site);
			           JenaEngine.updateValueOfDataTypeProperty(model, NS, identifiant_du_site, "name", libelle_du_site);
		            	
			           //Create instance of Location
			           String loc = "location_"+identifiant_du_site;
			           JenaEngine.createInstanceOfClass(model, NS, "Location", loc);
			           JenaEngine.updateValueOfDataTypeProperty(model, NS, loc, "adress", adresse);
			           JenaEngine.updateValueOfDataTypeProperty(model, NS, loc, "latitude", lat);
			           JenaEngine.updateValueOfDataTypeProperty(model, NS, loc, "longitude", lg);
			           
			           localite = replaceUnsupportedCharacters(localite);
			           String city = localite.replaceAll("\\s+","_");
			           //Create instance of City
			           JenaEngine.createInstanceOfClass(model, NS, "City", city);
			           JenaEngine.updateValueOfDataTypeProperty(model, NS, city, "cityname", cleanCityName(localite));
			           JenaEngine.updateValueOfDataTypeProperty(model, NS, city, "country", pays);
			           JenaEngine.updateValueOfDataTypeProperty(model, NS, city, "department", dept);
			           
			           //Add a location to a Building
			           //Add a city to a Location 
			           JenaEngine.updateValueOfObjectProperty(model, NS, identifiant_du_site, "location", loc);
			           JenaEngine.updateValueOfObjectProperty(model, NS, loc, "city", city);
		               
		            } else {
		            	//System.out.println(libelle_du_site);
		            }
		        }

		        
			} catch (Exception e) {
				e.printStackTrace();
			}
			
			model.write(System.out, "Turtle");
			

		} else {
			System.out.println("Error when reading model from ontology");
		}
	}
	
	//Replace unsupported characters 
	static String replaceUnsupportedCharacters(String cityname){
		cityname = cityname.replaceAll("Ãˆ","E");
		cityname = cityname.replaceAll("Ã‰","E");
		cityname = cityname.replaceAll("Ã‹","E");
		cityname = cityname.replaceAll("Ã”","E");
		cityname = cityname.replaceAll("Ã‡","C");
		cityname = cityname.replaceAll("Ã‚","A");
		cityname = cityname.replaceAll("Ã›","U");
		cityname = cityname.replaceAll("Å¸","Y");
		return cityname;
	}
	
	
	static String cleanCityName(String cityname){
		cityname = cityname.replaceAll("\\d","");
		cityname = cityname.replace(" CEDEX ","");
		cityname = cityname.replace(" CEDEX","");
		cityname = cityname.replace("CEDEX ","");
		cityname = cityname.replaceAll("-"," ");
		return cityname;
	}
}

