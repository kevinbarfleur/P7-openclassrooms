import errorIconURL from "./assets/error.svg";
import happyIconURL from "./assets/emoji-happy.svg";
import sadIconURL from "./assets/emoji-sad.svg";

import { geocodeLatLng } from "./map";
import { closeLittleModal } from "./handleUI";

const noficationContainer = document.querySelector(".notification");
const reviewContainer = document.querySelector(".review-modal");
const addContainer = document.querySelector(".add-modal");
const modalOverlay = document.querySelector(".modal-overlay");
const reviewModalName = document.querySelector(".modal-name");
const modalAddress = document.querySelector(".modal-address");
export const littleModalContainer = document.querySelector(".little-modal");
const currentAdress = document.querySelector(".current-address");

const errorIcon = `
  <img src="${errorIconURL}" class="notification-icon" alt="error icon">
`;

const happyIcon = `
  <img src="${happyIconURL}" class="notification-icon" alt="error icon">
`;

const sadIcon = `
  <img src="${sadIconURL}" class="notification-icon" alt="error icon">
`;

export const errorNotification = (name) => {
  const message = name
    ? `${errorIcon} <span>No details available for input: "${name}".</span>`
    : `${errorIcon} <span>Unknown error. Please retry.</span>`;

  noficationContainer.innerHTML = message;
  noficationContainer.classList.add("active");
  setTimeout(() => {
    noficationContainer.classList.remove("active");
  }, 5000);
};

export const successNotification = () => {
  const message = `${happyIcon} <span>Your review has successfully been left, thank you for your participation.</span>`;

  noficationContainer.innerHTML = message;
  noficationContainer.classList.add("active");
  setTimeout(() => {
    noficationContainer.classList.remove("active");
  }, 5000);
};

export const addNotification = () => {
  const message = `${happyIcon} <span>Your establishment has successfully been added, thank you for your participation!</span>`;

  noficationContainer.innerHTML = message;
  noficationContainer.classList.add("active");
  setTimeout(() => {
    noficationContainer.classList.remove("active");
  }, 5000);
};

export const sadNotification = () => {
  const message = `${sadIcon} <span>Your review has successfully been left, thank you for your participation.</span>`;

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
  reviewForm.querySelector(".stars-input").value = "";
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
  const address = await geocodeLatLng(geocoder, event);
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
