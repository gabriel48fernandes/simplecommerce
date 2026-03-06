import { formatarPreco, badgeStatus, proximoStatus } from "./utils.js"

const modalPedido = document.getElementById("modalPedido")
const conteudoPedido = document.getElementById("conteudoPedido")

export function inicializarPedidos() {
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
}

export async function carregarPedidos(search = "") {
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
          <button onclick="window.verPedidoModal(${p.id})">👁 Ver</button>
        </td>
      </tr>
    `
  })
}

window.verPedidoModal = async (id) => {
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
    ${proximo ? `<button onclick="window.atualizarStatusPedido(${pedido.id}, '${proximo}')">
      Avançar para ${proximo}
    </button>` : ""}
  `
}

window.atualizarStatusPedido = async (id, status) => {
  await fetch(`/pedidos/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  })

  window.verPedidoModal(id)
  carregarPedidos()
}
