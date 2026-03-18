// Fallback seguro para imagens (sem depender de serviços externos)
// Essa imagem SVG é escalável e pode ser usada como placeholder em qualquer tamanho.
const SEM_IMAGEM_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23cccccc'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%23666666' font-size='24'%3E%3F%3C/text%3E%3C/svg%3E";

window.SEM_IMAGEM_FALLBACK = SEM_IMAGEM_FALLBACK;

function api(url, options = {}) {
  const auth = JSON.parse(localStorage.getItem("auth"));
  const token = auth?.token;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers
  }).then((res) => {
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("auth");
    }
    return res;
  });
}

window.api = api;