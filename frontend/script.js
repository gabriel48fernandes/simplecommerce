const container = document.getElementById("produtos");
const areaUsuario = document.getElementById("area-usuario");

// ============================
// USUÁRIO LOGADO
// ============================
let auth = null;

try {
  auth = JSON.parse(localStorage.getItem("auth"));
} catch {
  auth = null;
}

if (areaUsuario) {
  if (!auth) {
    areaUsuario.innerHTML = `
      <a href="/login.html">👤</a>
      <span>🛒</span>
    `;
  } else {
    areaUsuario.innerHTML = `
      <span>${auth.usuario.email}</span>
      ${
        auth.usuario.role === "admin"
          ? `<a href="/admin.html" class="btn-admin">⚙ ADM</a>`
          : ""
      }
      <button id="logout">Sair</button>
      <span>🛒</span>
    `;

    document.getElementById("logout").onclick = () => {
      localStorage.removeItem("auth");
      window.location.reload();
    };
  }
}

// ============================
// PRODUTOS
// ============================
async function carregarProdutos() {
  try {
    const res = await fetch("/produtos");
    const produtos = await res.json();

    if (!container) return;
    container.innerHTML = "";

    produtos.forEach(p => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <img src="${p.imagem}" />
        <h3>${p.nome}</h3>
        <p class="preco">
          ${Number(p.preco).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
          })}
        </p>
        <button>Ver produto</button>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error("Erro ao carregar produtos:", err);
  }
}

// ============================
// CATEGORIAS
// ============================
async function carregarCategorias() {
  const res = await fetch("/categorias");
  const categorias = await res.json();

  const categoriasContainer = document.getElementById("categorias");
  if (!categoriasContainer) return;

  categorias.forEach(cat => {
    const card = document.createElement("div");
    card.className = "categoria-card";

    card.innerHTML = `
      <img src="${cat.imagem_url}">
      <span>${cat.nome}</span>
    `;

    categoriasContainer.appendChild(card);
  });
}

carregarCategorias();
carregarProdutos();
