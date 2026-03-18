import { formatarPreco, badgeStatus, proximoStatus, api } from "./utils.js"

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
  const res = await api(`/pedidos?search=${search}`)
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
  const res = await api(`/pedidos/${id}`)
  const pedido = await res.json()

  modalPedido.classList.add("active")

  const proximo = proximoStatus(pedido.status)

  conteudoPedido.innerHTML = `
  <h3>Pedido #${pedido.id}</h3>

  <p><strong>Cliente:</strong> ${pedido.nome}</p>
  <p><strong>Status:</strong> ${badgeStatus(pedido.status)}</p>
  <p><strong>Data:</strong> ${new Date(pedido.criado_em).toLocaleString()}</p>

  <hr>

  <h4>Entrega</h4>

  <p><strong>Transportadora:</strong> ${pedido.transportadora ?? "-"}</p>
  <p><strong>Prazo:</strong> ${pedido.prazo ?? "-"} dias</p>
  <p><strong>CEP:</strong> ${pedido.cep ?? "-"}</p>
  <p><strong>Frete:</strong> ${formatarPreco(pedido.frete ?? 0)}</p>

  <hr>

  <h4>Itens</h4>

  ${pedido.itens.map(i => `
    <div>
      ${i.nome} — ${i.quantidade}x ${formatarPreco(i.preco)}
    </div>
  `).join("")}

  <hr>

  <p><strong>Total:</strong> ${formatarPreco(pedido.total)}</p>
`
}

window.atualizarStatusPedido = async (id, status) => {
  await api(`/pedidos/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status })
  })

  window.verPedidoModal(id)
  carregarPedidos()
}
