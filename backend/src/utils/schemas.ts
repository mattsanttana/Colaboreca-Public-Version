import * as Joi from 'joi';

// Define o esquema de validação para o nome da pista
export const trackNameSchema = Joi.object({
  trackName: Joi.string()
    .min(3).message('track name too short')
    .max(32).message('track name too long')
    .required(),
});

// Define o esquema de validação para o nome do DJ
export const djNameSchema = Joi.object({
  djName: Joi.string()
    .min(3).message('dj name too short')
    .max(16).message('dj name too long')
    .required(),
});