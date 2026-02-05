import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://fcknvwqerkyujhquugls.supabase.co",
  "sb_publishable_c-_9HXFPIQLd56o_2bixfw_oh-bMdXZ"
);

let produtoEditandoId = null;

const modal = document.getElementById("modal");
const form = document.getElementById("form-produto");
const tabelaBody = document.querySelector("#tabela-produtos tbody");
const status = document.getElementById("status");
const tituloModal = document.getElementById("tituloModal");

/* =========================
   MODAL
========================= */
document.getElementById("btnNovo").onclick = () => abrirModal();
document.getElementById("btnCancelar").onclick = fecharModal;

function abrirModal(produto = null) {
  modal.style.display = "flex";

  if (produto) {
    tituloModal.innerText = "Editar Produto";
    produtoEditandoId = produto.id;

    nome.value = produto.nome;
    preco.value = produto.preco;
    quantidade.value = produto.quantidade;
    categoria.value = produto.categoria_id;
  } else {
    tituloModal.innerText = "Cadastrar Produto";
    form.reset();
    produtoEditandoId = null;
  }
}

function fecharModal() {
  modal.style.display = "none";
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
   SALVAR (CRIAR / EDITAR)
========================= */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const preco = parseFloat(document.getElementById("preco").value);
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
      <td><img src="${p.imagem}" /></td>
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

carregarProdutos();
