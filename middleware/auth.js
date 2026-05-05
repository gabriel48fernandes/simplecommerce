import jwt from "jsonwebtoken";

// ============================
// MIDDLEWARE DE AUTENTICAÇÃO
// ============================
export function autenticarToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ erro: "Token não enviado" });
  }

  const parts = authHeader.split(" ");
  const token = parts.length === 2 ? parts[1] : null;

  if (!token) {
    return res.status(401).json({ erro: "Token inválido" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {

    if (err) {
      console.log("❌ ERRO JWT:", err.message);
      console.log("🔐 TOKEN RECEBIDO:", token);
      console.log("🔑 SECRET:", process.env.JWT_SECRET);

      return res.status(403).json({ erro: "Token inválido" });
    }

    console.log("✅ TOKEN OK:", usuario);

    req.usuario = usuario;
    next();
  });
}

// ============================
// MIDDLEWARE DE ADMIN
// ============================
export function apenasAdmin(req, res, next) {

  if (!req.usuario || req.usuario.role !== "admin") {
    return res.status(403).json({ erro: "Acesso negado (admin)" });
  }

  next();
}