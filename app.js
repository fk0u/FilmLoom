const API_KEY = "968286cd738c3557ab97c1dc585a999e";
const API_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

let currentTrendingPage = 1;
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

// Initialize the application
$(document).ready(function () {
  fetchTrendingMovies();
  fetchNewReleases();

  // Load more movies for New Releases
  $("#loadMore").on("click", function () {
    currentTrendingPage += 1;
    fetchNewReleases(currentTrendingPage);
  });

  // Search functionality
  $("#searchBar").on("input", function () {
    const query = $(this).val();
    if (query.length > 2) {
      searchMovies(query);
    } else {
      $("#searchResults").addClass("hidden");
    }
  });

  // Open or toggle wishlist modal
    $("#wishlistButton").on("click", function () {
        const wishlistModal = $("#wishlistModal");
        if (wishlistModal.hasClass("hidden")) {
        showWishlist(); // Show wishlist content
        wishlistModal.removeClass("hidden");
        } else {
        wishlistModal.addClass("hidden");
        }
    });  

    // Toggle account modal
    $("#accountButton").on("click", function () {
        const accountModal = $("#accountModal");
        accountModal.toggleClass("hidden");
    });
    
    // Switch to Sign Up form
    $("#toggleToSignUp").on("click", function () {
        $("#loginForm").parent().addClass("hidden");
        $("#signUpFormContainer").removeClass("hidden");
    });
    
    // Switch to Login form
    $("#toggleToLogin").on("click", function () {
        $("#signUpFormContainer").addClass("hidden");
        $("#loginForm").parent().removeClass("hidden");
    });

  // Close movie details modal
  $(document).on("click", function (e) {
    if ($(e.target).is("#movieModal") || $(e.target).is("#closeModal")) {
      $("#movieModal").addClass("hidden");
    }
  });
});

function createMovieModal(movie) {
    // Hapus modal lama jika ada
    $("#movieModal").remove();
  
    // Template modal
    const modalHtml = `
      <div id="movieModal" class="fixed inset-0 items-center justify-center z-50 flex">
        <div class="bg-gray-800 rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/2 flex overflow-hidden relative">
          <!-- Left Section: Poster -->
          <div class="w-1/3 bg-gray-700 flex items-center justify-center">
            <img src="${IMAGE_BASE_URL + movie.poster_path}" alt="${movie.title}" class="w-full h-auto object-cover rounded-md">
          </div>
          <!-- Right Section: Details -->
          <div class="w-2/3 p-6 flex flex-col justify-between">
            <button id="closeModal" class="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full">
              <i class="fa-solid fa-times"></i>
            </button>
            <div>
              <h2 class="text-3xl font-bold text-white">${movie.title}</h2>
              <p class="text-yellow-400 text-lg mt-2">Rating: ${movie.vote_average || "N/A"}</p>
              <p class="text-gray-300 mt-4">${movie.overview || "No Overview Available"}</p>
              <p class="text-sm text-gray-500 mt-2">Release Date: ${movie.release_date || "N/A"}</p>
              <div class="mt-6">
                <h3 class="text-lg font-bold text-white mb-2"><i class="fa-solid fa-users"></i> Cast</h3>
                <div id="castList" class="flex gap-4 overflow-x-auto">
                  <!-- Cast dynamically loaded -->
                </div>
              </div>
            </div>
            <div class="mt-6 flex flex-col space-y-4">
              <button id="addToWishlist" 
                class="bg-gray-600 hover:bg-gray-800 px-4 py-2 rounded-md text-white text-lg">
                <i class="fa-solid fa-heart"></i> Save to Wishlist
              </button>
              <button id="watchTrailer" 
                class="bg-primary hover:bg-indigo-700 px-4 py-2 rounded-md text-white text-lg">
                <i class="fa-solid fa-play"></i> Watch Trailer
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  
    // Tambahkan modal ke body
    $("body").append(modalHtml);
  
    // Tambahkan event listener untuk tombol tutup
    $("#closeModal").on("click", function () {
      $("#movieModal").removeClass("flex").addClass("hidden");
    });
  
    // Tambahkan event listener untuk tombol Save to Wishlist
    $("#addToWishlist").on("click", function () {
      addToWishlist(movie.id, movie.title, `${IMAGE_BASE_URL}${movie.poster_path}`, movie.vote_average);
    });
  
    // Tambahkan event listener untuk tombol Watch Trailer
    if (movie.trailerKey) {
      $("#watchTrailer").on("click", function () {
        const trailerUrl = `https://www.youtube.com/watch?v=${movie.trailerKey}`;
        window.open(trailerUrl, "_blank");
      });
    } else {
      $("#watchTrailer").prop("disabled", true).addClass("opacity-50").text("Trailer Not Available");
    }
  }  

