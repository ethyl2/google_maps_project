var map;
var markers = [];
var locations = [
  {title: 'Lindon Pioneer Park', location: {lat: 40.335168, lng: -111.702404}},
  {title: 'Lindon Aquatics Center', location: {lat: 40.340225, lng: -111.716937}},
  {title: 'Lindon Community Center', location: {lat: 40.339282, lng: -111.715786}},
  {title: 'Lindon City Center Park', location: {lat: 40.341354, lng: -111.717734}}
]
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.343286, lng: -111.720761},
    zoom: 15,
    // Map style is from https://snazzymaps.com/style/35/avocado-world
    styles: [{"featureType":"water","elementType":"geometry", "stylers":[{"visibility":"on"},
       {"color":"#aee2e0"}]},
     {"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#abce83"}]},

     {"featureType":"poi","elementType":"geometry.fill","stylers":[{"color":"#769E72"}]},
     {"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#7B8758"}]},
     {"featureType":"poi","elementType":"labels.text.stroke","stylers":[{"color":"#EBF4A4"}]},

     {"featureType":"poi.park","elementType":"geometry","stylers":[{"visibility":"simplified"},
       {"color":"#8dab68"}]},

     {"featureType":"road","elementType":"geometry.fill","stylers":[{"visibility":"simplified"}]},
     {"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#5B5B3F"}]},
     {"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#ABCE83"}]},
     {"featureType":"road","elementType":"labels.icon","stylers":[{"visibility":"off"}]},

     {"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#A4C67D"}]},
     {"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#9BBF72"}]},
     {"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#EBF4A4"}]},
     {"featureType":"transit","stylers":[{"visibility":"off"}]},

     {"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"visibility":"on"},
       {"color":"#87ae79"}]},
     {"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#7f2200"},
       {"visibility":"off"}]},
     {"featureType":"administrative","elementType":"labels.text.stroke", "stylers":[{"color":"#ffffff"},
       {"visibility":"on"},{"weight":4.1}]},
     {"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#495421"}]},
     {"featureType":"administrative.neighborhood","elementType":"labels","stylers":[{"visibility":"off"}]}]
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
              pitch: 30
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
