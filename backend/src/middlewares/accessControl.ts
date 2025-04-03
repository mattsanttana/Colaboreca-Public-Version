import * as express from 'express';

// Middleware para permitir o acesso de qualquer origem
const accessControl: express.RequestHandler = (_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Permite o acesso de qualquer origem
  res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS,PUT,PATCH'); // Permite os métodos listados
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type'); // Permite os cabeçalhos listados
  next(); // Chama o próximo middleware
};

export default accessControl;