// Fetch trending movies
function fetchTrendingMovies() {
    $.get(`${API_URL}/movie/popular?api_key=${API_KEY}`, function (data) {
      const trendingContainer = $("#trendingMovies");
      trendingContainer.empty();
  
      data.results.slice(0, 10).forEach((movie) => {
        trendingContainer.append(`
          <div class="carousel-item w-60 bg-dark rounded-lg shadow-lg">
            <img src="${IMAGE_BASE_URL + movie.poster_path}" alt="${movie.title}" class="w-full h-64 object-cover rounded-t-lg">
            <div class="p-4">
              <h3 class="text-lg font-bold text-white">${movie.title}</h3>
              <p class="text-sm text-gray-400">${movie.release_date}</p>
              <button 
                class="mt-2 bg-primary px-3 py-1 rounded text-white hover:bg-indigo-700" 
                onclick="showMovieDetails(${movie.id})">
                Lihat Detail
              </button>
              <button 
                class="mt-2 bg-primary px-3 py-1 rounded text-white hover:bg-indigo-700" 
                onclick="addToWishlist(${movie.id}, '${movie.title}', '${IMAGE_BASE_URL + movie.poster_path}', ${movie.vote_average})">
                <i class="fa-solid fa-heart"></i> Save
              </button>
            </div>
          </div>
        `);
      });
    });
  }  

// Fetch new releases
function fetchNewReleases(page = 1) {
    $.get(`${API_URL}/movie/now_playing?api_key=${API_KEY}&page=${page}`, function (data) {
      const newReleasesContainer = $("#newReleases");
      newReleasesContainer.empty();
  
      data.results.forEach((movie) => {
        newReleasesContainer.append(`
          <div class="bg-dark rounded-lg shadow-lg overflow-hidden">
            <img src="${IMAGE_BASE_URL + movie.poster_path}" alt="${movie.title}" class="w-full h-64 object-cover">
            <div class="p-4">
              <h3 class="text-lg font-bold text-white">${movie.title}</h3>
              <p class="text-sm text-gray-400">${movie.release_date}</p>
              <button 
                class="mt-2 bg-primary px-3 py-1 rounded text-white hover:bg-indigo-700" 
                onclick="showMovieDetails(${movie.id})">
                Lihat Detail
              </button>
              <button 
                class="mt-2 bg-primary px-3 py-1 rounded text-white hover:bg-indigo-700" 
                onclick="addToWishlist(${movie.id}, '${movie.title}', '${IMAGE_BASE_URL + movie.poster_path}', ${movie.vote_average})">
                <i class="fa-solid fa-heart"></i> Save
              </button>
            </div>
          </div>
        `);
      });
    });
  }  

// Search movies
function searchMovies(query) {
  $.get(`${API_URL}/search/movie?api_key=${API_KEY}&query=${query}`, function (data) {
    const resultsContainer = $("#searchResults");
    resultsContainer.empty().removeClass("hidden");

    data.results.forEach((movie) => {
      resultsContainer.append(`
        <div class="flex items-center gap-4 p-2 hover:bg-gray-700 cursor-pointer" onclick="showMovieDetails(${movie.id})">
          <img src="${IMAGE_BASE_URL + movie.poster_path}" alt="${movie.title}" class="w-12 h-16 object-cover rounded-md">
          <div>
            <h3 class="text-sm font-bold">${movie.title}</h3>
            <p class="text-xs text-gray-400">${movie.release_date}</p>
            <p class="text-xs text-yellow-400">Rating: ${movie.vote_average}</p>
          </div>
        </div>
      `);
    });
  });
}

// Show movie details in modal
function showMovieDetails(movieId) {
    const movieDetails = $.get(`${API_URL}/movie/${movieId}?api_key=${API_KEY}`);
    const movieCredits = $.get(`${API_URL}/movie/${movieId}/credits?api_key=${API_KEY}`);
    const movieVideos = $.get(`${API_URL}/movie/${movieId}/videos?api_key=${API_KEY}`);
  
    Promise.all([movieDetails, movieCredits, movieVideos]).then(([details, credits, videos]) => {
      // Tambahkan key trailer jika tersedia
      const trailer = videos.results.find((video) => video.type === "Trailer");
      details.trailerKey = trailer ? trailer.key : null;
  
      // Tambahkan cast ke detail film
      details.cast = credits.cast.slice(0, 8);
  
      // Panggil fungsi untuk membuat modal
      createMovieModal(details);
  
      // Tampilkan modal
      $("#movieModal").removeClass("hidden").addClass("flex");
  
      // Populate cast list
      const castHtml = details.cast.map((actor) => `
        <div class="w-16 text-center">
          <img src="${IMAGE_BASE_URL + actor.profile_path}" class="w-full h-16 object-cover rounded-full mb-2" alt="${actor.name}" />
          <p class="text-xs text-white">${actor.name}</p>
        </div>
      `).join("");
      $("#castList").html(castHtml);
    });
  }


