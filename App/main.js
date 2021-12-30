// TODO icone utilisateur (marker)
// TODO Check validation w3c html/css
// TODO commentaire dans le main
// TODO Refactor POO
// TODO faire attention à refilter à l'ajout d'une nouvelle note

import "./styles/reset.css";
import "./styles/main.scss";

import "./handleUI.js";
import {
  mapLoader,
  autocompleteListener,
  initMapInstances,
  newMarker,
  clearMarkers,
  setStreetView,
} from "./map.js";
import defaultPlaces from "./dictionary/defaultPlaces.json";
import { placeTemplate } from "./templates";
import {
  notification,
  openReviewModal,
  closeReviewModal,
  littleModal,
  openAddModal,
  closeAddModal,
  fetchingNotification,
} from "./services";

const placesContainer = document.getElementById("results");
const addAddress = document.querySelector(".add-address");
const filterStars = document.querySelectorAll(".filter-stars");
const placesCheckbox = document.querySelector(".toggle-places");
export const reviewForm = document.getElementById("review-form");
export const addForm = document.getElementById("add-form");
let addReview;
let selectedEstablishment;
let pointedAddress, pointedCoordinates;
let placesItems;
export let dragMode = true; // True by default
let dragListener = null;

const markers = [];
let dynamicPlaces = defaultPlaces;
let nearbyPlaces = [],
  tempPlaces = [];
let selectedFilter = 5;

addAddress.addEventListener("click", () => {
  openAddModal(pointedAddress);
});

