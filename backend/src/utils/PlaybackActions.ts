import { SpotifyQueue } from '../interfaces/spotify_response/SpotifyResponse';
import { IDJ } from '../interfaces/djs/IDJ';
import { IMusic } from '../interfaces/musics/IMusic';

// Classe util para manipular ações de playback
export default class PlaybackActions {
  // Método para pegar a fila completa
  static getQueue(spotifyQueue: SpotifyQueue, colaborecaQueue: IMusic[], djs: IDJ[], trackName: string) {
    const processedURIs = new Set<string>(); // Set para armazenar as URIs que já foram processadas

    // Mapear a fila do Spotify e adicionar informações do DJ
    const completeQueue = spotifyQueue.queue.map((spotifyTrack: any) => {
      // Adicionar informações da música
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

    return completeQueue; // Retornar a fila completa
  }

  // Método separar as músicas tocadas e não tocadas
  static wasPlayed(musicsAddedByDJ: IMusic[]) {
    // Mapear a fila do Colaboreca e adicionar informações do DJ
    const completeQueue = musicsAddedByDJ.map((colaborecaTrack: any) => {
      const trackWasPlayed = colaborecaTrack.pointsApllied; // Verificar se a música foi tocada

      return {
        cover: colaborecaTrack.cover,
        name: colaborecaTrack.name,
        artists: colaborecaTrack.artists,
        wasPlayed: trackWasPlayed,
      };
    });

    return completeQueue; // Retornar a fila completa
  }

  // Método para pegar o DJ que adicionu a música que está sendo reproduzida no momento
  static getDJAddedCurrentMusic(spotifyQueue: SpotifyQueue, colaborecaQueue: IMusic[], djs: IDJ[]) {
    const currentMusic = spotifyQueue.currently_playing; // Buscar a música que está tocando no momento
    const colaborecaQueueNotPlayed = colaborecaQueue.filter((colaborecaTrack: any) => colaborecaTrack.pointsApllied === false); // Filtrar a fila do Colaboreca pelas músicas que ainda não foram tocadas

    // Buscar a música que está tocando no momento na fila do Colaboreca
    const colaborecaMusic = colaborecaQueueNotPlayed.find(
      (colaborecaTrack: any) => colaborecaTrack.musicURI === currentMusic?.uri
    );

    let addedBy; // Variável para armazenar quem adicionou a música
    let characterPath; // Variável para armazenar o caminho do personagem

    // Se encontrar a música que está tocando no momento na fila do Colaboreca
    if (colaborecaMusic) {
      addedBy = djs.find((dj: any) => dj.id === colaborecaMusic.djId)?.djName; // Definir o nome do DJ que adicionou a música
      characterPath = djs.find((dj: any) => dj.id === colaborecaMusic.djId)?.characterPath; // Definir o caminho do personagem
    } else {
      // Caso contrário, a música foi adicionada pelo próprio aplicativo
      addedBy = undefined;
      characterPath = null;
    }

    // Retornar a música com a informação do DJ que a adicionou
    return {
      musicId: colaborecaMusic?.id,
      cover: currentMusic?.album.images[0].url,
      musicName: currentMusic?.name,
      artists: currentMusic?.artists.map((artist: any) => artist.name),
      djId: addedBy === undefined ? null : colaborecaMusic?.djId,
      addedBy,
      characterPath,
      spotifyQueue
    };
  }
}