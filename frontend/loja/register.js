const form = document.getElementById("formRegister");
const mensagem = document.getElementById("mensagem");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    const response = await fetch("auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nome, email, senha })
    });

    const data = await response.json();

    if (!response.ok) {
      mensagem.textContent = data.erro;
      return;
    }

    // 🔥 Salva no formato correto (igual ao login)
    localStorage.setItem("auth", JSON.stringify({
      token: data.token,
      usuario: data.usuario
    }));

    mensagem.style.color = "green";
    mensagem.textContent = "Conta criada! Bem-vindo!";

    // 🔥 Recarrega a página automaticamente (usuário já está logado)
    setTimeout(() => {
      window.location.reload();
    }, 1000);

  } catch (err) {
    mensagem.textContent = "Erro ao cadastrar.";
  }
});
