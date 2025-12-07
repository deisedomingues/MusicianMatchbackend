import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "chave_super_secreta";

export function autenticarToken(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "Token não fornecido." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido ou expirado." });
    }
    req.user = user; // adiciona dados do usuário no request
    next();
  });
}
