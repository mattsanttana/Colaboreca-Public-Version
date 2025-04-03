import { Sequelize } from 'sequelize';
import * as config from '../database/config/database';
import { IDJ } from '../interfaces/djs/IDJ';
import { Music } from '../interfaces/spotify_response/SpotifyResponse';
import { Vote } from '../interfaces/votes/IVote';
import DJModel from '../models/DJModel';
import MusicModel from '../models/MusicModel';
import TrackModel from '../models/TrackModel';
import VoteModel from '../models/VoteModel';
import PlaybackService from './PlaybackService';
import { getDJScore, updateDJsRanking } from '../utils/applyPointsToDJ';
import JWT from '../utils/JWT';
import { getSocket } from '../utils/socketIO';
import SpotifyActions from '../utils/SpotifyActions';

// Essa classe é responsável por gerenciar as votações dos DJs e aplicar os pontos ao DJ que adicionou a música
export default class VoteService {
  constructor(
    // Injeção de dependências
    private sequelize: Sequelize = new Sequelize(config),
    private voteModel: VoteModel = new VoteModel(),
    private djModel: DJModel = new DJModel(),
    private musicModel: MusicModel = new MusicModel(),
    private trackModel: TrackModel = new TrackModel(),
    private playbackService: PlaybackService = new PlaybackService()
  ) {
    // Começa o processo de verificação
    setInterval(this.checkPlaybackState.bind(this), 30000);
  }


  // Método para verificar se a música que não teve seus pontos aplicados foi tocada e aplicar os pontos ao DJ
  async checkPlaybackState() {
    try {
      const tracksData = await this.trackModel.findAll(); // Busca todas as tracks

      // Para cada track, verifica o estado de reprodução
      for (const track of tracksData) {
        const token = await SpotifyActions.refreshAccessToken(track.spotifyToken); // Atualiza o token de acesso

        // Se não houver token, pula para a próxima track
        if (!token) {
          continue;
        }

        const music = track.colaborecaQueue.find((music) => !music.pointsApllied); // Busca a música que não teve seus pontos aplicados

        // Se não houver música, pula para a próxima track
        if (!music || !music.id) {
          continue;
        }

        const queue = await SpotifyActions.getQueue(token); // Busca a fila de reprodução
        const musicInQueue = queue.queue.find((track: Music) => track.uri === music?.musicURI); // Verifica se a música está na fila
        const currentMusicURI = queue.currently_playing?.uri; // Pega a URI da música atual

        // Se a música não estiver na fila e a música atual for diferente da música que não teve seus pontos aplicados
        if (currentMusicURI && music?.musicURI !== currentMusicURI && musicInQueue === undefined) {
          await this.applyPointsToDJ(track.id, music.id); // Aplica os pontos ao DJ
        }
      }
    } catch (error) {
      // Se ocorrer um erro, exiba no console e retorne uma mensagem de erro
      console.error(error);
      if (error instanceof Error) {
        return { status: 'ERROR', data: { message: error.message } };
      } else {
        return { status: 'ERROR', data: { message: 'An unknown error occurred' } };
      }
    }
  }

