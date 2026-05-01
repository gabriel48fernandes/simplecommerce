// ===========================================
// DOM ELEMENTS - Definição de variáveis globais
// ===========================================
const container = document.getElementById("produtos");
const areaUsuario = document.getElementById("area-usuario");

const API_URL = window.location.hostname.includes("localhost")
  ? "http://localhost:3000"
  : "https://simplecommerce.onrender.com";

let PRECO_MAXIMO = 0;

// ⚠️ Nota: container pode ser null em páginas que não têm #produtos
// As funções validam isso antes de usar

async function carregarPrecoMaximo() {
  try {
    const res = await api(`${API_URL}/produtos/preco-max`);
    const data = await res.json();

    PRECO_MAXIMO = Number(data.max) || 0;

    const range = document.getElementById("precoRange");
    const valor = document.getElementById("precoValor");

    if (range) {
      range.min = 0;
      range.max = PRECO_MAXIMO;
      range.value = PRECO_MAXIMO;
    }

    if (valor) {
      valor.innerText = `R$ ${PRECO_MAXIMO.toLocaleString("pt-BR")}`;
    }

    return PRECO_MAXIMO;
  } catch (err) {
    console.error("Erro ao obter preço máximo:", err);
    return 0;
  }
}
document.addEventListener('contextmenu', function (e) {
  e.preventDefault();
  return false;
});

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
      <a href="/login.html" class="icon-link">
        <i data-lucide="user"></i>
      </a>

      <button class="icon-link" onclick="abrirCarrinho()">
        <i data-lucide="shopping-cart"></i>
      </button>
    `;

    lucide.createIcons();

  } else {

  const primeiroNome = auth.usuario.nome
    ? auth.usuario.nome.split(" ")[0]
    : auth.usuario.email;

  const inicial = primeiroNome.charAt(0).toUpperCase();

  areaUsuario.innerHTML = `
    <div class="user-menu">

      <div class="user-info" onclick="abrirModalUsuario()">
        <div class="avatar">${inicial}</div>
        <span>${primeiroNome}</span>
      </div>

      <button class="icon-link" id="iconeCarrinho" onclick="abrirCarrinho()">
        <i data-lucide="shopping-cart"></i>
        <span id="contadorCarrinho">0</span>
      </button>

    </div>

    <!-- MODAL USUÁRIO -->
    <div class="user-modal" id="userModal">
      <div class="user-modal-content">

        <div class="user-modal-header">
          <div class="avatar grande">${inicial}</div>

          <div class="info">
            <h4>${primeiroNome}</h4>
            <span>${auth.usuario.email}</span>
          </div>

          <button onclick="fecharModalUsuario()">
            <i data-lucide="x"></i>
          </button>
        </div>

        <div class="user-modal-body">

          <button onclick="irParaPedidos()">
            <i data-lucide="package"></i>
            Meus pedidos
          </button>

          ${
            auth.usuario.role === "admin"
              ? `
                <button onclick="irParaAdmin()">
                  <i data-lucide="settings"></i>
                  Painel ADM
                </button>
              `
              : ""
          }

          <div class="divider"></div>

          <button onclick="logout()" class="logout">
            <i data-lucide="log-out"></i>
            Sair
          </button>

        </div>

      </div>
    </div>
  `;

  atualizarContadorCarrinho();
  lucide.createIcons();
}

}

// ============================
// FUNÇÕES DO MENU USUÁRIO
// ============================

function logout() {
  localStorage.removeItem("auth");
  window.location.reload();
}

function irParaPedidos() {
  window.location.href = "/meus-pedidos.html";
}

function irParaAdmin() {
  window.location.href = "/admin/admin.html";
}

function logout() {
  localStorage.removeItem("auth");
  window.location.reload();
}

function irParaPedidos() {
  window.location.href = "/meus-pedidos.html";
}

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
document.addEventListener("click", function (e) {
  const modal = document.getElementById("userModal");
  const content = document.querySelector(".user-modal-content");
  const userInfo = document.querySelector(".user-info");

  if (!modal || !content || !userInfo) return;

  if (
    modal.classList.contains("ativo") &&
    !content.contains(e.target) &&
    !userInfo.contains(e.target)
  ) {
    modal.classList.remove("ativo");
  }
});

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
let currentIndex = 0
let slides = []
let dots = []
let intervalo = null

function aplicarEstiloBanner() {
  const banner = document.querySelector(".banner-container");
  if (banner) {
    banner.style.boxShadow = "0 20px 40px rgba(0,0,0,0.2)";
  }
}

async function carregarBannersHome() {
  const container = document.getElementById("carouselHome");
  const dotsContainer = document.getElementById("dots");

  // Validar se os elementos existem
  if (!container || !dotsContainer) {
    console.warn("Container de banners não encontrado na página");
    return;
  }

  try {
    const res = await api(`${API_URL}/banners`);

    if (!res.ok) {
      throw new Error(`Erro ao buscar banners: ${res.status} ${res.statusText}`);
    }

    const banners = await res.json();

    if (!banners || banners.length === 0) {
      console.log("Nenhum banner disponível");
      container.innerHTML = "<p>Sem banners disponíveis</p>";
      return;
    }

    const isMobile = window.innerWidth < 768;

    container.innerHTML = banners.map((b, index) => {
      const imagem = isMobile && b.imagem_mobile
        ? b.imagem_mobile
        : b.imagem_url;

      return `
        <div class="slide ${index === 0 ? "active" : ""}">
          <img src="${imagem}" alt="${b.titulo || 'Banner'}" />
          <button class="banner-btn">Ver ofertas</button>
        </div>
      `;
    }).join("");

    dotsContainer.innerHTML = banners.map((_, index) => `
      <span class="dot ${index === 0 ? "active" : ""}" data-index="${index}"></span>
    `).join("");

    slides = document.querySelectorAll(".slide");
    dots = document.querySelectorAll(".dot");

    dots.forEach(dot => {
      dot.addEventListener("click", () => {
        mostrarSlide(Number(dot.dataset.index));
        resetIntervalo();
      });
    });

    aplicarEstiloBanner();
    iniciarCarrossel();

    console.log("✅ Banners carregados com sucesso");

  } catch (err) {
    console.error("❌ Erro ao carregar banners:", err);
  }
}

// ============================ filtros ============================
async function aplicarFiltros() {
  const textoBusca = document.getElementById("buscaProduto")?.value.trim() || "";

  await carregarProdutos(textoBusca);
  fecharFiltros();
}

function abrirFiltros() {
  document.getElementById("painelFiltros").classList.add("ativo");
  document.getElementById("overlay").classList.add("ativo");
}

function fecharFiltros() {
  document.getElementById("painelFiltros").classList.remove("ativo");
  document.getElementById("overlay").classList.remove("ativo");
}

// RANGE PREÇO DINÂMICO
const range = document.getElementById("precoRange");
const valor = document.getElementById("precoValor");

if (range && valor) {
  range.addEventListener("input", () => {
    valor.innerText = "R$ " + range.value;
    carregarProdutos(document.getElementById("buscaProduto")?.value.trim() || "");
  });
}
// ============================
// CARROSSEL BANNERS
// ============================

function mostrarSlide(index) {
  if (!slides.length) return;

  slides.forEach(s => s.classList.remove("active"));
  dots.forEach(d => d.classList.remove("active"));

  slides[index].classList.add("active");
  dots[index].classList.add("active");

  currentIndex = index;
}

function proximoSlide() {
  if (!slides.length) return;

  currentIndex = (currentIndex + 1) % slides.length;
  mostrarSlide(currentIndex);
}

function iniciarCarrossel() {
  if (intervalo) clearInterval(intervalo);

  intervalo = setInterval(() => {
    proximoSlide();
  }, 4000);
}

function resetIntervalo() {
  iniciarCarrossel();
}

// ============================
// PRODUTOS
// ============================
async function carregarProdutos(search = "") {
  try {
    const precoMin = document.getElementById("precoMin")?.value || "";
    const precoMax = document.getElementById("precoRange")?.value || "";
    const promo = document.getElementById("promo")?.checked;

    const categoriasSelecionadas = Array.from(
      document.querySelectorAll('#filtroCategorias input[type="checkbox"]:checked')
    ).map(el => el.value);

    const params = new URLSearchParams();

    if (search) {
      params.set("search", search);
    }

    if (precoMin) {
      const precoMinNum = Number(precoMin);
      if (!Number.isNaN(precoMinNum) && precoMinNum > 0) {
        params.set("precoMin", precoMinNum);
      }
    }

    if (precoMax) {
      const precoMaxNum = Number(precoMax);
      if (
        !Number.isNaN(precoMaxNum) &&
        PRECO_MAXIMO > 0 &&
        precoMaxNum > 0 &&
        precoMaxNum < PRECO_MAXIMO
      ) {
        params.set("precoMax", precoMaxNum);
      }
    }

    if (promo) {
      params.set("promo", "true");
    }

    if (categoriasSelecionadas.length > 0) {
      params.set("categoria", categoriasSelecionadas.join(","));
    }

    const url = `${API_URL}/produtos?${params.toString()}`;

    const res = await api(url);
    const produtos = await res.json();

    if (!container) return;
    container.innerHTML = "";

    produtos.forEach(p => {
      const card = document.createElement("div");
      card.className = "card";

      const temPromocao = p.tem_promocao;

      // 🔥 Obter URL da imagem principal (com fallback)
      let imagemUrl = window.SEM_IMAGEM_FALLBACK;

      if (p.imagens && Array.isArray(p.imagens) && p.imagens.length > 0) {
        // Procurar imagem principal
        const imagemPrincipal = p.imagens.find(img => img.principal === true || img.principal === 1);
        imagemUrl = imagemPrincipal?.url || p.imagens[0]?.url || p.imagem || window.SEM_IMAGEM_FALLBACK;
      } else if (p.imagem) {
        imagemUrl = p.imagem;
      }

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

        <img src="${imagemUrl}"
        alt="${p.nome}"
        onerror="this.onerror=null; this.src=window.SEM_IMAGEM_FALLBACK" />

        <h3>${p.nome}</h3>
        ${precoHTML}
      </a>

      <button onclick="adicionarAoCarrinho(${p.id}, this)">
       Adicionar ao carrinho
      </button>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    console.error("Erro ao carregar produtos:", err);
  }
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

async function carregarCategorias() {
    try {
        const res = await api("/categorias");
        const categorias = await res.json();

        const categoriasContainer = document.getElementById("categorias");
        if (!categoriasContainer) return;

        // Monta estrutura
        categoriasContainer.innerHTML = `
            <div class="categorias-scroll-wrapper" id="categoriasScrollWrapper">
                <div class="categorias-scroll" id="categoriasScroll"></div>
            </div>
            <div class="scroll-indicator"></div>
            <button class="categorias-scroll-btn prev" onclick="scrollCategorias(-1)">←</button>
            <button class="categorias-scroll-btn next" onclick="scrollCategorias(1)">→</button>
        `;

        const scrollWrapper = document.getElementById("categoriasScrollWrapper");
        const scrollContainer = document.getElementById("categoriasScroll");

        // Atualizar filtros na sidebar
        const filtroCategorias = document.getElementById("filtroCategorias");
        if (filtroCategorias) {
            let filtrosHtml = '<h4>Categoria</h4>';
            categorias.forEach(cat => {
                filtrosHtml += `
                    <label class="checkbox-label">
                        <input type="checkbox" value="${cat.id}" data-categoria-nome="${cat.nome}" />
                        <span>${cat.nome}</span>
                    </label>
                `;
            });
            filtroCategorias.innerHTML = filtrosHtml;
            document.querySelectorAll('#filtroCategorias input[type="checkbox"]').forEach(cb => {
                cb.addEventListener('change', () => aplicarFiltros());
            });
        }

        // Criar cards
        categorias.forEach(cat => {
            const card = document.createElement("div");
            card.className = "categoria-card";
            card.setAttribute("data-categoria-id", cat.id);

            // Verifica se tem imagem válida (não é fallback)
            const temImagem = cat.imagem_url && 
                              cat.imagem_url !== window.SEM_IMAGEM_FALLBACK && 
                              cat.imagem_url.trim() !== '' &&
                              !cat.imagem_url.includes('sem-imagem') &&
                              !cat.imagem_url.includes('placeholder') &&
                              !cat.imagem_url.includes('no-image');

            if (temImagem) {
                card.classList.add("with-image");
                // Aplica a imagem de fundo
                card.style.backgroundImage = `url("${cat.imagem_url}")`;
                card.style.backgroundSize = "cover";
                card.style.backgroundPosition = "center";
                
                // Fallback: se a imagem falhar, remove com-image e vira no-image
                const testImg = new Image();
                testImg.onerror = () => {
                    if (card.classList.contains('with-image')) {
                        card.classList.remove('with-image');
                        card.classList.add('no-image');
                        card.style.backgroundImage = '';
                        card.style.backgroundColor = '#e5e7eb';
                        card.innerHTML = `<span>${cat.nome}</span>`;
                    }
                };
                testImg.src = cat.imagem_url;
            } else {
                card.classList.add("no-image");
            }

            // Só o nome da categoria (sem ícone ou imagem extra)
            card.innerHTML = `<span>${cat.nome}</span>`;

            card.addEventListener('click', () => {
                filtrarPorCategoria(cat.id, cat.nome);
            });

            scrollContainer.appendChild(card);
        });

        // Ajusta centralização e indicador de scroll
        function adjustScrollLayout() {
            if (!scrollWrapper) return;
            const hasScroll = scrollWrapper.scrollWidth > scrollWrapper.clientWidth;
            if (hasScroll) {
                scrollWrapper.classList.add('scrollable');
                categoriasContainer.classList.add('has-scroll');
            } else {
                scrollWrapper.classList.remove('scrollable');
                categoriasContainer.classList.remove('has-scroll');
            }
        }

        adjustScrollLayout();
        scrollWrapper.addEventListener('scroll', checkScrollButtons);
        window.addEventListener('resize', () => {
            adjustScrollLayout();
            checkScrollButtons();
        });
        checkScrollButtons();

        console.log("✅ Categorias carregadas:", categorias.length);
    } catch (err) {
        console.error("Erro ao carregar categorias:", err);
    }
}

// ============================
// INIT - INICIALIZA A HOME
// ============================
async function initHome() {
  // Validar se os elementos da home existem
  const temProdutos = document.getElementById("produtos");
  const temCategorias = document.getElementById("categorias");
  const temBanners = document.getElementById("carouselHome");

  // Se nenhum desses elementos existe, provavelmente não é a página home
  if (!temProdutos && !temCategorias && !temBanners) {
    console.log("⚠️  Não é a página home. Inicialização parcial.");
  }

  try {
    // 1. Carregar categorias
    await carregarCategorias();
    console.log("✅ Categorias carregadas");

    // 2. Carregar preço máximo (apenas se tiver filtro de preço)
    if (document.getElementById("precoRange")) {
      await carregarPrecoMaximo();
      console.log("✅ Preço máximo carregado");
    }

    // 3. Carregar produtos (apenas se existir container)
    if (temProdutos) {
      carregarProdutos();
      console.log("✅ Produtos carregados");
    }

    // 4. Carregar banners da home (apenas se existir container)
    if (temBanners) {
      await carregarBannersHome();
      console.log("✅ Banners carregados");
    }
  } catch (err) {
    console.error("❌ Erro durante inicialização da home:", err);
  }
}

// Executar inicialização quando o DOM está pronto
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHome);
} else {
  initHome();
}

// ============================
// EVENT LISTENERS
// ============================
const botaoAplicar = document.querySelector(".btn-aplicar");
if (botaoAplicar) {
  botaoAplicar.addEventListener("click", aplicarFiltros);
}

const buscaInput = document.getElementById("buscaProduto");
if (buscaInput) {
  buscaInput.addEventListener("input", (event) => {
    carregarProdutos(event.target.value.trim());
  });
}
function abrirModalUsuario() {
  const modal = document.getElementById("userModal");
  if (modal) modal.classList.add("ativo");
}

function fecharModalUsuario() {
  const modal = document.getElementById("userModal");
  if (modal) modal.classList.remove("ativo");
}
