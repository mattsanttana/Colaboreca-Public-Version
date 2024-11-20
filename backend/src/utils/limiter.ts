import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // Limite de 100 requisições por IP por minuto
  message: "Limite de requisições excedido. Tente novamente mais tarde."
});