import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

/* =========================
   AUTH CHECK
========================= */
const auth = JSON.parse(localStorage.getItem("auth") || "null")
if (!auth || !auth.token) {
  window.location.href = "/login.html"
}

/* =========================
   ELEMENTOS
========================= */
let produtoEditandoId = null

const modal = document.getElementById("modal")
const modalPedido = document.getElementById("modalPedido")
const conteudoPedido = document.getElementById("conteudoPedido")

const form = document.getElementById("form-produto")
const tabelaBody = document.querySelector("#tabela-produtos tbody")

const secProdutos = document.getElementById("secProdutos")
const secClientes = document.getElementById("secClientes")
const secPedidos = document.getElementById("secPedidos")
const secDashboard = document.getElementById("secDashboard");

/* =========================
   UTIL
========================= */
function formatarPreco(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  })
}

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

  document.getElementById("searchAdmin")
    .addEventListener("input", (e) => {
      funcao(e.target.value)
    })
}

const menuDashboard = document.getElementById("menuDashboard");

document.getElementById("menuDashboard").onclick = () => {
  mostrarSecao("dashboard")
  carregarDadosDashboard()
}

function esconderTodas() {
  secDashboard.style.display = "none";
  secProdutos.style.display = "none";
  secClientes.style.display = "none";
  secPedidos.style.display = "none";
}

async function carregarDadosDashboard() {
  const response = await fetch("http://localhost:3000/dashboard");
  const data = await response.json();

  document.getElementById("totalPedidos").innerText = data.totalPedidos;
  document.getElementById("faturamentoTotal").innerText =
    "R$ " + data.faturamentoTotal.toFixed(2);
  document.getElementById("faturamentoMes").innerText =
    "R$ " + data.faturamentoMes.toFixed(2);
  document.getElementById("totalClientes").innerText = data.totalClientes;
  document.getElementById("estoqueBaixo").innerText = data.estoqueBaixo;
  document.getElementById("ticketMedio").innerText =
    "R$ " + data.ticketMedio.toFixed(2);

  criarGrafico(data);
}

async function mostrarDashboard() {

  esconderTodas();
  secDashboard.style.display = "block";

  document.getElementById("tituloPagina").innerText = "Dashboard";
  document.getElementById("breadcrumb").innerText = "Dashboard / Visão Geral";

  document.getElementById("btnNovo").style.display = "none";
  document.getElementById("headerSearchContainer").innerHTML = "";

  await carregarDadosDashboard();
}
function criarGrafico(data) {
  const ctx = document.getElementById("graficoVendas");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Faturamento Total", "Faturamento Mês"],
      datasets: [{
        label: "R$",
        data: [data.faturamentoTotal, data.faturamentoMes]
      }]
    }
  });
}

function badgeStatus(status) {
  const cores = {
    pendente: "#999",
    pago: "#2196F3",
    enviado: "#FF9800",
    entregue: "#4CAF50"
  }

  return `
    <span style="
      padding:4px 10px;
      border-radius:20px;
      color:white;
      font-size:12px;
      background:${cores[status] || "#777"};
    ">
      ${status}
    </span>
  `
}

function proximoStatus(atual) {
  const fluxo = ["pendente", "pago", "enviado", "entregue"]
  const index = fluxo.indexOf(atual)
  return fluxo[index + 1] || null
}

/* =========================
   MENU
========================= */
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

  // Esconde todas primeiro
  secDashboard.style.display = "none";
  secProdutos.style.display = "none";
  secClientes.style.display = "none";
  secPedidos.style.display = "none";

  // Mostra apenas a escolhida
  if (secao === "dashboard") {
    secDashboard.style.display = "block";

    document.getElementById("btnNovo").style.display = "none";
    document.getElementById("headerSearchContainer").innerHTML = "";
  }

  if (secao === "produtos") {
    secProdutos.style.display = "block";
    document.getElementById("btnNovo").style.display = "inline-block";
  }

  if (secao === "clientes") {
    secClientes.style.display = "block";
    document.getElementById("btnNovo").style.display = "none";
  }

  if (secao === "pedidos") {
    secPedidos.style.display = "block";
    document.getElementById("btnNovo").style.display = "none";
  }
}
/* =========================
   LOGOUT
========================= */
document.getElementById("btnLogout").onclick = () => {
  localStorage.clear()
  window.location.href = "/index.html"
}

document.getElementById("btnIrLoja").onclick = () => {
  window.location.href = "/index.html"
}

/* =========================
   MODAL PRODUTO
========================= */
document.getElementById("btnNovo").onclick = () => abrirModal()
document.getElementById("btnCancelar").onclick = fecharModal
document.getElementById("btnCancelarX").onclick = fecharModal

modal.onclick = (e) => {
  if (e.target === modal) fecharModal()
}

