const form = document.getElementById("formRegister");
const mensagem = document.getElementById("mensagem");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    const response = await fetch("http://localhost:3000/auth/register", {
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

    // 🔥 Salva token e usuário
    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(data.usuario));

    mensagem.style.color = "green";
    mensagem.textContent = "Conta criada! Redirecionando...";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);

  } catch (err) {
    mensagem.textContent = "Erro ao cadastrar.";
  }
});
