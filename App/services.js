import errorIconURL from "./assets/error.svg";
import happyIconURL from "./assets/emoji-happy.svg";
import sadIconURL from "./assets/emoji-sad.svg";

import { _map } from "./main";
import { closeLittleModal } from "./handleUI";

const noficationContainer = document.querySelector(".notification");
const reviewContainer = document.querySelector(".review-modal");
const addContainer = document.querySelector(".add-modal");
const modalOverlay = document.querySelector(".modal-overlay");
const reviewModalName = document.querySelector(".modal-name");
const modalAddress = document.querySelector(".modal-address");
export const littleModalContainer = document.querySelector(".little-modal");
const currentAdress = document.querySelector(".current-address");
const fetchingNotificationContainer = document.querySelector(
  ".fetching-notification"
);
const loadingBar = document.querySelector(".loading-content");

const icon = (url) =>
  `<img src="${url}" class="notification-icon" alt="${url} icon">`;

export const notification = (type, content) => {
  let message;

  switch (type) {
    case "error":
      message = content?.text
        ? `${icon(errorIconURL)} <span>No details available for input: "${
            content.text
          }".</span>`
        : `${icon(errorIconURL)} <span>Unknown error. Please retry.</span>`;
      break;
    case "success":
      message = `${icon(
        happyIconURL
      )} <span>Your review has successfully been left, thank you for your participation.</span>`;
      break;
    case "sad":
      message = `${icon(
        sadIconURL
      )} <span>Your review has successfully been left, thank you for your participation.</span>`;
      break;
    case "add":
      message = `${icon(
        happyIconURL
      )} <span>Your establishment has successfully been added, thank you for your participation!</span>`;
      console.log(message);
      break;
    default:
      break;
  }

  noficationContainer.innerHTML = message;
  noficationContainer.classList.add("active");
  setTimeout(() => {
    noficationContainer.classList.remove("active");
  }, 5000);
};

export const openReviewModal = (place) => {
  reviewModalName.innerHTML = `(${place.restaurantName})`;
  const reviewForm = document.getElementById("review-form");
  reviewForm.querySelector(".name-input").value = "";

  const ratingStars = document.querySelectorAll(".rating-stars");
  ratingStars.forEach((star) => (star.checked = false));

  reviewForm.querySelector(".comment-input").value = "";

  modalOverlay.style.display = "block";
  reviewContainer.style.display = "block";
  setTimeout(() => {
    modalOverlay.classList.add("active");
    reviewContainer.classList.add("active");
  }, 1);
};

export const closeReviewModal = () => {
  modalOverlay.classList.remove("active");
  reviewContainer.classList.remove("active");
  modalOverlay.style.display = "none";
  setTimeout(() => {
    reviewContainer.style.display = "none";
  }, 400);
};

export const littleModal = async (event, geocoder) => {
  const address = await _map.geocodeLatLng(geocoder, event);
  currentAdress.innerHTML = address;
  const mousePos = { x: event.domEvent.clientX, y: event.domEvent.clientY };
  littleModalContainer.style.display = "block";
  littleModalContainer.style.left = mousePos.x + "px";
  littleModalContainer.style.top = mousePos.y + "px";

  const pointedCoordinates = {
    lat: event.latLng.lat(),
    lng: event.latLng.lng(),
  };

  return { pointedAddress: address, pointedCoordinates };
};

export const openAddModal = (address) => {
  closeLittleModal();
  modalAddress.innerHTML = `${address}`;
  const addForm = document.getElementById("add-form");
  addForm.querySelector(".name-input").value = "";

  modalOverlay.style.display = "block";
  addContainer.style.display = "block";
  setTimeout(() => {
    modalOverlay.classList.add("active");
    addContainer.classList.add("active");
  }, 1);
};

export const closeAddModal = () => {
  modalOverlay.classList.remove("active");
  addContainer.classList.remove("active");
  modalOverlay.style.display = "none";
  setTimeout(() => {
    addContainer.style.display = "none";
  }, 400);
};

export const fetchingNotification = (action) => {
  if (action === "open") {
    const loadingElement =
      fetchingNotificationContainer.querySelector(".loading-content");
    loadingElement.style.height = "300px";
    fetchingNotificationContainer.classList.add("active");
  } else if (action === "close") {
    fetchingNotificationContainer.classList.remove("active");
  } else if (action === "progress") {
    loadingBar.style.transform = "translate3d(-66%, 0, 0)";
    setTimeout(() => {
      loadingBar.style.transform = "translate3d(-33%, 0, 0)";
    }, 2000);
    setTimeout(() => {
      loadingBar.style.transform = "translate3d(0%, 0, 0)";
    }, 4000);
    setTimeout(() => {
      fetchingNotification("close");
      loadingBar.style.transform = "translate3d(-100%, 0, 0)";
    }, 6000);
  }
};
