// Carregar usuário e pedidos
document.addEventListener('DOMContentLoaded', async () => {
  const auth = JSON.parse(localStorage.getItem("auth"));

  if (!auth) {
    window.location.href = "/login.html";
    return;
  }

  // Atualizar área de usuário
  const areaUsuario = document.getElementById("area-usuario");
  const primeiroNome = auth.usuario.nome
    ? auth.usuario.nome.split(" ")[0]
    : auth.usuario.email;

  areaUsuario.innerHTML = `
    <span style="color: white; font-weight: 600;">Olá, ${primeiroNome} 👋</span>
    <button id="logout" style="padding: 10px 20px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.3s; border: 1px solid rgba(255,255,255,0.3);">Sair</button>
  `;

  document.getElementById("logout").onclick = () => {
    localStorage.removeItem("auth");
    window.location.href = "/";
  };

  // A navegação agora está integrada na area-usuario do header

  // Carregar pedidos
  await carregarPedidos();
});

async function carregarPedidos() {
  const lista = document.getElementById("lista-pedidos");
  const auth = JSON.parse(localStorage.getItem("auth"));

  if (!auth || !auth.usuario.id) {
    lista.innerHTML = `
      <div class="pedidos-vazio">
        <p>Você precisa estar logado para ver seus pedidos 😢</p>
        <p style="margin-top: 15px; color: #999; font-size: 14px;">
          <a href="/login.html" style="color: #667eea; text-decoration: none; font-weight: 600;">Fazer login</a>
        </p>
      </div>
    `;
    return;
  }

  try {
    const res = await api(`/pedidos/usuario/${auth.usuario.id}`);

    if (!res.ok) {
      throw new Error("Erro ao buscar pedidos");
    }

    const pedidos = await res.json();

    lista.innerHTML = "";

    if (!pedidos || pedidos.length === 0) {
      lista.innerHTML = `
        <div class="pedidos-vazio">
          <p>Você ainda não tem pedidos 😢</p>
          <p style="margin-top: 15px; color: #999; font-size: 14px;">
            <a href="/" style="color: #667eea; text-decoration: none; font-weight: 600;">← Voltar para a loja e fazer uma compra</a>
          </p>
        </div>
      `;
      return;
    }

    pedidos.forEach(pedido => {
      const dataFormatada = new Date(pedido.criado_em).toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const statusClass = `status-${pedido.status_pagamento || pedido.status}`;

      let html = `
        <div class="pedido-card">
          <div class="pedido-header">
            <div class="pedido-info">
              <div class="pedido-id">Pedido #${pedido.id}</div>
              <div class="pedido-total">R$ ${(parseFloat(pedido.total) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <div class="pedido-data">${dataFormatada}</div>
            </div>
            <div class="pedido-status-badge ${statusClass}">
              ${pedido.status_pagamento || pedido.status}
            </div>
          </div>

          <div class="pedido-itens">
      `;

      if (pedido.itens && pedido.itens.length > 0) {
        pedido.itens.forEach(item => {
          const imagemUrl = item.imagem || window.SEM_IMAGEM_FALLBACK;

          html += `
            <div class="item-pedido">
              <img src="${imagemUrl}" alt="${item.nome}" class="item-imagem" onerror="this.src=window.SEM_IMAGEM_FALLBACK;" />
              <div class="item-detalhes">
                <div class="item-nome">${item.nome}</div>
                <div class="item-info">
                  <span>Quantidade: <strong>${item.quantidade}</strong></span>
                  <span class="item-preco">R$ ${(parseFloat(item.preco) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  <span>Subtotal: <strong>R$ ${((parseFloat(item.preco) || 0) * (item.quantidade || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                </div>
              </div>
            </div>
          `;
        });
      }

      html += `
          </div>
        </div>
      `;

      lista.innerHTML += html;
    });

  } catch (error) {
    console.error("Erro ao carregar pedidos:", error);
    lista.innerHTML = `
      <div class="pedidos-vazio">
        <p>Erro ao carregar pedidos 😢</p>
        <p style="margin-top: 15px; color: #999; font-size: 14px;">
          <a href="/" style="color: #667eea; text-decoration: none; font-weight: 600;">← Voltar para home</a>
        </p>
      </div>
    `;
  }
}