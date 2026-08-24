import { motion, AnimatePresence } from 'framer-motion';
import { Card, Container, Image, Spinner } from 'react-bootstrap';
import TQueue from '../types/TQueue';
import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { logo } from '../assets/images/characterPath';
import { useNavigate } from 'react-router-dom';

interface Props {
  previewQueue: TQueue[];
  isLoading: boolean;
  trackId: string | undefined;
}

const QueuePreview: React.FC<Props> = ({ previewQueue, isLoading, trackId }) => {
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
      <Card className='text-center text-light m-0 p-0'
        style={{ boxShadow: '0 0 0 0.5px #ffffff', padding: 0, margin: 0 }}>
        <Card.Body style={{ height: '360px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div
            className="d-flex align-items-center justify-content-between mb-3"
          >
            <Card.Title className="mb-0 text-start" style={{ color: '#fff4c2'}}>
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
            <div 
              style={{ 
                flex: 1, 
                overflowY: 'auto',
                overflowX: 'hidden',
                position: 'relative'
              }} 
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
                      <div className="me-2" style={{ width: '24px', opacity: 0.7, fontWeight: 'bold' }}>
                        {index + 1}
                      </div>
                      
                      <Image 
                        src={track.cover}
                        alt={`Capa da música ${ track.musicName || 'Desconhecida' }`}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                        className="me-3"
                      />
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div 
                          className="text-truncate" 
                          style={{ 
                            fontWeight: 'bold', 
                            fontSize: '0.9em',
                            color: '#fff4c2',
                            textAlign: 'left'
                          }}
                        >
                          { track.musicName || 'Música Desconhecida' }
                        </div>
                        <div 
                          className="text-truncate" 
                          style={{ 
                            fontSize: '0.8em', 
                            opacity: 0.7,
                            color: '#fff4c2',
                            textAlign: 'left'
                          }}
                        >
                          { track.artists || 'Artista Desconhecido' }
                        </div>
                      </div>

                      {/* Ícone de expansão */}
                      <motion.div
                        animate={{ rotate: expandedIndex === index ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ marginLeft: '8px', fontSize: '12px' }}
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
                          <div
                            style={{
                              background: 'rgba(255, 255, 255, 0.08)',
                              borderRadius: '4px',
                              marginTop: '8px',
                              padding: '12px',
                              fontSize: '0.85em',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '12px',
                            }}
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
                                className='img-thumbnail'
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  backgroundColor: '#2e30594D',
                                  borderRadius: '4px',
                                  border: '1px solid rgba(255, 255, 255, 0.2)',
                                  flexShrink: 0,
                                }}
                                src={logo}
                              />
                            )}

                            {/* Info do DJ que adicionou */}
                            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                              <span style={{ 
                                opacity: 0.7,
                                color: '#fff4c2',
                                textAlign: 'left'
                              }}>
                                Adicionado por:
                              </span>
                              <strong style={{ 
                                color: '#fff4c2',
                                textAlign: 'left'
                              }}>
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
                <div className="text-center py-5" style={{ opacity: 0.5 }}>
                  Dispositivo Desconectado
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