async function carregarPedidos() {

  const auth = JSON.parse(localStorage.getItem("auth"));

  if (!auth) {
    window.location.href = "login.html";
    return;
  }

  const div = document.getElementById("listaPedidos");

  try {
    const res = await api(`/pedidos/usuario/${auth.usuario.id}`);
    
    if (!res.ok) {
      throw new Error("Erro ao carregar pedidos");
    }

    const pedidos = await res.json();

    if (!pedidos || pedidos.length === 0) {
      div.innerHTML = `
        <div class="pedidos-vazio">
          <h2>Você ainda não tem pedidos</h2>
          <p>Comece a comprar agora e acompanhe seus pedidos aqui!</p>
          <a href="/" class="btn-voltar">← Voltar à loja</a>
        </div>
      `;
      return;
    }

    div.innerHTML = "";

    pedidos.forEach(p => {
      const statusClass = `status-${p.status_pagamento || 'pendente'}`;
      const dataFormatada = new Date(p.criado_em).toLocaleDateString('pt-BR');
      
      const itensHTML = (p.itens || []).map(item => `
        <div class="item-lista">
          <span class="item-nome">${item.nome}</span>
          <span class="item-qtd">${item.quantidade}x</span>
          <span class="item-preco">R$ ${Number(item.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      `).join('');

      div.innerHTML += `
        <div class="pedido-card">
          <div class="pedido-header">
            <span class="pedido-id">Pedido #${p.id}</span>
            <span class="pedido-status ${statusClass}">${p.status_pagamento || 'Pendente'}</span>
          </div>

          <div class="pedido-info">
            <div class="info-item">
              <span class="info-label">Total</span>
              <span class="info-value">R$ ${Number(p.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Status</span>
              <span class="info-value">${p.status || 'Pendente'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Data</span>
              <span class="info-value">${dataFormatada}</span>
            </div>
          </div>

          ${p.itens && p.itens.length > 0 ? `
            <div class="pedido-itens">
              <h4>Itens (${p.itens.length})</h4>
              ${itensHTML}
            </div>
          ` : ''}
        </div>
      `;
    });

  } catch (error) {
    console.error("Erro ao carregar pedidos:", error);
    div.innerHTML = `
      <div class="pedidos-vazio">
        <h2>Erro ao carregar pedidos</h2>
        <p>Desculpe, houve um erro ao carregar seus pedidos. Tente novamente mais tarde.</p>
        <a href="/" class="btn-voltar">← Voltar à loja</a>
      </div>
    `;
  }

}

carregarPedidos();