import { SpotifyQueue } from '../interfaces/spotify_response/SpotifyResponse';
import { IDJ } from '../interfaces/djs/IDJ';
import { IMusic } from '../interfaces/musics/IMusic';
import { InferAttributes } from 'sequelize/types';
import SequelizeMusic from '../database/models/SequelizeMusic';

export default class PlaybackActions {
  static getQueue(spotifyQueue: SpotifyQueue, colaborecaQueue: IMusic[], djs: IDJ[], trackName: string) {
    const processedURIs = new Set<string>();
    const completeQueue = spotifyQueue.queue.map((spotifyTrack: any) => {
      const responseTrack = {
        cover: spotifyTrack.album.images[0].url,
        musicName: spotifyTrack.name,
        artists: spotifyTrack.artists.map((artist: any) => artist.name).join(', '),
      };

      // Buscar a música correspondente na fila do Colaboreca
      const correspondingColaborecaTrack = colaborecaQueue.find(
        (colaborecaTrack: any) => colaborecaTrack.musicURI === spotifyTrack.uri
      );

      // Se encontrar correspondência e a música ainda não tiver sido processada
      if (correspondingColaborecaTrack && correspondingColaborecaTrack.pointsApllied === false && !processedURIs.has(spotifyTrack.uri)) {
        // Marcar a URI como processada
        processedURIs.add(spotifyTrack.uri);

        // Se encontrar correspondência, adicionar informações do DJ
        return {
          djId: correspondingColaborecaTrack.djId,
          addedBy: djs.find((dj: any) => dj.id === correspondingColaborecaTrack.djId)?.djName,
          characterPath: djs.find((dj: any) => dj.id === correspondingColaborecaTrack.djId)?.characterPath,
          ...responseTrack
        };
      } else {
        // Caso contrário, a música foi adicionada pelo próprio aplicativo
        return {
          addedBy: trackName,
          characterPath: null,
          ...responseTrack
        };
      }
    });

    return completeQueue;
  }

  static getMusicAddedBy(spotifyQueue: SpotifyQueue, colaborecaQueue: IMusic[]) {
    const completeQueue = colaborecaQueue.map((colaborecaTrack: any) => {
      const spotifyTrack = spotifyQueue.queue.find((spotifyTrack: any) => spotifyTrack.uri === colaborecaTrack.musicURI); // Buscar a música correspondente na fila do Spotify
      const trackWasPlayed = !spotifyTrack; // Se a música não estiver na fila, ela já foi tocada

      return {
        cover: colaborecaTrack.cover, // usar a capa do colaboreca se não estiver na fila
        name: colaborecaTrack.name, // usar o nome da música do colaboreca se não estiver na fila
        artists: colaborecaTrack.artists,
        wasPlayed: trackWasPlayed, // flag indicando se a música foi tocada
      };
    });

    return completeQueue;
  }

  static getDJAddedCurrentMusic(spotifyQueue: SpotifyQueue, colaborecaQueue: IMusic[], djs: IDJ[]) {
    const currentMusic = spotifyQueue.currently_playing; // Buscar a música que está tocando no momento
    const colaborecaQueueNotPlayed = colaborecaQueue.filter((colaborecaTrack: any) => colaborecaTrack.pointsApllied === false); // Filtrar a fila do Colaboreca pelas músicas que ainda não foram tocadas

    // Filtrar as músicas do Colaboreca que possuem a mesma URI da música que está tocando no momento
    const colaborecaTracksWithURI = colaborecaQueueNotPlayed.filter(
      (colaborecaTrack: any) => colaborecaTrack.musicURI === currentMusic?.uri
    );

    let addedBy; // Variável para armazenar quem adicionou a música
    let characterPath; // Variável para armazenar o caminho do personagem

    // Se houver ocorrências da música que está tocando no momento
    if (colaborecaTracksWithURI.length > 0) {
      // Verificar se todas as ocorrências são do Spotify ou se há alguma do DJ
      const isAllSpotify = colaborecaTracksWithURI.every(
        (colaborecaTrack: any) => colaborecaTrack.djId === null
      );

      // Se todas as ocorrências são do Spotify, então consideramos que a música foi adicionada pelo Spotify
      if (isAllSpotify) {
        addedBy = undefined; // A música foi adicionada pelo Spotify
        characterPath = null; // Não há personagem associado
      } else {
        // Se houver pelo menos uma ocorrência do DJ, considerar a primeira como a que adicionou a música
        const firstColaborecaTrack = colaborecaTracksWithURI.find(
          (colaborecaTrack: any) => colaborecaTrack.djId !== null
        );

        // Se a primeira ocorrência do DJ for encontrada, buscar o nome do DJ e o caminho do personagem
        if (firstColaborecaTrack) {
          const dj = djs.find((dj: any) => dj.id === firstColaborecaTrack.djId); // Buscar o DJ

          // Se o DJ for encontrado, buscar o nome do DJ e o caminho do personagem
          if (dj) {
            addedBy = dj.djName; // Definir o nome do DJ
            characterPath = dj.characterPath; // Definir o caminho do personagem
          } else {
            // Se o DJ não for encontrado, definir o nome do DJ como indefinido e o caminho do personagem como nulo
            addedBy = undefined; // O DJ não foi encontrado
            characterPath = null; // Não há personagem associado
          }
        } else {
          // Se a primeira ocorrência do DJ não for encontrada, definir o nome do DJ como indefinido e o caminho do personagem como nulo
          addedBy = undefined; // O DJ não foi encontrado
          characterPath = null; // Não há personagem associado
        }
      }
    } else {
      // Se não houver ocorrências da música que está tocando no momento, definir o nome do DJ como indefinido e o caminho do personagem como nulo
      addedBy = undefined; // O DJ não foi encontrado
      characterPath = null; // Não há personagem associado
    }

    // Buscar a música com o maior ID
    const musicId = colaborecaTracksWithURI.reduce((latest, current) => {
      // Se o ID da música atual for maior que o ID da música mais recente, retornar a música atual
      if (latest.id === undefined || (current.id !== undefined && current.id > latest.id)) {
        return current;
      } else {
        // Caso contrário, retornar a música mais recente
        return latest;
      }
    }, {} as InferAttributes<SequelizeMusic, { omit: never; }>).id;

    return {
      musicId,
      cover: currentMusic?.album.images[0].url,
      musicName: currentMusic?.name,
      artists: currentMusic?.artists.map((artist: any) => artist.name),
      djId: addedBy === undefined ? null : colaborecaTracksWithURI[0]?.djId,
      addedBy,
      characterPath,
      spotifyQueue
    };
  }

}