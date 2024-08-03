import * as Joi from 'joi';

export const trackNameSchema = Joi.object({
  trackName: Joi.string()
    .min(3).message('track name too short')
    .max(16).message('track name too long')
    .required(),
});

export const djNameSchema = Joi.object({
  djName: Joi.string()
    .min(3).message('dj name too short')
    .max(16).message('dj name too long')
    .required(),
});