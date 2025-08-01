const apiDestacadas = "https://cinestream-backend.onrender.com/api/peliculas/recomendadas";

let cachePeliculasDestacadas = [];

// Obtener referencias a los elementos
const featuredMoviesContainer = document.getElementById("featured-movies");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");

// Función para crear una tarjeta de película destacada
function createMovieCard(movie) {
    console.log("Creando tarjeta para:", movie);  // ✅ Log para depuración

    const card = document.createElement("div");
    card.className = "movie-card fade-in";

    // Validaciones con valores por defecto para evitar errores si algún dato falta
    const posterUrl = movie.poster_url || 'img/poster-placeholder.png';
    const titulo = movie.titulo_espanol || 'Sin título';
    const fecha = movie.fecha_estreno ? new Date(movie.fecha_estreno).getFullYear() : 'Sin fecha';
    const calificacion = movie.calificacion ?? 'N/A';
    const generos = Array.isArray(movie.generos) ? movie.generos.map(g => g.nombre).join(', ') : 'Sin género';

    card.innerHTML = `
    <div class="movie-poster">
      <img src="${posterUrl}" alt="${titulo}">
      <div class="card-overlay">
        <button class="play-trailer" data-id="${movie.trailer_url}">
          <i class="fas fa-play"></i> Ver Tráiler
        </button>
        <button class="details-btn" data-movie='${JSON.stringify(movie).replace(/'/g, "&apos;")}'>
          <i class="fas fa-info-circle"></i> Detalles
        </button>
      </div>
    </div>
    <div class="card-info">
      <h3>${titulo}</h3>
      <div class="movie-meta">
        <span><i class="fas fa-calendar"></i> ${fecha}</span>
        <span class="rating"><i class="fas fa-star"></i> ${calificacion}/10</span>
      </div>
      <div class="movie-meta">
        <span>${generos}</span>
      </div>
    </div>
  `;

    return card;
}

// Función para obtener y mostrar las películas destacadas
async function loadFeaturedMovies(forzarRecarga = false) {
    const loader = document.getElementById("featured-loader");

    try {
        if (loader) loader.style.display = "flex";
        featuredMoviesContainer.style.display = "none";

        const cacheKey = "destacadasCache";
        const cacheTimeKey = "destacadasCacheTime";
        const cached = localStorage.getItem(cacheKey);
        const cachedTime = localStorage.getItem(cacheTimeKey);
        const now = Date.now();
        const cacheValido = cached && cachedTime && (now - cachedTime) < 5 * 60 * 1000; // 5 minutos

        if (cacheValido && !forzarRecarga) {
            cachePeliculasDestacadas = JSON.parse(cached);
            console.log("Usando datos cacheados:", cachePeliculasDestacadas);
            mostrarPeliculas(cachePeliculasDestacadas);
        } else {
            const response = await fetch(apiDestacadas);
            if (!response.ok) throw new Error("No se pudo obtener las películas destacadas");

            const data = await response.json();
            console.log("Respuesta cruda de la API:", data);

            // Manejo flexible: si viene { recomendadas: [...] }, usamos eso; si ya es array, usamos directamente
            const movies = Array.isArray(data) ? data : (data.recomendadas || data.peliculas || []);

            console.log("Películas destacadas a mostrar:", movies);

            cachePeliculasDestacadas = movies;

            // Guardar en cache
            localStorage.setItem(cacheKey, JSON.stringify(movies));
            localStorage.setItem(cacheTimeKey, now.toString());

            mostrarPeliculas(movies);
        }

        if (loader) loader.style.display = "none";
        featuredMoviesContainer.style.display = "grid";

    } catch (error) {
        if (loader) loader.style.display = "none";
        featuredMoviesContainer.style.display = "block";
        featuredMoviesContainer.innerHTML = "<p>Error al cargar las películas destacadas.</p>";
        console.error("Error al cargar destacadas:", error);
    }
}



// Función que imprime películas y asigna eventos
function mostrarPeliculas(lista) {
    featuredMoviesContainer.innerHTML = "";

    console.log("Cantidad de películas a renderizar:", lista.length); // ✅ Añadido

    if (lista.length === 0) {
        featuredMoviesContainer.innerHTML = "<p>No se encontraron resultados.</p>";
        return;
    }

    lista.forEach((movie, index) => {
        console.log(`Renderizando película ${index + 1}:`, movie.titulo_espanol); // ✅ Añadido
        featuredMoviesContainer.appendChild(createMovieCard(movie));
    });

    // Asignar eventos a botones de tráiler
    document.querySelectorAll(".play-trailer").forEach(button => {
        button.addEventListener("click", (e) => {
            const rawId =
                e.target.getAttribute("data-id") ||
                e.target.parentElement.getAttribute("data-id");
            const videoId = getYouTubeId(rawId);
            showTrailerModal(videoId);
        });
    });

    // Asignar eventos a botones de detalles
  document.querySelectorAll(".details-btn").forEach(button => {
  button.addEventListener("click", (e) => {
    const movie = JSON.parse(
      e.currentTarget.getAttribute("data-movie").replace(/&apos;/g, "'")
    );
    showMovieDetails(movie);
  });
});

}


