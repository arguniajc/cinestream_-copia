const apiLanzamientos =
  "https://cinestream-backend.onrender.com/api/peliculas/lanzamientos";

let cacheNuevosLanzamientos = [];

const featuredMoviesContainer = document.getElementById("featured-movies");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");

function createMovieCard(movie) {
  const card = document.createElement("div");
  card.className = "movie-card fade-in";

  const posterUrl = movie.poster_url || "img/poster-placeholder.png";
  const titulo = movie.titulo_espanol || "Título desconocido";
  const calificacion =
    movie.calificacion !== undefined ? movie.calificacion : "N/A";

  let anioEstreno = "Año N/D";
  if (movie.fecha_estreno) {
    const fecha = new Date(movie.fecha_estreno);
    if (!isNaN(fecha)) {
      anioEstreno = fecha.getFullYear();
    }
  }

  const generos =
    Array.isArray(movie.generos) && movie.generos.length > 0
      ? movie.generos.map((g) => g.nombre).join(", ")
      : "Género no disponible";

  card.innerHTML = `
    <div class="movie-poster">
      <img src="${posterUrl}" alt="${titulo}"
           onerror="this.onerror=null;this.src='img/poster-placeholder.png';">
      <div class="card-overlay">
        <button class="play-trailer" data-id="${movie.trailer_url}">
          <i class="fas fa-play"></i> Ver Tráiler
        </button>
        <button class="details-btn" data-movie='${JSON.stringify(movie).replace(
          /'/g,
          "&apos;"
        )}'>
          <i class="fas fa-info-circle"></i> Detalles
        </button>
      </div>
    </div>
    <div class="card-info">
      <h3>${titulo}</h3>
      <div class="movie-meta">
        <span><i class="fas fa-calendar"></i> ${anioEstreno}</span>
        <span class="rating"><i class="fas fa-star"></i> ${calificacion}/10</span>
      </div>
      <div class="movie-meta">
        <span>${generos}</span>
      </div>
    </div>
  `;

  return card;
}

function mostrarPeliculas(lista) {
  // Limpiar contenedor
  featuredMoviesContainer.innerHTML = "";

  // Validar lista vacía
  if (!Array.isArray(lista) || lista.length === 0) {
    featuredMoviesContainer.innerHTML = "<p>No se encontraron resultados.</p>";
    return;
  }

  // Crear y agregar tarjetas de películas
  lista.forEach((movie) => {
    const card = createMovieCard(movie);
    featuredMoviesContainer.appendChild(card);
  });

  // Agregar eventos para reproducir tráiler
  const trailerButtons = document.querySelectorAll(".play-trailer");
  trailerButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const videoId = getYouTubeId(e.currentTarget.dataset.id);
      showTrailerModal(videoId);
    });
  });

  // Agregar eventos para mostrar detalles
  const detailsButtons = document.querySelectorAll(".details-btn");
  detailsButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const movie = JSON.parse(
        button.getAttribute("data-movie").replace(/&apos;/g, "'")
      );
      showMovieDetails(movie);
    });
  });
}

async function loadFeaturedMovies() {
  const loader = document.getElementById("featured-loader");

  try {
    if (loader) loader.style.display = "flex";
    featuredMoviesContainer.style.display = "none";

    const cached = localStorage.getItem("lanzamientosCache");
    const cachedTime = localStorage.getItem("lanzamientosCacheTime");
    const now = Date.now();

    if (cached && cachedTime && now - cachedTime < 5 * 60 * 1000) {
      // Usar caché si tiene menos de 5 minutos
      cacheNuevosLanzamientos = JSON.parse(cached);
      mostrarPeliculas(cacheNuevosLanzamientos);
    } else {
      // Obtener desde la API
      const response = await fetch(apiLanzamientos);
      if (!response.ok) throw new Error("No se pudo obtener los lanzamientos");
      const data = await response.json();

      cacheNuevosLanzamientos = data.lanzamientos;

      // Guardar en localStorage
      localStorage.setItem(
        "lanzamientosCache",
        JSON.stringify(cacheNuevosLanzamientos)
      );
      localStorage.setItem("lanzamientosCacheTime", now.toString());

      mostrarPeliculas(cacheNuevosLanzamientos);
    }

    if (loader) loader.style.display = "none";
    featuredMoviesContainer.style.display = "grid";
  } catch (error) {
    if (loader) loader.style.display = "none";
    featuredMoviesContainer.style.display = "block";
    featuredMoviesContainer.innerHTML = "<p>Error al cargar las películas.</p>";
    console.error("Error al cargar los lanzamientos:", error);
  }
}

