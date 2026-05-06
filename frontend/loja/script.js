// ===========================================
// DOM ELEMENTS - Definição de variáveis globais
// ===========================================
const container = document.getElementById("produtos");
const areaUsuario = document.getElementById("area-usuario");

const API_URL = window.location.hostname.includes("localhost")
  ? "http://localhost:3000"
  : "https://simplecommerce.onrender.com";

let PRECO_MAXIMO = 0;

// Função auxiliar api (garantir que existe)
window.api = async function (url, options = {}) {

  const auth = JSON.parse(localStorage.getItem("auth"));
  const token = auth?.token;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const fullUrl = url.startsWith("http")
    ? url
    : `${API_URL}${url}`;

  const res = await fetch(fullUrl, {
    ...options,
    headers
  });

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("auth");
  }

  return res;
};
// ⚠️ Nota: container pode ser null em páginas que não têm #produtos
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
            ${auth.usuario.role === "admin" ? `
                <button onclick="irParaAdmin()">
                  <i data-lucide="settings"></i>
                  Painel ADM
                </button>
              ` : ""}
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
  if (modal.classList.contains("ativo") && !content.contains(e.target) && !userInfo.contains(e.target)) {
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
    if (contador) contador.innerText = data.total;
  } catch (err) {
    console.error("Erro ao atualizar carrinho", err);
  }
}

// ============================
// BANNER CARROSSEL
// ============================
let currentIndex = 0;
let slides = [];
let dots = [];
let intervalo = null;

function aplicarEstiloBanner() {
  const banner = document.querySelector(".banner-container");
  if (banner) banner.style.boxShadow = "0 20px 40px rgba(0,0,0,0.2)";
}

