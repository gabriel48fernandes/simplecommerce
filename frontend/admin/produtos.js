import { formatarPreco, api } from "./utils.js"

let produtoEditandoId = null

const modal = document.getElementById("modal")
const form = document.getElementById("form-produto")
const tabelaBody = document.querySelector("#tabela-produtos tbody")

export function inicializarProdutos() {
  document.getElementById("btnNovo").onclick = () => abrirModal()
  document.getElementById("btnCancelar").onclick = fecharModal
  document.getElementById("btnCancelarX").onclick = fecharModal

  modal.onclick = (e) => {
    if (e.target === modal) fecharModal()
  }

  form.addEventListener("submit", salvarProduto)
}

function abrirModal(produto = null) {
  modal.classList.add("active")

  if (produto) {
    produtoEditandoId = produto.id
    document.getElementById("nome").value = produto.nome
    document.getElementById("preco").value = produto.preco
    document.getElementById("quantidade").value = produto.quantidade
    document.getElementById("categoria").value = produto.categoria_id
    document.getElementById("preco_promocional").value = produto.preco_promocional || ""
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

async function getSelectedImageDataUrl() {
  const input = document.getElementById("imagem");
  if (!input || !input.files || input.files.length === 0) return null;

  const file = input.files[0];

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function salvarProduto(e) {
  e.preventDefault()

  const data = {
    nome: document.getElementById("nome").value,
    preco: parseFloat(document.getElementById("preco").value),
    preco_promocional: document.getElementById("preco_promocional").value
      ? parseFloat(document.getElementById("preco_promocional").value)
      : null,
    quantidade: Number(document.getElementById("quantidade").value),
    categoria_id: Number(document.getElementById("categoria").value)
  }

  const imagemUrl = await getSelectedImageDataUrl();
  if (imagemUrl) {
    data.imagem_url = imagemUrl;
  }

  const metodo = produtoEditandoId ? "PUT" : "POST"
  const url = produtoEditandoId ? `/produtos/${produtoEditandoId}` : "/produtos"

  const res = await api(url, {
    method: metodo,
    body: JSON.stringify(data)
  })

  if (!res.ok) {
    alert("Erro ao salvar produto")
    return
  }

  fecharModal()
  carregarProdutos()
}

export async function carregarProdutos(search = "") {
  tabelaBody.innerHTML = ""

  const res = await api(`/produtos?search=${search}`)
  const produtos = await res.json()

  produtos.forEach(p => {
    tabelaBody.innerHTML += `
      <tr>
        <td>
          <img src="${p.imagem || 'data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2250%22%20height=%2250%22%3E%3Crect%20width=%2250%22%20height=%2250%22%20fill=%22%23cccccc%22/%3E%3Ctext%20x=%2225%22%20y=%2230%22%20text-anchor=%22middle%22%20fill=%22%23666666%22%20font-size=%2214%22%3E%3F%3C/text%3E%3C/svg%3E'}" 
               width="50" 
               alt="${p.nome}" 
               onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2250%22%20height=%2250%22%3E%3Crect%20width=%2250%22%20height=%2250%22%20fill=%22%23cccccc%22/%3E%3Ctext%20x=%2225%22%20y=%2230%22%20text-anchor=%22middle%22%20fill=%22%23666666%22%20font-size=%2214%22%3E%3F%3C/text%3E%3C/svg%3E'"/>
        </td>
        <td>${p.nome}</td>
        <td>${formatarPreco(p.preco)}</td>
        <td>${p.quantidade}</td>
        <td>${p.categoria}</td>
        <td>
          <button onclick='window.editarProduto(${JSON.stringify(p)})'>✏️</button>
          <button onclick="window.excluirProduto(${p.id})">🗑️</button>
        </td>
      </tr>
    `
  })
}

window.editarProduto = (produto) => abrirModal(produto)

window.excluirProduto = async (id) => {
  if (!confirm("Excluir produto?")) return

  const res = await api(`/produtos/${id}`, {
    method: "DELETE"
  })

  if (!res.ok) {
    alert("Erro ao excluir produto")
    return
  }

  carregarProdutos()
}