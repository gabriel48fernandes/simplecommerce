document.getElementById("btnLogin").onclick = async () => {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  const res = await fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha })
  });

  const data = await res.json();

  if (!res.ok) {
    document.getElementById("erro").innerText = "Login inválido";
    return;
  }

  localStorage.setItem("token", data.token);
  window.location.href = "/admin.html";
};
