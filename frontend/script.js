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
    // 🔥 Pega apenas o primeiro nome
    const primeiroNome = auth.usuario.nome
      ? auth.usuario.nome.split(" ")[0]
      : auth.usuario.email;

    areaUsuario.innerHTML = `
      <span>Olá, ${primeiroNome} 👋</span>
      ${auth.usuario.role === "admin"
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

      // Verifica se tem promoção

      const temPromocao = p.tem_promocao;

      let precoHTML = "";
      let badgeHTML = "";

      if (temPromocao) {
        badgeHTML = `<span class="badge">${p.percentual_desconto}% OFF</span>`;
        
        precoHTML = `
          <p class="preco-antigo">
            ${Number(p.preco).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL"
        })}
          </p>
          <p class="preco-promocional">
            ${Number(p.preco_promocional).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL"
        })}
          </p>
        `;
      } else {
        precoHTML = `
          <p class="preco">
            ${Number(p.preco).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL"
        })}
          </p>
        `;
      }

      card.innerHTML = `
        ${badgeHTML}
        <img src="${p.imagem}" />
        <h3>${p.nome}</h3>
        ${precoHTML}
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
