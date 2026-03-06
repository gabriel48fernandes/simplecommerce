export async function carregarClientes(search = "") {
  const res = await fetch(`/usuarios?search=${search}`)
  const clientes = await res.json()

  const tabela = document.getElementById("tabela-clientes")
  tabela.innerHTML = ""

  clientes.forEach(c => {
    tabela.innerHTML += `
      <tr>
        <td>${c.id}</td>
        <td>${c.nome}</td>
        <td>${c.email}</td>
        <td>${c.role}</td>
      </tr>
    `
  })
}