function addToWishlist(movieId, movieTitle, moviePoster, movieRating) {
    // Debugging: Log semua parameter untuk memastikan data diterima dengan benar
    console.log(movieId, movieTitle, moviePoster, movieRating);
  
    if (!wishlist.some((movie) => movie.id === movieId)) {
      wishlist.push({
        id: movieId,
        title: movieTitle,
        poster: moviePoster,
        rating: movieRating
      });
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      showToast(`${movieTitle} has been added to your wishlist!`);
    } else {
      showToast(`${movieTitle} is already in your wishlist.`);
    }
    showWishlist();
  }
  

  function showWishlist() {
  const wishlistContainer = $("#wishlistContent");
  wishlistContainer.empty();

  if (wishlist.length === 0) {
    $("#emptyWishlist").removeClass("hidden");
  } else {
    $("#emptyWishlist").addClass("hidden");
    wishlist.forEach((movie) => {
      wishlistContainer.append(`
        <div class="flex items-center space-x-4 bg-gray-700 p-2 rounded-md">
          <img src="${movie.poster}" alt="${movie.title}" class="w-16 h-20 object-cover rounded-md">
          <div class="flex-1">
            <h3 class="text-sm font-bold text-white">${movie.title}</h3>
            <p class="text-xs text-gray-400">Rating: ${movie.rating}</p>
          </div>
          <button class="text-red-500" onclick="removeFromWishlist(${movie.id})">
            <i class="fa-solid fa-trash"></i>
          </button>
          <button class="text-primary" onclick="navigateToDetail(${movie.id})">
            <i class="fa-solid fa-circle-info"></i>
          </button>
        </div>
      `);
    });
  }
}


  function navigateToDetail(movieId) {
    // Replace this with your logic to navigate to the movie detail page
    showMovieDetails(movieId); // Reuse the movie detail modal logic
  }  

// Remove from wishlist
function removeFromWishlist(movieId) {
  wishlist = wishlist.filter((movie) => movie.id !== movieId);
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  showWishlist();
}

