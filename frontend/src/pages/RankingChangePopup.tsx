import { Modal, Table, Card } from "react-bootstrap";
import React, { useState, useEffect, useRef } from "react";
import { useSpring, animated, useTransition } from "@react-spring/web";
import { podium } from "../assets/images/characterPath";
import { DJ } from "../types/DJ";

interface Props {
  dj: DJ;
  previousRanking: DJ[];
  currentRanking: DJ[];
  showRankingChangePopup: boolean;
  handleClose: () => void;
}

const RankingChangePopup: React.FC<Props> = ({ dj, previousRanking, currentRanking, showRankingChangePopup, handleClose }) => {
  // Estados
  const [showPodium, setShowPodium] = useState(false);
  const [showRanking, setShowRanking] = useState(true);
  const [djPodium, setPodium] = useState<DJ[]>([]);
  const [points, setPoints] = useState<{ [key: number]: number }>({});
  const [updatedDJId, setUpdatedDJId] = useState<number | null>(null);
  const [rowHeight, setRowHeight] = useState(0);
  const [displayedRanking, setDisplayedRanking] = useState<DJ[]>(previousRanking);

  const sampleRowRef = useRef<HTMLTableRowElement>(null);

  // 1) Animação de flip do ranking
  const rankingChangeAnimation = useSpring({
    from: { opacity: 0, transform: "translateY(-20px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
    config: { duration: 800 },
    onRest: () => {
      // Quando terminar o flip, se o usuário subiu pro top3, fecha ranking e abre pódio
      if (currentRanking.some((it) => it.id === dj.id && it.ranking <= 3)) {
        setTimeout(() => {
          setShowRanking(false);
          setShowPodium(true);
        }, 5000);
      }
    },
  });

  // 2) Animação de pulo no DJ que mudou
  const jumpAnimation = useSpring({
    from: { transform: "translateY(0px)" },
    to: { transform: "translateY(-10px)" },
    config: { duration: 300 },
    loop: { reverse: true },
  });

  // 3) Transição de posição das linhas
  const transitions = useTransition(displayedRanking, {
    keys: (it: DJ) => it.id,
    from: (it) => {
      const prevIdx = previousRanking.findIndex((d) => d.id === it.id);
      const curIdx = currentRanking.findIndex((d) => d.id === it.id);
      const h = rowHeight || 50;
      return { opacity: 0, transform: `translateY(${(prevIdx - curIdx) * h}px)` };
    },
    enter: { opacity: 1, transform: "translateY(0px)" },
    config: { duration: 800 },
  });

  // 4) Quando abrir popup: primeiro ranking antigo, depois flip pro novo, depois highlight
  useEffect(() => {
    if (!showRankingChangePopup) return;

    // 4.1 exibe ranking antigo
    setDisplayedRanking([...previousRanking].sort((a, b) => b.score - a.score));

    // 4.2 após 1.9s, faz flip pro novo ranking
    const t1 = setTimeout(() => {
      setDisplayedRanking([...currentRanking].sort((a, b) => b.score - a.score));

      // 4.3 só após a animação de 800ms, acende o highlight
      const t2 = setTimeout(() => {
        setUpdatedDJId(Number(dj.id));
      }, 800);

      return () => clearTimeout(t2);
    }, 2500);

    return () => clearTimeout(t1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRankingChangePopup]);

  // 5) Agora que o usuário já está no pódio, monta o array correto
  useEffect(() => {
    if (!showPodium) return;
    const top3 = [...currentRanking]
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    setPodium(top3);
  }, [showPodium, currentRanking]);

  // 6) Pontos animados **imediatamente** ao abrir o popup
  useEffect(() => {
    if (!showRankingChangePopup) return;

    previousRanking.forEach((prev) => {
      const cur = currentRanking.find((it) => it.id === prev.id);
      if (!cur) return;

      // inicia no valor antigo
      setPoints((p) => ({ ...p, [prev.id]: prev.score }));

      const diff = cur.score - prev.score;
      if (diff > 0) {
        let c = prev.score;
        const iv = setInterval(() => {
          c += 1;
          setPoints((p) => ({ ...p, [prev.id]: c }));
          if (c >= cur.score) clearInterval(iv);
        }, 1000); // <--- intervalo menor para ver a contagem fluir
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRankingChangePopup]);

  // 7) Mede altura da linha
  useEffect(() => {
    if (sampleRowRef.current) {
      const h = sampleRowRef.current.offsetHeight;
      setRowHeight(h > 0 ? h : 50);
    }
  }, [showRankingChangePopup]);

  // 8) Rola até o DJ destacado (highlight)
  useEffect(() => {
    if (updatedDJId !== null) {
      const el = document.getElementById(`dj-${updatedDJId}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [updatedDJId]);

  // 9) Reset ao fechar
  useEffect(() => {
    if (!showRankingChangePopup) {
      setShowRanking(true);
      setShowPodium(false);
      setUpdatedDJId(null);
      setPoints({});
    }
  }, [showRankingChangePopup]);

  return (
    <Modal className="custom-modal custom-modal-header" show={showRankingChangePopup} onHide={handleClose}>
      <Modal.Header closeButton style={{ borderBottom: "none" }}>
        <Modal.Title>Você subiu no ranque!</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {showRanking && (
          <div className="table-responsive">
            <Table striped>
              <thead>
                <tr>
                  <th className="text-light" style={{ backgroundColor: "#000000", borderBottom: "none" }}></th>
                  <th className="text-light" style={{ backgroundColor: "#000000", borderBottom: "none" }}>
                    Ranque
                  </th>
                  <th className="text-light" style={{ backgroundColor: "#000000", borderBottom: "none" }}>
                    Vulgo
                  </th>
                  <th className="text-light" style={{ backgroundColor: "#000000", borderBottom: "none" }}>
                    Pontos
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Linha usada para medir a altura */}
                <tr ref={sampleRowRef} style={{ visibility: 'hidden', position: 'absolute' }}>
                  <td />
                  <td />
                  <td />
                  <td />
                </tr>
                {transitions((style, item) => (
                  <animated.tr
                    key={item.id}
                    id={`dj-${item.id}`} // ID único baseado no DJ
                    className={Number(item.id) === Number(updatedDJId) ? 'highlighted' : ''}
                    style={{ ...style, ...rankingChangeAnimation }}
                  >
                    <td
                      className="text-light"
                      style={{ backgroundColor: "#000000", borderBottom: "none" }}
                    >
                      <img
                        src={item.characterPath}
                        alt={item.djName}
                        className="img-thumbnail img-thumbnail-hover"
                        style={{
                          width: '50px',
                          height: '50px',
                          cursor: 'pointer',
                          backgroundColor: '#000000',
                          border:
                            item.ranking === 1
                              ? '2px solid #FFD700'
                              : item.ranking === 2
                              ? '2px solid #C0C0C0'
                              : item.ranking === 3
                              ? '2px solid #CD7F32'
                              : 'none',
                          boxShadow:
                            item.ranking === 1
                              ? '0 0 10px #FFD700'
                              : item.ranking === 2
                              ? '0 0 10px #C0C0C0'
                              : item.ranking === 3
                              ? '0 0 10px #CD7F32'
                              : 'none',
                        }}
                      />
                    </td>
                    <td
                      className="text-light"
                      style={{ backgroundColor: "#000000", borderBottom: "none" }}
                    >
                      {item.ranking === 0 ? "-" : item.ranking}
                    </td>
                    <td
                      className="text-light"
                      style={{ backgroundColor: "#000000", borderBottom: "none" }}
                    >
                      {item.djName}
                    </td>
                    <td
                      className="text-light"
                      style={{ backgroundColor: "#000000", borderBottom: "none" }}
                    >
                      {points[Number(item.id)] !== undefined ? points[Number(item.id)] : item.score}
                    </td>
                  </animated.tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
        {showPodium && (
          <div className="d-flex justify-content-center align-items-center">
            <img src={podium} alt="podium" style={{ width: '300px', marginLeft: '30px' }} />
            <div>
              {djPodium[0] && (
                <div>
                  <animated.div
                    key={djPodium[0].id}
                    style={djPodium[0].id === dj.id ? jumpAnimation : {}}
                  >
                    <p className="text-light mt-3" style={{
                      marginLeft: '-170px',
                      marginBottom: !djPodium[1] && !djPodium[2] ? '310px' : !djPodium[2] ? '40px' : '0px',
                    }}>
                      {djPodium[0].djName}
                    </p>
                    <Card.Img
                      src={djPodium[0].characterPath}
                      alt={djPodium[0].djName}
                      style={{
                        width: '160px',
                        marginLeft: '-220px',
                        marginTop: !djPodium[1] && !djPodium[2] ? '-320px' : !djPodium[2] ? '-30px' : '-5px',
                        position: 'absolute'
                      }}
                    />
                  </animated.div>
                </div>
              )}
              {djPodium[1] && (
                <div>
                  <animated.div
                    key={djPodium[1].id}
                    style={djPodium[1].id === dj.id ? jumpAnimation : {}}
                  >
                    <p className="text-light mt-3" style={{
                      marginLeft: '-290px',
                      marginBottom: !djPodium[2] ? '300px' : '-30px'
                    }}>
                      {djPodium[1].djName}
                    </p>
                    <Card.Img
                      src={djPodium[1].characterPath}
                      alt={djPodium[1].djName}
                      style={{
                        width: '140px',
                        marginLeft: '-320px',
                        marginTop: !djPodium[2] ? '-300px' : '30px',
                        position: 'absolute'
                      }}
                    />
                  </animated.div>
                </div>
              )}
              {djPodium[2] && (
                <div>
                  <animated.div
                    key={djPodium[2].id}
                    style={djPodium[2].id === dj.id ? jumpAnimation : {}}
                  >
                    <p className="text-light mt-3" style={{
                      marginLeft: '-80px',
                      marginBottom: '260px'
                    }}>
                      {djPodium[2].djName}
                    </p>
                    <Card.Img
                      src={djPodium[2].characterPath}
                      alt={djPodium[2].djName}
                      style={{
                        width: '130px',
                        marginLeft: '-110px',
                        marginTop: '-255px',
                        position: 'absolute'
                      }}
                    />
                  </animated.div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer style={{ borderTop: "none" }}></Modal.Footer>
    </Modal>
  );
};

export default RankingChangePopup;
