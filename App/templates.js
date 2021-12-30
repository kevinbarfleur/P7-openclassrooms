import { getStreetView } from "./map";

export const placeTemplate = async (place, isContainer = true) => {
  const avatarColors = [
    "#E57373",
    "#BA68C8",
    "#5C6BC0",
    "#29B6F6",
    "#00BCD4",
    "#009688",
    "#4CAF50",
    "#AED581",
    "#FFB74D",
    "#FF8A65",
    "#A1887F",
    "#BDBDBD",
    "#90A4AE",
  ];

  const streetView = await getStreetView(place.lat, place.lng);
  let ratings = `<img class="street-view-list" src='${streetView}'>`;

  if (place.ratings && place.ratings.length) {
    for (let rate of place.ratings) {
      const names = rate.name.split(" ");
      let avatarLeters;
      if (names.length > 1) avatarLeters = names[0][0] + names[1][0];
      else avatarLeters = names[0][0];

      let stars = ``;
      for (let i = 0; i < Math.floor(rate.stars); i++) {
        stars += `
        <div class="star"></div>
      `;
      }

      const color =
        avatarColors[Math.floor(Math.random() * avatarColors.length)];

      ratings += `
        <div class="rating-container">
          <div class="avatar" style="background-color:${color};">${avatarLeters}</div>
          <div>
            <h5 class="user-name">${rate.name}</h3>
            <div class="stars">
              <div class="overlay-background"></div>
              ${stars}
            </div>
            <p class="comment">${rate.comment}</p>
          </div>
        </div>
      `;
    }
  } else {
    ratings += `<div>
      <p class="comment">Aucun commentaire</p>
    </div>`;
  }

  const ratingsHolder =
    place.ratings && place.ratings.length
      ? place.ratings.map((place) => place.stars)
      : [];

  const average = ratingsHolder.length
    ? ratingsHolder.reduce((a, b) => a + b, 0) / ratingsHolder.length
    : "";

  place.average = typeof average === "object" ? average.stars : average;

  const star =
    place.ratings && place.ratings.length
      ? `<div class="stars">
            <div class="overlay-background"></div>
            <div class="star"></div>
          </div>`
      : "";

  if (isContainer) {
    return `
      <div class="place" data-lat="${place.lat}" data-lng="${
      place.lng
    }" data-id="${place.name + place.lat + place.lng}">
          <div class="label">
            <h5 class="name">${place.restaurantName}</h3>
            ${star}
            <span class="average">${parseFloat(place.average).toFixed(1)}</span>
          </div>
          <p class="adress">${place.address}</p>
          <div class="ratings hidden">
            ${ratings}
            <button class="add-review">+ Ajouter un avis</button>
          </div>
      </div>
  `;
  } else {
    return `
          <div class="label">
              <h5 class="name">${place.restaurantName}</h3>
              ${star}
              <span class="average">${parseFloat(place.average).toFixed(
                1
              )}</span>
          </div>
          <p class="adress">${place.address}</p>
          <div class="ratings hidden">
            ${ratings}
            <button class="add-review">Ajouter un avis +</button>
          </div>
  `;
  }
};
