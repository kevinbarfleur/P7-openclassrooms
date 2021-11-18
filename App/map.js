import { Loader } from "@googlemaps/js-api-loader";
import { errorNotification } from "./services";

export const mapLoader = new Loader({
  apiKey: "AIzaSyCtcuLlu2_7aP1ZCUI6kAVZY8K4KMJ-BJA",
  version: "weekly",
  libraries: ["places"],
});

/*
Listen for  autocomplete change & see selected etablishment

map: map element (Object)
*/
export function autocompleteListener(map, autocomplete, markers) {
  const place = autocomplete.getPlace();
  console.log(place);

  if (!place.geometry || !place.geometry.location) {
    errorNotification(place.name);
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
}

export const geocodeLatLng = async (geocoder, event) => {
  const latlng = {
    lat: event.latLng.lat(),
    lng: event.latLng.lng(),
  };

  return await geocoder.geocode({ location: latlng }).then((response) => {
    return response.results[0].formatted_address;
  });
};
