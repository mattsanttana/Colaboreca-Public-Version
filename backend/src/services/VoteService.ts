import { Sequelize } from 'sequelize';
import * as config from '../database/config/database';
import PlaybackService from './PlaybackService';
import DJModel from '../models/DJModel';
import VoteModel from '../models/VoteModel';
import MusicModel from '../models/MusicModel';
import JWT from '../utils/JWT';
import { getSocket } from '../utils/socketIO';
import { Vote } from '../interfaces/votes/IVote';
import SpotifyActions from '../utils/SpotifyActions';
import { Track } from '../interfaces/spotify_response/SpotifyResponse';
import TrackModel from '../models/TrackModel';

export default class VoteService {
  constructor(
    private sequelize: Sequelize = new Sequelize(config),
    private voteModel: VoteModel = new VoteModel(),
    private djModel: DJModel = new DJModel(),
    private musicModel: MusicModel = new MusicModel(),
    private trackModel: TrackModel = new TrackModel(),
    private playbackService: PlaybackService = new PlaybackService()
  ) {
    setInterval(this.checkPlaybackState.bind(this), 25000);
  }

  async checkPlaybackState() {
    const transaction = await this.sequelize.transaction();

    try {
      const tracks = await this.trackModel.findAll({ transaction });

      for (const track of tracks) {
        const token = await SpotifyActions.refreshAccessToken(track.spotifyToken);

        if (!token) {
          continue;
        }

        const response = await SpotifyActions.getPlaybackState(token);

        if (!response) {
          continue;
        }

        const music = await this.musicModel.findOne({ trackId: track.id, pointsApllied: false }, { transaction });

        if (!music) {
          continue;
        }

        const queue = await SpotifyActions.getQueue(token);

        const musicInQueue = queue.queue.find((track: Track) => track.uri === music?.musicURI);

        const currentMusicURI = response?.data?.item?.uri;

        if (music?.musicURI !== currentMusicURI && musicInQueue === undefined && response.data.is_playing && music.id) {
          await this.musicModel.update({ pointsApllied: true }, { id: music.id }, { transaction });
          await this.applyPointsToDJ(track.id, music.id);
        }
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao verificar o estado de reprodução:', error);
    }
  }

  async verifyIfDJHasAlreadVoted(authorization: string) {
    try {
      const token = authorization.split(' ')[1];

      const decoded = JWT.verify(token);

      if (typeof decoded === 'string') {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      const dj = await this.djModel.findOne({ id: decoded.id });

      const music = await this.playbackService.findDJAddedCurrentMusic(decoded.trackId);

      if (!music?.data.musicId || music.data.addedBy === dj?.djName) {
        return {
          status: 'OK',
          data: { message: 'The song was added for currently DJ, or was not added by track DJ' }
        };
      }

      const response = await this.voteModel.findOne({ djId: decoded.id, musicId: music.data.musicId });

      if (!response) {
        return { status: 'OK', data: { message: 'The DJ has not yet voted on the current song' } };
      }

      return { status: 'OK', data: { message: 'The DJ has already voted' } };
    } catch (error) {
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }

  async createVote(authorization: string, musicURI: string, vote: Vote) {
    const transaction = await this.sequelize.transaction();
    try {
      const io = getSocket();

      const token = authorization.split(' ')[1];
      const decoded = JWT.verify(token);

      if (typeof decoded === 'string') {
        await transaction.rollback();
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      const musics = await this.musicModel.findAll({ musicURI }, { transaction });

      const music = musics.reduce((max, current) => {
        if (!current || !current.id) {
          return max;
        }
        if (!max || !max.id) {
          return current;
        }
        return current.id > max.id ? current : max;
      }
        , musics[0]);

      if (!music || !music.id || music.djId === decoded.id) {
        await transaction.rollback();
        return { status: 'UNAUTHORIZED', data: { message: 'Music not found or invalid dj' } };
      }

      const alreadyVoted = await this.voteModel.findOne({ djId: decoded.id, musicId: music.id }, { transaction });

      if (alreadyVoted) {
        await transaction.rollback();
        return { status: 'UNAUTHORIZED', data: { message: 'This DJ has already voted' } };
      }

      const response = await this.voteModel.create({ djId: decoded.id, musicId: music.id, vote, trackId: decoded.trackId }, { transaction });
      io.to(`track_${decoded.trackId}`).emit('new vote', response);

      await transaction.commit();
      return { status: 'OK', data: response };
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }

  async getAllVotesForThisMusic(trackId: number, musicURI: string) {
    try {
      const musics = await this.musicModel.findAll({ musicURI, trackId });

      if (!musics || musics.length === 0) {
        return { status: 'OK', data: { message: 'Music not found' } };
      }

      const music = musics.reduce((max, current) => {
        if (!current || !current.id) {
          return max;
        }
        if (!max || !max.id) {
          return current;
        }
        return current.id > max.id ? current : max;
      }, musics[0]);

      if (!music || !music.id) {
        return { status: 'OK', data: { message: 'Music not found' } };
      }

      const votes = await this.voteModel.findAll({ musicId: music.id });

      const voteValues = votes.map(vote => vote.vote);

      return { status: 'OK', data: { voteValues } };
    } catch (error) {
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }

  async getAllVotesForDJ(djId: number) {
    try {
      const votes = await this.voteModel.findAll({ djId });

      const voteValues = votes.map(vote => vote.vote);

      return { status: 'OK', data: { voteValues } };
    } catch (error) {
      console.error(error);
      return { status: 'ERROR', data: { message: 'An error occurred' } };
    }
  }

  async applyPointsToDJ(trackId: number, musicId: number) {
    const io = getSocket();

    try {
      const music = await this.musicModel.findOne({ id: musicId });

      if (!music || !music.id) {
        return { status: 'OK', data: { message: 'Music not found' } };
      }

      const votes = await this.getAllVotesForThisMusic(trackId, music.musicURI);

      if (votes.status !== 'OK') {
        return { status: 'OK', data: { message: 'Votes not found' } };
      }

      if (!votes.data || !votes.data.voteValues) {
        return { status: 'OK', data: { message: 'No vote values found' } };
      }

      const voteCounts = votes.data.voteValues.reduce(
        (acc, vote) => {
          acc[vote as keyof typeof acc] = (acc[vote as keyof typeof acc] || 0) + 1;
          return acc;
        },
        { very_good: 0, good: 0, normal: 0, bad: 0, very_bad: 0 }
      );

      // Determinar a opção com mais votos
      const maxVotes = Math.max(...Object.values(voteCounts));
      const topOptions = Object.keys(voteCounts).filter(option => voteCounts[option as keyof typeof voteCounts] === maxVotes);

      // Calcular os pontos de acordo com as regras
      const pointsMap = {
        very_good: 3,
        good: 1,
        normal: 0,
        bad: -1,
        very_bad: -3
      };

      let totalPoints = 0;
      if (topOptions.length === 1) {
        // Apenas uma opção tem mais votos
        totalPoints = pointsMap[topOptions[0] as keyof typeof pointsMap];
      } else {
        // Empate: calcular a média dos pontos das opções empatadas
        const total = topOptions.reduce((sum, option) => sum + pointsMap[option as keyof typeof pointsMap], 0);
        totalPoints = total / topOptions.length;
      }

      // Aplicar os pontos ao DJ
      const dj = await this.djModel.findOne({ id: music.djId });

      if (!dj) {
        return { status: 'OK', data: { message: 'DJ not found' } };
      }

      // Garantir que dj.score tenha um valor padrão de 0 se estiver indefinido
      const currentScore = dj.score ?? 0;

      // Verificar se é para adicionar ou subtrair pontos
      if (totalPoints < 0 && currentScore === 0) {
        // Verificar se a opção com mais votos é "bad" ou "very bad" (ou empate entre os dois)
        const negativeVotes = ["bad", "very_bad"];
        const isNegativeVote = topOptions.every(option => negativeVotes.includes(option));

        if (isNegativeVote) {
          // Não fazer nada se o score atual é 0 e os pontos são negativos
          return { status: 'OK', data: { message: 'No points subtracted as DJ score is already 0' } };
        }
      }

      // Ajustar os pontos para evitar valores negativos
      if (totalPoints < 0) {
        if (currentScore < 3 && topOptions.includes("very_bad")) {
          totalPoints = -currentScore; // Reduzir para 0
        } else if (currentScore < 1 && topOptions.includes("bad")) {
          totalPoints = -currentScore; // Reduzir para 0
        }
      }

      // Calcular o novo score garantindo que não seja negativo
      const newScore = Math.max(currentScore + totalPoints, 0);

      await this.djModel.update({ score: newScore }, { id: dj.id });

      // Atualizar o rank de todos os DJs
      const allDJs = await this.djModel.findAll({ trackId: music.trackId });

      // Buscar todos os votos de todas as músicas dos DJs empatados
      const allVotes = await Promise.all(allDJs.map(async (dj) => {
        if (typeof dj.id === 'string') {
          const djVotes = await this.getAllVotesForDJ(dj.id);
          if (djVotes.status === 'OK' && djVotes.data && djVotes.data.voteValues) {
            return { dj, votes: djVotes };
          }
        }
        // Trate o caso onde dj.id é undefined ou não é uma string
        return { dj, votes: { status: 'OK', data: { voteValues: [] } } }; // ou outra lógica apropriada
      }));

      // Ordenar DJs por score (descendente) e aplicar critérios de desempate
      const sortedDJs = allDJs.sort((a, b) => {
        const scoreA = a.score ?? 0;
        const scoreB = b.score ?? 0;

        if (scoreB !== scoreA) {
          return scoreB - scoreA;
        }

        // Critério de desempate 1: mais votos "very good"
        const veryGoodVotesA = allVotes.find(v => v.dj.id === a.id)?.votes.data?.voteValues?.filter(v => v === 'very_good').length ?? 0;
        const veryGoodVotesB = allVotes.find(v => v.dj.id === b.id)?.votes.data?.voteValues?.filter(v => v === 'very_good').length ?? 0;
        if (veryGoodVotesB !== veryGoodVotesA) {
          return veryGoodVotesB - veryGoodVotesA;
        }

        // Critério de desempate 2: mais votos "good"
        const goodVotesA = allVotes.find(v => v.dj.id === a.id)?.votes.data?.voteValues?.filter(v => v === 'good').length ?? 0;
        const goodVotesB = allVotes.find(v => v.dj.id === b.id)?.votes.data?.voteValues?.filter(v => v === 'good').length ?? 0;
        if (goodVotesB !== goodVotesA) {
          return goodVotesB - goodVotesA;
        }

        // Critério de desempate 3: menos votos "very bad"
        const veryBadVotesA = allVotes.find(v => v.dj.id === a.id)?.votes.data?.voteValues?.filter(v => v === 'very_bad').length ?? 0;
        const veryBadVotesB = allVotes.find(v => v.dj.id === b.id)?.votes.data?.voteValues?.filter(v => v === 'very_bad').length ?? 0;
        if (veryBadVotesA !== veryBadVotesB) {
          return veryBadVotesA - veryBadVotesB;
        }

        // Critério de desempate 4: menos votos "bad"
        const badVotesA = allVotes.find(v => v.dj.id === a.id)?.votes.data?.voteValues?.filter(v => v === 'bad').length ?? 0;
        const badVotesB = allVotes.find(v => v.dj.id === b.id)?.votes.data?.voteValues?.filter(v => v === 'bad').length ?? 0;
        if (badVotesA !== badVotesB) {
          return badVotesA - badVotesB;
        }

        // Critério de desempate 5: quem alcançou o empate (menor id)
        if (a.id === undefined || b.id === undefined) {
          return 0; // Tratar como iguais se id for indefinido
        }
        return a.id - b.id;
      });

      // Atualizar o rank de todos os DJs
      for (let i = 0; i < sortedDJs.length; i += 1) {
        const newRanking = sortedDJs[i].score === 0 ? 0 : i + 1;
        await this.djModel.update({ ranking: newRanking }, { id: sortedDJs[i].id });
        const djUpdated = await this.djModel.findOne({ id: sortedDJs[i].id });
        io.to(`track_${music.trackId}`).emit('dj updated', djUpdated);
      }

      return { status: 'OK', data: { message: 'Points and rank applied to DJ' } };

    } catch (error) {
      console.error('Erro ao aplicar pontos ao DJ:', error);
      return { status: 'ERROR', data: { message: 'An error occurred while applying points to DJ' } };
    }
  }
}