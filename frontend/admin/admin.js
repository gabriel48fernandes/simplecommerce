import { carregarDadosDashboard, mostrarDashboard } from "./dashboard.js"
import { carregarProdutos, inicializarProdutos } from "./produtos.js"
import { carregarClientes } from "./clientes.js"
import { carregarPedidos, inicializarPedidos } from "./pedidos.js"
import { renderBanners } from "./banners.js"
import { inicializarCategorias, carregarCategorias } from "./categorias.js"

/* =========================
   AUTH CHECK
========================= */
const auth = JSON.parse(localStorage.getItem("auth") || "null")
if (!auth || !auth.token) {
  window.location.href = "/login.html"
}

/* =========================
   INICIALIZAR MÓDULOS
========================= */
inicializarProdutos()
inicializarPedidos()
inicializarCategorias()

/* =========================
   BUSCA DINÂMICA HEADER
========================= */
function atualizarBusca(tipo) {
  const container = document.getElementById("headerSearchContainer")
  container.innerHTML = ""

  let placeholder = ""
  let funcao = null
""
  if (tipo === "produtos") {
    placeholder = "🔍 Buscar produto..."
    funcao = carregarProdutos
  } else if (tipo === "clientes") {
    placeholder = "🔍 Buscar cliente..."
    funcao = carregarClientes
  } else if (tipo === "pedidos") {
    placeholder = "🔍 Buscar pedido..."
    funcao = carregarPedidos
  } else if (tipo === "categorias") {
    placeholder = "🔍 Buscar categoria..."
    funcao = carregarCategorias
  } else {
    return
  }

  container.innerHTML = `
    <input
      type="text"
      id="searchAdmin"
      placeholder="${placeholder}"
      class="search-admin"
    />
  `
  document.getElementById("searchAdmin").addEventListener("input", (e) => {
    funcao(e.target.value)
  })
}

/* =========================
   MENU
========================= */
document.getElementById("menuDashboard").onclick = () => {
  mostrarSecao("dashboard")
  mostrarDashboard()
}

document.getElementById("menuProdutos").onclick = () => {
  mostrarSecao("produtos")
  atualizarBusca("produtos")
  carregarProdutos()
}

document.getElementById("menuCategorias").onclick = () => {
  mostrarSecao("categorias")
  atualizarBusca("categorias")
  carregarCategorias()
}

document.getElementById("menuClientes").onclick = () => {
  mostrarSecao("clientes")
  atualizarBusca("clientes")
  carregarClientes()
}

document.getElementById("menuPedidos").onclick = () => {
  mostrarSecao("pedidos")
  atualizarBusca("pedidos")
  carregarPedidos()
}

document.getElementById("menuBanners").onclick = () => {
  mostrarSecao("banners")
  document.getElementById("headerSearchContainer").innerHTML = ""
  renderBanners()
}

/* =========================
   MOSTRAR SEÇÃO
========================= */
function mostrarSecao(secao) {
  const secoes = {
    dashboard:  document.getElementById("secDashboard"),
    produtos:   document.getElementById("secProdutos"),
    categorias: document.getElementById("secCategorias"),
    clientes:   document.getElementById("secClientes"),
    pedidos:    document.getElementById("secPedidos"),
    banners:    document.getElementById("secBanners"),
  }

  const menus = {
    dashboard:  document.getElementById("menuDashboard"),
    produtos:   document.getElementById("menuProdutos"),
    categorias: document.getElementById("menuCategorias"),
    clientes:   document.getElementById("menuClientes"),
    pedidos:    document.getElementById("menuPedidos"),
    banners:    document.getElementById("menuBanners"),
  }

  const titulos = {
    dashboard:  ["Dashboard",           "Dashboard / Início"],
    produtos:   ["Gerenciar Produtos",  "Dashboard / Produtos"],
    categorias: ["Gerenciar Categorias","Dashboard / Categorias"],
    clientes:   ["Clientes",            "Dashboard / Clientes"],
    pedidos:    ["Pedidos",             "Dashboard / Pedidos"],
    banners:    ["Banners",             "Dashboard / Banners"],
  }

  const btnNovo = document.getElementById("btnNovo")

  // Remove active de todos os menus e esconde todas as seções
  Object.values(menus).forEach(m => m?.classList.remove("active"))
  Object.values(secoes).forEach(s => { if (s) s.style.display = "none" })

  // Mostra a seção selecionada
  if (secoes[secao]) secoes[secao].style.display = "block"
  if (menus[secao])  menus[secao].classList.add("active")

  // Atualiza título e breadcrumb
  if (titulos[secao]) {
    document.getElementById("tituloPagina").textContent = titulos[secao][0]
    document.getElementById("breadcrumb").textContent   = titulos[secao][1]
  }

  // Mostra/esconde botão novo
  btnNovo.style.display = ["produtos", "categorias"].includes(secao)
    ? "inline-block"
    : "none"

  // Troca o label do botão
  if (secao === "categorias") {
    btnNovo.textContent = "+ Nova Categoria"
    btnNovo.onclick = () => window.abrirModalCategoria()
  } else if (secao === "produtos") {
    btnNovo.textContent = "+ Novo Produto"
    btnNovo.onclick = () => window.abrirModalProduto()
  }
}

/* =========================
   LOGOUT / IR PARA LOJA
========================= */
document.getElementById("btnLogout").onclick = () => {
  localStorage.clear()
  window.location.href = "/"
}

document.getElementById("btnIrLoja").onclick = () => {
  window.location.href = "/"
}

/* =========================
   INIT
========================= */
mostrarSecao("produtos")
atualizarBusca("produtos")
carregarProdutos()