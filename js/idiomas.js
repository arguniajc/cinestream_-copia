const API = 'https://cinestream-backend.onrender.com/api/idiomas';
const listaIdiomas = document.getElementById('listaIdiomas');
const form = document.getElementById('formIdioma');
const idiomaId = document.getElementById('idiomaId');
const nombre = document.getElementById('nombre');
const mensaje = document.getElementById('mensaje');

async function cargarIdiomas() {
  const res = await fetch(API);
  const data = await res.json();
  listaIdiomas.innerHTML = data.map(idioma => `
    <div class="card">
      <strong>${idioma.nombre}</strong>
      <div class="card-buttons">
        <button onclick="editar(${idioma.id}, '${idioma.nombre}')">Editar</button>
        <button onclick="eliminar(${idioma.id})">Eliminar</button>
      </div>
    </div>
  `).join('');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = { nombre: nombre.value };
  const method = idiomaId.value ? 'PUT' : 'POST';
  const url = idiomaId.value ? `${API}/${idiomaId.value}` : API;

  const token = localStorage.getItem('token');
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  mensaje.textContent = result.mensaje || result.error;
  idiomaId.value = '';
  nombre.value = '';
  cargarIdiomas();
});

function editar(id, nombreIdioma) {
  idiomaId.value = id;
  nombre.value = nombreIdioma;
}

async function eliminar(id) {
  if (!confirm('¿Eliminar idioma?')) return;
  const token = localStorage.getItem('token');
  const res = await fetch(`${API}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const result = await res.json();
  mensaje.textContent = result.mensaje || result.error;
  cargarIdiomas();
}

cargarIdiomas();
