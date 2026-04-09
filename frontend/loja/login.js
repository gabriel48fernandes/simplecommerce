document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  // 🔥 Define API_URL para production compatibility
  const API_URL = window.location.hostname.includes("localhost")
    ? "http://localhost:3000"
    : "https://simplecommerce.onrender.com";

  const res = await fetch(`${API_URL}/auth/login`, {
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
