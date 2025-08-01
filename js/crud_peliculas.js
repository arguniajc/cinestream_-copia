// Configuración global
const API_BASE = "https://cinestream-backend.onrender.com/api";

// Estados globales
let peliculasData = [];
let actoresData = [];
let directoresData = [];
let companiasData = [];
let generosData = [];
let idiomasData = [];
let paisesData = [];

// Elementos seleccionados para la película actual
let actoresSeleccionados = [];
let directoresSeleccionados = [];
let companiasSeleccionadas = [];
let generosSeleccionados = [];
let idiomasSeleccionados = [];
let editandoPelicula = null;

// Utilidades
function mostrarMensaje(texto, tipo = "success") {
  const mensaje = document.getElementById("mensajeGlobal");
  mensaje.textContent = texto;
  mensaje.className = `mensaje ${tipo}`;
  mensaje.style.display = "block";

  setTimeout(() => {
    mensaje.style.display = "none";
  }, 5000);
}

function mostrarVistaPrevia(input, previewId) {
  const preview = document.getElementById(previewId);
  if (input.value) {
    preview.src = input.value;
    preview.classList.add("visible");
    preview.onerror = () => preview.classList.remove("visible");
  } else {
    preview.classList.remove("visible");
  }
}

// Funciones para manejar modales
function abrirModal(modalId) {
  document.getElementById(modalId).style.display = "flex";
}

function cerrarModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

