export function formatarPreco(valor) {
  return Number(valor)
    .toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })
    // remove espaços entre R$ e valor (ex: `R$ 1.000,00` → `R$1.000,00`)
    .replace(/\s+/g, "");
}

export function badgeStatus(status) {
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

export function proximoStatus(atual) {
  const fluxo = ["pendente", "pago", "enviado", "entregue"]
  const index = fluxo.indexOf(atual)
  return fluxo[index + 1] || null
}
export function api(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token"),
      ...options.headers
    }
  })
}
