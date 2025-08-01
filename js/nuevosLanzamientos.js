const apiLanzamientos = "https://cinestream-backend.onrender.com/api/peliculas/lanzamientos";

// Obtener contenedor de películas destacadas
const featuredMoviesContainer = document.getElementById("featured-movies");

// Función para crear una tarjeta de película destacada
function createMovieCard(movie) {
  const card = document.createElement("div");
  card.className = "movie-card fade-in";

  card.innerHTML = `
    <div class="movie-poster">
      <img src="${movie.poster_url || 'img/poster-placeholder.png'}" alt="${movie.titulo_espanol}">
      <div class="card-overlay">
        <button class="play-trailer" data-id="${movie.trailer_url}">
          <i class="fas fa-play"></i> Ver Tráiler
        </button>
        <button class="details-btn" data-id="${movie._id}">
          <i class="fas fa-info-circle"></i> Detalles
        </button>
      </div>
    </div>
    <div class="card-info">
      <h3>${movie.titulo_espanol}</h3>
      <div class="movie-meta">
        <span><i class="fas fa-calendar"></i> ${new Date(movie.fecha_estreno).getFullYear()}</span>
        <span class="rating"><i class="fas fa-star"></i> ${movie.calificacion}/10</span>
      </div>
      <div class="movie-meta">
        <span>${movie.generos.map(g => g.nombre).join(', ')}</span>
      </div>
    </div>
  `;
  return card;
}

// Función para obtener y mostrar las películas destacadas
// ...existing code...

async function loadFeaturedMovies() {
  const loader = document.getElementById("featured-loader");
  try {
    // Mostrar loader y ocultar grid
    if (loader) loader.style.display = "flex";
    featuredMoviesContainer.style.display = "none";

    const response = await fetch(apiLanzamientos);
    if (!response.ok) throw new Error("No se pudo obtener las películas destacadas");
    const movies = await response.json();

    featuredMoviesContainer.innerHTML = ""; // Limpiar antes de renderizar
    movies.lanzamientos.forEach(movie => {
      featuredMoviesContainer.appendChild(createMovieCard(movie));
    });

    // Ocultar loader y mostrar grid
    if (loader) loader.style.display = "none";
    featuredMoviesContainer.style.display = "grid";

    // ...eventos de botones...
    document.querySelectorAll(".play-trailer").forEach(button => {
      button.addEventListener("click", (e) => {
        const rawId =
          e.target.getAttribute("data-id") ||
          e.target.parentElement.getAttribute("data-id");
        const videoId = getYouTubeId(rawId);
        showTrailerModal(videoId);
      });
    });

    document.querySelectorAll(".details-btn").forEach(button => {
      button.addEventListener("click", (e) => {
        const movieId = e.currentTarget.getAttribute("data-id");
        showMovieDetails(movieId);
      });
    });

  } catch (error) {
    if (loader) loader.style.display = "none";
    featuredMoviesContainer.style.display = "block";
    featuredMoviesContainer.innerHTML = "<p>Error al cargar las películas destacadas.</p>";
    console.error(error);
  }
};

// Extrae el ID de YouTube desde una URL
function getYouTubeId(url) {
  const regExp = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&?/]+)/;
  const match = url.match(regExp);
  return match ? match[1] : url;
}

// Muestra el modal del tráiler (debes tener un modal en tu HTML)
function showTrailerModal(videoId) {
  const modal = document.getElementById("trailer-modal");
  const iframe = document.getElementById("modal-youtube-player");
  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  modal.style.display = "flex";
}

// Ejemplo de función para mostrar detalles (puedes personalizarla)
function showMovieDetails(movieId) {
  // Aquí puedes abrir un modal o redirigir a una página de detalles
  alert("Mostrar detalles de la película con ID: " + movieId);
}

// Cerrar el modal del tráiler
document.addEventListener("DOMContentLoaded", () => {
  loadFeaturedMovies();

  const modal = document.getElementById("trailer-modal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.classList.contains("close-trailer-modal")) {
        modal.style.display = "none";
        document.getElementById("modal-youtube-player").src = "";
      }
    });
  }
});