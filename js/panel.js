function cerrarSesion() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

window.onload = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Debe iniciar sesión');
    window.location.href = 'login.html';
  }
};