function init(coords, zoom) {
  mapLoader.load().then(async () => {
    const { autocomplete, map, geocoder, serviceInstance } = initMapInstances(
      coords,
      zoom
    );
    await updateEstablishments(map, dynamicPlaces);

    addReview = await document.querySelectorAll(".add-review");
    addReview.forEach((button, index) => {
      button.addEventListener("click", () => {
        openReviewModal(dynamicPlaces[index]);
      });
    });

    placesItems = document.querySelectorAll(".place");
    placesItems.forEach((place, index) => {
      place.addEventListener("click", () =>
        seeEstablishment(map, place, index)
      );
    });
    autocomplete.addListener("place_changed", () =>
      autocompleteListener(map, autocomplete, markers)
    );
    reviewForm.addEventListener(
      "submit",
      async (event) => await submitReviewForm(event)
    );
    addForm.addEventListener("submit", (event) => submitAddForm(event, map));

    placesCheckbox.addEventListener("click", async (event) => {
      if (event.target.checked) {
        tempPlaces = dynamicPlaces;
        dynamicPlaces = [];
        await updateEstablishments(map, dynamicPlaces);
        searchNearbyPlaces(map, serviceInstance);
      } else {
        google.maps.event.removeListener(dragListener);
        clearMarkers(markers);
        dynamicPlaces = tempPlaces;
        await updateEstablishments(map, dynamicPlaces);
      }

      filterStars.forEach((star) => (star.checked = false));
    });

    // filterInput.addEventListener("input", async (event) => {
    //   const filteredPlaces = dynamicPlaces.filter(
    //     (place) =>
    //       parseInt(place.average) <= event.target.value || !place.average
    //   );
    //   await updateEstablishments(map, filteredPlaces);
    // });

    filterStars.forEach(async (star, index) => {
      star.addEventListener("click", async () => {
        selectedFilter = 5 - index;
        const filteredPlaces = dynamicPlaces.filter(
          (place) => parseFloat(place.average) <= 5 - index || !place.average
        );
        await updateEstablishments(map, filteredPlaces);
      });
    });

    map.addListener("click", async (event) => {
      clearMarkers(markers);
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

    dragListener = map.addListener("dragend", () =>
      handleDragListener(map, serviceInstance)
    );
  });
}

/*
  See place on visible on viewport

  map: map element (Object)
*/
const searchNearbyPlaces = async (map, serviceInstance) => {
  clearMarkers(markers);
  fetchingNotification("open");
  fetchingNotification("progress");

  let placesDetails = [];

  const placeDetailsCallback = async (place, status) => {
    const reviews = place
      ? place.reviews.map((review) => ({
          name: review.author_name,
          stars: parseFloat(review.rating),
          comment: review.text,
        }))
      : [];

    if (!place) return;
    const formaredPlace = {
      restaurantName: place.name,
      address: place.vicinity,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      ratings: reviews,
    };

    placesDetails.push(formaredPlace);
    dynamicPlaces = [...dynamicPlaces, ...placesDetails];
  };

  const nearbySearchCallback = async (results, status, pagination) => {
    console.log(pagination);
    if (results) {
      for (let result of results) {
        nearbyPlaces.push(result);
      }

      nearbyPlaces = nearbyPlaces.map(async (place) => {
        if (!place) return;

        if (place.place_id) {
          serviceInstance.getDetails(
            {
              placeId: place.place_id,
              fields: ["name", "reviews", "geometry", "vicinity"],
            },
            placeDetailsCallback
          );
        }

        if (place.place_id && place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          markers.push(newMarker(map, { lat, lng }));
        } else {
          return {};
        }

        return {
          restaurantName: place.name,
          address: place.vicinity,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          ratings: [],
        };
      });

      await updateEstablishments(map, dynamicPlaces);

      if (pagination && pagination.hasNextPage) {
        pagination.nextPage();
      }
    }
  };

  const request = {
    location: map.getCenter(),
    radius: 50000,
    type: ["restaurant"],
  };

  serviceInstance.nearbySearch(request, nearbySearchCallback);
  return;
};

/*
  See place on visible on viewport

  map: map element (Object)
*/
const handleDragListener = async (map, serviceInstance) => {
  clearMarkers(markers);
  const isPlaces = placesCheckbox.checked;
  if (isPlaces) {
    dynamicPlaces = [];
    await updateEstablishments(map, dynamicPlaces);
    searchNearbyPlaces(map, serviceInstance);
  }
  if (!dragMode) return;

  const northEastLat = map.getBounds().getNorthEast().lat();
  const northEastLng = map.getBounds().getNorthEast().lng();
  const southWestLat = map.getBounds().getSouthWest().lat();
  const southWestLng = map.getBounds().getSouthWest().lng();

  const filteredPlace = dynamicPlaces.filter(
    (place) =>
      place.lat < northEastLat &&
      place.lat > southWestLat &&
      place.lng < northEastLng &&
      place.lng > southWestLng
  );

  addReview.forEach((button, index) => {
    button.removeEventListener("click", () => {
      openReviewModal(dynamicPlaces[index]);
    });
  });

  await updateEstablishments(map, filteredPlace);
  updateReviewListiner(filteredPlace);

  addReview = document.querySelectorAll(".add-review");
  addReview.forEach((button, index) => {
    button.addEventListener("click", () => {
      openReviewModal(dynamicPlaces[index]);
    });
  });

  for (let place of dynamicPlaces) {
    if (
      place.lat < northEastLat &&
      place.lat > southWestLat &&
      place.lng < northEastLng &&
      place.lng > southWestLng
    ) {
      markers.push(
        newMarker(map, {
          lat: place.lat,
          lng: place.lng,
        })
      );
    }
  }
};

/*
  See place on map when selected

  map: map element (Object)
  place: place element in DOM (Node)
  index: forEach index, current  place (Number)
*/
const seeEstablishment = (map, place, index) => {
  clearMarkers(markers);

  const selectedPlaceIndex = dynamicPlaces.indexOf(
    dynamicPlaces.filter(
      (item) =>
        item.lat === parseFloat(place.getAttribute("data-lat")) &&
        item.lng === parseFloat(place.getAttribute("data-lng"))
    )[0]
  );
  const selectedPlace = dynamicPlaces[selectedPlaceIndex];

  selectedEstablishment = selectedPlaceIndex;

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

  const coord = { lat: selectedPlace.lat, lng: selectedPlace.lng };
  markers.push(newMarker(map, coord, place.restaurantName));
  map.panTo(coord);
};

/*
  Submit new  review

  event: form submet event (Object)
  placesItems: places HTML nodes (node)
*/
const submitReviewForm = async (event) => {
  event.preventDefault();
  placesItems = document.querySelectorAll(".place");
  const currentElement = placesItems[selectedEstablishment];

  // When the template is updated, this function try to update a DOM node he doesnt exist
  const name = event.srcElement[0].value;
  const stars = Array.from(event.srcElement).find(
    (input) => input.getAttribute("name") === "rating-star" && input.checked
  ).value;
  const comment = event.srcElement[6].value;

  // Format new review object
  dynamicPlaces[selectedEstablishment].ratings = [
    ...dynamicPlaces[selectedEstablishment].ratings,
    {
      name,
      stars: parseFloat(stars),
      comment,
    },
  ];

  // Handle DOM update and animations
  currentElement.innerHTML = await placeTemplate(
    dynamicPlaces[selectedEstablishment],
    false
  );

  const ratingsElement = currentElement.querySelector(".ratings");
  ratingsElement.classList.remove("hidden");
  ratingsElement.style.transition = "0s";
  ratingsElement.style.maxHeight = ratingsElement.scrollHeight + "px";

  // Filter with new stars
  const filteredPlaces = dynamicPlaces.filter(
    (place) => parseFloat(place.average) <= selectedFilter || !place.average
  );
  await updateEstablishments(map, filteredPlaces);

  // remove old listener and add new one on all buttons
  updateReviewListiner(dynamicPlaces);
  closeReviewModal();

  if (stars <= 2) notification("sad");
  else notification("success");
};

const submitAddForm = async (event, map) => {
  event.preventDefault();
  const name = event.srcElement[0].value;

  const establishment = {
    restaurantName: name,
    address: pointedAddress,
    lat: pointedCoordinates.lat,
    lng: pointedCoordinates.lng,
    ratings: [],
  };

  setStreetView(establishment.lat, establishment.lng);

  dynamicPlaces = [...dynamicPlaces, establishment];
  closeAddModal();
  await updateEstablishments(map, dynamicPlaces);
  updateReviewListiner(dynamicPlaces);
  notification("add");
};

const updateEstablishments = async (map, collection) => {
  placesContainer.innerHTML = "";
  for (let place of collection) {
    placesContainer.innerHTML += await placeTemplate(place);
  }
  placesItems = document.querySelectorAll(".place");
  placesItems.forEach((place, index) => {
    place.addEventListener("click", () => seeEstablishment(map, place, index));
  });

  addReview = await document.querySelectorAll(".add-review");
  addReview.forEach((button, index) => {
    button.addEventListener("click", () => {
      openReviewModal(dynamicPlaces[index]);
    });
  });
};

const updateReviewListiner = (collection) => {
  // remove old listener and add new one on all buttons
  addReview.forEach((button, index) => {
    button.removeEventListener("click", () => {
      openReviewModal(collection[index]);
    });
  });
  addReview = document.querySelectorAll(".add-review");
  addReview.forEach((button, index) => {
    button.addEventListener("click", () => {
      openReviewModal(collection[index]);
    });
  });
};

// Initialize map
navigator.geolocation.getCurrentPosition(
  async (data) => {
    init(
      await { lat: data.coords.latitude, lng: data.coords.longitude },
      12 /* Zoom */
    );
  },
  (err) => {
    console.log(err);
    init({ lat: 48.8534, lng: 2.3488 }, 12 /* Zoom */);
  }
);
