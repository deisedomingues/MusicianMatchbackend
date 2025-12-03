import connection from '../connection.js';
import bcrypt from 'bcryptjs';

export const loginUsuario = (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  const query = `SELECT * FROM Usuario WHERE email = ?`;

  connection.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuário:', err);
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Email ou senha incorretos.' });
    }

    const usuario = results[0];

    try {
      const senhaValida = await bcrypt.compare(senha, usuario.senha);

      if (!senhaValida) {
        return res.status(401).json({ message: 'Email ou senha incorretos.' });
      }

      return res.status(200).json({
        message: 'Login realizado com sucesso!',
        usuario: {
          cpf: usuario.cpf,
          nome: usuario.nome,
          email: usuario.email,
          telefone: usuario.telefone,
          tipo: usuario.tipo
        }
      });
    } catch (error) {
      console.error('Erro na comparação da senha:', error);
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  });
};
