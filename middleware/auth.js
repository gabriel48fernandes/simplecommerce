import jwt from "jsonwebtoken";

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
      return res.status(403).json({ erro: "Token inválido" });
    }

    req.usuario = usuario;
    next();
  });
}

export function apenasAdmin(req, res, next) {
  // se o middleware de autenticação não foi executado ou não setou req.usuario
  if (!req.usuario || req.usuario.role !== "admin") {
    return res.status(403).json({ erro: "Acesso negado (admin)" });
  }

  next();
}