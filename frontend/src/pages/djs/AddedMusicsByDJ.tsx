import '../../styles/djs/AddedMusicsByDJ.css';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, Container, Form, Image } from 'react-bootstrap';
import { DJMusic } from '../../types/SpotifySearchResponse';
import socket from '../../utils/socket';

// Props para o componente AddedMusicsByDJ
interface Props {
  addedMusics: DJMusic[]; // Lista de músicas adicionadas pelo DJ
}

// Componente AddedMusicsByDJ
const AddedMusicsByDJ: React.FC<Props> = ({ addedMusics }) => {
  const [liveAddedMusics, setLiveAddedMusics] = useState(addedMusics);
  const [addedMusicsFilter, setAddedMusicsFilter] = useState<'all' | 'played' | 'not played'>('all'); // Estado para controlar o filtro de músicas (1: Todas, 2: Tocadas, 3: Não tocadas)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const expandedRef = useRef<HTMLDivElement>(null);
  const expandedContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLiveAddedMusics(addedMusics);
  }, [addedMusics]);

  useEffect(() => {
    const handleNewVote = (data: { musicId: number; vote: keyof DJMusic['voteCounts'] }) => {
      setLiveAddedMusics((currentMusics) => currentMusics.map((music) => (
        music.id === Number(data.musicId)
          ? { ...music, voteCounts: { ...music.voteCounts, [data.vote]: music.voteCounts[data.vote] + 1 } }
          : music
      )));
    };

    socket.on('new vote', handleNewVote);
    return () => {
      socket.off('new vote', handleNewVote);
    };
  }, []);

  const musicsToShow = liveAddedMusics.filter((music) => {
    if (addedMusicsFilter === 'played') return music.wasPlayed;
    if (addedMusicsFilter === 'not played') return !music.wasPlayed;
    return true;
  });

  const toggleExpand = (index: number) => {
    setExpandedIndex((current) => current === index ? null : index);
  };

  const scrollToExpanded = useCallback(() => {
    expandedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
  }, []);

  useLayoutEffect(() => {
    if (expandedIndex === null) return undefined;

    const timeout = setTimeout(scrollToExpanded, 50);
    return () => clearTimeout(timeout);
  }, [expandedIndex, scrollToExpanded]);

  useEffect(() => {
    const handleResize = () => {
      if (expandedIndex !== null) scrollToExpanded();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [expandedIndex, scrollToExpanded]);

  // Renderiza o componente DJProfile
  return (
    <Card className='gradient-border dj-added-musics'>
      { /* Formulário para filtrar as músicas adicionadas pelo DJ */ }
      <Container
        // Estilo do container para o filtro de músicas
        className='dj-music-filter-container'
      >
        <Form.Select
          className='text-light dj-music-filter' // Classe para aplicar cor ao texto
          onChange={ e => setAddedMusicsFilter(e.target.value as 'all' | 'played' | 'not played') } // Função para atualizar o filtro quando o valor mudar
          value={ addedMusicsFilter } // Valor selecionado do filtro
        >
          <option value='all'>Todas</option> { /* Opção para renderizar todas as músicas adicionadas pelo DJ */ }
          <option value='played'>Tocadas</option> { /* Opção para renderizar apenas as músicas tocadas */ }
          <option value='not played'>Não tocadas</option> { /* Opção para renderizar apenas as músicas não tocadas */ }
        </Form.Select>
      </Container>
      { /* Renderiza o card com as músicas adicionadas pelo DJ */ }
      <Card.Body className='dj-added-musics-body'>
        { /* Título do card */ }
        <Card.Title className='dj-added-musics-title'>Músicas adicionadas:</Card.Title>
        { musicsToShow.length > 0 ? (
          <Container className='p-0'>
            <AnimatePresence mode='popLayout'>
              { musicsToShow.map((music, index) => {
                const voteData = [
                  { name: 'Hino', value: music.voteCounts.very_good },
                  { name: 'Boa', value: music.voteCounts.good },
                  { name: 'Tanto faz', value: music.voteCounts.normal },
                  { name: 'Ruim', value: music.voteCounts.bad },
                  { name: 'Ninguém merece', value: music.voteCounts.very_bad },
                ];

                return (
                  <motion.div
                    key={ music.id }
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: 'tween', duration: 0.4, ease: 'easeInOut' }}
                    className='mb-2'
                    ref={ expandedIndex === index ? expandedRef : null }
                  >
                    <motion.div
                      onClick={ () => toggleExpand(index) }
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        padding: '8px',
                      }}
                      whileHover={{ background: 'rgba(255, 255, 255, 0.1)' }}
                      className='d-flex align-items-center'
                    >
                      <div className='me-2 added-musics-by-dj-wrapper'>
                        { index + 1 }
                      </div>
                      <Image
                        src={ music.cover }
                        alt={`Capa da música ${music.name || 'Desconhecida'}`}

                        className='me-3 added-musics-by-dj-image'
                      />
                      <div className="added-musics-by-dj-wrapper-2">
                        <div className='text-truncate added-musics-by-dj-text-truncate'>
                          { music.name || 'Música Desconhecida' }
                        </div>
                        <div className='text-truncate added-musics-by-dj-text-truncate-2'>
                          { music.artists || 'Artista Desconhecido' }
                        </div>
                      </div>
                      <motion.div className="added-musics-by-dj-wrapper-3"
                        animate={{ rotate: expandedIndex === index ? 180 : 0 }}
                        transition={{ duration: 0.3 }}

                      >
                        ▼
                      </motion.div>
                    </motion.div>

                    <AnimatePresence>
                      { expandedIndex === index && (
                        <motion.div
                          ref={ expandedContentRef }
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ height: { duration: 0.3 }, opacity: { duration: 0.2 } }}
                          onAnimationComplete={() => expandedContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                          style={{ overflow: 'hidden' }}
                        >
                          <div className="added-musics-by-dj-wrapper-4"

                          >
                            { voteData.some((item) => item.value > 0) ? (
                              <div className='dj-music-vote-chart'>
                                <ResponsiveContainer height='100%' width='100%'>
                                  <BarChart data={ voteData } layout='vertical'>
                                    <defs>
                                      <linearGradient id='addedMusicVoteGradient' x1='0' y1='0' x2='1' y2='0'>
                                        <stop offset='0%' stopColor='#fff4c2' />
                                        <stop offset='33%' stopColor='#494c80' />
                                        <stop offset='66%' stopColor='#2e3059' />
                                        <stop offset='100%' stopColor='#186ea7' />
                                      </linearGradient>
                                    </defs>
                                    <XAxis
                                      allowDecimals={ false }
                                      domain={[0, (dataMax: number) => Math.max(5, Math.ceil(dataMax * 1.2))]}
                                      type='number'
                                      tick={{ fontSize: 12, fill: '#a8dadc', fontWeight: 'bold' }}
                                      tickCount={ 4 }
                                      axisLine={{ stroke: '#494c80' }}
                                      tickLine={ false }
                                    />
                                    <YAxis
                                      dataKey='name'
                                      tick={{ fontSize: 11, fill: '#a8dadc', fontWeight: 'bold' }}
                                      type='category'
                                      width={ 100 }
                                      axisLine={{ stroke: '#494c80' }}
                                      tickLine={ false }
                                    />
                                    <Tooltip
                                      cursor={{ fill: '#ffb70322' }}
                                      contentStyle={{
                                        background: '#222',
                                        border: '1px solid #494c80',
                                        color: '#fff',
                                        borderRadius: 8,
                                        fontWeight: 'bold',
                                      }}
                                    />
                                    <Bar
                                      dataKey='value'
                                      fill='url(#addedMusicVoteGradient)'
                                      radius={[8, 8, 8, 8]}
                                      barSize={ 18 }
                                    >
                                      <LabelList dataKey='value' position='right' fill='#fff4c2' fontSize={ 12 } fontWeight={ 700 } />
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            ) : (
                              <p className='m-0 py-4 text-center added-musics-by-dj-text'>
                                Esta música ainda não recebeu votos.
                              </p>
                            ) }
                          </div>
                        </motion.div>
                      ) }
                    </AnimatePresence>
                  </motion.div>
                );
              }) }
            </AnimatePresence>
          </Container>
        ) : (
          <Container>
            <h4 className='text-light dj-music-empty'>
              { liveAddedMusics.length === 0 ? 'O DJ ainda não adicionou nenhuma música' : 'Nenhuma música encontrada com este filtro' }
            </h4>
          </Container>
        )}
      </Card.Body>
    </Card>
  )
}

export default AddedMusicsByDJ; // Exporta o componente AddedMusicsByDJ
