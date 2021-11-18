import { littleModalContainer } from "./services";

const togglePlaces = document.querySelector(".toggle-places");
const autocompleteContainer = document.querySelector(".autocomplete-container");
const cancelModal = document.querySelector(".cancel-modal");

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

function autocloseLittleModal(event) {
  const preventClasses = ["little-modal", "current-address", "action"];

  for (let item of preventClasses) {
    if (event.target.classList.contains(item)) return;
  }

  littleModalContainer.style.display = "none";
}

export function closeLittleModal() {
  littleModalContainer.style.display = "none";
}