// Handle Sign Up
$("#signUpForm").on("submit", function (e) {
    e.preventDefault();
    const name = $("#signUpName").val();
    const email = $("#signUpEmail").val();
    const password = $("#signUpPassword").val();
  
    // Save user data to localStorage
    localStorage.setItem("user", JSON.stringify({ name, email, password }));
  
    // Show success toast
    showToast(`Account created successfully! Welcome, ${name}.`);
    $("#signUpForm")[0].reset();
  
    // Switch to login view
    $("#signUpFormContainer").addClass("hidden");
    $("#loginForm").parent().removeClass("hidden");
  });
  
  // Handle Login
  $("#loginForm").on("submit", function (e) {
    e.preventDefault();
    const email = $("#loginEmail").val();
    const password = $("#loginPassword").val();
    const user = JSON.parse(localStorage.getItem("user"));
  
    if (user && user.email === email && user.password === password) {
      // Show user name and close modal
      $("#userName").text(user.name).removeClass("hidden");
      $("#accountModal").addClass("hidden");
  
      // Show success toast
      showToast(`Welcome back, ${user.name}!`);
    } else {
      alert("Invalid email or password. Please try again.");
    }
  });
  
  // Show toast notification
  function showToast(message) {
    const toast = $("#toast");
    toast.text(message).fadeIn().delay(2000).fadeOut();
  }
  
  // Google login/signup (mock implementation)
  $("#loginWithGoogle, #signUpWithGoogle").on("click", function () {
    const user = {
      name: "Google User",
      email: "googleuser@example.com",
    };
  
    // Save Google user data to localStorage
    localStorage.setItem("user", JSON.stringify(user));
  
    // Show user name and close modal
    $("#userName").text(user.name).removeClass("hidden");
    $("#accountModal").addClass("hidden");
  
    // Show success toast
    showToast(`Logged in as ${user.name} via Google!`);
  });

  function showAccountDetails() {
    const user = JSON.parse(localStorage.getItem("user"));
  
    // Periksa apakah user sudah login
    if (user) {
      const accountDetailsHtml = `
        <div class="text-center">
          <!-- Profile Picture -->
          <div class="flex items-center justify-center mb-4">
            <img src="https://via.placeholder.com/100" alt="Profile Picture" class="w-24 h-24 rounded-full border-4 border-primary">
          </div>
          <!-- User Details -->
          <h2 class="text-xl font-bold text-white">${user.name}</h2>
          <p class="text-gray-400">${user.email}</p>
          <button id="logoutButton" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md mt-4">
            Logout
          </button>
        </div>
      `;
  
      $("#accountDetails").html(accountDetailsHtml);
      $("#accountModal").removeClass("hidden flex").addClass("flex");
  
      // Event listener untuk tombol logout
      $("#logoutButton").on("click", function () {
        logoutUser();
      });
    } else {
      alert("You are not logged in. Please log in to view your account details.");
    }
  }
  

  function logoutUser() {
    // Hapus data user dari localStorage
    localStorage.removeItem("user");
  
    // Sembunyikan nama user dari header
    $("#userName").text("").addClass("hidden");
  
    // Tutup modal akun
    $("#accountModal").addClass("hidden");
  
    // Tampilkan toast notifikasi logout
    showToast("You have been logged out.");
  }
  

  function fetchGenres() {
    $.get(`${API_URL}/genre/movie/list?api_key=${API_KEY}`, function (data) {
      const genreDropdown = $("#genreFilter");
      data.genres.forEach((genre) => {
        genreDropdown.append(`<option value="${genre.id}">${genre.name}</option>`);
      });
    });
  }

  function fetchCountries() {
    $.get(`${API_URL}/configuration/countries?api_key=${API_KEY}`, function (data) {
      const countryDropdown = $("#countryFilter");
      data.forEach((country) => {
        countryDropdown.append(`<option value="${country.iso_3166_1}">${country.english_name}</option>`);
      });
    });
  }

  function applyFilters() {
    const keyword = $("#keywordSearch").val();
    const genreId = $("#genreFilter").val();
    const country = $("#countryFilter").val();
    const year = $("#yearFilter").val();
    const sort = $("#sortFilter").val();
  
    // Query string untuk filter
    let query = `${API_URL}/discover/movie?api_key=${API_KEY}`;
    if (keyword) query = `${API_URL}/search/movie?api_key=${API_KEY}&query=${keyword}`;
    if (genreId) query += `&with_genres=${genreId}`;
    if (country) query += `&region=${country}`;
    if (year) query += `&year=${year}`;
    if (sort) query += `&sort_by=${sort}`;
  
    // Tampilkan loader dan kosongkan hasil sebelumnya
    $("#loader").removeClass("hidden");
    $("#resultsContainer").empty();
    $("#resultsSection").removeClass("hidden");
  
    // Fetch data dengan filter
    $.get(query, function (data) {
      // Sembunyikan loader setelah data diterima
      $("#loader").addClass("hidden");
  
      // Jika tidak ada hasil
      if (data.results.length === 0) {
        $("#resultsContainer").html(`<p class="text-white text-center col-span-4">No results found.</p>`);
        return;
      }
  
      // Tampilkan hasil
      data.results.forEach((movie) => {
        $("#resultsContainer").append(`
          <div class="bg-dark rounded-lg shadow-lg overflow-hidden">
            <img src="${IMAGE_BASE_URL + movie.poster_path}" alt="${movie.title}" class="w-full h-64 object-cover">
            <div class="p-4">
              <h3 class="text-lg font-bold text-white">${movie.title}</h3>
              <p class="text-sm text-gray-400">${movie.release_date}</p>
              <button 
                class="mt-2 bg-primary px-3 py-1 rounded text-white hover:bg-indigo-700" 
                onclick="showMovieDetails(${movie.id})">
                Lihat Detail
              </button>
            </div>
          </div>
        `);
      });
    });
  }  

  function resetFilters() {
    $("#keywordSearch").val("");
    $("#genreFilter").val("");
    $("#countryFilter").val("");
    $("#yearFilter").val("");
    $("#sortFilter").val("popularity.desc");
    fetchNewReleases(); // Tampilkan film tanpa filter
    $("#resultsContainer").addClass("hidden");
    $("#resultsSection").addClass("hidden");
  }

  $(document).ready(function () {
    fetchGenres();
    fetchCountries();
  
    // Listener for Apply Filters button
    $("#applyFilters").on("click", function () {
      applyFilters();
    });
  
    // Listener for Reset Filters button
    $("#resetFilters").on("click", function () {
      resetFilters();
    });

  });
    
