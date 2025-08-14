document.addEventListener("DOMContentLoaded", () => {
  // Select all the elements we will be interacting with
  const factBtn = document.getElementById("get-fact-btn");
  const catFactDisplay = document.getElementById("cat-fact");
  const imageBtn = document.getElementById("get-image-btn");
  const catImageDisplay = document.getElementById("cat-image");
  const breedSelect = document.getElementById("breed-select");
  const favoriteFactBtn = document.getElementById("favorite-fact-btn");
  const favoriteImageBtn = document.getElementById("favorite-image-btn");
  const favoritesList = document.getElementById("favorites-list");

  // API endpoints
  const catFactsApi = "https://catfact.ninja/fact";
  const catImagesApi = "https://api.thecatapi.com/v1/images/search";
  const catBreedsApi = "https://api.thecatapi.com/v1/breeds";

  // Store current fact and image URLs to be favorited
  let currentFact = null;
  let currentImageUrl = null;

  // Load favorites from local storage when the page loads
  loadFavorites();

  // --- Cat Fact Functionality ---
  factBtn.addEventListener("click", async () => {
    try {
      const response = await fetch(catFactsApi);
      const data = await response.json();
      currentFact = data.fact; // Store the current fact
      catFactDisplay.textContent = currentFact;
      favoriteFactBtn.style.display = "inline-block"; // Show the favorite button
    } catch (error) {
      console.error("Error fetching cat fact:", error);
      catFactDisplay.textContent =
        "Failed to load a cat fact. Please try again.";
    }
  });

  // --- Cat Image Functionality ---
  imageBtn.addEventListener("click", () => {
    fetchCatImage();
  });

  breedSelect.addEventListener("change", () => {
    fetchCatImage(breedSelect.value);
  });

  // Function to fetch a cat image based on breed
  async function fetchCatImage(breedId = "") {
    let url = catImagesApi;
    if (breedId) {
      url += `?breed_ids=${breedId}`;
    }
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.length > 0) {
        currentImageUrl = data[0].url; // Store the current image URL
        catImageDisplay.src = currentImageUrl;
        catImageDisplay.style.display = "block"; // Show the image
        favoriteImageBtn.style.display = "inline-block"; // Show the favorite button
      } else {
        catImageDisplay.src = "";
        catImageDisplay.style.display = "none";
        alert("No images found for this breed.");
        favoriteImageBtn.style.display = "none";
      }
    } catch (error) {
      console.error("Error fetching cat image:", error);
      catImageDisplay.src = "";
      catImageDisplay.style.display = "none";
      alert("Failed to load a cat image. Please try again.");
    }
  }

  // --- Populate Dropdown with Breeds ---
  async function fetchCatBreeds() {
    try {
      const response = await fetch(catBreedsApi);
      const breeds = await response.json();
      breeds.forEach((breed) => {
        const option = document.createElement("option");
        option.value = breed.id;
        option.textContent = breed.name;
        breedSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error fetching cat breeds:", error);
    }
  }

  // Call the function to populate the dropdown when the page loads
  fetchCatBreeds();

  // --- Favorite Functionality ---
  favoriteFactBtn.addEventListener("click", () => {
    if (currentFact) {
      addFavorite("fact", currentFact);
      currentFact = null; // Clear the fact after favoriting
      favoriteFactBtn.style.display = "none";
    }
  });

  favoriteImageBtn.addEventListener("click", () => {
    if (currentImageUrl) {
      addFavorite("image", currentImageUrl);
      currentImageUrl = null; // Clear the image after favoriting
      favoriteImageBtn.style.display = "none";
    }
  });

  // Add a new favorite item to the list and local storage
  function addFavorite(type, content) {
    let favorites = JSON.parse(localStorage.getItem("catFavorites")) || [];
    favorites.push({ type, content });
    localStorage.setItem("catFavorites", JSON.stringify(favorites));
    renderFavorites();
  }

  // Load favorites from local storage
  function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem("catFavorites")) || [];
    favorites.forEach((item) => {
      renderFavoriteItem(item);
    });
  }

  // Render the entire favorites list from local storage
  function renderFavorites() {
    favoritesList.innerHTML = ""; // Clear existing list
    const favorites = JSON.parse(localStorage.getItem("catFavorites")) || [];
    favorites.forEach((item) => {
      renderFavoriteItem(item);
    });
  }

  // Create and append a single favorite item to the list
  function renderFavoriteItem(item) {
    const favoriteItem = document.createElement("div");
    favoriteItem.className = "favorite-item";

    if (item.type === "fact") {
      const p = document.createElement("p");
      p.textContent = item.content;
      favoriteItem.appendChild(p);
    } else if (item.type === "image") {
      const img = document.createElement("img");
      img.src = item.content;
      img.alt = "Favorited cat image";
      favoriteItem.appendChild(img);
    }

    // Add a "remove" button for each favorite item
    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      removeFavorite(item);
    });
    favoriteItem.appendChild(removeBtn);

    favoritesList.appendChild(favoriteItem);
  }

  // Remove a favorite item from the list and local storage
  function removeFavorite(itemToRemove) {
    let favorites = JSON.parse(localStorage.getItem("catFavorites")) || [];
    favorites = favorites.filter(
      (item) => item.content !== itemToRemove.content
    );
    localStorage.setItem("catFavorites", JSON.stringify(favorites));
    renderFavorites();
  }
});
