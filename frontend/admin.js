import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

/* =========================
   AUTH CHECK
========================= */
const auth = JSON.parse(localStorage.getItem("auth") || "null");

if (!auth || !auth.token) {
  window.location.href = "/login.html";
}

/* =========================
   SUPABASE
========================= */
const supabase = createClient(
  "https://fcknvwqerkyujhquugls.supabase.co",
  "sb_publishable_c-_9HXFPIQLd56o_2bixfw_oh-bMdXZ"
);

/* =========================
   ELEMENTOS
========================= */
let produtoEditandoId = null;

const modal = document.getElementById("modal");
const form = document.getElementById("form-produto");
const tabelaBody = document.querySelector("#tabela-produtos tbody");

const secProdutos = document.querySelector("#tabela-produtos").closest("section");
const secClientes = document.getElementById("secClientes");
const secPedidos = document.getElementById("secPedidos");

/* =========================
   NAVEGAÇÃO MENU
========================= */
document.getElementById("menuProdutos").onclick = () => {
  mostrarSecao("produtos");
};

document.getElementById("menuClientes").onclick = () => {
  mostrarSecao("clientes");
  carregarClientes();
};

document.getElementById("menuPedidos").onclick = () => {
  mostrarSecao("pedidos");
  carregarPedidos();
};

function mostrarSecao(secao) {
  secProdutos.style.display = "block";
  secClientes.style.display = "none";
  secPedidos.style.display = "none";

  if (secao === "clientes") {
    secProdutos.style.display = "none";
    secClientes.style.display = "block";
  }

  if (secao === "pedidos") {
    secProdutos.style.display = "none";
    secPedidos.style.display = "block";
  }
}

/* =========================
   LOGOUT / LOJA
========================= */
document.getElementById("btnLogout").onclick = () => {
  localStorage.clear();
  window.location.href = "/index.html";
};

document.getElementById("btnIrLoja").onclick = () => {
  window.location.href = "/index.html";
};

/* =========================
   MODAL
========================= */
document.getElementById("btnNovo").onclick = () => abrirModal();
document.getElementById("btnCancelar").onclick = fecharModal;
document.getElementById("btnCancelarX").onclick = fecharModal;

modal.onclick = (e) => {
  if (e.target === modal) fecharModal();
};

function abrirModal(produto = null) {
  modal.classList.add("active");

  if (produto) {
    produtoEditandoId = produto.id;
    document.getElementById("nome").value = produto.nome;
    document.getElementById("preco").value = produto.preco;
    document.getElementById("quantidade").value = produto.quantidade;
    document.getElementById("categoria").value = produto.categoria_id;
    document.getElementById("preco_promocional").value =
      produto.preco_promocional || "";
  } else {
    produtoEditandoId = null;
    form.reset();
  }
}

function fecharModal() {
  modal.classList.remove("active");
  form.reset();
  produtoEditandoId = null;
}

/* =========================
   UPLOAD IMAGEM
========================= */
async function uploadImagem(file) {
  const nomeArquivo = `${Date.now()}-${file.name}`;

  await supabase.storage
    .from("produtos")
    .upload(nomeArquivo, file);

  const { data } = supabase.storage
    .from("produtos")
    .getPublicUrl(nomeArquivo);

  return data.publicUrl;
}

/* =========================
   SALVAR PRODUTO
========================= */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const preco = parseFloat(document.getElementById("preco").value);
  const precoPromocionalInput =
    document.getElementById("preco_promocional").value;

  const preco_promocional = precoPromocionalInput
    ? parseFloat(precoPromocionalInput)
    : null;

  const quantidade = Number(document.getElementById("quantidade").value);
  const categoria_id = Number(document.getElementById("categoria").value);
  const imagemFile = document.getElementById("imagem").files[0];

  let imagem_url = null;
  if (imagemFile) imagem_url = await uploadImagem(imagemFile);

  const metodo = produtoEditandoId ? "PUT" : "POST";
  const url = produtoEditandoId
    ? `/produtos/${produtoEditandoId}`
    : "/produtos";

  await fetch(url, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome,
      preco,
      preco_promocional,
      quantidade,
      categoria_id,
      imagem_url
    })
  });

  fecharModal();
  carregarProdutos();
});

/* =========================
   LISTAR PRODUTOS
========================= */
async function carregarProdutos() {
  tabelaBody.innerHTML = "";

  const res = await fetch("/produtos");
  const produtos = await res.json();

  produtos.forEach(p => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td><img src="${p.imagem}" width="50"/></td>
      <td>${p.nome}</td>
      <td>${formatarPreco(p.preco)}</td>
      <td>${p.quantidade}</td>
      <td>${p.categoria}</td>
      <td>
        <button onclick='editar(${JSON.stringify(p)})'>✏️</button>
        <button onclick="excluir(${p.id})">🗑️</button>
      </td>
    `;

    tabelaBody.appendChild(tr);
  });
}

function formatarPreco(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

window.editar = (produto) => abrirModal(produto);

window.excluir = async (id) => {
  if (!confirm("Excluir produto?")) return;
  await fetch(`/produtos/${id}`, { method: "DELETE" });
  carregarProdutos();
};

/* =========================
   CLIENTES
========================= */
async function carregarClientes() {
  const res = await fetch("/auth/clientes");
  const clientes = await res.json();

  const tabela = document.getElementById("tabela-clientes");
  tabela.innerHTML = "";

  clientes.forEach(c => {
    tabela.innerHTML += `
      <tr>
        <td>${c.id}</td>
        <td>${c.nome}</td>
        <td>${c.email}</td>
        <td>${c.role}</td>
      </tr>
    `;
  });
}

/* =========================
   PEDIDOS
========================= */
async function carregarPedidos() {
  const res = await fetch("/pedidos");
  const pedidos = await res.json();

  const tabela = document.getElementById("tabela-pedidos");
  tabela.innerHTML = "";

  pedidos.forEach(p => {
    tabela.innerHTML += `
      <tr>
        <td>${p.id}</td>
        <td>${p.nome}</td>
        <td>${formatarPreco(p.total)}</td>
        <td>${p.status}</td>
        <td>${new Date(p.criado_em).toLocaleDateString()}</td>
      </tr>
    `;
  });
}

/* =========================
   INIT
========================= */
carregarProdutos();