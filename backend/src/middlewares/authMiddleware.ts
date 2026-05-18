/* Autor: Enzo Olivato Pazian */

// Importando os recursos necessários do express
import { Request, Response, NextFunction } from 'express';
// Importando os recursos necessários do JWT para permitir a criação do token
import jwt, { JwtPayload } from 'jsonwebtoken';

// Criando a interface que extende a interface padrão de Requisição do express e receberá o ID do professor logado
export interface AuthenticatedRequest extends Request {
    userId?: string; 
}

// Definindo a chave base do Token
const JWT_SECRET = 'qwertuioplkjhgfdsa'; 

// Middleware para proteger rotas que verifica se o token JWT fornecido é válido
export const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    
    // Obtém o token do cabeçalho 'Authorization: Bearer <token>'
    const authHeader = req.headers.authorization; 

    // Barreira de Formato: Verifica se o token foi enviado e está no padrão 'Bearer'
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // Se o token recebido não for autorizado (indefindo ou incorreto), retorna o erro de acesso negado
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido ou formato incorreto.' });
    }
    
    // Se o token recebido atende ao padrão, extrai apenas a string do token, removendo o prefixo 'Bearer '
    const token = authHeader.split(' ')[1]; 

    try {
        // Barreira de Validade: Verifica a assinatura e a expiração do token e converte para o tipo PayLoad do JWT e, se for válido, armazena o payload (os dados do usuário)
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        // Anexa o ID do usuário (vindo do payload do token) ao objeto Request.
        req.userId = decoded.userId as string;
        // Como o token é válido, permite que a requisição prossiga para a próxima função (a rota principal que chama o middleware de autorização)
        next(); 
    }
    // Se houver algum erro durante o processo, emite uma mensagem de erro
    catch (error) {
        // Captura erros de 'jwt.verify' (token expirado, assinatura inválida, etc.).
        console.error("Erro na verificação do token:", error);
        // Retorna 401, rejeitando a requisição.
        return res.status(401).json({ message: 'Token inválido ou expirado. Faça login novamente.' });
    }
};