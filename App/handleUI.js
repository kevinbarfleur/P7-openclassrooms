import {
  littleModalContainer,
  closeReviewModal,
  closeAddModal,
} from "./services";

const togglePlaces = document.querySelector(".toggle-places");
const autocompleteContainer = document.querySelector(".autocomplete-container");
const cancelModal = document.querySelector(".cancel-modal");

const refreshNotification = () => {
  const template = `
  Récupération des établissements
  <div class="loading-container">
    <div class="loading-content"></div>
  </div>
  `;
};

const closeButtons = document.querySelectorAll(".close-button");
closeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    closeReviewModal();
    closeAddModal();
  });
});

const autocloseLittleModal = (event) => {
  const preventClasses = ["little-modal", "current-address", "action"];

  for (let item of preventClasses) {
    if (event.target.classList.contains(item)) return;
  }

  littleModalContainer.style.display = "none";
};

export const closeLittleModal = () => {
  littleModalContainer.style.display = "none";
};

document.addEventListener("click", autocloseLittleModal);
cancelModal.addEventListener("click", closeLittleModal);

togglePlaces.addEventListener("change", (event) => {
  const checked = event.target.checked;
  if (!checked) {
    autocompleteContainer.classList.add("hidden");
  } else {
    autocompleteContainer.classList.remove("hidden");
  }
});
