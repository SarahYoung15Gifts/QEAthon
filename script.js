document.addEventListener("DOMContentLoaded", () => {
  // Select all the elements we will be interacting with
  const factBtn = document.getElementById("get-fact-btn");
  const catFactDisplay = document.getElementById("cat-fact");
  const imageBtn = document.getElementById("get-image-btn");
  const catImageDisplay = document.getElementById("cat-image");
  const breedSelect = document.getElementById("breed-select");
  const favouriteFactBtn = document.getElementById("favourite-fact-btn");
  const favouriteImageBtn = document.getElementById("favourite-image-btn");

  // New element selectors for the two columns
  const favouriteFactsList = document.getElementById("favourite-facts-list");
  const favouriteImagesList = document.getElementById("favourite-images-list");
  const clearFavoritesBtn = document.getElementById("clear-favourites-btn");

  // API endpoints
  const catFactsApi = "https://catfact.ninja/fact";
  const catImagesApi = "https://api.thecatapi.com/v1/images/search";
  const catBreedsApi = "https://api.thecatapi.com/v1/breeds";

  // Store current fact and image URLs to be favourited
  let currentFact = null;
  let currentImageUrl = null;

  // Load favourites from local storage when the page loads
  loadFavourites();

  // --- Cat Fact Functionality ---
  factBtn.addEventListener("click", async () => {
    try {
      const response = await fetch(catFactsApi);
      const data = await response.json();
      currentFact = data.fact; // Store the current fact
      catFactDisplay.textContent = currentFact;
      favouriteFactBtn.style.display = "inline-block"; // Show the favourite button
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
        favouriteImageBtn.style.display = "inline-block"; // Show the favourite button
      } else {
        catImageDisplay.src = "";
        catImageDisplay.style.display = "none";
        alert("No images found for this breed.");
        favouriteImageBtn.style.display = "none";
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

  // --- Favourite Functionality ---
  favouriteFactBtn.addEventListener("click", () => {
    if (currentFact) {
      addFavourite("fact", currentFact);
      currentFact = null; // Clear the fact after favouriting
      favouriteFactBtn.style.display = "none";
    }
  });

  favouriteImageBtn.addEventListener("click", () => {
    if (currentImageUrl) {
      addFavourite("image", currentImageUrl);
      currentImageUrl = null; // Clear the image after favouriting
      favouriteImageBtn.style.display = "none";
    }
  });

  clearFavoritesBtn.addEventListener("click", () => {
    localStorage.removeItem("catFavourites");
    renderFavourites();
  });

  // Add a new favourite item to the list and local storage
  function addFavourite(type, content) {
    let favourites = JSON.parse(localStorage.getItem("catFavourites")) || [];
    favourites.push({ type, content });
    localStorage.setItem("catFavourites", JSON.stringify(favourites));
    renderFavourites();
  }

  // Load favourites from local storage
  function loadFavourites() {
    renderFavourites();
  }

  // Render the entire favourites list from local storage
  function renderFavourites() {
    favouriteFactsList.innerHTML = ""; // Clear existing facts list
    favouriteImagesList.innerHTML = ""; // Clear existing images list

    const favourites = JSON.parse(localStorage.getItem("catFavourites")) || [];

    favourites.forEach((item) => {
      renderFavouriteItem(item);
    });
  }

  // Create and append a single favourite item to the list
  function renderFavouriteItem(item) {
    const favouriteItem = document.createElement("div");
    favouriteItem.className = "favourite-item";

    // Add a "remove" button for each favourite item
    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      removeFavourite(item);
    });

    if (item.type === "fact") {
      const p = document.createElement("p");
      p.textContent = item.content;
      favouriteItem.appendChild(p);
      favouriteItem.appendChild(removeBtn);
      favouriteFactsList.appendChild(favouriteItem); // Append to the facts column
    } else if (item.type === "image") {
      const img = document.createElement("img");
      img.src = item.content;
      img.alt = "Favourited cat image";
      favouriteItem.appendChild(img);
      favouriteItem.appendChild(removeBtn);
      favouriteImagesList.appendChild(favouriteItem); // Append to the images column
    }
  }

  // Remove a favourite item from the list and local storage
  function removeFavourite(itemToRemove) {
    let favourites = JSON.parse(localStorage.getItem("catFavourites")) || [];
    favourites = favourites.filter(
      (item) => item.content !== itemToRemove.content
    );
    localStorage.setItem("catFavourites", JSON.stringify(favourites));
    renderFavourites();
  }
});
