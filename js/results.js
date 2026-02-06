const params = new URLSearchParams(window.location.search);
const preferences = {
  gameType: params.get("gameType"),
  price: params.get("price")
};

localStorage.setItem("preferences", JSON.stringify(preferences));

const summaryEl = document.getElementById("summary");
const gameEl = document.getElementById("video-games");

summaryEl.innerHTML = `
  <h2>Your Preferences</h2>
  <ul>
    ${Object.entries(preferences)
      .map(([k,v]) => `<li><strong>${k}:</strong> ${v || "Any"}</li>`)
      .join("")}
  </ul>
`;

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

function toggleFavorite(id) {
  const key = `game-${id}`;
  favorites.includes(key)
    ? favorites = favorites.filter(f => f !== key)
    : favorites.push(key);
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function filterByPrice(games) {
  if (!preferences.price) return games;
  return games.filter(game => {
    const price = parseFloat(game.cheapest);
    if (preferences.price === "cheap") return price < 10;
    if (preferences.price === "mid") return price >= 10 && price <= 25;
    if (preferences.price === "premium") return price > 25;
    return true;
  });
}

async function fetchGames(query) {
  try {
    const res = await fetch(`https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(query)}&limit=20`);
    if (!res.ok) throw new Error("Failed to fetch from CheapShark");
    let data = await res.json();
    return filterByPrice(data);
  } catch (err) {
    console.error("CheapShark API error:", err);
    return [];
  }
}

function renderGames(games) {
  gameEl.innerHTML = "<h2>Game Recommendations</h2>";
  if (!games || games.length === 0) {
    gameEl.innerHTML += `<p>No games found for your preferences. Try different options!</p>`;
    return;
  }

  games.forEach(game => {
    const key = `game-${game.gameID}`;
    const div = document.createElement("div");
    div.className = "game-card";

    div.innerHTML = `
      <h3 class="game-title">${game.external}</h3>
      <p>Cheapest Price: $${game.cheapest}</p>
      <img class="game-thumb" src="${game.thumb}" alt="${game.external}" />
      <button class="fav-btn ${favorites.includes(key) ? "active" : ""}">★</button>
    `;

    div.querySelector(".fav-btn").addEventListener("click", () => {
      toggleFavorite(game.gameID);
      div.querySelector(".fav-btn").classList.toggle("active");
    });

    div.querySelector(".game-title").addEventListener("mouseover", () => {
      div.querySelector(".game-thumb").style.display = "block";
    });
    div.querySelector(".game-title").addEventListener("mouseout", () => {
      div.querySelector(".game-thumb").style.display = "none";
    });

    gameEl.appendChild(div);
  });
}

async function init() {
  const query = preferences.gameType || "game";
  const games = await fetchGames(query);
  renderGames(games);
}

init();

const startBtn = document.getElementById("start-over-btn");
if (startBtn) {
  startBtn.addEventListener("click", () => {
    localStorage.removeItem("preferences");
    window.location.href = "index.html";
  });
}