// Búsqueda de películas destacadas
function filtrarDestacadas() {
    const searchTerm = searchInput.value.trim().toLowerCase();

    if (!searchTerm) {
        // Si no hay búsqueda, muestra todo
        mostrarPeliculas(cachePeliculasDestacadas);
        return;
    }

    const filtradas = cachePeliculasDestacadas.filter(pelicula => {
        const titulo = pelicula.titulo_espanol?.toLowerCase() || "";
        const generos = pelicula.generos?.map(g => g.nombre.toLowerCase()).join(", ") || "";
        const anio = new Date(pelicula.fecha_estreno).getFullYear().toString();

        return (
            titulo.includes(searchTerm) ||
            generos.includes(searchTerm) ||
            anio.includes(searchTerm)
        );
    });

    mostrarPeliculas(filtradas);
}


// Extrae el ID de YouTube desde una URL
function getYouTubeId(url) {
    const regExp = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&?/]+)/;
    const match = url.match(regExp);
    return match ? match[1] : url;
}

// Muestra el modal del tráiler
function showTrailerModal(videoId) {
    const modal = document.getElementById("trailer-modal");
    const iframe = document.getElementById("modal-youtube-player");
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    modal.style.display = "flex";
}

// Cierra el modal del tráiler
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

    // Eventos de búsqueda
    searchInput.addEventListener("input", filtrarDestacadas);
    searchButton.addEventListener("click", filtrarDestacadas);
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            filtrarDestacadas();
        }
    });
});

// Muestra detalles (puedes personalizarla)
function showMovieDetails(movie) {
    try {
        const modal = document.getElementById("movie-modal");
        const details = document.getElementById("modal-details");

        if (!modal || !details) {
            console.error("❌ No se encontró el modal o su contenedor de detalles.");
            alert("No se puede mostrar la información porque falta el modal en la página.");
            return;
        }

        const generos = (movie.generos || []).map(g => g.nombre).join(", ") || "No especificado";
        const idiomas = (movie.idiomas || []).map(i => i.nombre).join(", ") || "No especificado";

        const actoresHtml = (movie.actores || []).map(a => `
            <div class="persona">
                <img src="${a.imagen_url || "img/persona-placeholder.png"}" alt="${a.nombre}" class="persona-img">
                <p>${a.nombre}</p>
                ${a.personaje ? `<small>como ${a.personaje}</small>` : ""}
            </div>
        `).join("") || "<p>No disponible</p>";

        const directoresHtml = (movie.directores || []).map(d => `
            <div class="persona">
                <img src="${d.imagen_url || "img/persona-placeholder.png"}" alt="${d.nombre}" class="persona-img">
                <p>${d.nombre}</p>
            </div>
        `).join("") || "<p>No disponible</p>";

        const companiasHtml = (movie.companias || []).map(c => `
            <div class="persona">
                <img src="${c.imagen_url || "img/persona-placeholder.png"}" alt="${c.nombre}" class="persona-img">
                <p>${c.nombre}</p>
            </div>
        `).join("") || "<p>No disponible</p>";

        details.innerHTML = `
            <img src="${movie.poster_url || "img/poster-placeholder.png"}" alt="${movie.titulo_espanol}" class="poster-img">
            <h2>${movie.titulo_espanol}</h2>
            <div class="movie-meta">
                <span><i class="fas fa-calendar"></i> ${movie.fecha_estreno ? new Date(movie.fecha_estreno).getFullYear() : "N/D"}</span>
                <span><i class="fas fa-star"></i> ${movie.calificacion || "N/A"}/10</span>
                <span><i class="fas fa-film"></i> ${generos}</span>
            </div>
            <p><strong>Sinopsis:</strong> ${movie.sinopsis || "No disponible."}</p>

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
                <h4>Géneros:</h4>
                <p>${generos}</p>
            </div>

            <div class="movie-meta">
                <h4>Idiomas:</h4>
                <p>${idiomas}</p>
            </div>
        `;

        modal.style.display = "block";
    } catch (error) {
        console.error("❌ Error mostrando detalles:", error);
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
