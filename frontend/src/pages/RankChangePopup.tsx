import { Modal, Table, Card } from "react-bootstrap";
import React, { useState, useEffect, useRef } from "react";
import { useSpring, animated, useTransition } from "@react-spring/web";
import { podium } from '../assets/images/characterPath';
import { DJ } from "../types/DJ";

interface Props {
  dj: DJ;
  previousRank: DJ[];
  currentRank: DJ[];
  showRankChangePopup: boolean;
  handleClosePopup: () => void;
}

const RankChangePopup: React.FC<Props> = ({ dj, previousRank, currentRank, showRankChangePopup, handleClosePopup }) => {
  const [sortedRank, setSortedRank] = useState<DJ[]>([]);
  const [showPodium, setShowPodium] = useState(false);
  const [showRanking, setShowRanking] = useState(true);
  const [djPodium, setPodium] = useState<DJ[]>([]);
  const [points, setPoints] = useState<{ [key: number]: number }>({});
  const [updatedDJId, setUpdatedDJId] = useState<number | null>(null);
  const updatedDJRef = useRef<HTMLTableRowElement>(null);


  const rankChangeAnimation = useSpring({
    from: { opacity: 0, transform: "translateY(-20px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
    config: { duration: 800 },
    onRest: () => {
      if (currentRank.some((dj) => dj.id === dj?.id && dj.ranking <= 3)) {
        setTimeout(() => {
          setShowRanking(false);
          setShowPodium(true);
        }, 3000);
      }
    },
  });

  useEffect(() => {
    const sortedDJs = [...currentRank].sort((a, b) => b.score - a.score);
    const newPodium = sortedDJs.filter(dj => dj.ranking > 0).slice(0, 3);
    setSortedRank(sortedDJs);
    setPodium(newPodium);
  }, [currentRank]);

  useEffect(() => {
    if (!showRankChangePopup) {
      setShowRanking(true);
      setShowPodium(false);
    }
  }, [showRankChangePopup]);

  useEffect(() => {
    const newPoints: { [key: number]: number } = {};
    previousRank.forEach((prevDJ) => {
      const currentDJ = currentRank.find((dj) => dj.id === prevDJ.id);
      if (currentDJ) {
        newPoints[Number(prevDJ.id)] = prevDJ.score;
        const increment = currentDJ.score - prevDJ.score;
        if (increment > 0) {
          let currentPoints = prevDJ.score;
          const interval = setInterval(() => {
            currentPoints += 1;
            setPoints((prevPoints) => ({
              ...prevPoints,
              [prevDJ.id]: currentPoints,
            }));
            if (currentPoints >= currentDJ.score) {
              clearInterval(interval);
              setUpdatedDJId(Number(prevDJ.id));
            }
          }, 800); // Ajuste a velocidade da animação aqui
        }
      }
    });
  }, [previousRank, currentRank]);

  useEffect(() => {
    if (updatedDJRef.current) {
      updatedDJRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [points]);


  const jumpAnimation = useSpring({
    from: { transform: "translateY(0px)" },
    to: { transform: "translateY(-10px)" },
    config: { duration: 300 },
    loop: { reverse: true },
  });
  
  const transitions = useTransition(sortedRank, {
    key: (dj: DJ) => dj.id,
    from: (item) => {
      const prevIndex = previousRank.findIndex((dj) => dj.id === item.id);
      const currentIndex = sortedRank.findIndex((dj) => dj.id === item.id);
      const delta = prevIndex !== -1 ? (prevIndex - currentIndex) * 100 : 0; // 100px por item
      return { transform: `translateY(${delta}px)` }; // Desloca conforme a troca de lugar
    },
    enter: { transform: "translateY(0px)" }, // Finaliza na posição normal
    leave: { transform: "translateY(0px)" }, // Mantém a posição normal
    update: (item) => {
      const prevIndex = previousRank.findIndex((dj) => dj.id === item.id);
      const currentIndex = sortedRank.findIndex((dj) => dj.id === item.id);
      const delta = prevIndex !== -1 ? (prevIndex - currentIndex) * 100 : 0; // Delta baseado na troca
      return { transform: `translateY(${delta}px)` };
    },
    config: { duration: 800 }, // Suavidade da animação
  });

  return (
    <Modal className="custom-modal custom-modal-header" show={showRankChangePopup} onHide={handleClosePopup}>
      <Modal.Header closeButton style={{ borderBottom: "none" }}>
        <Modal.Title> Você subiu no ranque! </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {showRanking && (
          <div className="table-responsive">
            <Table striped>
              <thead>
                <tr>
                  <th
                    className="text-light"
                    style={{ backgroundColor: "#000000", borderBottom: "none" }}
                  >
                  </th>
                  <th
                    className="text-light"
                    style={{ backgroundColor: "#000000", borderBottom: "none" }}
                  >
                    Ranque
                  </th>
                  <th
                    className="text-light"
                    style={{ backgroundColor: "#000000", borderBottom: "none" }}
                  >
                    Vulgo
                  </th>
                  <th
                    className="text-light"
                    style={{ backgroundColor: "#000000", borderBottom: "none" }}
                  >
                    Pontos
                  </th>
                </tr>
              </thead>
              <tbody>
                {transitions((style, dj) => (
                  <animated.tr
                    key={dj.id}
                    ref={dj.id === updatedDJRef.current?.id ? updatedDJRef : null}
                    className={Number(dj.id) === Number(updatedDJId) ? 'highlighted' : ''}
                    style={{ ...style, ...rankChangeAnimation }}>
                    <td
                      className="text-light"
                      style={{
                        backgroundColor: "#000000",
                        borderBottom: "none",
                      }}
                    >
                      <img
                        src={dj.characterPath}
                        alt={dj.djName}
                        className="img-thumbnail img-thumbnail-hover"
                        style={{ 
                          width: '50px',
                          height: '50px',
                          cursor: 'pointer',
                          backgroundColor: '#000000',
                          border: dj.ranking === 1
                            ? '2px solid #FFD700'
                            : dj.ranking === 2
                            ? '2px solid #C0C0C0'
                            : dj.ranking === 3
                            ? '2px solid #CD7F32'
                            : 'none',
                          boxShadow: dj.ranking === 1 
                            ? '0 0 10px #FFD700' 
                            : dj.ranking === 2 
                            ? '0 0 10px #C0C0C0' 
                            : dj.ranking === 3 
                            ? '0 0 10px #CD7F32' 
                            : 'none',
                        }} 
                      />
                    </td>
                    <td
                      className="text-light"
                      style={{
                        backgroundColor: "#000000",
                        borderBottom: "none",
                      }}
                    >
                      {dj.ranking === 0 ? "-" : dj.ranking}
                    </td>
                    <td
                      className="text-light"
                      style={{
                        backgroundColor: "#000000",
                        borderBottom: "none",
                      }}
                    >
                      {dj.djName}
                    </td>
                    <td
                      className="text-light"
                      style={{
                        backgroundColor: "#000000",
                        borderBottom: "none",
                      }}
                    >
                      {points[Number(dj.id)] !== undefined ? points[Number(dj.id)] : dj.score}
                    </td>
                  </animated.tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
        {showPodium && (
          <div className="d-flex justify-content-center align-items-center">
            <img src={podium} alt="podium" style={{ width: '300px', marginLeft: '30px'}} />
            <div>
              {djPodium[0] && (
                <div>
                    <animated.div
                      key={djPodium[0].id}
                      style={djPodium[0].id === dj?.id ? jumpAnimation : {}}
                    >
                      <p className="text-light mt-3" style={{
                        marginLeft: '-160px',
                        marginBottom: !djPodium[1] && !djPodium[2] ? '310px' : !djPodium[2] ? '40px' : '0px',
                        }}
                      >
                          {djPodium[0].djName}
                      </p>
                      <Card.Img
                        src={djPodium[0].characterPath}
                        alt={djPodium[0].djName}
                        style={{
                          width: '160px',
                          marginLeft: '-220px',
                          marginTop: !djPodium[1] && !djPodium[2] ? '-320px' : !djPodium[2] ? '-30px' : '-5px',
                          position: 'absolute' }}
                      />
                    </animated.div>
                </div>
              )}
              {djPodium[1] && (
                <div>
                    <animated.div
                      key={djPodium[1].id}
                      style={djPodium[1].id === dj?.id ? jumpAnimation : {}}
                    >
                      <p className="text-light mt-3" style={{
                        marginLeft: '-290px',
                        marginBottom: !djPodium[2] ? '300px' : '-30px' 
                        }}
                      >
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
                      style={djPodium[2].id === dj?.id ? jumpAnimation : {}}
                    >
                      <p className="text-light mt-3" style={{ marginLeft: '-80px', marginBottom: '260px' }}>{djPodium[2].djName}</p>
                      <Card.Img
                        src={djPodium[2].characterPath}
                        alt={djPodium[2].djName}
                        style={{ width: '130px', marginLeft: '-110px', marginTop: '-255px', position: 'absolute' }}
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

export default RankChangePopup;