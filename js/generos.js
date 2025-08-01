const API = 'https://cinestream-backend.onrender.com/api/generos';
const listaGeneros = document.getElementById('listaGeneros');
const form = document.getElementById('formGenero');
const generoId = document.getElementById('generoId');
const nombre = document.getElementById('nombre');
const mensaje = document.getElementById('mensaje');

async function cargarGeneros() {
  const res = await fetch(API);
  const data = await res.json();
  listaGeneros.innerHTML = data.map(genero => `
    <div class="card">
      <strong>${genero.nombre}</strong>
      <div class="card-buttons">
        <button onclick="editar(${genero.id}, '${genero.nombre}')">Editar</button>
        <button onclick="eliminar(${genero.id})">Eliminar</button>
      </div>
    </div>
  `).join('');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = { nombre: nombre.value };
  const method = generoId.value ? 'PUT' : 'POST';
  const url = generoId.value ? `${API}/${generoId.value}` : API;

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
  generoId.value = '';
  nombre.value = '';
  cargarGeneros();
});

function editar(id, nombreGenero) {
  generoId.value = id;
  nombre.value = nombreGenero;
}

async function eliminar(id) {
  if (!confirm('¿Eliminar género?')) return;
  const token = localStorage.getItem('token');
  const res = await fetch(`${API}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const result = await res.json();
  mensaje.textContent = result.mensaje || result.error;
  cargarGeneros();
}

cargarGeneros();
