const API_URL = 'https://cinestream-backend.onrender.com/api/actores';
    const token = localStorage.getItem('token');
    const lista = document.getElementById('listaActores');
    const mensaje = document.getElementById('mensaje');

    async function cargarActores() {
        lista.innerHTML = '';
        const res = await fetch(API_URL);
        const data = await res.json();

        data.forEach(actor => {
            const div = document.createElement('div');
            div.className = 'card';

            const img = document.createElement('img');
            img.src = actor.imagen_url;
            img.alt = actor.nombre;

            const content = document.createElement('div');
            content.className = 'card-content';
            content.innerHTML = `<strong>${actor.nombre}</strong>`;

            const actions = document.createElement('div');
            actions.className = 'card-actions';
            actions.innerHTML = `
                <button onclick="editar(${actor.id}, '${actor.nombre}', '${actor.imagen_url}')">Editar</button>
                <button onclick="eliminar(${actor.id})">Eliminar</button>
            `;

            div.appendChild(img);
            div.appendChild(content);
            div.appendChild(actions);
            lista.appendChild(div);
        });
    }

    const form = document.getElementById('formActor');
    form.addEventListener('submit', async e => {
        e.preventDefault();
        const nombre = document.getElementById('nombre').value;
        const imagen_url = document.getElementById('imagenUrl').value;

        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ nombre, imagen_url })
        });
        const result = await res.json();
        mensaje.textContent = result.mensaje || result.error;
        cargarActores();
        form.reset();
    });

    async function eliminar(id) {
        if (!confirm('¿Eliminar actor?')) return;
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        mensaje.textContent = result.mensaje || result.error;
        cargarActores();
    }

    function editar(id, nombre, imagen_url) {
        const nuevoNombre = prompt('Editar nombre:', nombre);
        const nuevaUrl = prompt('Editar URL de imagen:', imagen_url);

        if (nuevoNombre && nuevaUrl) {
            fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ nombre: nuevoNombre, imagen_url: nuevaUrl })
            })
            .then(res => res.json())
            .then(data => {
                mensaje.textContent = data.mensaje || data.error;
                cargarActores();
            });
        }
    }

    cargarActores();