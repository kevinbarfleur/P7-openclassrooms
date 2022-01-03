import { Loader } from "@googlemaps/js-api-loader";
import { notification } from "./services";
export default class Map {
  constructor(apiKey, version, libraries = []) {
    this.apiKey = apiKey;
    this.version = version;
    this.libraries = libraries;
    this.markers = [];
    this.dynamicPlaces = [];
    this.nearbyPlaces = [];
    this.tempPlaces = [];
  }

  loader() {
    return new Loader({
      apiKey: this.apiKey,
      version: this.version,
      libraries: this.libraries,
    });
  }

  /*
    Init all related Google map instance & return them
  */
  init(coords, zoom) {
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
  }

  /*
    Listen for  autocomplete change & see selected etablishment

    map: map element (Object)
  */
  autocompleteListener(map, autocomplete, markers) {
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
  }

  /*
    Retun address with geocode

    geocoder: geocoder element (Object)
    event: click event (Object)
  */
  async geocodeLatLng(geocoder, event) {
    const latlng = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };

    // Set street view image in popup
    this.setStreetView(event.latLng.lat(), event.latLng.lng());

    return await geocoder.geocode({ location: latlng }).then((response) => {
      return response.results[0].formatted_address;
    });
  }

  /*
    Get street view image

    lat: latitude (String)
    lng: longitude (String)
  */
  async setStreetView(lat, lng) {
    const streetViewImg = document.querySelector(".modal-street-view");
    streetViewImg.src = await this.getStreetView(lat, lng);
  }

  /*
    Get street view image

    lat: latitude (String)
    lng: longitude (String)
  */
  async getStreetView(lat, lng) {
    return `https://maps.googleapis.com/maps/api/streetview?size=400x200&location=${lat},${lng}
    &fov=80&heading=70&pitch=0
    &key=${apiKey}`;
  }

  /*
    Get place details

    placeId: place_id (String)
 */
  async getPlaceDetails(placeId) {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`;
    return await fetch(url).then((response) => response.json());
  }

  /*
    Add marker

    map: map element (Object)
    coord: new marker coordinate (Object)
    name: new marker name (String)
  */
  newMarker(map, coords, name = "", icon = "") {
    return new google.maps.Marker({
      position: { lat: coords.lat, lng: coords.lng },
      map,
      title: name,
      icon,
    });
  }

  /*
    Clear all markers

    markers: Markers storage (Array)
  */
  clearMarkers() {
    for (let i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(null);
    }
  }
}
