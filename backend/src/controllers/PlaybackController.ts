import { Response, Request } from 'express';
import PlaybackService from '../services/PlaybackService';
import mapStatusHTTP from '../utils/mapStatusHTTP';

// Classe responsável por controlar as requisições feitas para o player de música
export default class TrackController {
  constructor(private playbackService: PlaybackService = new PlaybackService()) { } // Injeta o serviço de player de música

  // Método para buscar o estado de reprodução
  async findPlaybackState(req: Request, res: Response) {
    const { trackId } = req.params; // Pega o ID da pista
    const response = await this.playbackService.findPlaybackState(Number(trackId)); // Chama o serviço de player de música para buscar o estado de reprodução
    res.status(mapStatusHTTP(response.status)).json(response.data); // Retorna a resposta e o status correspondente
  }

  // Método para buscar as músicas mais tocadas no Brasil
  async findTopTracksInBrazil(req: Request, res: Response) {
    const { trackId } = req.params; // Pega o ID da pista
    const response = await this.playbackService.findTopTracksInBrazil(Number(trackId)); // Chama o serviço de player de música para buscar as músicas mais tocadas no Brasil
    res.status(mapStatusHTTP(response.status)).json(response.data); // Retorna a resposta e o status correspondente
  }

  // Método para buscar músicas por pesquisa
  async findTrackBySearch(req: Request, res: Response) {
    const { trackId } = req.params; // Pega o ID da pista
    const { search } = req.query; // Pega a pesquisa
    const response = await this.playbackService.findTrackBySearch(Number(trackId), search as string); // Chama o serviço de player de música para buscar músicas por pesquisa
    res.status(mapStatusHTTP(response.status)).json(response.data); // Retorna a resposta e o status correspondente
  }

  // Método para buscar a fila de reprodução
  async findQueue(req: Request, res: Response) {
    const { trackId } = req.params; // Pega o ID da pista
    const response = await this.playbackService.findQueue(Number(trackId)); // Chama o serviço de player de música para buscar a fila de reprodução
    res.status(mapStatusHTTP(response.status)).json(response.data); // Retorna a resposta e o status correspondente
  }

  // Método para buscar o DJ que adicionou a música que está sendo reproduzida no momento
  async findDJAddedCurrentMusic(req: Request, res: Response) {
    const { trackId } = req.params; // Pega o ID da pista
    const response = await this.playbackService.findDJAddedCurrentMusic(Number(trackId)); // Chama o serviço de player de música para buscar a música que está sendo reproduzida no momento
    res.status(mapStatusHTTP(response.status)).json(response.data); // Retorna a resposta e o status correspondente
  }

  // Método para buscar as músicas adicionadas pelo DJ
  async findAddedMusicsByDJ(req: Request, res: Response) {
    const { djId, trackId } = req.params; // Pega o ID do DJ e o ID da pista
    const response = await this.playbackService.findAddedMusicsByDJ(Number(djId), Number(trackId)); // Chama o serviço de player de música para buscar as músicas adicionadas pelo DJ
    res.status(mapStatusHTTP(response.status)).json(response.data); // Retorna a resposta e o status correspondente
  }

  // Método para adicionar uma música à fila de reprodução
  async addTrackToQueue(req: Request, res: Response) {
    const { trackId } = req.params; // Pega o ID da pista
    const musicData = req.body; // Pega a capa, o nome, os artistas e o URI da música
    const { authorization } = req.headers; // Pega o token de autorização
    const response = await this.playbackService.addTrackToQueue(Number(trackId), musicData, authorization as string); // Chama o serviço de player de música para adicionar uma música à fila de reprodução
    res.status(mapStatusHTTP(response.status)).json(response.data); // Retorna a resposta e o status correspondente
  }
}