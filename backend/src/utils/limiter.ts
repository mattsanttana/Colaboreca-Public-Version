import rateLimit from 'express-rate-limit';

// Limite de requisições por IP
export const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // Limite de 100 requisições por IP por 1 minuto
  message: "Limite de requisições excedido. Tente novamente mais tarde." // Mensagem de erro
});