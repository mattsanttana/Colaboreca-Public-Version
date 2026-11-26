import { useEffect, useMemo, useRef, useState } from 'react';
import PlayingNow from '../types/PlayingNow';
import { Vote, voteValues } from '../types/Vote';
import { DJPlayingNow } from '../types/DJ';
import { Music } from '../types/SpotifySearchResponse';
import TQueue from '../types/TQueue';
import socket from './socket';

const initialVoteCounts = { very_good: 0, good: 0, normal: 0, bad: 0, very_bad: 0 };

const useFetchPlaybackData = () => {
  const [playingNow, setPlayingNow] = useState<PlayingNow | null>(null);
  const [votes, setVotes] = useState<Vote | undefined>();
  const [displayVoteCounts, setDisplayVoteCounts] = useState(initialVoteCounts);
  const [djPlayingNow, setDJPlayingNow] = useState<DJPlayingNow | null>(null);
  const [showVotePopup, setShowVotePopup] = useState(false);
  const [queue, setQueue] = useState<Music[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const lastVoteMusicId = useRef<number | null>(null);

  const cardVisible = Boolean(djPlayingNow?.addedBy && !djPlayingNow.addedByApp);

  const voteCounts = useMemo(() => {
    if (!votes?.voteValues.length) return initialVoteCounts;

    return votes.voteValues.reduce((counts, vote) => {
      counts[vote] += 1;
      return counts;
    }, { ...initialVoteCounts });
  }, [votes]);

  useEffect(() => {
    const handleNewVote = (data: { vote: voteValues }) => {
      setVotes((currentVotes) => ({
        voteValues: [...(currentVotes?.voteValues ?? []), data.vote],
      }));
    };

    const handleQueueUpdated = (data: { queue: TQueue[]; spotifyQueue: Music[] }) => {
      setQueue(data.spotifyQueue);
    };

    const handlePlaybackUpdated = (data: {
      playingNow: PlayingNow | null;
      djPlayingNow: DJPlayingNow | null;
      spotifyQueue: Music[];
      voteValues: voteValues[];
    }) => {
      setPlayingNow(data.playingNow);
      setDJPlayingNow(data.djPlayingNow);
      setQueue(data.spotifyQueue ?? []);
      setVotes(data.voteValues?.length ? { voteValues: data.voteValues } : undefined);
      setIsLoading(false);
    };

    const handleVoteEligibilityUpdated = (data: { musicId: number | null; canVote: boolean }) => {
      if (data.musicId !== lastVoteMusicId.current) {
        lastVoteMusicId.current = data.musicId;
        setShowVotePopup(data.canVote);
      } else if (!data.canVote) {
        setShowVotePopup(false);
      }
    };

    socket.on('new vote', handleNewVote);
    socket.on('queue updated', handleQueueUpdated);
    socket.on('playback updated', handlePlaybackUpdated);
    socket.on('vote eligibility updated', handleVoteEligibilityUpdated);

    return () => {
      socket.off('new vote', handleNewVote);
      socket.off('queue updated', handleQueueUpdated);
      socket.off('playback updated', handlePlaybackUpdated);
      socket.off('vote eligibility updated', handleVoteEligibilityUpdated);
    };
  }, []);

  useEffect(() => {
    setDisplayVoteCounts(voteCounts);
  }, [voteCounts]);

  return {
    playingNow,
    initialVoteCounts,
    djPlayingNow,
    showVotePopup,
    setShowVotePopup,
    queue,
    isLoading,
    cardVisible,
    displayVoteCounts,
  };
};

export default useFetchPlaybackData;