async function carregarBannersHome() {
  const container = document.getElementById("carouselHome");
  const dotsContainer = document.getElementById("dots");
  if (!container || !dotsContainer) {
    console.warn("Container de banners não encontrado");
    return;
  }
  try {
    const res = await api(`${API_URL}/banners`);
    if (!res.ok) throw new Error(`Erro ao buscar banners: ${res.status}`);
    const banners = await res.json();
    if (!banners || banners.length === 0) {
      container.innerHTML = "<p>Sem banners disponíveis</p>";
      return;
    }
    const isMobile = window.innerWidth < 768;
    container.innerHTML = banners.map((b, index) => {
      const imagem = isMobile && b.imagem_mobile ? b.imagem_mobile : b.imagem_url;
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
    console.log("✅ Banners carregados");
  } catch (err) {
    console.error("❌ Erro ao carregar banners:", err);
  }
}

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
  intervalo = setInterval(() => proximoSlide(), 4000);
}
function resetIntervalo() {
  iniciarCarrossel();
}

// ============================
// FILTROS
// ============================
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
const range = document.getElementById("precoRange");
const valorPreco = document.getElementById("precoValor");
if (range && valorPreco) {
  range.addEventListener("input", () => {
    valorPreco.innerText = "R$ " + range.value;
    carregarProdutos(document.getElementById("buscaProduto")?.value.trim() || "");
  });
}

// ============================
// PRODUTOS (LISTAGEM PRINCIPAL)
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
    if (search) params.set("search", search);
    if (precoMin) {
      const num = Number(precoMin);
      if (!isNaN(num) && num > 0) params.set("precoMin", num);
    }
    if (precoMax) {
      const num = Number(precoMax);
      if (!isNaN(num) && PRECO_MAXIMO > 0 && num > 0 && num < PRECO_MAXIMO) params.set("precoMax", num);
    }
    if (promo) params.set("promo", "true");
    if (categoriasSelecionadas.length > 0) params.set("categoria", categoriasSelecionadas.join(","));
    const url = `${API_URL}/produtos?${params.toString()}`;
    const res = await api(url);
    const produtos = await res.json();
    if (!container) return;
    container.innerHTML = "";
    produtos.forEach(p => {
      const card = document.createElement("div");
      card.className = "card";
      const temPromocao = p.tem_promocao;
      let imagemUrl = window.SEM_IMAGEM_FALLBACK;
      if (p.imagens && Array.isArray(p.imagens) && p.imagens.length > 0) {
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
          <p class="preco-antigo">${Number(p.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
          <p class="preco-promocional">${Number(p.preco_promocional).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
        `;
      } else {
        precoHTML = `<p class="preco">${Number(p.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>`;
      }
      card.innerHTML = `
        <a class="card-link" href="produto.html?id=${p.id}">
          ${badgeHTML}
          <img src="${imagemUrl}" alt="${p.nome}" onerror="this.onerror=null; this.src=window.SEM_IMAGEM_FALLBACK" />
          <h3>${p.nome}</h3>
          ${precoHTML}
        </a>
        <button onclick="adicionarAoCarrinho(${p.id}, this)">Adicionar ao carrinho</button>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Erro ao carregar produtos:", err);
  }
}

// ============================
// DESTAQUES E LANÇAMENTOS (COM AS NOVAS ROTAS)
// ============================
function renderizarProdutosScroll(containerId, produtos) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Garantir array
  let produtosArray = produtos;
  if (!Array.isArray(produtos)) {
    if (produtos?.rows) produtosArray = produtos.rows;
    else if (produtos?.data) produtosArray = produtos.data;
    else {
      console.error('Formato inválido:', produtos);
      container.innerHTML = '<div style="padding:20px;text-align:center">Erro nos dados</div>';
      return;
    }
  }

  container.innerHTML = '';
  if (!produtosArray.length) {
    container.innerHTML = '<div style="padding:20px;text-align:center">Nenhum produto encontrado</div>';
    return;
  }

  produtosArray.forEach(prod => {
    const temPromocao = prod.tem_promocao === true || (prod.preco_promocional && prod.preco_promocional < prod.preco);
    let imagemUrl = window.SEM_IMAGEM_FALLBACK;
    if (prod.imagens?.length) imagemUrl = prod.imagens[0].url;
    else if (prod.imagem) imagemUrl = prod.imagem;

    let precoHTML = '';
    let badgeHTML = '';

    if (temPromocao) {
      const desconto = prod.percentual_desconto || Math.round(((prod.preco - prod.preco_promocional) / prod.preco) * 100);
      badgeHTML = `<div class="badge-scroll">${desconto}% OFF</div>`;
      precoHTML = `
                <div class="preco-original-scroll">${Number(prod.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                <div class="preco-promocional-scroll">${Number(prod.preco_promocional).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
            `;
    } else {
      precoHTML = `<div class="preco-normal-scroll">${Number(prod.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>`;
    }

    const card = document.createElement('div');
    card.className = 'produto-card-scroll';
    card.onclick = () => window.location.href = `produto.html?id=${prod.id}`;
    card.innerHTML = `
            ${badgeHTML}
            <img src="${imagemUrl}" alt="${prod.nome}" onerror="this.onerror=null; this.src='${window.SEM_IMAGEM_FALLBACK}'">
            <div class="info">
                <h3>${prod.nome}</h3>
                ${precoHTML}
                <button onclick="event.stopPropagation(); adicionarAoCarrinho(${prod.id}, this)">Comprar</button>
            </div>
        `;
    container.appendChild(card);
  });
}

async function carregarDestaques() {
  try {
    const res = await api(`${API_URL}/produtos/destaques`);
    const data = await res.json();
    renderizarProdutosScroll('destaquesContainer', data);
  } catch (err) {
    console.error('Erro destaques:', err);
    document.getElementById('destaquesContainer').innerHTML = '<p>Erro ao carregar destaques</p>';
  }
}

async function carregarLancamentos() {
  try {
    const res = await api(`${API_URL}/produtos/lancamentos`);
    const data = await res.json();
    renderizarProdutosScroll('lancamentosContainer', data);
  } catch (err) {
    console.error('Erro lançamentos:', err);
    document.getElementById('lancamentosContainer').innerHTML = '<p>Erro ao carregar lançamentos</p>';
  }
}

// ============================
// CARRINHO
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
        quantidade
      })
    });
    if (!res.ok) throw new Error("Erro ao adicionar no carrinho");
    let imagem = null;
    if (botao) {
      const card = botao.closest(".card") || botao.closest(".produto-card-scroll");
      if (card) imagem = card.querySelector("img");
    }
    if (!imagem) imagem = document.getElementById("imagemPrincipal");
    if (imagem) animarProdutoCarrinho(imagem);
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
  setTimeout(() => toast.classList.remove("mostrar"), 2500);
}

// ============================
// CATEGORIAS (SCROLL HORIZONTAL)
// ============================
function checkScrollButtons() {
  const scrollWrapper = document.querySelector('.categorias-scroll-wrapper');
  const prevBtn = document.querySelector('.categorias-scroll-btn.prev');
  const nextBtn = document.querySelector('.categorias-scroll-btn.next');
  if (!scrollWrapper || !prevBtn || !nextBtn) return;
  const hasScroll = scrollWrapper.scrollWidth > scrollWrapper.clientWidth;
  const canLeft = scrollWrapper.scrollLeft > 0;
  const canRight = scrollWrapper.scrollLeft + scrollWrapper.clientWidth < scrollWrapper.scrollWidth - 1;
  if (hasScroll) {
    prevBtn.style.opacity = canLeft ? '1' : '0.3';
    prevBtn.style.pointerEvents = canLeft ? 'auto' : 'none';
    nextBtn.style.opacity = canRight ? '1' : '0.3';
    nextBtn.style.pointerEvents = canRight ? 'auto' : 'none';
  } else {
    prevBtn.style.opacity = '0';
    prevBtn.style.pointerEvents = 'none';
    nextBtn.style.opacity = '0';
    nextBtn.style.pointerEvents = 'none';
  }
}

function scrollCategorias(direction) {
  const scrollWrapper = document.querySelector('.categorias-scroll-wrapper');
  if (scrollWrapper) {
    const scrollAmount = 280;
    scrollWrapper.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  }
}

async function carregarCategorias() {
  try {
    const res = await api("/categorias");
    const categorias = await res.json();
    const categoriasContainer = document.getElementById("categorias");
    if (!categoriasContainer) return;
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
      const temImagem = cat.imagem_url &&
        cat.imagem_url !== window.SEM_IMAGEM_FALLBACK &&
        cat.imagem_url.trim() !== '' &&
        !cat.imagem_url.includes('sem-imagem') &&
        !cat.imagem_url.includes('placeholder') &&
        !cat.imagem_url.includes('no-image');
      if (temImagem) {
        card.classList.add("with-image");
        card.style.backgroundImage = `url("${cat.imagem_url}")`;
        card.style.backgroundSize = "cover";
        card.style.backgroundPosition = "center";
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
      card.innerHTML = `<span>${cat.nome}</span>`;
      card.addEventListener('click', () => {
        filtrarPorCategoria(cat.id, cat.nome);
      });
      scrollContainer.appendChild(card);
    });
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
// FUNÇÕES AUXILIARES PARA CATEGORIA (FILTRO)
// ============================
function filtrarPorCategoria(categoriaId, categoriaNome) {
  // Marca o checkbox correspondente no filtro lateral
  const checkboxes = document.querySelectorAll('#filtroCategorias input[type="checkbox"]');
  checkboxes.forEach(cb => {
    if (cb.value == categoriaId) cb.checked = true;
    else cb.checked = false;
  });
  aplicarFiltros();
  mostrarToastCategoria(categoriaNome);
  // Scroll suave até os produtos
  const produtosSection = document.querySelector('.conteudo-produtos');
  if (produtosSection) {
    setTimeout(() => produtosSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }
}

function mostrarToastCategoria(categoriaNome) {
  const toast = document.createElement('div');
  toast.className = 'toast-categoria';
  toast.innerHTML = `<i class="fas fa-filter"></i> Filtrando por: ${categoriaNome}`;
  toast.style.cssText = `
    position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
    background: var(--primary); color: white; padding: 12px 24px;
    border-radius: 8px; font-weight: 600; z-index: 2000;
    animation: slideUp 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideDown 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// ============================
// SCROLL HORIZONTAL GENÉRICO (PARA DESTAQUES/LANÇAMENTOS)
// ============================
function scrollHorizontal(wrapperId, direction) {
  const wrapper = document.getElementById(wrapperId);
  if (wrapper) {
    const scrollAmount = 260;
    wrapper.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  }
}

// ============================
// INIT - INICIALIZA A HOME
// ============================
async function initHome() {
  const temCategorias = document.getElementById('categorias');
  const temDestaques = document.getElementById('destaquesContainer');
  const temLancamentos = document.getElementById('lancamentosContainer');
  const temProdutos = document.getElementById('produtos');
  const temBanners = document.getElementById('carouselHome');
  try {
    if (temCategorias) await carregarCategorias();
    if (temDestaques) await carregarDestaques();
    if (temLancamentos) await carregarLancamentos();
    if (temProdutos) carregarProdutos();
    if (temBanners) await carregarBannersHome();
  } catch (err) {
    console.error('Erro na inicialização:', err);
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
if (botaoAplicar) botaoAplicar.addEventListener("click", aplicarFiltros);

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