function abrirModal(produto = null) {
  modal.classList.add("active")

  if (produto) {
    produtoEditandoId = produto.id
    nome.value = produto.nome
    preco.value = produto.preco
    quantidade.value = produto.quantidade
    categoria.value = produto.categoria_id
    preco_promocional.value = produto.preco_promocional || ""
  } else {
    produtoEditandoId = null
    form.reset()
  }
}

function fecharModal() {
  modal.classList.remove("active")
  form.reset()
  produtoEditandoId = null
}

/* =========================
   SALVAR PRODUTO
========================= */
form.addEventListener("submit", async (e) => {
  e.preventDefault()

  const data = {
    nome: nome.value,
    preco: parseFloat(preco.value),
    preco_promocional: preco_promocional.value ? parseFloat(preco_promocional.value) : null,
    quantidade: Number(quantidade.value),
    categoria_id: Number(categoria.value)
  }

  const metodo = produtoEditandoId ? "PUT" : "POST"
  const url = produtoEditandoId ? `/produtos/${produtoEditandoId}` : "/produtos"

  await fetch(url, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })

  fecharModal()
  carregarProdutos()
})

/* =========================
   PRODUTOS
========================= */
async function carregarProdutos(search = "") {
  tabelaBody.innerHTML = ""
  const res = await fetch(`/produtos?search=${search}`)
  const produtos = await res.json()

  produtos.forEach(p => {
    tabelaBody.innerHTML += `
      <tr>
        <td><img src="${p.imagem}" width="50"/></td>
        <td>${p.nome}</td>
        <td>${formatarPreco(p.preco)}</td>
        <td>${p.quantidade}</td>
        <td>${p.categoria}</td>
        <td>
          <button onclick='editar(${JSON.stringify(p)})'>✏️</button>
          <button onclick="excluir(${p.id})">🗑️</button>
        </td>
      </tr>
    `
  })
}

window.editar = (produto) => abrirModal(produto)

window.excluir = async (id) => {
  if (!confirm("Excluir produto?")) return
  await fetch(`/produtos/${id}`, { method: "DELETE" })
  carregarProdutos()
}

/* =========================
   CLIENTES
========================= */
async function carregarClientes(search = "") {
  const res = await fetch(`/usuarios?search=${search}`)
  const clientes = await res.json()

  const tabela = document.getElementById("tabela-clientes")
  tabela.innerHTML = ""

  clientes.forEach(c => {
    tabela.innerHTML += `
      <tr>
        <td>${c.id}</td>
        <td>${c.nome}</td>
        <td>${c.email}</td>
        <td>${c.role}</td>
      </tr>
    `
  })
}

/* =========================
   PEDIDOS
========================= */
async function carregarPedidos(search = "") {
  const res = await fetch(`/pedidos?search=${search}`)
  const pedidos = await res.json()

  const tabela = document.getElementById("tabela-pedidos")
  tabela.innerHTML = ""

  pedidos.forEach(p => {
    tabela.innerHTML += `
      <tr>
        <td>${p.id}</td>
        <td>${p.nome}</td>
        <td>${formatarPreco(p.total)}</td>
        <td>${badgeStatus(p.status)}</td>
        <td>${new Date(p.criado_em).toLocaleDateString()}</td>
        <td>
          <button onclick="verPedido(${p.id})">👁 Ver</button>
        </td>
      </tr>
    `
  })
}

/* =========================
   MODAL PEDIDO
========================= */
window.verPedido = async (id) => {
  const res = await fetch(`/pedidos/${id}`)
  const pedido = await res.json()

  modalPedido.classList.add("active")

  const proximo = proximoStatus(pedido.status)

  conteudoPedido.innerHTML = `
    <p><strong>ID:</strong> ${pedido.id}</p>
    <p><strong>Cliente:</strong> ${pedido.nome}</p>
    <p><strong>Total:</strong> ${formatarPreco(pedido.total)}</p>
    <p><strong>Status:</strong> ${badgeStatus(pedido.status)}</p>
    <p><strong>Data:</strong> ${new Date(pedido.criado_em).toLocaleString()}</p>
    <hr>
    ${pedido.itens.map(i => `
      <div style="margin-bottom:10px;">
        ${i.nome} — ${i.quantidade}x ${formatarPreco(i.preco)}
      </div>
    `).join("")}
    <br>
    ${proximo ? `<button onclick="atualizarStatus(${pedido.id}, '${proximo}')">
      Avançar para ${proximo}
    </button>` : ""}
  `
}

window.atualizarStatus = async (id, status) => {
  await fetch(`/pedidos/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  })

  verPedido(id)
  carregarPedidos()
}

document.getElementById("btnFecharPedido").onclick = () => {
  modalPedido.classList.remove("active")
}

document.getElementById("fecharPedidoX").onclick = () => {
  modalPedido.classList.remove("active")
}

modalPedido.onclick = (e) => {
  if (e.target === modalPedido) {
    modalPedido.classList.remove("active")
  }
}

/* =========================
   INIT
========================= */
mostrarSecao("produtos")
atualizarBusca("produtos")
carregarProdutos()