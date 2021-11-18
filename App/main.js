import "./styles/reset.css";
import "./styles/main.scss";

import "./handleUI.js";
import { mapLoader, autocompleteListener } from "./map.js";
import defaultPlaces from "./dictionary/defaultPlaces.json";
import { placeTemplate } from "./templates";
import {
  addNotification,
  successNotification,
  sadNotification,
  openReviewModal,
  closeReviewModal,
  littleModal,
  openAddModal,
  closeAddModal,
} from "./services";

const placesContainer = document.getElementById("results");
const placesInput = document.querySelector(".autocomplete");
const addAddress = document.querySelector(".add-address");
export const reviewForm = document.getElementById("review-form");
export const addForm = document.getElementById("add-form");
let addReview;
let selectedEstablishment;
let pointedAddress, pointedCoordinates;

let map, autocomplete, geocoder, infowindow;
const markers = [];
let dynamicPlaces = defaultPlaces;

const mapOptions = {
  zoom: 12,
  center: { lat: 48.8534, lng: 2.3488 },
};

const placesOptions = {
  bounds: {
    north: mapOptions.center.lat + 0.1,
    south: mapOptions.center.lat - 0.1,
    east: mapOptions.center.lng + 0.1,
    west: mapOptions.center.lng - 0.1,
  },
  componentRestrictions: false,
  fields: ["address_components", "geometry", "icon", "name", "photos"],
  strictBounds: false,
  types: ["restaurant"],
};

updateEstablishments();

addReview = document.querySelectorAll(".add-review");
addReview.forEach((button, index) => {
  button.addEventListener("click", () => {
    openReviewModal(dynamicPlaces[index]);
  });
});

const closeButtons = document.querySelectorAll(".close-button");
closeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    closeReviewModal();
    closeAddModal();
  });
});

addAddress.addEventListener("click", () => {
  openAddModal(pointedAddress);
});

mapLoader.load().then(() => {
  autocomplete = new google.maps.places.Autocomplete(placesInput);
  map = new google.maps.Map(document.getElementById("map"), mapOptions);
  autocomplete.bindTo("bounds", map);

  geocoder = new google.maps.Geocoder();
  infowindow = new google.maps.InfoWindow();

  const placesItems = document.querySelectorAll(".place");
  placesItems.forEach((place, index) => {
    place.addEventListener("click", () => seeEstablishment(map, place, index));
  });

  autocomplete.addListener("place_changed", () =>
    autocompleteListener(map, autocomplete, markers)
  );

  reviewForm.addEventListener("submit", (event) => submitReviewForm(event));

  addForm.addEventListener("submit", (event) => submitAddForm(event));

  map.addListener("click", async (event) => {
    clearMarkers();
    const results = await littleModal(event, geocoder);
    pointedAddress = results.pointedAddress;
    pointedCoordinates = results.pointedCoordinates;

    const marker = new google.maps.Marker({
      position: {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      },
      map,
    });

    markers.push(marker);
  });
});

/*
  See place on map when selected

  map: map element (Object)
  place: place element in DOM (Node)
  index: forEach index, current  place (Number)
*/
function seeEstablishment(map, place, index) {
  clearMarkers();

  let currentPlace = dynamicPlaces[index];
  selectedEstablishment = index;

  const allRatings = document.querySelectorAll(".ratings");
  allRatings.forEach((element) => {
    element.classList.add("hidden");
    element.style.maxHeight = 0;
  });

  const currentElement = place;
  const currentRatingElement = currentElement.querySelector(".ratings");

  currentRatingElement.classList.remove("hidden");
  currentRatingElement.style.transition = "0.4s";
  currentRatingElement.style.maxHeight =
    currentRatingElement.scrollHeight + "px";

  const marker = new google.maps.Marker({
    position: { lat: currentPlace.lat, lng: currentPlace.lng },
    map,
    title: place.restaurantName,
  });

  markers.push(marker);

  map.panTo({
    lat: currentPlace.lat,
    lng: currentPlace.lng,
  });
}

/*
  Clear all markers
*/
function clearMarkers() {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

/*
  Submit new  review

  event: form submet event (Object)
  placesItems: places HTML nodes (node)
*/
function submitReviewForm(event) {
  event.preventDefault();
  const placesItems = document.querySelectorAll(".place");
  const currentElement = placesItems[selectedEstablishment];
  const name = event.srcElement[0].value;
  const stars = event.srcElement[1].value;
  const comment = event.srcElement[2].value;

  // Format new review object
  dynamicPlaces[selectedEstablishment].ratings = [
    ...dynamicPlaces[selectedEstablishment].ratings,
    {
      name,
      stars,
      comment,
    },
  ];

  // Handle DOM update and animations
  currentElement.innerHTML = placeTemplate(
    dynamicPlaces[selectedEstablishment],
    false
  );

  const ratingsElement = currentElement.querySelector(".ratings");
  ratingsElement.classList.remove("hidden");
  ratingsElement.style.transition = "0s";
  ratingsElement.style.maxHeight = ratingsElement.scrollHeight + "px";

  // remove old listener and add new one on all buttons
  updateReviewListiner();
  closeReviewModal();

  if (stars <= 2) sadNotification();
  else successNotification();
}

function submitAddForm(event) {
  event.preventDefault();
  const name = event.srcElement[0].value;

  const establishment = {
    restaurantName: name,
    address: pointedAddress,
    lat: pointedCoordinates.lat,
    lng: pointedCoordinates.lng,
    ratings: [],
  };

  dynamicPlaces = [...dynamicPlaces, establishment];
  closeAddModal();
  updateEstablishments();
  updateReviewListiner();
  addNotification();
}

function updateEstablishments() {
  placesContainer.innerHTML = "";
  for (let place of dynamicPlaces) {
    placesContainer.innerHTML += placeTemplate(place);
  }
  const placesItems = document.querySelectorAll(".place");
  console.log(placesItems);
  placesItems.forEach((place, index) => {
    place.addEventListener("click", () => seeEstablishment(map, place, index));
  });
}

function updateReviewListiner() {
  // remove old listener and add new one on all buttons
  addReview.forEach((button, index) => {
    button.removeEventListener("click", () => {
      openReviewModal(dynamicPlaces[index]);
    });
  });
  addReview = document.querySelectorAll(".add-review");
  addReview.forEach((button, index) => {
    button.addEventListener("click", () => {
      openReviewModal(dynamicPlaces[index]);
    });
  });
}
