const genreContainer = document.getElementById('genreButtons');
// Elementos del Modal
const moviesModal = document.getElementById('moviesModal');
const modalMovieList = document.getElementById('modalMovieList');
const modalTitle = document.getElementById('modal-title');
const closeModalBtn = moviesModal.querySelector('.close-modal');
// Elementos del Modal de Tráiler
const trailerModal = document.getElementById('trailer-modal');
const trailerIframe = document.getElementById('modal-youtube-player');
const closeTrailerBtn = document.querySelector('.close-trailer-modal');


const GENEROS_API = 'https://cinestream-backend.onrender.com/api/generos';
const PELICULAS_POR_GENERO_API = 'https://cinestream-backend.onrender.com/api/peliculas/genero/';

// Imágenes de ejemplo por género (puedes cambiarlas)
const generoImages = {
  1: 'https://i.ibb.co/xD4S0HD/drama.jpg',
  2: 'https://i.ibb.co/FmcRrxW/accion.jpg',
  3: 'https://i.ibb.co/Z1S6Lb4/comedia.jpg',
  4: 'https://i.ibb.co/vdH0yVF/terror.jpg',
  5: 'https://i.ibb.co/Bs6LkPP/romance.jpg',
};

async function cargarGeneros() {
  try {
    const res = await fetch(GENEROS_API);
    const generos = await res.json();

    genreContainer.innerHTML = generos.map(genero => `
      <div class="card" data-id="${genero.id}" data-nombre="${genero.nombre}">
        <img src="${generoImages[genero.id] || 'https://via.placeholder.com/300x200'}" alt="${genero.nombre}">
        <div class="card-body">
          <h3>${genero.nombre}</h3>
          <button class="ver-peliculas-btn">Ver películas</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error cargando géneros:', error);
  }
}

async function cargarPeliculasPorGenero(id, nombre) {
  try {
    // 1. Actualizamos el título del modal y mostramos un mensaje de carga.
    modalTitle.textContent = `Películas de ${nombre}`;
    modalMovieList.innerHTML = `<p>Cargando películas...</p>`;
    openModal(); // Abrimos el modal inmediatamente.

    const res = await fetch(`${PELICULAS_POR_GENERO_API}${id}`);
    const data = await res.json();

    console.log('Respuesta de la API para el género:', nombre, data);

    const peliculas = data.peliculas || data;

    if (!Array.isArray(peliculas) || peliculas.length === 0) {
      modalMovieList.innerHTML = `<p>No se encontraron películas para el género ${nombre}.</p>`;
      return;
    }

    // 2. Llenamos el modal con las tarjetas de las películas.
    modalMovieList.innerHTML = peliculas.map(pelicula => `
      <div class="card">
        <div class="movie-poster">
          <img src="${pelicula.poster_url || 'https://via.placeholder.com/300x200'}" alt="${pelicula.titulo_espanol}">
          <div class="card-overlay">
            <button class="play-trailer-btn" data-trailer-url="${pelicula.trailer_url}">
              <i class="fas fa-play"></i> Ver Tráiler
            </button>
          </div>
        </div>
        <div class="card-body">
          <h3>${pelicula.titulo_espanol}</h3>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error cargando películas:', error);
    modalMovieList.innerHTML = `<p>Ocurrió un error al cargar las películas.</p>`;
  }
}

// --- Funciones para controlar el Modal ---
function openModal() {
  moviesModal.style.display = 'block';
}

function closeModal() {
  moviesModal.style.display = 'none';
  modalMovieList.innerHTML = ''; // Limpiamos el contenido al cerrar.
}

// --- Funciones para controlar el Modal de Tráiler ---
function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&?/]+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

function openTrailerModal(url) {
  const videoId = getYouTubeId(url);
  if (videoId) {
    trailerIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    trailerModal.style.display = 'flex';
  } else {
    alert('El tráiler para esta película no está disponible.');
  }
}

function closeTrailerModal() {
  trailerIframe.src = ''; // Detiene la reproducción del video
  trailerModal.style.display = 'none';
}

// --- Event Listeners ---

// Cerrar el modal de tráiler
closeTrailerBtn.addEventListener('click', closeTrailerModal);
trailerModal.addEventListener('click', (e) => e.target === trailerModal && closeTrailerModal());

// Cerrar el modal con el botón 'X'
closeModalBtn.addEventListener('click', closeModal);

// Cerrar el modal si se hace clic fuera del contenido
window.addEventListener('click', (e) => {
  if (e.target == moviesModal) {
    closeModal();
  }
});

// ✅ EVENT DELEGATION PARA LOS BOTONES DINÁMICOS
genreContainer.addEventListener('click', function (e) {
  const button = e.target.closest('.ver-peliculas-btn');

  if (button) {
    const card = button.closest('.card');
    const id = card.getAttribute('data-id');
    const nombre = card.getAttribute('data-nombre');
    cargarPeliculasPorGenero(id, nombre);
  }
});

// Event delegation para los botones de tráiler en el modal de películas
modalMovieList.addEventListener('click', (e) => {
  const trailerButton = e.target.closest('.play-trailer-btn');
  if (trailerButton) {
    const trailerUrl = trailerButton.dataset.trailerUrl;
    openTrailerModal(trailerUrl);
  }
});

cargarGeneros();
