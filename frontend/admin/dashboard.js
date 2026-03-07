import { formatarPreco } from "./utils.js"

let graficosInstanciados = {}

export async function carregarDadosDashboard() {
  const response = await fetch("/dashboard")
  const data = await response.json()

  document.getElementById("totalPedidos").innerText = data.totalPedidos
  document.getElementById("faturamentoTotal").innerText =
    "R$ " + data.faturamentoTotal.toFixed(2)
  document.getElementById("faturamentoMes").innerText =
    "R$ " + data.faturamentoMes.toFixed(2)
  document.getElementById("totalClientes").innerText = data.totalClientes
  document.getElementById("estoqueBaixo").innerText = data.estoqueBaixo
  document.getElementById("ticketMedio").innerText =
    "R$ " + data.ticketMedio.toFixed(2)

  criarGrafico(data)
}

function criarGrafico(data) {
  const ctx = document.getElementById("graficoVendas")

  // Verificar se Chart.js está carregado
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js não está carregado. Pulando criação do gráfico.')
    return
  }

  // Destruir gráfico anterior se existir
  if (graficosInstanciados.vendas) {
    graficosInstanciados.vendas.destroy()
  }

  graficosInstanciados.vendas = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Faturamento Total", "Faturamento Mês"],
      datasets: [{
        label: "R$",
        data: [data.faturamentoTotal, data.faturamentoMes]
      }]
    }
  })
}

export function esconderTodas() {
  document.getElementById("secDashboard").style.display = "none"
  document.getElementById("secProdutos").style.display = "none"
  document.getElementById("secClientes").style.display = "none"
  document.getElementById("secPedidos").style.display = "none"
}

export async function mostrarDashboard() {
  esconderTodas()
  document.getElementById("secDashboard").style.display = "block"

  document.getElementById("tituloPagina").innerText = "Dashboard"
  document.getElementById("breadcrumb").innerText = "Dashboard / Visão Geral"

  document.getElementById("btnNovo").style.display = "none"
  document.getElementById("headerSearchContainer").innerHTML = ""

  await carregarDadosDashboard()
}
