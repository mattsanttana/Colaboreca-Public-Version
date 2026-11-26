import { ITrackQueueData } from '../interfaces/tracks/ITrack';
import { SpotifyQueue } from '../interfaces/spotify_response/SpotifyResponse';
import TrackModel from '../models/TrackModel';
import VoteModel from '../models/VoteModel';
import PlaybackActions from '../utils/PlaybackActions';
import { getSocket } from '../utils/socketIO';
import SpotifyActions from '../utils/SpotifyActions';
import VoteService from './VoteService';

const POLL_INTERVAL_MS = 5000;

export default class PlaybackMonitorService {
  private readonly voteService = new VoteService();
  private readonly voteModel = new VoteModel();
  private readonly trackModel = new TrackModel();
  private readonly tracksInProgress = new Set<number>();
  private timer?: NodeJS.Timeout;
  private isRunning = false;

  start() {
    if (this.timer || this.isRunning) return;
    void this.pollAllTracks();
  }

  stop() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  async refreshTrack(trackId: number) {
    if (this.tracksInProgress.has(trackId)) return;

    const track = await this.trackModel.findOne({ id: trackId });
    if (!track) return;

    await this.updateTrack(track);
  }

  private async pollAllTracks() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      const tracks = await this.trackModel.findAll();
      await Promise.all(tracks.map(async (track) => {
        try {
          await this.updateTrack(track);
        } catch (error) {
          console.error(`Failed to update playback for track ${track.id}:`, error);
        }
      }));
    } catch (error) {
      console.error('Failed to load tracks for playback monitoring:', error);
    } finally {
      this.isRunning = false;
      this.timer = setTimeout(() => {
        this.timer = undefined;
        void this.pollAllTracks();
      }, POLL_INTERVAL_MS);
    }
  }

  private async updateTrack(track: ITrackQueueData) {
    if (this.tracksInProgress.has(track.id)) return;
    this.tracksInProgress.add(track.id);

    try {
      const token = await SpotifyActions.refreshAccessToken(track.spotifyToken);
      if (typeof token !== 'string') {
        throw new Error('Spotify access token could not be refreshed');
      }

      const [playbackResponse, spotifyQueueResponse] = await Promise.all([
        SpotifyActions.getPlaybackState(token),
        SpotifyActions.getQueue(token),
      ]);

      if (!spotifyQueueResponse || !Array.isArray(spotifyQueueResponse.queue)) {
        SpotifyActions.invalidateAccessToken(track.spotifyToken);
        throw new Error('Spotify queue response is invalid');
      }
      if (!playbackResponse) {
        SpotifyActions.invalidateAccessToken(track.spotifyToken);
        throw new Error('Spotify playback response is unavailable');
      }

      const spotifyQueue = spotifyQueueResponse as SpotifyQueue;
      const playbackState = playbackResponse?.status === 200 ? playbackResponse.data : null;
      const queueForMapping: SpotifyQueue = {
        ...spotifyQueue,
        currently_playing: playbackState?.item ?? spotifyQueue.currently_playing,
      };

      const pendingMusic = [...track.colaborecaQueue]
        .filter((music) => !music.pointsApllied && music.id)
        .sort((first, second) => (first.id ?? 0) - (second.id ?? 0))[0];

      if (pendingMusic?.id && queueForMapping.currently_playing?.uri) {
        const isCurrentMusic = pendingMusic.musicURI === queueForMapping.currently_playing.uri;
        const isInQueue = spotifyQueue.queue.some((music) => music.uri === pendingMusic.musicURI);

        if (!isCurrentMusic && !isInQueue) {
          const result = await this.voteService.applyPointsToDJ(track.id, pendingMusic.id);
          if (result.status !== 'OK') {
            console.error(`Could not apply points for music ${pendingMusic.id} on track ${track.id}:`, result);
          }
        }
      }

      const djPlayingNow = PlaybackActions.getDJAddedCurrentMusic(
        queueForMapping,
        track.colaborecaQueue,
        track.djs,
        track.ownerDjId
      );
      const completeQueue = PlaybackActions.getQueue(
        spotifyQueue,
        track.colaborecaQueue,
        track.djs,
        track.trackName,
        track.ownerDjId
      );
      const votes = djPlayingNow.musicId
        ? await this.voteModel.findAll({ musicId: djPlayingNow.musicId, trackId: track.id })
        : [];
      const voteValues = votes.map((vote) => vote.vote);

      const io = getSocket();
      io.to(`track_${track.id}`).emit('playback updated', {
        trackId: track.id,
        playingNow: playbackState,
        djPlayingNow,
        queue: completeQueue,
        spotifyQueue: spotifyQueue.queue,
        voteValues,
      });

      await Promise.all(track.djs.map(async (dj) => {
        const hasVoted = votes.some((vote) => vote.djId === dj.id);
        const canVote = Boolean(
          playbackState?.is_playing &&
          djPlayingNow.musicId &&
          !djPlayingNow.addedByApp &&
          djPlayingNow.djId !== dj.id
        );

        io.to(`track_${track.id}_dj_${dj.id}`).emit('vote eligibility updated', {
          musicId: djPlayingNow.musicId ?? null,
          canVote: canVote && !hasVoted,
        });
      }));
    } finally {
      this.tracksInProgress.delete(track.id);
    }
  }
}
