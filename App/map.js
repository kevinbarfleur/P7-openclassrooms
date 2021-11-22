import { Loader } from "@googlemaps/js-api-loader";
import { notification } from "./services";

export const mapLoader = new Loader({
  apiKey: "AIzaSyCtcuLlu2_7aP1ZCUI6kAVZY8K4KMJ-BJA",
  version: "weekly",
  libraries: ["places"],
});

/*
Init all related Google map instance & return them
*/
export const initMapInstances = () => {
  const placesInput = document.querySelector(".autocomplete");
  const mapOptions = {
    zoom: 12,
    center: { lat: 48.8534, lng: 2.3488 },
  };

  const autocomplete = new google.maps.places.Autocomplete(placesInput);
  const map = new google.maps.Map(document.getElementById("map"), mapOptions);
  const geocoder = new google.maps.Geocoder();
  const infowindow = new google.maps.InfoWindow();

  return {
    autocomplete,
    map,
    geocoder,
    infowindow,
  };
};

/*
Listen for  autocomplete change & see selected etablishment

map: map element (Object)
*/
export const autocompleteListener = (map, autocomplete, markers) => {
  const place = autocomplete.getPlace();

  if (!place.geometry || !place.geometry.location) {
    notification("error", { text: place.name });
    return;
  }
  const marker = new google.maps.Marker({
    position: place.geometry.location,
    map,
    title: place.restaurantName,
  });

  markers.push(marker);
  map.panTo(place.geometry.location);
  map.setZoom(17);
};

/*
Retun address with geocode

geocoder: geocoder element (Object)
event: click event (Object)
*/
export const geocodeLatLng = async (geocoder, event) => {
  const latlng = {
    lat: event.latLng.lat(),
    lng: event.latLng.lng(),
  };

  return await geocoder.geocode({ location: latlng }).then((response) => {
    return response.results[0].formatted_address;
  });
};

/*
Add marker

map: map element (Object)
coord: new marker coordinate (Object)
name: new marker name (String)
*/
export const newMarker = (map, coord, name = "") => {
  return new google.maps.Marker({
    position: { lat: coord.lat, lng: coord.lng },
    map,
    title: name,
  });
};

/*
Clear all markers

markers: Markers storage (Array)
*/
export const clearMarkers = (markers) => {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
};
