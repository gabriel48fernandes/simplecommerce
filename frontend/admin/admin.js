import { carregarDadosDashboard, esconderTodas, mostrarDashboard } from "./dashboard.js"
import { carregarProdutos, inicializarProdutos } from "./produtos.js"
import { carregarClientes } from "./clientes.js"
import { carregarPedidos, inicializarPedidos } from "./pedidos.js"

/* =========================
   AUTH CHECK
========================= */
const auth = JSON.parse(localStorage.getItem("auth") || "null")
if (!auth || !auth.token) {
  window.location.href = "/loja/login.html"
}

/* =========================
   INICIALIZAR MÓDULOS
========================= */
inicializarProdutos()
inicializarPedidos()

/* =========================
   BUSCA DINÂMICA HEADER
========================= */
function atualizarBusca(tipo) {
  const container = document.getElementById("headerSearchContainer")
  container.innerHTML = ""

  let placeholder = ""
  let funcao = null

  if (tipo === "produtos") {
    placeholder = "🔍 Buscar produto..."
    funcao = carregarProdutos
  }

  if (tipo === "clientes") {
    placeholder = "🔍 Buscar cliente..."
    funcao = carregarClientes
  }

  if (tipo === "pedidos") {
    placeholder = "🔍 Buscar pedido..."
    funcao = carregarPedidos
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

function mostrarSecao(secao) {
  const secDashboard = document.getElementById("secDashboard")
  const secProdutos = document.getElementById("secProdutos")
  const secClientes = document.getElementById("secClientes")
  const secPedidos = document.getElementById("secPedidos")
  const btnNovo = document.getElementById("btnNovo")

  // Remove classe active de todos os itens do menu
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active')
  })

  // Esconde todas as seções primeiro
  secDashboard.style.display = "none"
  secProdutos.style.display = "none"
  secClientes.style.display = "none"
  secPedidos.style.display = "none"

  // Mostra apenas a escolhida e adiciona classe active
  if (secao === "dashboard") {
    secDashboard.style.display = "block"
    btnNovo.style.display = "none"
    document.getElementById("menuDashboard").classList.add('active')
  }

  if (secao === "produtos") {
    secProdutos.style.display = "block"
    btnNovo.style.display = "inline-block"
    document.getElementById("menuProdutos").classList.add('active')
  }

  if (secao === "clientes") {
    secClientes.style.display = "block"
    btnNovo.style.display = "none"
    document.getElementById("menuClientes").classList.add('active')
  }

  if (secao === "pedidos") {
    secPedidos.style.display = "block"
    btnNovo.style.display = "none"
    document.getElementById("menuPedidos").classList.add('active')
  }
}

/* =========================
   LOGOUT
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