// Funciones de carga de datos
async function cargarDatos(endpoint) {
  try {
    const token = localStorage.getItem("token");

    // Si no hay token, redirigir inmediatamente
    if (!token) {
      mostrarMensaje("Sesión no válida, redirigiendo...", "error");
      setTimeout(() => (window.location.href = "login.html"), 2000);
      return null;
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(`${API_BASE}/${endpoint}`, {
      headers: headers,
    });

    if (!response.ok) {
      // Si es error 401 (no autorizado), redirigir a login
      if (response.status === 401) {
        localStorage.removeItem("token"); // Limpiar token inválido
        mostrarMensaje("Sesión expirada, redirigiendo...", "error");
        setTimeout(() => (window.location.href = "login.html"), 2000);
        return null;
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error cargando ${endpoint}:`, error);
    mostrarMensaje(`Error cargando ${endpoint}: ${error.message}`, "error");
    return null;
  }
}

async function cargarPaises() {
  try {
    const response = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,cca2"
    );
    const paises = await response.json();

    paisesData = paises
      .map((p) => ({ codigo: p.cca2, nombre: p.name.common }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));

    const select = document.getElementById("pais_estreno");
    select.innerHTML = '<option value="">Seleccionar país...</option>';

    paisesData.forEach((pais) => {
      const option = document.createElement("option");
      option.value = pais.codigo;
      option.textContent = pais.nombre;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error cargando países:", error);
    const select = document.getElementById("pais_estreno");
    select.innerHTML = '<option value="">Error cargando países</option>';
  }
}

async function cargarActores() {
  const data = await cargarDatos("actores");
  if (data) {
    actoresData = data.actores || data;
    const select = document.getElementById("selectActor");
    select.innerHTML = '<option value="">Seleccionar actor...</option>';

    actoresData.forEach((actor) => {
      const option = document.createElement("option");
      option.value = actor.id;
      option.textContent = actor.nombre;
      select.appendChild(option);
    });
  }
}

async function cargarDirectores() {
  const data = await cargarDatos("directores");
  if (data) {
    directoresData = data.directores || data;
    const select = document.getElementById("selectDirector");
    select.innerHTML = '<option value="">Seleccionar director...</option>';

    directoresData.forEach((director) => {
      const option = document.createElement("option");
      option.value = director.id;
      option.textContent = director.nombre;
      select.appendChild(option);
    });
  }
}

async function cargarGeneros() {
  try {
    const data = await cargarDatos("generos");
    console.log("Datos de géneros recibidos:", data); // Debug

    if (data) {
      generosData = data.generos || data;
      const select = document.getElementById("selectGenero");
      select.innerHTML = '<option value="">Seleccionar género...</option>';

      if (generosData.length === 0) {
        select.innerHTML =
          '<option value="">No hay géneros disponibles</option>';
        return;
      }

      generosData.forEach((genero) => {
        const option = document.createElement("option");
        option.value = genero.id;
        option.textContent = genero.nombre;
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Error en cargarGeneros:", error);
    const select = document.getElementById("selectGenero");
    select.innerHTML = '<option value="">Error cargando géneros</option>';
  }
}

async function cargarCompanias() {
  try {
    const data = await cargarDatos("companias");
    console.log("Datos de compañías:", data); // Para depuración

    if (!data) return;

    // Manejar tanto el formato {companias: [...]} como [...]
    companiasData = Array.isArray(data) ? data : data.companias || [];

    const select = document.getElementById("selectCompania");
    select.innerHTML = '<option value="">Seleccionar compañía...</option>';

    if (companiasData.length === 0) {
      select.innerHTML =
        '<option value="">No hay compañías disponibles</option>';
      return;
    }

    companiasData.forEach((compania) => {
      const option = document.createElement("option");
      option.value = compania.id;
      option.textContent = compania.nombre;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error cargando compañías:", error);
    const select = document.getElementById("selectCompania");
    select.innerHTML = '<option value="">Error cargando compañías</option>';
    mostrarMensaje("Error cargando las compañías", "error");
  }
}

async function cargarIdiomas() {
  try {
    const data = await cargarDatos("idiomas");
    console.log("Datos de idiomas:", data); // Para depuración

    if (!data) return;

    // Manejar tanto el formato {idiomas: [...]} como [...]
    idiomasData = Array.isArray(data) ? data : data.idiomas || [];

    const select = document.getElementById("selectIdioma");
    select.innerHTML = '<option value="">Seleccionar idioma...</option>';

    if (idiomasData.length === 0) {
      select.innerHTML = '<option value="">No hay idiomas disponibles</option>';
      return;
    }

    idiomasData.forEach((idioma) => {
      const option = document.createElement("option");
      option.value = idioma.id;
      option.textContent = idioma.nombre;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error cargando idiomas:", error);
    const select = document.getElementById("selectIdioma");
    select.innerHTML = '<option value="">Error cargando idiomas</option>';
    mostrarMensaje("Error cargando los idiomas", "error");
  }
}

async function cargarPeliculas() {
  const container = document.getElementById("peliculasContainer");
  const grid = document.getElementById("peliculasGrid");

  try {
    const data = await cargarDatos("peliculas");
    if (data) {
      peliculasData = data.peliculas || data;
      grid.innerHTML = "";

      if (peliculasData.length === 0) {
        grid.innerHTML =
          '<p style="text-align: center; color: var(--text-secondary);">No hay películas registradas</p>';
        return;
      }

      peliculasData.forEach((pelicula) => {
        const card = document.createElement("div");
        card.className = "movie-card";

        card.innerHTML = `
                            <img src="${
                              pelicula.poster_url ||
                              "https://via.placeholder.com/300x450?text=Sin+poster"
                            }" 
                                 alt="${pelicula.titulo_espanol}"
                                 onerror="this.src='https://via.placeholder.com/300x450?text=Sin+poster'">
                            <div class="movie-actions">
                                <button class="secondary" onclick="editarPelicula(${
                                  pelicula.id
                                })">Editar</button>
                                <button class="danger" onclick="eliminarPelicula(${
                                  pelicula.id
                                })">Eliminar</button>
                            </div>
                            <div class="movie-info">
                                <h3>${pelicula.titulo_espanol}</h3>
                                <p>⭐ ${pelicula.calificacion || "N/A"}</p>
                                <p>📅 ${
                                  pelicula.fecha_estreno
                                    ? new Date(
                                        pelicula.fecha_estreno
                                      ).getFullYear()
                                    : "N/A"
                                }</p>
                            </div>
                        `;

        grid.appendChild(card);
      });
    }
  } catch (error) {
    grid.innerHTML =
      '<p style="text-align: center; color: var(--error);">Error cargando películas</p>';
  } finally {
    container.querySelector(".loading").style.display = "none";
  }
}

// Funciones para gestionar relaciones
function agregarActor() {
  const selectActor = document.getElementById("selectActor");
  const personajeInput = document.getElementById("personaje");

  if (!selectActor.value) {
    mostrarMensaje("Selecciona un actor", "error");
    return;
  }

  const actorId = parseInt(selectActor.value);
  const actor = actoresData.find((a) => a.id === actorId);
  const personaje = personajeInput.value.trim();

  // Verificar si ya está agregado
  if (actoresSeleccionados.some((a) => a.id === actorId)) {
    mostrarMensaje("Este actor ya está agregado", "error");
    return;
  }

  actoresSeleccionados.push({
    id: actorId,
    nombre: actor.nombre,
    personaje: personaje,
  });

  actualizarListaActores();
  personajeInput.value = "";
  selectActor.value = "";
  cerrarModal("actorModal");
}

function agregarDirector() {
  const selectDirector = document.getElementById("selectDirector");

  if (!selectDirector.value) {
    mostrarMensaje("Selecciona un director", "error");
    return;
  }

  const directorId = parseInt(selectDirector.value);
  const director = directoresData.find((d) => d.id === directorId);

  if (directoresSeleccionados.some((d) => d.id === directorId)) {
    mostrarMensaje("Este director ya está agregado", "error");
    return;
  }

  // Guardar objeto con propiedad 'id'
  directoresSeleccionados.push({
    id: directorId,
    nombre: director.nombre,
  });

  actualizarListaDirectores();
  selectDirector.value = "";
  cerrarModal("directorModal");
}

function agregarCompania() {
  const selectCompania = document.getElementById("selectCompania");

  if (!selectCompania.value) {
    mostrarMensaje("Selecciona una compañía", "error");
    return;
  }

  const companiaId = parseInt(selectCompania.value);
  const compania = companiasData.find((c) => c.id === companiaId);

  if (companiasSeleccionadas.some((c) => c.id === companiaId)) {
    mostrarMensaje("Esta compañía ya está agregada", "error");
    return;
  }

  companiasSeleccionadas.push({
    id: companiaId,
    nombre: compania.nombre,
  });

  actualizarListaCompanias();
  selectCompania.value = "";
  cerrarModal("companiaModal");
}

function agregarGenero() {
  const selectGenero = document.getElementById("selectGenero");

  if (!selectGenero.value) {
    mostrarMensaje("Selecciona un género", "error");
    return;
  }

  const generoId = parseInt(selectGenero.value);
  const genero = generosData.find((g) => g.id === generoId);

  if (generosSeleccionados.some((g) => g.id === generoId)) {
    mostrarMensaje("Este género ya está agregado", "error");
    return;
  }

  generosSeleccionados.push({
    id: generoId,
    nombre: genero.nombre,
  });

  actualizarListaGeneros();
  selectGenero.value = "";
  cerrarModal("generoModal");
}

function agregarIdioma() {
  const selectIdioma = document.getElementById("selectIdioma");

  if (!selectIdioma.value) {
    mostrarMensaje("Selecciona un idioma", "error");
    return;
  }

  const idiomaId = parseInt(selectIdioma.value);
  const idioma = idiomasData.find((i) => i.id === idiomaId);

  if (idiomasSeleccionados.some((i) => i.id === idiomaId)) {
    mostrarMensaje("Este idioma ya está agregado", "error");
    return;
  }

  idiomasSeleccionados.push({
    id: idiomaId,
    nombre: idioma.nombre,
  });

  actualizarListaIdiomas();
  selectIdioma.value = "";
  cerrarModal("idiomaModal");
}

// Funciones para actualizar listas visuales
function actualizarListaActores() {
  const container = document.getElementById("actoresSeleccionados");
  container.innerHTML = "";

  actoresSeleccionados.forEach((actor, index) => {
    const item = document.createElement("div");
    item.className = "relation-item";
    item.innerHTML = `
                    <span>${actor.nombre}${
      actor.personaje ? ` como ${actor.personaje}` : ""
    }</span>
                    <button onclick="eliminarActor(${index})" type="button">×</button>
                `;
    container.appendChild(item);
  });
}

function actualizarListaDirectores() {
  const container = document.getElementById("directoresSeleccionados");
  container.innerHTML = "";

  directoresSeleccionados.forEach((director, index) => {
    const item = document.createElement("div");
    item.className = "relation-item";
    item.innerHTML = `
                    <span>${director.nombre}</span>
                    <button onclick="eliminarDirector(${index})" type="button">×</button>
                `;
    container.appendChild(item);
  });
}

function actualizarListaGeneros() {
  const container = document.getElementById("generosSeleccionados");
  container.innerHTML = "";

  generosSeleccionados.forEach((genero, index) => {
    const item = document.createElement("div");
    item.className = "relation-item";
    item.innerHTML = `
                    <span>${genero.nombre}</span>
                    <button onclick="eliminarGenero(${index})" type="button">×</button>
                `;
    container.appendChild(item);
  });
}

function actualizarListaCompanias() {
  const container = document.getElementById("companiasSeleccionadas");
  container.innerHTML = "";

  companiasSeleccionadas.forEach((compania, index) => {
    const item = document.createElement("div");
    item.className = "relation-item";

    // Buscar el nombre de la compañía en los datos cargados
    const companiaData = companiasData.find(
      (c) => c.id === compania.id || c.id === compania
    );
    const nombreCompania = companiaData
      ? companiaData.nombre
      : `Compañía ID: ${compania.id || compania}`;

    item.innerHTML = `
            <span>${nombreCompania}</span>
            <button onclick="eliminarCompania(${index})" type="button">×</button>
        `;
    container.appendChild(item);
  });
}

function actualizarListaIdiomas() {
  const container = document.getElementById("idiomasSeleccionados");
  container.innerHTML = "";

  idiomasSeleccionados.forEach((idioma, index) => {
    const item = document.createElement("div");
    item.className = "relation-item";
    item.innerHTML = `
            <span>${idioma.nombre}</span>
            <button onclick="eliminarIdioma(${index})" type="button">×</button>
        `;
    container.appendChild(item);
  });
}

function eliminarCompania(index) {
  companiasSeleccionadas.splice(index, 1);
  actualizarListaCompanias();
}

function eliminarIdioma(index) {
  idiomasSeleccionados.splice(index, 1);
  actualizarListaIdiomas();
}
function eliminarActor(index) {
  actoresSeleccionados.splice(index, 1);
  actualizarListaActores();
}

function eliminarDirector(index) {
  directoresSeleccionados.splice(index, 1);
  actualizarListaDirectores();
}

function eliminarGenero(index) {
  generosSeleccionados.splice(index, 1);
  actualizarListaGeneros();
}

// Función para limpiar formulario
function limpiarFormulario() {
  document.getElementById("formPelicula").reset();
  document.getElementById("peliculaId").value = "";
  document.getElementById("formTitle").textContent = "Agregar Película";
  document.getElementById("posterPreview").classList.remove("visible");

  actoresSeleccionados = [];
  directoresSeleccionados = [];
  generosSeleccionados = [];
  companiasSeleccionadas = [];
  idiomasSeleccionados = [];
  editandoPelicula = null;

  actualizarListaActores();
  actualizarListaDirectores();
  actualizarListaGeneros();
  actualizarListaCompanias();
  actualizarListaIdiomas();
}
// Función para editar película
async function editarPelicula(id) {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      mostrarMensaje("Debes iniciar sesión para realizar esta acción", "error");
      setTimeout(() => (window.location.href = "login.html"), 2000);
      return;
    }

    const response = await fetch(`${API_BASE}/peliculas/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al cargar los datos de la película");
    }

    const pelicula = await response.json();
    console.log("Datos de película recibidos:", pelicula); // Para depuración

    // Llenar formulario
    document.getElementById("peliculaId").value = pelicula.id;
    document.getElementById("titulo_espanol").value = pelicula.titulo_espanol;
    document.getElementById("titulo_original").value = pelicula.titulo_original;
    document.getElementById("sinopsis").value = pelicula.sinopsis;
    document.getElementById("fecha_estreno").value =
      pelicula.fecha_estreno?.split("T")[0];
    document.getElementById("pais_estreno").value = pelicula.pais_estreno;
    document.getElementById("duracion_minutos").value =
      pelicula.duracion_minutos;
    document.getElementById("calificacion").value = pelicula.calificacion;
    document.getElementById("trailer_url").value = pelicula.trailer_url || "";
    document.getElementById("poster_url").value = pelicula.poster_url || "";

    if (pelicula.poster_url) {
      mostrarVistaPrevia({ value: pelicula.poster_url }, "posterPreview");
    }

    // Cargar todas las relaciones
    actoresSeleccionados = pelicula.actores || [];
    directoresSeleccionados = pelicula.directores || [];
    companiasSeleccionadas = pelicula.companias || [];
    generosSeleccionados = pelicula.generos || [];
    idiomasSeleccionados = pelicula.idiomas || [];

    // Actualizar todas las listas visuales
    actualizarListaActores();
    actualizarListaDirectores();
    actualizarListaCompanias();
    actualizarListaGeneros();
    actualizarListaIdiomas();

    document.getElementById("formTitle").textContent = "Editar Película";
    editandoPelicula = id;

    // Scroll al formulario
    document
      .querySelector(".form-section")
      .scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    console.error("Error al cargar película:", error);
    mostrarMensaje(
      "Error cargando datos de la película: " + error.message,
      "error"
    );
  }
}

