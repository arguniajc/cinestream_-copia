const API = 'https://cinestream-backend.onrender.com/api/companias';
const token = localStorage.getItem('token');

async function cargarCompanias() {
    const res = await fetch(API);
    const data = await res.json();
    const tbody = document.getElementById('tablaCompanias');
    tbody.innerHTML = '';
    data.forEach(c => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${c.id}</td>
            <td>${c.nombre}</td>
            <td><img src="${c.imagen_url}" alt="${c.nombre}"></td>
            <td>
                <button onclick="editar(${c.id}, '${c.nombre}', '${c.imagen_url}')">Editar</button>
                <button onclick="eliminar(${c.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(fila);
    });
}

const form = document.getElementById('formCompania');
form.addEventListener('submit', async e => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const imagen_url = document.getElementById('imagenUrl').value;

    const res = await fetch(API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ nombre, imagen_url })
    });

    const data = await res.json();
    document.getElementById('mensaje').innerText = data.mensaje || data.error;
    form.reset();
    cargarCompanias();
});

async function editar(id, nombreActual, imagenActual) {
    const nuevoNombre = prompt('Nuevo nombre:', nombreActual);
    const nuevaImagen = prompt('Nueva URL de imagen:', imagenActual);
    if (!nuevoNombre || !nuevaImagen) return;

    const res = await fetch(`${API}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ nombre: nuevoNombre, imagen_url: nuevaImagen })
    });

    const data = await res.json();
    document.getElementById('mensaje').innerText = data.mensaje || data.error;
    cargarCompanias();
}

async function eliminar(id) {
    if (!confirm('¿Deseas eliminar esta compañía?')) return;

    const res = await fetch(`${API}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
    });

    const data = await res.json();
    document.getElementById('mensaje').innerText = data.mensaje || data.error;
    cargarCompanias();
}

cargarCompanias();