import { Request, Response, NextFunction } from 'express';
import { trackNameSchema, djNameSchema } from '../utils/schemas';

// Classe responsável por controlar as validações
export default class Validations {

  // Método para validar o token
  static validateToken(req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers; // Pega o token de autorização

    // Verifica se o token existe, se não existir, retorna um erro e o status correspondente
    if (!authorization) {
      return res.status(401).json({ message: 'Token not found' });
    }

    next(); // Se o token for válido, chama o próximo middleware
  }

  // Método para validar os dados necessários para criar um DJ
  static validateCreateDJ(req: Request, res: Response, next: NextFunction) {
    const { djName, trackId, characterPath } = req.body; // Pega o nome do DJ, o ID da música e o caminho do personagem

    // Verifica se algum dos parâmetros está faltando, se estiver, retorna um erro e o status correspondente
    if (!djName || !trackId || !characterPath) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    const { error } = djNameSchema.validate({ djName }); // Valida o nome do DJ

    // Se houver um erro, retorna um erro e o status correspondente
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    next(); // Se tudo estiver correto, chama o próximo middleware
  }

  // Método para validar o ID da pista
  static validateTrackId(req: Request, res: Response, next: NextFunction) {
    const { trackId } = req.params; // Pega o ID da pista

    // Se o ID da pista não existir, retorna um erro e o status correspondente
    if (!trackId) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    next(); // Se tudo estiver correto, chama o próximo middleware
  }

  // Método para validar o ID
  static validateId(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params; // Pega o ID

    // Se o ID não existir, retorna um erro e o status correspondente
    if (!id) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    next(); // Se tudo estiver correto, chama o próximo middleware
  }

  // Método para validar o ID do DJ
  static validateDJId(req: Request, res: Response, next: NextFunction) {
    const { djId } = req.params; // Pega o ID do DJ

    // Se o ID do DJ não existir, retorna um erro e o status correspondente
    if (!djId) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    next(); // Se tudo estiver correto, chama o próximo middleware
  }

  // Método para validar os dados necessários para atualizar
  static validateUpdateDJ(req: Request, res: Response, next: NextFunction) {
    const { djName, characterPath } = req.body; // Pega o nome do DJ e o caminho do personagem

    // Se algum dos parâmetros estiver faltando, retorna um erro e o status correspondente
    if (!djName && !characterPath) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    // Se o nome do DJ existir, valida o nome do DJ
    if (djName) {
      const { error } = djNameSchema.validate({ djName });
      // Se houver um erro, retorna um erro e o status correspondente
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }
    }

    next(); // Se tudo estiver correto, chama o próximo middleware
  }

  // Método para validar os dados necessários para criar uma pista
  static async validateCreateTrack(req: Request, res: Response, next: NextFunction) {
    const { trackName, code } = req.body; // Pega o nome da pista e o código

    // Se algum dos parâmetros estiver faltando, retorna um erro e o status correspondente
    if (!trackName || !code) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    const { error } = trackNameSchema.validate({ trackName }); // Valida o nome da pista

    // Se houver um erro, retorna um erro e o status correspondente
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    next(); // Se tudo estiver correto, chama o próximo middleware
  }

  // Método para validar o nome da pista
  static async validateTrackName(req: Request, res: Response, next: NextFunction) {
    const { trackName } = req.body; // Pega o nome da pista

    // Se o nome da pista não existir, retorna um erro e o status correspondente
    if (!trackName) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    const { error } = trackNameSchema.validate({ trackName }); // Valida o nome da pista

    // Se houver um erro, retorna um erro e o status correspondente
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    next(); // Se tudo estiver correto, chama o próximo middleware
  }

  // Método para validar a consulta de pesquisa
  static async validateSearchQuery(req: Request, res: Response, next: NextFunction) {
    const { search } = req.query; // Pega a consulta de pesquisa

    // Se a consulta de pesquisa não existir, retorna um erro e o status correspondente
    if (!search) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    next(); // Se tudo estiver correto, chama o próximo middleware
  }

  // Método para validar os dados necessários para adicionar uma música a fila
  static async validateCreateMusic(req: Request, res: Response, next: NextFunction) {
    const { cover, name, artists, musicURI } = req.body; // Pega a capa, o nome, os artistas e a URI da música

    // Se algum dos parâmetros estiver faltando, retorna um erro e o status correspondente
    if (!cover || !name || !artists || !musicURI) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    next(); // Se tudo estiver correto, chama o próximo middleware
  }

  // Método para validar a criação de um voto
  static async validateCreateVote(req: Request, res: Response, next: NextFunction) {
    const { musicURI, vote } = req.body; // Pega a URI da música e o voto

    // Se algum dos parâmetros estiver faltando, retorna um erro e o status correspondente
    if (!musicURI || !vote) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    next(); // Se tudo estiver correto, chama o próximo middleware
  }

  // Método para validar a URI da música
  static async validateMusicURI(req: Request, res: Response, next: NextFunction) {
    const { musicURI } = req.params; // Pega a URI da música

    // Se a URI da música não existir, retorna um erro e o status correspondente
    if (!musicURI) {
      return res.status(201).json({ message: 'Missing parameters' });
    }

    next(); // Se tudo estiver correto, chama o próximo middleware
  }

  // Método para validar o envio de uma menssage
  static async validateSendMessage(req: Request, res: Response, next: NextFunction) {
    const { message } = req.body; // Pega a mensagem

    // Se a mensagem não existir, retorna um erro e o status correspondente
    if (!message) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    next(); // Se tudo estiver correto, chama o próximo middleware
  }

  // Método para validar o(s) ID(s) da(s) mensagem(s)
  static async validateMessagesIds(req: Request, res: Response, next: NextFunction) {
    const { messageIds } = req.body; // Pega o(s) ID(s) da(s) mensagem(s)

    // Se o(s) ID(s) da(s) mensagem(s) não existir(em), retorna um erro e o status correspondente
    if (!messageIds) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    next(); // Se tudo estiver correto, chama o próximo middleware
  }
}