import { useEffect, useRef, useState } from 'react';
import TQueue from '../types/TQueue';
import socket from './socket';

const useQueue = (currentTrackIndex?: number) => {
  const [queue, setQueue] = useState<TQueue[]>([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState(true);
  const trackRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleQueueUpdate = (data: { queue: TQueue[] }) => {
      setQueue(data.queue ?? []);
      setIsLoadingQueue(false);
    };

    socket.on('playback updated', handleQueueUpdate);
    socket.on('queue updated', handleQueueUpdate);

    return () => {
      socket.off('playback updated', handleQueueUpdate);
      socket.off('queue updated', handleQueueUpdate);
    };
  }, []);

  useEffect(() => {
    const selectedTrack = currentTrackIndex === undefined ? null : trackRefs.current[currentTrackIndex];
    const listScroller = selectedTrack?.closest<HTMLElement>('.queue-list-scroll');
    if (!selectedTrack || !listScroller) return;

    const itemBounds = selectedTrack.getBoundingClientRect();
    const scrollerBounds = listScroller.getBoundingClientRect();

    if (itemBounds.bottom > scrollerBounds.bottom) {
      listScroller.scrollTo({
        top: listScroller.scrollTop + itemBounds.bottom - scrollerBounds.bottom,
        behavior: 'smooth',
      });
    } else if (itemBounds.top < scrollerBounds.top) {
      listScroller.scrollTo({
        top: listScroller.scrollTop - (scrollerBounds.top - itemBounds.top),
        behavior: 'smooth',
      });
    }
  }, [currentTrackIndex]);

  return {
    queue,
    trackRefs,
    isLoadingQueue,
  };
};

export default useQueue;
