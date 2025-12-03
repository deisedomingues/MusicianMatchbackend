import connection from '../connection.js';
import bcrypt from 'bcrypt';

export const cadastrarUsuario = async (req, res) => {
  try {
    const { cpf, nome, email, senha, telefone, tipo } = req.body;

    // Validação de campos obrigatórios
    if (!cpf || !nome || !email || !senha || !telefone || !tipo) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios!' });
    }

    // Validação de tipo
    if (!['comum', 'musico'].includes(tipo)) {
      return res.status(400).json({ message: 'Tipo inválido. Deve ser "comum" ou "musico".' });
    }

    // Validação de senha
    if (senha.length < 6) {
      return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    // Verifica se usuário já existe
    const [existe] = await connection.query(
      'SELECT * FROM Usuario WHERE cpf = ? OR email = ?',
      [cpf, email]
    );

    if (existe.length > 0) {
      return res.status(409).json({ message: 'Usuário já existe!' });
    }

    // Criptografa a senha
    const hashSenha = await bcrypt.hash(senha, 10);

    // Insere no banco
    await connection.query(
      'INSERT INTO Usuario (cpf, nome, email, senha, telefone, tipo) VALUES (?, ?, ?, ?, ?, ?)',
      [cpf, nome, email, hashSenha, telefone, tipo]
    );

    return res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });

  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
