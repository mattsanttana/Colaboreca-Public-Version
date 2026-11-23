import '../../styles/queue/QueuePreview.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Container, Image, Spinner } from 'react-bootstrap';
import TQueue from '../../types/TQueue';
import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { logo } from '../../assets/images/characterPath';
import { useNavigate } from 'react-router-dom';
import PlayingNow from '../../types/PlayingNow';

interface Props {
  previewQueue: TQueue[];
  isLoading: boolean;
  trackId: string | undefined;
  playingNow: PlayingNow | null; // Música que está tocando atualmente
}

const QueuePreview: React.FC<Props> = ({ previewQueue, isLoading, trackId, playingNow }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  
  const expandedRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const expandedContentRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Função para rolar até o elemento expandido
  const scrollToExpanded = useCallback(() => {
    if (expandedRef.current) {
      expandedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }
  }, []);

  useLayoutEffect(() => {
    if (expandedIndex !== null) {
      const timeout = setTimeout(() => {
        scrollToExpanded();
      }, 50); // pequeno delay só pra garantir a animação de altura

      return () => clearTimeout(timeout);
    }
  }, [expandedIndex, scrollToExpanded]);

  // Efeito para reajustar scroll quando o conteúdo expandido muda
  useEffect(() => {
    const handleResize = () => {
      if (expandedIndex !== null) {
        scrollToExpanded();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [expandedIndex, scrollToExpanded]);

  return (
    <Container className='py-4 p-0'>
      <Card className='text-center text-light m-0 p-0 queue-preview-card'
>
        <Card.Body className="queue-preview-body">
          <div
            className="d-flex align-items-center justify-content-between mb-3"
          >
            <Card.Title className="mb-0 text-start queue-preview-mb-0">
              A seguir:
            </Card.Title>

            <span
              onClick={() =>
                navigate( `/track/queue/${ trackId }`) 
              }
              style={{
                fontSize: '0.85em',
                cursor: 'pointer',
                color: '#e6a700',
                opacity: 0.8
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
            >
              Ver fila →
            </span>
          </div>  
          { isLoading ? (
            <div className="d-flex align-items-center justify-content-center flex-grow-1">
              <Spinner animation='border' variant='light' />
            </div>
          ) : (
            <div className="queue-preview-wrapper" 
 
              ref={scrollContainerRef}
            >
              <AnimatePresence mode="popLayout">
                { previewQueue.map((track, index) => (
                  <motion.div
                    key={ track.id }
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: "tween", duration: 0.4, ease: "easeInOut" }}
                    className="mb-2"
                    ref={ expandedIndex === index ? expandedRef : null }
                  >
                    { /* Item principal (sempre visível) */ }
                    <motion.div
                      onClick={ () => toggleExpand(index) }
                      style={{ 
                        background: 'rgba(255, 255, 255, 0.05)',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        padding: '8px',
                      }}
                      whileHover={{ background: 'rgba(255, 255, 255, 0.1)' }}
                      className="d-flex align-items-center"
                    >
                      <div className="me-2 queue-preview-wrapper-2">
                        {index + 1}
                      </div>
                      
                      <Image 
                        src={track.cover}
                        alt={`Capa da música ${ track.musicName || 'Desconhecida' }`}

                        className="me-3 queue-preview-image"
                      />
                      
                      <div className="queue-preview-wrapper-3">
                        <div 
                          className="text-truncate queue-preview-text-truncate" 

                        >
                          { track.musicName || 'Música Desconhecida' }
                        </div>
                        <div 
                          className="text-truncate queue-preview-text-truncate-2" 

                        >
                          { track.artists || 'Artista Desconhecido' }
                        </div>
                      </div>

                      {/* Ícone de expansão */}
                      <motion.div className="queue-preview-wrapper-4"
                        animate={{ rotate: expandedIndex === index ? 180 : 0 }}
                        transition={{ duration: 0.3 }}

                      >
                        ▼
                      </motion.div>
                    </motion.div>

                    {/* Conteúdo expandido (acordeão) */}
                    <AnimatePresence>
                      { expandedIndex === index && (
                        <motion.div
                          ref={expandedContentRef}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{
                            height: { duration: 0.3 },
                            opacity: { duration: 0.2 }
                          }}
                          onAnimationComplete={() => {
                            expandedContentRef.current?.scrollIntoView({
                              behavior: 'smooth',
                              block: 'center',
                            });
                          }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div className="queue-preview-wrapper-5"

                          >
                            {/* Imagem do personagem/DJ */}
                            { track.characterPath ? (
                              <Image
                                src={ track.characterPath }
                                alt={ `Imagem do DJ ${ track.addedBy || 'Desconhecido' }` }
                                className='dj-character-hover'
                                onClick={ () => navigate( `/track/profile/${ trackId }/${ track.djId }` )}
                                style={{
                                  width: '45px',
                                  height: '45px',
                                  backgroundColor: '#2e30594D',
                                  borderRadius: '4px',
                                  border: '1px solid rgba(255, 255, 255, 0.2)',
                                  flexShrink: 0,
                                  cursor: 'pointer',
                                }}
                              />
                            ) : (
                              <Image
                                alt='Logo do Colaboreca'
                                className='img-thumbnail queue-preview-image-2'

                                src={logo}
                              />
                            )}

                            {/* Info do DJ que adicionou */}
                            <div className="queue-preview-wrapper-6">
                              <span className="queue-preview-label">
                                Adicionado por:
                              </span>
                              <strong className="queue-preview-emphasis">
                                {track.addedBy || 'Desconhecido'}
                              </strong>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
              { previewQueue.length === 0 && !isLoading && (
                <div className="text-center py-5 queue-preview-py-5">
                  { !playingNow
                    ? 'Ops! Perdemos a conexão com o Spotify, possivelmente por inatividade.'
                    : 'A DJ Dani (inteligência artificial do Spotify) assumiu a reprodução. Por isso, não conseguimos exibir as informações da fila.' }
                </div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default QueuePreview;
