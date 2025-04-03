import rateLimit from 'express-rate-limit';

// Limite de requisições por IP
export const limiter = rateLimit({
  windowMs: 1 * 30 * 1000, // 30 segundos
  max: 30, // Limite de 30 requisições por IP por 30 segundos
  message: "Limite de requisições excedido. Tente novamente mais tarde." // Mensagem de erro
});