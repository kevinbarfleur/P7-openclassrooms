import { Loader } from "@googlemaps/js-api-loader";
import { notification } from "./services";
const streetViewImg = document.querySelector(".modal-street-view");

const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
export const mapLoader = new Loader({
  apiKey,
  version: "weekly",
  libraries: ["places"],
});

/*
Init all related Google map instance & return them
*/
export const initMapInstances = (coords, zoom) => {
  const placesInput = document.querySelector(".autocomplete");
  const mapOptions = {
    zoom,
    center: coords,
  };

  const autocomplete = new google.maps.places.Autocomplete(placesInput);
  const map = new google.maps.Map(document.getElementById("map"), mapOptions);
  const geocoder = new google.maps.Geocoder();
  const infowindow = new google.maps.InfoWindow();
  const serviceInstance = new google.maps.places.PlacesService(map);

  return {
    autocomplete,
    map,
    geocoder,
    infowindow,
    serviceInstance,
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

  // Set street view image in popup
  setStreetView(event.latLng.lat(), event.latLng.lng());

  return await geocoder.geocode({ location: latlng }).then((response) => {
    return response.results[0].formatted_address;
  });
};

/*
Get street view image

lat: latitude (String)
lng: longitude (String)
*/
export const setStreetView = async (lat, lng) => {
  streetViewImg.src = await getStreetView(lat, lng);
};

/*
Get street view image

lat: latitude (String)
lng: longitude (String)
*/
export const getStreetView = async (lat, lng) => {
  return `https://maps.googleapis.com/maps/api/streetview?size=400x200&location=${lat},${lng}
  &fov=80&heading=70&pitch=0
  &key=${apiKey}`;
};

/*
Get place details

placeId: place_id (String)
*/
export const getPlaceDetails = async (placeId) => {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`;
  return await fetch(url).then((response) => response.json());
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