// Función para eliminar película
async function eliminarPelicula(id) {
  const token = localStorage.getItem("token");
  if (!token) {
    mostrarMensaje("Debes iniciar sesión para realizar esta acción", "error");
    setTimeout(() => (window.location.href = "login.html"), 2000);
    return;
  }

  if (!confirm("¿Estás seguro de que quieres eliminar esta película?")) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/peliculas/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      mostrarMensaje("Película eliminada correctamente");
      cargarPeliculas();
    } else {
      throw new Error("Error al eliminar");
    }
  } catch (error) {
    mostrarMensaje("Error eliminando la película", "error");
  }
}

// Función principal para enviar formulario
async function enviarFormulario(event) {
  event.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) {
    mostrarMensaje("Debes iniciar sesión para realizar esta acción", "error");
    return;
  }

  if (!validarFormulario()) {
    return;
  }

  // Preparar datos exactamente como los espera el backend
  const formData = {
    titulo_espanol: document.getElementById("titulo_espanol").value.trim(),
    titulo_original: document.getElementById("titulo_original").value.trim(),
    sinopsis: document.getElementById("sinopsis").value.trim(),
    fecha_estreno: document.getElementById("fecha_estreno").value,
    pais_estreno: document.getElementById("pais_estreno").value,
    duracion_minutos: parseInt(
      document.getElementById("duracion_minutos").value
    ),
    calificacion: document.getElementById("calificacion").value.trim(),
    trailer_url: document.getElementById("trailer_url").value.trim() || null,
    poster_url: document.getElementById("poster_url").value.trim() || null,
    actores: actoresSeleccionados.map((a) => ({
      actor_id: a.id,
      personaje: a.personaje || null,
    })),
    // Cambiar a arrays de IDs simples (no objetos)
    directores: directoresSeleccionados.map((d) => d.id),
    companias: companiasSeleccionadas.map((c) => c.id),
    generos: generosSeleccionados.map((g) => g.id),
    idiomas: idiomasSeleccionados.map((i) => i.id),
  };

  console.log("Datos a enviar:", JSON.stringify(formData, null, 2));

  try {
    const url = editandoPelicula
      ? `${API_BASE}/peliculas/${editandoPelicula}`
      : `${API_BASE}/peliculas`;

    const method = editandoPelicula ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Error detallado del servidor:", responseData);
      let errorMessage = responseData.error || "Error al guardar la película";
      if (responseData.detalle) {
        errorMessage += `: ${responseData.detalle}`;
      }
      throw new Error(errorMessage);
    }

    console.log("Respuesta exitosa:", responseData);
    mostrarMensaje(
      `Película ${editandoPelicula ? "actualizada" : "creada"} correctamente`
    );
    limpiarFormulario();
    cargarPeliculas();
  } catch (error) {
    console.error("Error completo:", error);
    mostrarMensaje(error.message, "error");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // Verificar si el usuario tiene token
  const token = localStorage.getItem("token");
  if (!token) {
    mostrarMensaje("Debes iniciar sesión para acceder a esta página", "error");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
    return;
  }

  // Si tiene token, cargar los datos normalmente
  await Promise.all([
    cargarPaises(),
    cargarActores(),
    cargarDirectores(),
    cargarCompanias(),
    cargarGeneros(),
    cargarIdiomas(),
    cargarPeliculas(),
  ]);

  document
    .getElementById("formPelicula")
    .addEventListener("submit", enviarFormulario);
});

function validarFormulario() {
  const camposRequeridos = [
    "titulo_espanol",
    "titulo_original",
    "sinopsis",
    "fecha_estreno",
    "pais_estreno",
    "duracion_minutos",
    "calificacion",
  ];

  for (const campo of camposRequeridos) {
    const valor = document.getElementById(campo).value.trim();
    if (!valor) {
      mostrarMensaje(
        `El campo ${campo.replace("_", " ")} es requerido`,
        "error"
      );
      document.getElementById(campo).focus();
      return false;
    }
  }

  const duracion = parseInt(document.getElementById("duracion_minutos").value);
  if (isNaN(duracion) || duracion <= 0) {
    mostrarMensaje("La duración debe ser un número positivo", "error");
    return false;
  }

  if (actoresSeleccionados.length === 0) {
    mostrarMensaje("Debe seleccionar al menos un actor", "error");
    return false;
  }

  if (directoresSeleccionados.length === 0) {
    mostrarMensaje("Debe seleccionar al menos un director", "error");
    return false;
  }

  if (generosSeleccionados.length === 0) {
    mostrarMensaje("Debe seleccionar al menos un género", "error");
    return false;
  }

  return true;
}
