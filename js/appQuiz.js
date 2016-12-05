var map;
var markers = [];
var locations = [
  {title: 'La Sagrada Familia', location: {lat: 41.403203, lng: 2.174851}},
  {title: 'Southern Sagrada Familia', location: {lat: 41.4031, lng: 2.174851}},
  {title: 'Quiz Location 1', location: {lat: 41.40404, lng: 2.17513}},
  {title: 'Quiz Location 2', location: {lat: 41.40315, lng: 2.17380}}
]
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 41.403203, lng: 2.174851},
    zoom: 15,
  });

  var infoWindow = new google.maps.InfoWindow();
  var bounds = new google.maps.LatLngBounds();
  var defaultIcon = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
  var highlightedIcon = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';

  for (var i = 0; i < locations.length; i++) {
    var name = locations[i].title;
    var position = locations[i].location;
    var marker = new google.maps.Marker({
      position: position,
      title: name,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon
    });
    markers.push(marker);
    bounds.extend(marker.position);
    marker.addListener('click', function() {
      populateInfoWindow(this, infoWindow);
    })
    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });
  }

  populateInfoWindow = function(myMarker, myWindow) {
    if (myWindow.marker != myMarker) {
      myWindow.marker = myMarker;

      var streetViewService = new google.maps.StreetViewService();
      var radius = 50;
      // In case the status is OK, which means the pano was found, compute the
      // position of the streetview image, then calculate the heading, then get a
      // panorama from that and set the options
      function getStreetView(data, status) {
        if (status == google.maps.StreetViewStatus.OK) {
          var nearStreetViewLocation = data.location.latLng;
          var heading = google.maps.geometry.spherical.computeHeading(
            nearStreetViewLocation, myMarker.position);
          myWindow.setContent('<div>' + myMarker.title + '<br>' + myMarker.position + '</div><div id="pano"></div>');
          var panoramaOptions = {
            position: nearStreetViewLocation,
            pov: {
              heading: heading,
              pitch: 40
              }
            };
          var panorama = new google.maps.StreetViewPanorama(
            document.getElementById('pano'), panoramaOptions);
        } else {
          infowindow.setContent('<div>' + myMarker.title + '</div>' +
            '<div>No Street View Found</div>');
        }
      }
      // Use streetview service to get the closest streetview image within
      // 50 meters of the markers position
      streetViewService.getPanoramaByLocation(myMarker.position, radius, getStreetView);
      // Open the infowindow on the correct marker.
      myWindow.open(map, myMarker);
    }
  }

  document.getElementById('show-places').addEventListener('click', showPlaces);
  document.getElementById('hide-places').addEventListener('click', hidePlaces);
}

showPlaces = function() {
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}

hidePlaces = function() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}
