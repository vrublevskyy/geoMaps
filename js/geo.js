var db = new PouchDB('http://localhost:5984/map');
var map = L.map('map').setView([40.5126759, -3.3502846], 13);
var markerMe = null;
var l_visibles = null;
var layerGroup = null;
var id_updateMe=null;


// add an OpenStreetMap tile layer
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);



$(document).ready(function () {

     $.getJSON('http://nominatim.openstreetmap.org/search?format=json&limit=5&q=' + "lviv", function(data) {
        console.log(data);
     });
    
});

function geoSwitch(){

	if (document.getElementById("my-checkbox").checked) {
		id_updateMe=updateMe();
	}
	else{
        clearInterval(id_updateMe);
	    var grupo = null;
	    db.get(document.getElementById('clave_grupo').value).then(function (doc) {
	        grupo = doc;
	        for (var i = 0; i < doc.conectados.length; i++) {
	            if (document.getElementById('nom_usuario').value == doc.conectados[i].usuario) {
	                doc.conectados.splice(i, 1); 
	            }
	        }
	        db.put(grupo);
	    });

	};

	
}

function markMe(position)
{
    myPos = position;
    var grupo = null;
    var user = null;
    var existe = false;
    markerMe={
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        position.coords.latitude,
                        position.coords.longitude]
                }
            }

  
    map.setView([position.coords.latitude, position.coords.longitude], 16);
}

function showError(error)
{    
    var message = null;  
    
	if (error.core == error.PERMISSION_DENIED)
		message = "El usuario no ha concedido los privilegios de geolocalización.";  
	else if (error.core == error.POSITION_UNAVAILABLE)
		message = "Posicion no disponible.";  
	else if (error.core == error.TIMEOUT)
		message = "Demasiado tiempo intentando obtener la localización del usuario.";  
	else 
		message = "No se ha podido geolocalizar con la configuración de su navegador.";  

	$('#locate').addClass("pure-button pure-button-error");
	alert(message);
}  

function geoMe()
{
	if (map !== null)
	{
		 if (navigator.geolocation)
		 { 
		 	if (markerMe !== null)
				map.removeLayer(markerMe);

			var queryOptions  = {timeout:5000, maximumAge:20000, enableHighAccurace:false};
  			navigator.geolocation.getCurrentPosition(markMe, showError, queryOptions);	
		}
		else
		{
			$('#locate').addClass("pure-button pure-button-error");	
			alert("La geolocalizción HTML5 no esta disponible en su navegador.");
		}
	}
}



function update() {
    if (layerGroup !== null) { map.removeLayer(layerGroup);}
    console.log("update");
        $.getJSON( "http://localhost:5984/map/_changes", function( data ) {
         console.log(data);
        });

    db.get(document.getElementById('clave_grupo').value).then(function (doc) {
        var mark = null;
        visibles = [];
        layerGroup = null;
        for (var i = 0; i < doc.conectados.length; i++) {
            mark = L.marker([doc.conectados[i].geometry.coordinates[0], doc.conectados[i].geometry.coordinates[1]]).bindPopup(doc.conectados[i].usuario);
            visibles.push(mark);
            layerGroup = L.layerGroup(visibles);
            
        }
        layerGroup.addTo(map);
    });

}

function searchText(){
    var response;
    var mark;

     $.getJSON('http://nominatim.openstreetmap.org/search?format=json&limit=5&q=' + document.getElementById('place').value, function(data) {
        for (var i = data.length-1; i>=0; i--) {
         mark={
            "type": data[i].display_name,
            "properties": {},
            "geometry": {
                "type": "Point",
                "coordinates": [
                    data[i].lat,
                    data[i].lon]
                }
            }
            console.log(mark)
            L.marker([mark.geometry.coordinates[0], mark.geometry.coordinates[1]]).addTo(map)
            .bindPopup(mark.type)
            .openPopup();
         };    
     });


    

    
}


