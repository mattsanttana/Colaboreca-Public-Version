import { useSprings } from '@react-spring/web';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMeasure, usePrevious } from 'react-use';
import { DJ } from '../types/DJ';
import useTrack from './useTrack';

const useRankingTable = (currentRanking: DJ[], dj: DJ | undefined, previousRanking: DJ[], trackToken?: string | undefined) => {
  const { trackId } = useParams();
  const [displayedRanking, setDisplayedRanking] = useState<DJ[]>(previousRanking); // Ranking a ser exibido
  const [pointDirection, setPointDirection] = useState<{ [key: number]: 'up' | 'down' | null }>({});
  const [points, setPoints] = useState<{ [key: number]: number }>({}); // Armazena os pontos dos DJs
  const [rowHeight, setRowHeight] = useState(0); // Altura da linha
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false); // Estado para controlar a exibição do modal de confirmação
  const [selectedDJ, setSelectedDJ] = useState<DJ | null>(null); // Estado para armazenar o DJ selecionado para expulsão
  const [updatedDJId, setUpdatedDJId] = useState<number | null>(null); // ID do DJ atualizado
  const [tableRef, { height: tableHeight }] = useMeasure<HTMLDivElement>(); // Mudei para div
  const [search, setSearch] = useState('');

  const prevRanking = usePrevious(displayedRanking) || displayedRanking;
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]); // Mudei para div
  const trackActions = useTrack();

  // Efeito FLIP só para animar posições
  useEffect(() => {
    if (!rowHeight || displayedRanking.length === 0) return;

    // 1. Calcular posições antigas
    const prevPositions: { [id: number]: number } = {};
    prevRanking.forEach((dj, index) => {
      prevPositions[dj.id] = index * rowHeight;
    });

    // 2. Atualizar springs com novas posições
    api.start(index => {
      const djItem = displayedRanking[index];
      const newY = index * rowHeight;
      const prevY = prevPositions[djItem.id] ?? newY;

      return {
        y: newY,
        from: { y: prevY },
        immediate: false,
        config: { tension: 100, friction: 50 },
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayedRanking, rowHeight]);

  useEffect(() => {
      const currentDJId = dj?.id;
      const previousDJ = previousRanking.find(({ id }) => Number(id) === Number(currentDJId));
      const currentDJ = currentRanking.find(({ id }) => Number(id) === Number(currentDJId));
      const currentDJRankingChanged =
        previousDJ !== undefined &&
        currentDJ !== undefined &&
        previousDJ.ranking !== currentDJ.ranking;

      // Não destaca o DJ na carga inicial nem quando só os pontos foram alterados.
      setUpdatedDJId(null);

      // Determina qual ranking usar como base inicial
      const initialRanking = previousRanking.length > 0 
        ? [...previousRanking] 
        : [...currentRanking];
  
      // Ordena o ranking inicial
      setDisplayedRanking(
        initialRanking.sort((a, b) => {
          if (a.ranking === 0 && b.ranking === 0) return 0;
          if (a.ranking === 0) return 1; // a vai para o final
          if (b.ranking === 0) return -1; // b vai para o final
          return a.ranking - b.ranking; // ordena normalmente
        })
      );
  
      // Anima para o ranking atual após 2.5 segundos
      let t2: ReturnType<typeof setTimeout> | undefined;
      const t1 = setTimeout(() => {
        setDisplayedRanking([...currentRanking].sort((a, b) => {
          if (a.ranking === 0 && b.ranking === 0) return 0;
          if (a.ranking === 0) return 1; // a vai para o final
          if (b.ranking === 0) return -1; // b vai para o final
          return a.ranking - b.ranking; // ordena normalmente
        }));
  
        if (currentDJRankingChanged && currentDJId !== undefined) {
          t2 = setTimeout(() => {
            setUpdatedDJId(Number(currentDJId));
          }, 200);
        }
      }, 2500);
  
      return () => {
        clearTimeout(t1);
        if (t2) clearTimeout(t2);
      };
    }, [currentRanking, previousRanking, dj?.id]); // Adicione as dependências necessárias

    // Animação de pontos
    useEffect(() => {
      previousRanking.forEach((prev) => {
        setPoints((p) => ({ ...p, [prev.id]: prev.score }));
  
        const current = currentRanking.find((c) => c.id === prev.id);
        if (!current) return;
  
        const diff = current.score - prev.score;
  
        if (diff !== 0) {
          setPointDirection((dir) => ({
            ...dir,
            [prev.id]: diff > 0 ? 'up' : 'down',
          }));
  
          let c = prev.score;
          const step = diff / 20;
          const iv = setInterval(() => {
            c += step;
  
            if ((diff > 0 && c >= current.score) || (diff < 0 && c <= current.score)) {
              c = current.score;
              clearInterval(iv);
              setPointDirection((dir) => ({ ...dir, [prev.id]: null }));
            }
  
            setPoints((p) => ({ ...p, [prev.id]: Math.round(c * 10) / 10 }));
          }, 200);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentRanking]);

    // Medir altura da linha
    useEffect(() => {
      if (rowRefs.current[0]?.offsetHeight) {
        setRowHeight(rowRefs.current[0].offsetHeight);
      }
    }, [displayedRanking]);

    // Scroll para o DJ destacado
    useEffect(() => {
      if (updatedDJId !== null) {
        const el = document.getElementById(`popup-dj-${updatedDJId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, [updatedDJId]);

    const filteredRanking = displayedRanking.filter(dj =>
      dj.djName.toLowerCase().includes(search.toLowerCase())
    );

    // Springs para animação
    const [springs, api] = useSprings(
      filteredRanking.length,
      index => ({
        y: index * rowHeight,
        config: { tension: 100, friction: 50 }
      })
  );

  // Funções de expulsão
    const confirmExpelDJ = () => {
      if (selectedDJ) {
        trackActions.expelDJ(selectedDJ.id, trackToken);
        setSelectedDJ(null);
        setShowConfirmModal(false);
      }
    };
    
    const handleExpelDJ = (dj: DJ) => {
      setSelectedDJ(dj);
      setShowConfirmModal(true);
    };
  
    const formatScore = (score: number) => {
      return score.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    };

  return {
    tableRef,
    tableHeight,
    rowRefs,
    springs,
    filteredRanking,
    search,
    setSearch,
    showConfirmModal,
    setShowConfirmModal,
    selectedDJ,
    setSelectedDJ,
    points,
    pointDirection,
    updatedDJId,
    trackId,
    confirmExpelDJ,
    handleExpelDJ,
    formatScore
  };
}

export default useRankingTable;
