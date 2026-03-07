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
      <a href="/login.html" class="icon-link">👤</a>
      <a href="/carrinho.html" class="icon-link">🛒</a>
    `;
  } else {
    const primeiroNome = auth.usuario.nome
      ? auth.usuario.nome.split(" ")[0]
      : auth.usuario.email;

    areaUsuario.innerHTML = `
      <span>Olá, ${primeiroNome} 👋</span>

      <a href="carrinho.html" class="icon-link">🛒</a>

      ${auth.usuario.role === "admin"
        ? `<a href="/admin/admin.html" class="btn-admin">⚙ ADM</a>`
        : ""
      }

      <button id="logout">Sair</button>
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
async function carregarProdutos(search = "") {
  try {
    const res = await fetch(`/produtos?search=${search}`)
    const produtos = await res.json();

    if (!container) return;
    container.innerHTML = "";

    produtos.forEach(p => {
      const card = document.createElement("div");
      card.className = "card";

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
       <a class="card-link" href="produto.html?id=${p.id}">

        ${badgeHTML}

       <img src="${p.imagem || 'https://via.placeholder.com/200x150/cccccc/666666?text=Sem+Imagem'}"
       alt="${p.nome}"
       onerror="this.src='https://via.placeholder.com/200x150/cccccc/666666?text=Sem+Imagem'" />

       <h3>${p.nome}</h3>

       ${precoHTML}

      </a>

      <button onclick="adicionarAoCarrinho(${p.id})">
      🛒 Adicionar
      </button>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error("Erro ao carregar produtos:", err);
  }
}
const inputBusca = document.getElementById("buscaProduto");

inputBusca.addEventListener("input", function () {
  carregarProdutos(inputBusca.value);
});

// ============================
// ADICIONAR AO CARRINHO (BACKEND)
// ============================
async function adicionarAoCarrinho(produto_id) {
  const auth = JSON.parse(localStorage.getItem("auth"));

  if (!auth) {
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch("/carrinho/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        usuario_id: auth.usuario.id,
        produto_id
      })
    });

    if (!res.ok) {
      throw new Error("Erro ao adicionar no carrinho");
    }

    alert("Produto adicionado ao carrinho 🛒");
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao adicionar ao carrinho");
  }
}

// ============================
// CATEGORIAS
// ============================
async function carregarCategorias() {
  try {
    const res = await fetch("/categorias");
    const categorias = await res.json();

    const categoriasContainer = document.getElementById("categorias");
    if (!categoriasContainer) return;

    categoriasContainer.innerHTML = "";

    categorias.forEach(cat => {
      const card = document.createElement("div");
      card.className = "categoria-card";

      card.innerHTML = `
        <img src="${cat.imagem_url}">
        <span>${cat.nome}</span>
      `;

      categoriasContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Erro ao carregar categorias:", err);
  }
}

// ============================
// INIT
// ============================
carregarCategorias();
carregarProdutos();