function filtrarLanzamientos() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  if (!searchTerm) {
    mostrarPeliculas(cacheNuevosLanzamientos);
    return;
  }

  const filtradas = cacheNuevosLanzamientos.filter((pelicula) => {
    const titulo = pelicula.titulo_espanol.toLowerCase();
    const generos = pelicula.generos
      .map((g) => g.nombre.toLowerCase())
      .join(", ");
    const anio = new Date(pelicula.fecha_estreno).getFullYear().toString();

    return (
      titulo.includes(searchTerm) ||
      generos.includes(searchTerm) ||
      anio.includes(searchTerm)
    );
  });

  mostrarPeliculas(filtradas);
}

function getYouTubeId(url) {
  const regExp = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&?/]+)/;
  const match = url.match(regExp);
  return match ? match[1] : url;
}

function showTrailerModal(videoId) {
  const modal = document.getElementById("trailer-modal");
  const iframe = document.getElementById("modal-youtube-player");
  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  modal.style.display = "flex";
}

document.addEventListener("DOMContentLoaded", () => {
  loadFeaturedMovies();

  const modal = document.getElementById("trailer-modal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (
        e.target === modal ||
        e.target.classList.contains("close-trailer-modal")
      ) {
        modal.style.display = "none";
        document.getElementById("modal-youtube-player").src = "";
      }
    });
  }

  if (searchInput && searchButton) {
    searchInput.addEventListener("input", filtrarLanzamientos);
    searchButton.addEventListener("click", filtrarLanzamientos);
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        filtrarLanzamientos();
      }
    });
  }
});

function showMovieDetails(movie) {
  try {
    const modal = document.getElementById("movie-modal");
    const details = document.getElementById("modal-details");

    // Preparar datos con fallbacks
    const generos =
      (movie.generos || []).map((g) => g.nombre).join(", ") ||
      "No especificado";
    const idiomas =
      (movie.idiomas || []).map((i) => i.nombre).join(", ") ||
      "No especificado";

    const actoresHtml =
      (movie.actores || [])
        .map(
          (a) => `
 <div class="persona">
  <img src="${a.imagen_url || "img/persona-placeholder.png"}" alt="${
            a.nombre
          }" class="persona-img">
  <p>${a.nombre}</p>
  ${
    a.personaje && a.personaje.trim()
      ? `<small>como ${a.personaje}</small>`
      : ""
  }
</div>

`
        )
        .join("") || "<p>No disponible</p>";

    const directoresHtml =
      (movie.directores || [])
        .map(
          (d) => `
      <div class="persona">
        <img src="${d.imagen_url || "img/persona-placeholder.png"}" alt="${
            d.nombre
          }" class="persona-img">
        <p>${d.nombre}</p>
      </div>
    `
        )
        .join("") || "<p>No disponible</p>";

    const companiasHtml =
      (movie.companias || [])
        .map(
          (c) => `
      <div class="persona">
        <img src="${c.imagen_url || "img/persona-placeholder.png"}" alt="${
            c.nombre
          }" class="persona-img">
        <p>${c.nombre}</p>
      </div>
    `
        )
        .join("") || "<p>No disponible</p>";

    // Construir HTML de detalles
    details.innerHTML = `
      <img src="${movie.poster_url || "img/poster-placeholder.png"}" alt="${
      movie.titulo_espanol
    }" class="poster-img">
      <h2>${movie.titulo_espanol}</h2>
      <div class="movie-meta">
        <span><i class="fas fa-calendar"></i> ${new Date(
          movie.fecha_estreno
        ).getFullYear()}</span>
        <span><i class="fas fa-star"></i> ${
          movie.calificacion || "N/A"
        }/10</span>
        <span><i class="fas fa-film"></i> ${generos}</span>
      </div>
      <p>${movie.descripcion || "Sinopsis:"} ${movie.sinopsis || ""}</p>

      <div class="movie-meta">
        <h4>Director(es):</h4>
        <div class="personas-container">${directoresHtml}</div>
      </div>

      <div class="movie-meta">
        <h4>Reparto:</h4>
        <div class="personas-container">${actoresHtml}</div>
      </div>

      <div class="movie-meta">
        <h4>Compañías:</h4>
        <div class="personas-container">${companiasHtml}</div>
      </div>

      <div class="movie-meta">
        <h4>Generos:</h4>
        <p>${generos}</p>
      </div>
      <div class="movie-meta">
        <h4>Idiomas:</h4>
        <p>${idiomas}</p>
      </div>
    `;

    modal.style.display = "block";
  } catch (error) {
    console.error("Error mostrando detalles:", error);
    alert("Ocurrió un error al mostrar los detalles de la película.");
  }
}

document.addEventListener("click", function (e) {
  const modal = document.getElementById("movie-modal");
  if (
    e.target.classList.contains("close-modal") ||
    e.target.id === "movie-modal"
  ) {
    modal.style.display = "none";
  }
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    const movieModal = document.getElementById("movie-modal");
    const trailerModal = document.getElementById("trailer-modal");

    if (movieModal.style.display === "block") {
      movieModal.style.display = "none";
    }
    if (trailerModal.style.display === "flex") {
      trailerModal.style.display = "none";
      document.getElementById("modal-youtube-player").src = "";
    }
  }
});
