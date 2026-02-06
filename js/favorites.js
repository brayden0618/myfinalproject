const favoritesEl = document.getElementById("favorites-grid");
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

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
  favoritesEl.innerHTML = "<h2>Your Favorites</h2>";

  if (!favorites.length) {
    favoritesEl.innerHTML += "<p>You haven't added any favorites yet!</p>";
    return;
  }

  for (let favKey of favorites) {
    const gameId = favKey.replace("game-", "");
    const game = await fetchGameById(gameId);
    if (!game) continue;

    const div = document.createElement("div");
    div.className = "game-card";

    div.innerHTML = `
      <h3 class="game-title">${game.info.title}</h3>
      <img src="${game.info.thumb}" alt="${game.info.title}" class="game-thumb">
      <p>Cheapest Price: $${game.cheapestPrice}</p>
      <p>Store: ${game.deals[0]?.storeID || "N/A"}</p>
      <button class="fav-btn active">★</button>
    `;

    const btn = div.querySelector(".fav-btn");
    btn.addEventListener("click", () => {
      favorites = favorites.filter(f => f !== favKey);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      div.remove();
      if (!favorites.length) {
        favoritesEl.innerHTML += "<p>You haven't added any favorites yet!</p>";
      }
    });

    favoritesEl.appendChild(div);
  }
}

document.getElementById("clear-favorites-btn").addEventListener("click", () => {
  localStorage.removeItem("favorites");
  favoritesEl.innerHTML = "<p>You haven't added any favorites yet!</p>";
  favorites = [];
});

renderFavorites();