  // Método para verificar se o DJ já votou na música atual
  async verifyIfDJHasAlreadVoted(authorization: string) {
    try {
      const token = authorization.split(' ')[1]; // Pega o token do cabeçalho

      const decoded = JWT.verify(token); // Decodifica o token

      // Se o token for inválido, retorna uma mensagem de erro
      if (typeof decoded === 'string') {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      const dj = await this.djModel.findOne({ id: decoded.id }); // Busca o DJ

      const music = await this.playbackService.findDJAddedCurrentMusic(decoded.trackId); // Busca a música atual

      // Se a música não for encontrada, retorna uma mensagem de erro
      if ('musicId' in music.data && (!music.data.musicId || music.data.addedBy === dj?.djName)) {
        return {
          status: 'UNAUTHORIZED',
          data: { message: 'The song was added for currently DJ, or was not added by track DJ' }
        };
      }

      // Verifica se a música contém o musicId (ou se não ela foi adicionada pelo aplicativo)
      if ('musicId' in music.data) {
        const response = await this.voteModel.findOne({ djId: decoded.id, musicId: music.data.musicId }); // Busca o voto do DJ

        // Se o voto não for encontrado, retorna uma mensagem de que o DJ ainda não votou
        if (!response) {
          return { status: 'OK', data: { message: 'The DJ has not yet voted on the current song' } };
        }

        return { status: 'UNAUTHORIZED', data: { message: 'The DJ has already voted' } }; // Retorna uma mensagem de que o DJ já votou
      }

      return { status: 'UNAUTHORIZED', data: { message: 'Music added by app' } }; // Retorna uma mensagem de que a música foi adicionada pelo aplicativo
    } catch (error) {
      // Se ocorrer um erro, exiba no console e retorne uma mensagem de erro
      console.error(error);
      if (error instanceof Error) {
        return { status: 'ERROR', data: { message: error.message } };
      } else {
        return { status: 'ERROR', data: { message: 'An unknown error occurred' } };
      }
    }
  }

  // Método para criar um voto
  async createVote(authorization: string, musicURI: string, vote: Vote) {
    const io = getSocket(); // Pega o socket

    try {
      const token = authorization.split(' ')[1]; // Pega o token do cabeçalho
      const decoded = JWT.verify(token); // Decodifica o token

      // Se o token for inválido, desfaz a transação e retorna uma mensagem de erro
      if (typeof decoded === 'string') {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      const musics = await this.musicModel.findAll({ musicURI, trackId: decoded.trackId }); // Busca todas as músicas com a URI

      const music = musics.find(music => music.pointsApllied === false); // Busca a música que não teve seus pontos aplicados

      // Se a música não for encontrada, retorna uma mensagem de erro
      if (!music || !music.id) {
        return { status: 'UNAUTHORIZED', data: { message: 'Music not found' } };
      }

      const alreadyVoted = music?.votes?.some(vote => vote.djId === decoded.id); // Verifica se o DJ já votou

      // Se o DJ já votou retorna uma mensagem de erro
      if (alreadyVoted) {
        return { status: 'UNAUTHORIZED', data: { message: 'This DJ has already voted' } };
      }

      const response = await this.voteModel.create({ djId: decoded.id, musicId: music.id, vote, trackId: decoded.trackId }); // Cria o voto

      // Se o voto não for criado retorna uma mensagem de erro
      if (!response) {
        return { status: 'ERROR', data: { message: 'An error occurred' } };
      }

      io.to(`track_${decoded.trackId}`).emit('new vote', response); // Emite um evento de novo voto

      return { status: 'OK', data: response }; // Retorna o voto criado
    } catch (error) {
      // Em caso de erro, rollback a transação, exibe o erro e retorna uma mensagem de erro
      console.error(error);
      if (error instanceof Error) {
        return { status: 'ERROR', data: { message: error.message } };
      } else {
        return { status: 'ERROR', data: { message: 'An unknown error occurred' } };
      }
    }
  }

  // Método para pegar todos os votos de uma música
  async getAllVotesForThisMusic(trackId: number, musicURI: string) {
    try {
      const musics = await this.musicModel.findAll({ musicURI, trackId }); // Busca todas as músicas com a URI

      // Se a música não for encontrada, retorna uma mensagem de erro
      if (!musics || musics.length === 0) {
        return { status: 'OK', data: { message: 'Music not found' } };
      }

      const music = musics.find(music => music.pointsApllied === false); // Busca a música que não teve seus pontos aplicados

      // Se a música não for encontrada, retorna uma mensagem de erro
      if (!music || !music.id) {
        return { status: 'OK', data: { message: 'Music not found' } };
      }

      const voteValues = music?.votes?.map(vote => vote.vote); // Pega os valores dos votos

      return { status: 'OK', data: { voteValues } }; // Retorna os valores dos votos com o status correspondente
    } catch (error) {
      // Se ocorrer um erro, exiba no console e retorne uma mensagem de erro
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }

  // Método para aplicar os pontos ao DJ
  async applyPointsToDJ(trackId: number, musicId: number) {
    const transaction = await this.sequelize.transaction();
    const io = getSocket(); // Pega o socket

    try {
      const musics = await this.musicModel.findAll({ trackId }, { transaction }) // busca todas as músicas

      const music = musics.find(music => music.id === musicId); // Busca a música pelo id

      if (!music || !music.id) {
        return { status: 'OK', data: { message: 'Music not found' } };
      }

      const score = getDJScore(music); // Calcula o score do DJ

      if (score.newScore !== 0) {
        const updateDJSCORE = await this.djModel.update({ score: score.newScore }, { id: music.djId }, { transaction }); // Atualiza o score do DJ

        if (!updateDJSCORE || !updateDJSCORE[0]) {
          transaction.rollback();
          return { status: 'ERROR', data: { message: 'An error occurred while updating DJ score' } };
        }
      }

      const allDJs = await this.djModel.findAll({ trackId }, { transaction }); // Busca todos os DJs

      // Aplicar 0.50 pontos para DJs que votaram na música com o voto majoritário e 0.25 para os demais que votaram
      const votes = music.votes ?? []; // Pega os votos da música
      const votingDJs = allDJs.filter(dj => votes.some(vote => vote.djId === dj.id)); // Filtra os DJs que votaram na música

      // Atualizar o score de todos os DJs que votaram na música
      for (const dj of votingDJs) {
        const djVote = votes.find(vote => vote.djId === dj.id); // Busca o voto do DJ
        const newScore = (dj.score ?? 0) + (djVote?.vote && score.majorityVote.includes(djVote.vote) ? 0.50 : 0.25); // Calcula o novo score

        const updateDJSCORE = await this.djModel.update({ score: newScore }, { id: dj.id }, { transaction }); // Atualiza o score do DJ

        if (!updateDJSCORE || !updateDJSCORE[0]) {
          transaction.rollback();
          return { status: 'ERROR', data: { message: 'An error occurred while updating DJ score' } };
        }
      }

      const allDJsUpdated = await this.djModel.findAll({ trackId: music.trackId }, { transaction }); // Busca todos os DJs atualizados

      const sortedDJs = updateDJsRanking(allDJsUpdated as IDJ[], musics); // Ordenar DJs por score (descendente) e aplicar critérios de desempate

      // Atualizar o rank de todos os DJs
      for (let i = 0; i < sortedDJs.length; i += 1) {
        const newRanking = sortedDJs[i].score === 0 ? 0 : i + 1; // Calcula o novo ranking

        if (sortedDJs[i].ranking !== newRanking) {
          const updateDJRank = await this.djModel.update({ ranking: newRanking }, { id: sortedDJs[i].id }, { transaction });
    
          if (!updateDJRank || !updateDJRank[0]) {
            console.log('Erro ao atualizar ranking do DJ');
            await transaction.rollback();
            return { status: 'ERROR', data: { message: 'An error occurred while updating DJ ranking' } };
          }
        }

        const djUpdated = await this.djModel.findOne({ id: sortedDJs[i].id }, { transaction }); // Busca o DJ atualizado

        if (!djUpdated) {
          transaction.rollback();
          return { status: 'ERROR', data: { message: 'An error occurred while updating DJ' } };
        }

        io.to(`track_${trackId}`).emit('dj updated', djUpdated); // Emite um evento de DJ atualizado
      }

      const updateMusicPointApplied = await this.musicModel.update({ pointsApllied: true }, { id: music.id }, { transaction }); // Atualiza a música para que os pontos sejam aplicados

      if (!updateMusicPointApplied || !updateMusicPointApplied[0]) {
        transaction.rollback();
        return { status: 'ERROR', data: { message: 'An error occurred while updating music points applied' } };
      }

      transaction.commit(); // Comita a transação

      return { status: 'OK', data: { message: 'Points applied to DJ and ranking updated' } };
    } catch (error) {
      // Em caso de erro, rollback a transação, exibe o erro e retorna uma mensagem de erro
      transaction.rollback();
      console.error('Erro ao aplicar pontos ao DJ:', error);
      return { status: 'ERROR', data: { message: 'An error occurred while applying points to DJ' } };
    }
  }
}