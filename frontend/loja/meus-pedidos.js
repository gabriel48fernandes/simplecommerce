async function carregarPedidos() {

  const auth = JSON.parse(localStorage.getItem("auth"));

  const res = await api(`/pedidos/usuario/${auth.usuario.id}`);

  const pedidos = await res.json();

  const div = document.getElementById("listaPedidos");

  div.innerHTML = "";

  pedidos.forEach(p => {

    div.innerHTML += `
      <div class="pedido">

        <h3>Pedido #${p.id}</h3>

        <p>Total: R$ ${p.total}</p>

        <p>Pagamento: ${p.status_pagamento}</p>

        <p>Status: ${p.status}</p>

      </div>
    `;

  });

}

carregarPedidos();