import { Response, Request } from 'express';
import TrackService from '../services/TrackService';
import mapStatusHTTP from '../utils/mapStatusHTTP';

// Classe responsável por controlar as requisições feitas para a pista
export default class TrackController {
  constructor(private trackService: TrackService = new TrackService()) { } // Injeta o serviço de pista

  // Método para criar uma pista
  async createTrack(req: Request, res: Response) {
    const data = req.body; // Pega os dados da requisição
    const response = await this.trackService.createTrack(data); // Chama o serviço de pista para criar uma pista
    res.status(mapStatusHTTP(response.status)).json(response.data); // Retorna a resposta e o status correspondente
  }

  // Método para buscar uma pista por ID
  async findTrackById(req: Request, res: Response) {
    const { id } = req.params; // Pega o ID da pista
    const response = await this.trackService.findTrackById(Number(id)); // Chama o serviço de pista para buscar uma pista por ID
    res.status(mapStatusHTTP(response.status)).json(response.data); // Retorna a resposta e o status correspondente
  }

  // Método para logar no aplicativo com o Spotify
  async loginWithSpotify(req: Request, res: Response) {
    // Dados para a autenticação com o Spotify
    const data = {
      clientId: process.env.COLABORECA_API_CLIENT_ID,
      scopes: `user-read-private user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-playback-position user-read-recently-played user-read-recently-played`,
      redirectURI: 'http://localhost:5173/login'
    }

    // URL para autenticação com o Spotify
    const URL = `https://accounts.spotify.com/authorize?response_type=code&client_id=${data.clientId}&scope=${encodeURIComponent(data.scopes)}&redirect_uri=${encodeURIComponent(data.redirectURI)}`

    res.redirect(URL); // Redirecionar para a URL de autenticação
  }

  // Método para entrar numa pista
  async enterTrack(req: Request, res: Response) {
    const { id } = req.params; // Pega o ID da pista
    const response = await this.trackService.findTrackById(Number(id)); // Chama o serviço de pista para buscar uma pista por ID
    res.status(mapStatusHTTP(response.status)).json(response.data); // Retorna a resposta e o status correspondente
  }

  // Método para verificar se a pista já foi criada para o dispositivo
  async verifyIfTrackAlreadyBeenCreated(req: Request, res: Response) {
    const authorization = req.headers.authorization; // Pega o token de autorização
    const response = await this.trackService.verifyIfTrackAlreadyBeenCreated(authorization as string); // Chama o serviço de pista para verificar se a pista já foi criada
    res.status(mapStatusHTTP(response.status)).json(response.data); // Retorna a resposta e o status correspondente
  }

  // Método para verificar se o usuário tem acesso à pista
  async verifyTrackAccess(req: Request, res: Response) {
    const { id } = req.params; // Pega o ID da pista
    const authorization = req.headers.authorization; // Pega o token de autorização
    const response = await this.trackService.verifyTrackAccess(Number(id), authorization as string); // Chama o serviço de pista para verificar se o usuário tem acesso à pista
    res.status(mapStatusHTTP(response.status)).json(response.data); // Retorna a resposta e o status correspondente
  }

  // Método para atualizar o nome da pista
  async updateTrack(req: Request, res: Response) {
    const { trackName } = req.body; // Pega o nome da pista
    const authorization = req.headers.authorization; // Pega o token de autorização
    const response = await this.trackService.updateTrack(trackName, authorization as string); // Chama o serviço de pista para atualizar o nome da pista
    res.status(mapStatusHTTP(response.status)).json(response.data); // Retorna a resposta e o status correspondente
  }

  // Método para deletar a pista
  async deleteTrack(req: Request, res: Response) {
    const authorization = req.headers.authorization; // Pega o token de autorização
    const response = await this.trackService.deleteTrack(authorization as string); // Chama o serviço de pista para deletar a pista
    res.status(mapStatusHTTP(response.status)).json(response.data); // Retorna a resposta e o status correspondente
  }

  // Método para a PISTA deletar um DJ
  async deleteDJ(req: Request, res: Response) {
    const { id } = req.params; // Pega o ID do DJ
    const authorization = req.headers.authorization; // Pega o token de autorização
    const response = await this.trackService.deleteDJ(Number(id), authorization as string); // Chama o serviço de pista para deletar um DJ
    res.status(mapStatusHTTP(response.status)).json(response.data); // Retorna a resposta e o status correspondente
  }
}