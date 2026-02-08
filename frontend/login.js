document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  const res = await fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha })
  });

  if (!res.ok) {
    alert("Email ou senha inválidos");
    return;
  }

  const data = await res.json();

  // 🔥 UM ÚNICO LOCAL
  localStorage.setItem("auth", JSON.stringify({
    token: data.token,
    usuario: data.usuario
  }));

  window.location.href = "/";
});
