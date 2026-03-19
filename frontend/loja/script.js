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

      <button class="icon-link" onclick="abrirCarrinho()">
        🛒
      </button>
    `;

  } else {

    const primeiroNome = auth.usuario.nome
      ? auth.usuario.nome.split(" ")[0]
      : auth.usuario.email;

    areaUsuario.innerHTML = `
      <span>Olá, ${primeiroNome} 👋</span>

      <button class="icon-link" id="iconeCarrinho" onclick="abrirCarrinho()">
        🛒 <span id="contadorCarrinho">0</span>
      </button>

      ${auth.usuario.role === "admin"
        ? `<a href="/admin/admin.html" class="btn-admin">⚙ ADM</a>`
        : ""
      }

      <button id="logout">Sair</button>
    `;

    atualizarContadorCarrinho();

    document.getElementById("logout").onclick = () => {
      localStorage.removeItem("auth");
      window.location.reload();
    };

  }

}

let currentSlide = 0

const slides = document.querySelectorAll(".slide")
const dots = document.querySelectorAll(".dot")

function showSlide(index){

 slides.forEach(slide => slide.classList.remove("active"))
 dots.forEach(dot => dot.classList.remove("active"))

 slides[index].classList.add("active")
 dots[index].classList.add("active")

}

function nextSlide(){

 currentSlide++

 if(currentSlide >= slides.length){
  currentSlide = 0
 }

 showSlide(currentSlide)

}

setInterval(nextSlide,4000)

function animarProdutoCarrinho(imagemProduto) {

  const carrinho = document.getElementById("iconeCarrinho");
  const img = imagemProduto.cloneNode(true);

  const rect = imagemProduto.getBoundingClientRect();
  const carrinhoRect = carrinho.getBoundingClientRect();

  img.style.position = "fixed";
  img.style.left = rect.left + "px";
  img.style.top = rect.top + "px";
  img.style.width = "80px";
  img.style.zIndex = "9999";
  img.style.transition = "all 0.8s ease";

  document.body.appendChild(img);

  setTimeout(() => {

    img.style.left = carrinhoRect.left + "px";
    img.style.top = carrinhoRect.top + "px";
    img.style.width = "20px";
    img.style.opacity = "0.5";

  }, 50);

  setTimeout(() => {
    img.remove();
  }, 800);

}

async function atualizarContadorCarrinho() {

  const auth = JSON.parse(localStorage.getItem("auth"));
  if (!auth) return;

  try {

    const res = await api(`/carrinho/count/${auth.usuario.id}`);
    const data = await res.json();

    const contador = document.getElementById("contadorCarrinho");

    if (contador) {
      contador.innerText = data.total;
    }

  } catch (err) {
    console.error("Erro ao atualizar carrinho", err);
  }

}

// ============================
// PRODUTOS
// ============================
async function carregarProdutos(search = "") {
  try {
    const res = await api(`/produtos?search=${search}`)
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

       <img src="${p.imagem || window.SEM_IMAGEM_FALLBACK}"
       alt="${p.nome}"
       onerror="this.onerror=null; this.src=window.SEM_IMAGEM_FALLBACK" />

       <h3>${p.nome}</h3>

       ${precoHTML}

      </a>

      <button onclick="adicionarAoCarrinho(${p.id} , this)">
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

if (inputBusca) {
  inputBusca.addEventListener("input", function () {
    carregarProdutos(inputBusca.value);
  });
}

// ============================
// ADICIONAR AO CARRINHO (BACKEND)
// ============================
async function adicionarAoCarrinho(produto_id, botao, quantidade = 1) {

  const auth = JSON.parse(localStorage.getItem("auth"));

  if (!auth) {
    window.location.href = "login.html";
    return;
  }

  try {

    const res = await api("/carrinho/add", {
      method: "POST",
      body: JSON.stringify({
        usuario_id: auth.usuario.id,
        produto_id,
        quantidade   // ✅ agora envia quantidade
      })
    });

    if (!res.ok) {
      throw new Error("Erro ao adicionar no carrinho");
    }

    /* animação apenas se existir botão/card */
    let imagem = null;

    if (botao) {

      const card = botao.closest(".card");

      if (card) {
        imagem = card.querySelector("img");
      }

    }

    if (!imagem) {
      imagem = document.getElementById("imagemPrincipal");
    }

    if (imagem) {
      animarProdutoCarrinho(imagem);
    }

    atualizarContadorCarrinho();
    mostrarToastCarrinho();

  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao adicionar ao carrinho");
  }
}
function mostrarToastCarrinho() {

  const toast = document.getElementById("toastCarrinho");

  if (!toast) return;

  toast.classList.add("mostrar");

  setTimeout(() => {

    toast.classList.remove("mostrar");

  }, 2500);

}

// ============================
// CATEGORIAS
// ============================
async function carregarCategorias() {
  try {
    const res = await api("/categorias");
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