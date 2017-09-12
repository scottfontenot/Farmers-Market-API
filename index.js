//var bootstrap = require('bootstrap');
//var $ = require('jquery');

window.initMap = function(){
   
  
  var markers = [];
   map = new google.maps.Map(document.getElementById('google_map'), {
    center: {lat: 37.0, lng: -105.7},
    zoom: 5,
    mapTypeId: 'roadmap'
  });//end of map
  
  //add click event to get latitude and longitude
        map.addListener('click', function(e) {
        var latitude = e.latLng.lat();
        //alert('latitude= '+latitude);
        var longitude = e.latLng.lng();
        //alert('longitude= '+longitude);
        document.getElementById('textbox1').value = latitude;
        document.getElementById('textbox2').value = longitude;
        var locationCoords = 'Latitude: '+latitude+', Longitude: '+longitude;
        //console.log(locationCoords);
        var marker = addMarker(map, {lat:latitude, lng:longitude});
        
  //remove previous marker and add new one
        removeMarker(null, markers);
  //now to push the marker in markers array in order to remove them
        markers.push(marker);
        getResults(longitude, latitude);
       
    
  });//end of click listener
   
}//end of initMap(called in API script)

   //to remove markers so map only displays one
   function removeMarker(map, markers) {
     for(var i=0; i<markers.length;i++) {
       markers[i].setMap(map);
       //console.log(markers[i]);
     }
   }//end of removeMarker
   
   //now add marker when user clicks and add array having Lat/Lng
  function addMarker(map, center) {
    return new google.maps.Marker({
    position: center,
    animation: google.maps.Animation.DROP,
    label: "M",
    map: map,
    });
}//end of addMarker



///////////////////////////////////////////////////////
function getResults(longitude, latitude) {
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        // submit a get request to the restful service locSearch
        url: "https://search.ams.usda.gov/farmersmarkets/v1/data.svc/locSearch?lat=" + latitude + "&lng=" + longitude,
        dataType: 'jsonp',
        success: function(data) {
                  var marketId = []; 
                  var marketName = []; 
               // console.log(marketName[1]);
                  $.each(data.results, function (i, val) {
                      marketId.push(val.id);
                      marketName.push(val.marketname);
                  }); 
                 //console.log(marketId.toString());
                 getMarketDetails(marketId, marketName);
              }//end of function(data)
    });//end of ajax call
}//end of getResults


function getMarketDetails(arrMarketId, marketName) {
   //console.log(arrMarketId.toString());
   
   var counter = 0;//use to match marketname
   $.each(arrMarketId, function(i, val) {
      //console.log(val);
      $.ajax({
          type: "GET",
          contentType: "application/json; charset=utf-8",
          url: "https://search.ams.usda.gov/farmersmarkets/v1/data.svc/mktDetail?id=" + val,
          dataType: 'jsonp',
          success: function(data) {
                        for (var key in data) {
                        var results = data[key];
                        //console.log(results);
                        
                        var allLatlng = []; 
                        var allMarkers = []; 
                        var infowindow = null;
                        var userCords;
                        var tempMarkerHolder = [];
                        
                        infowindow = new google.maps.InfoWindow({
                            contenot: ""
                          });
                        
                       
                      
                        var googleLink = results['GoogleLink'];
                        //console.log(googleLink);
                        
                        var latLong = decodeURIComponent(googleLink.substring(googleLink.indexOf("=")+1, googleLink.lastIndexOf("(")));
                        //console.log('latLong=>' + latLong);
                        
                        var split = latLong.split(',');
                        //console.log(split);
                        
                        var latitude = parseFloat(split[0]);
                        var longitude = parseFloat(split[1]);
                        //console.log(latitude);
                        //console.log(longitude);
                        
                        myLatlng = new google.maps.LatLng(latitude,longitude);
          
                       allMarkers = new google.maps.Marker({
                            icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                            position: myLatlng,
                            map: map,
                            title: marketName[counter],
                            html: 
                                '<div class="markerPop">' +
                                '<h1>' + marketName[counter].substring(4) + '</h1>' + 
                                '<h3>' + results['Address'] + '</h3>' +
                                '<p>' + results['Products'].split(';') + '</p>' +
                                '<p>' + results['Schedule'] + '</p>' +
                                '</div>',
                          });//end of allMarkers 
                          
                          allLatlng.push(myLatlng);
                          
                          tempMarkerHolder.push(allMarkers);
                
                          counter++;
                          //console.log(counter);
                          google.maps.event.addListener(allMarkers, 'click', function () {
                          infowindow.setContent(this.html);
                          infowindow.open(map, this);
                        }); 
                          
                          // event to close the infoWindow with a click on the map
                           google.maps.event.addListener(map, 'click', function() {
                             infowindow.close();
                           });                        
                        
                        //  Make an array of the LatLng's of the markers you want to show
                        
                        var bounds = new google.maps.LatLngBounds ();
                        
                          
                      } //end of for loop   
        
           }//end of function(data)
        });//end of $.ajax call 
    });//end of $.each(arrMarketId, function(i, val)
  }//end of getMarketDetails







