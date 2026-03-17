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

  const res = await fetch(`/produtos?search=${search}`)
  const produtos = await res.json()

  produtos.forEach(p => {
    tabelaBody.innerHTML += `
      <tr>
        <td>
          <img src="${p.imagem || 'https://via.placeholder.com/50x50/cccccc/666666?text=?'}" 
               width="50" 
               alt="${p.nome}" 
               onerror="this.src='https://via.placeholder.com/50x50/cccccc/666666?text=?'"/>
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