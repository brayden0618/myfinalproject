const favoritesEl = document.getElementById("favorites-grid");
const clearBtn = document.getElementById("clear-favorites-btn");

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let storesMap = {};

async function fetchStores() {
  try {
    const res = await fetch("https://www.cheapshark.com/api/1.0/stores");
    if (!res.ok) throw new Error("Failed to fetch stores");
    const stores = await res.json();
    stores.forEach(store => {
      storesMap[store.storeID] = store.storeName;
    });
  } catch (err) {
    console.error(err);
  }
}

async function fetchGameById(id) {
  try {
    const res = await fetch(`https://www.cheapshark.com/api/1.0/games?id=${id}`);
    if (!res.ok) throw new Error("Failed to fetch game details");
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function renderFavorites() {
  favoritesEl.innerHTML = "<h2>Your Favorite Games</h2>";

  if (!favorites.length) {
    favoritesEl.innerHTML += "<p>You haven't added any favorites yet!</p>";
    return;
  }

  for (let favKey of favorites) {
    const gameId = favKey.replace("game-", "");
    const game = await fetchGameById(gameId);
    if (!game) continue;

    const bestDeal = game.deals?.[0];
    const div = document.createElement("div");
    div.className = "game-card";

    div.innerHTML = `
      <h3 class="game-title">${game.info.title}</h3>
      <p><strong>Cheapest Price:</strong> $${game.cheapestPrice}</p>
      <p><strong>Store:</strong> ${storesMap[bestDeal?.storeID] || "Unknown Store"}</p>
      <p><strong>Normal Price:</strong> $${bestDeal?.retailPrice || "N/A"}</p>
      <p><strong>Savings:</strong> ${bestDeal?.savings ? Number(bestDeal.savings).toFixed(1) + "%" : "N/A"}</p>
      <p><strong>Deal Rating:</strong> ${bestDeal?.dealRating || "N/A"}</p>
      <p><strong>Steam App ID:</strong> ${game.info.steamAppID || "N/A"}</p>
      <img src="${game.info.thumb}" alt="${game.info.title}" class="game-thumb">
      <button class="fav-btn active">★</button>
    `;

    div.querySelector(".fav-btn").addEventListener("click", () => {
      favorites = favorites.filter(f => f !== favKey);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      div.remove();
      if (!favorites.length) {
        favoritesEl.innerHTML += "<p>You haven't added any favorites yet!</p>";
      }
    });

    div.querySelector(".game-title").addEventListener("mouseover", () => {
      div.querySelector(".game-thumb").style.display = "block";
    });

    div.querySelector(".game-title").addEventListener("mouseout", () => {
      div.querySelector(".game-thumb").style.display = "none";
    });

    favoritesEl.appendChild(div);
  }
}

if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    localStorage.removeItem("favorites");
    favorites = [];
    favoritesEl.innerHTML =
      "<h2>Your Favorite Games</h2><p>You haven't added any favorites yet!</p>";
  });
}

async function init() {
  await fetchStores();
  renderFavorites();
}

init();