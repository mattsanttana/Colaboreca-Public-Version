import React, { useState, useEffect, useRef, useCallback, lazy, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaPaperPlane, FaArrowLeft, FaReply, FaTimes } from 'react-icons/fa';
import { connect } from 'react-redux';
import { Container, Row, Col, Button, Form, ListGroup, Image, OverlayTrigger, Popover } from 'react-bootstrap';
import { io } from 'socket.io-client';
import { RootState } from '../redux/store';
import MessagePopup from './MessagePopup';
import useDJ from '../utils/useDJ';
import useTrack from '../utils/useTrack';
import usePlayback from '../utils/usePlayback';
import useVote from '../utils/useVote';
import PlayingNow from '../types/PlayingNow';
import { DJ, DJPlayingNow } from '../types/DJ';
import { logo } from '../assets/images/characterPath';
import useMessage from '../utils/useMessage';
import { Chats, Message } from '../types/Chat';
const Header = lazy(() => import('./Header'));
const Menu = lazy(() => import('./Menu'));
const VotePopup = lazy(() => import('./VotePopup'));

interface Props {
  token: string;
}

const socket = io('http://localhost:3001');

const Chat: React.FC<Props> = ({ token }) => {
  const { trackId } = useParams();
  const { djChat } = useParams();
  const [trackName, setTrackName] = useState('');
  const [dj, setDJ] = useState<DJ>();
  const [djs, setDJs] = useState<DJ[]>([]);
  const [playingNow, setPlayingNow] = useState<PlayingNow | null>(null);
  const [djPlayingNow, setDJPlayingNow] = useState<DJPlayingNow | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [redirectTo, setRedirectTo] = useState<string | undefined>(undefined);
  const [showVotePopup, setShowVotePopup] = useState<boolean | undefined>(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedDJChat, setSelectedDJChat] = useState<string | number | null>(null);
  const [chats, setChats] = useState<Chats>({});
  const [message, setMessage] = useState('');
  const [unreadMessages, setUnreadMessages] = useState<{ [key: string]: number }>({});
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [djTyping, setDJTyping] = useState<{ [key: string]: { isTyping: boolean, typingDJId: string } }>({});
  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
  const [messageToReply, setMessageToReply] = useState<Message | null>(null);
  const [inputHeight, setInputHeight] = useState(0); // valor inicial (por exemplo, 50px)

  const djActions = useDJ();
  const trackActions = useTrack();
  const playbackActions = usePlayback();
  const voteActions = useVote();
  const messageActions = useMessage();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const interval = useRef<number | null>(null);
  const typingTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    if (djChat && !selectedChat) {
      let chatFound = false;
      for (const chatId in chats) {
        if (chatId === 'general') continue;
        const chat = chats[chatId];
        // Verifica todas as mensagens na conversa
        for (const message of chat) {
          if (Number(message.djId) === Number(djChat) || Number(message.receiveDJId) === Number(djChat)) {
            setSelectedChat(chatId);
            setSelectedDJChat(Number(djChat));
            chatFound = true;
            break;
          }
        }
        if (chatFound) break;
      }
      if (!chatFound) {
        setSelectedChat(null);
        setSelectedDJChat(Number(djChat));
      }
    }
  }, [chats, djChat, selectedChat]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const djMessages = await messageActions.getAllMessagesForThisDJ(token);

        if (djMessages?.status === 200) {
          const newChats = djMessages.data.reduce((acc: Chats, message: Message) => {
            const chatId = message.chatId || 'general';
            acc[chatId] = [
              ...(acc[chatId] || []),
              {
                id: message.id,
                djId: message.djId,
                receiveDJId: message.receiveDJId,
                message: message.message,
                createdAt: new Date(message.createdAt),
                read: message.read
              }
            ];
            return acc;
          }, {} as Chats);

          setChats(newChats);
          setMessagesLoaded(true);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!messagesLoaded) return; // Verifica se as mensagens foram carregadas

    const calculateUnreadMessages = () => {
      const unreadCounts = Object.keys(chats).reduce((acc, chatId) => {
        if (chatId === 'general') return acc; // Ignora o chat geral
        const unreadCount = chats[chatId].filter(message => !message.read && message.receiveDJId === dj?.id).length;
        
        if (unreadCount > 0) {
          acc[chatId] = unreadCount;
        }
        return acc;
      }, {} as { [key: string]: number });
  
      setUnreadMessages(unreadCounts);
    };
  
    calculateUnreadMessages();
  }, [chats, messagesLoaded, dj?.id]);

  useEffect(() => {
      const fetchData = async () => {
        if (trackId) {
          try {
            const [fetchedTrack, fetchedDJData] = await Promise.all([
              trackActions.getTrackById(trackId),
              djActions.getDJData(token)
            ]);
  
            if (!fetchedDJData?.data.dj) {
              setPopupMessage('Você não é um DJ desta pista, por favor faça login');
              setRedirectTo('/enter-track');
              setShowPopup(true);
            }
  
            if (fetchedTrack?.status === 200) {
              setTrackName(fetchedTrack.data.trackName);
              setDJs(fetchedDJData?.data.djs);
              setDJ(fetchedDJData?.data.dj);
            } else {
              setPopupMessage('Esta pista não foi encontrada');
              setRedirectTo('/enter-track');
              setShowPopup(true);
            }

          } catch (error) {
            console.error("Error fetching data:", error);
          } finally {
            setIsLoading(false);
          }
        }
      };
  
      fetchData();
  
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      const fetchData = async () => {
        if (trackId && playingNow) {
  
          // Limpar os votos quando a URI da música atual mudar
          setDJPlayingNow(null);
  
          try {
            const [fetchedVerifyIfDJHasAlreadVoted, fetchedDJPlayingNow] = await Promise.all([
              voteActions.verifyIfDJHasAlreadVoted(token),
              playbackActions.getDJAddedCurrentMusic(trackId)
            ]);
  
            setShowVotePopup(fetchedVerifyIfDJHasAlreadVoted);
            setDJPlayingNow(fetchedDJPlayingNow);
      
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        }
      };
  
      fetchData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playingNow?.item?.uri || '']);

  useEffect(() => {
    const fetchData = async () => {
      if (trackId) {
        try {
          const fetchedPlayingNow = await playbackActions.getState(trackId)

          setPlayingNow(fetchedPlayingNow);
          
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    interval.current = window.setInterval(() => {
      fetchData();
    }, 10000);

    return () => {
      if (interval.current) {
        clearInterval(interval.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleSocketConnect = () => {
      // Solicita a entrada na sala geral
      socket.emit('joinRoom', `general_${trackId}`);
  
      // Entra na sala do usuário se o DJ estiver disponível
      if (dj) {
        socket.emit('joinRoom', `user_${dj.id}`);
      }
    };
  
    const handleTrackDeleted = (data: { trackId: number }) => {
      if (Number(trackId) === Number(data.trackId)) {
        setPopupMessage('Esta pista foi deletada');
        setRedirectTo('/enter-track');
        setShowPopup(true);
      }
    };
  
    const handleDJCreated = (data: { dj: DJ }) => {
      setDJs((prevDJs) => [...prevDJs, data.dj]);
    };
  
    const handleDJUpdated = (data: { dj: DJ }) => {
      setDJs((prevDJs) =>
        prevDJs.map((dj) => {
          if (Number(dj.id) === Number(data.dj.id)) {
            return data.dj;
          }
          return dj;
        })
      );
  
      if (Number(dj?.id) === Number(data.dj.id)) {
        setDJ(data.dj);
      }
    };
  
    const handleDJDeleted = (data: { djId: number }) => {
      if (Number(dj?.id) === Number(data.djId)) {
        setPopupMessage('Você foi removido desta pista');
        setRedirectTo('/enter-track');
        setShowPopup(true);
      } else {
        // Atualiza a lista de DJs removendo o DJ deletado
        setDJs((prevDJs) => prevDJs.filter((dj) => Number(dj.id) !== Number(data.djId)));
      }
    };

    const handleDJTyping = (data: { chatId: string; djId: string }) => {
      setDJTyping((prevTyping) => ({
        ...prevTyping,
        [data.chatId]: {
          isTyping: true,
          typingDJId: data.djId,
        },
      }));
  
      // Limpar o temporizador anterior, se existir
      if (typingTimeoutRef.current[data.chatId]) {
        clearTimeout(typingTimeoutRef.current[data.chatId]);
      }
  
      // Definir um novo temporizador
      typingTimeoutRef.current[data.chatId] = setTimeout(() => {
        setDJTyping((prevTyping) => ({
          ...prevTyping,
          [data.chatId]: {
            isTyping: false,
            typingDJId: '',
          },
        }));
      }, 1000);
    };
  
    socket.on('connect', handleSocketConnect);
  
    // Quando `dj` é atualizado, verifica se precisa entrar na sala do DJ
    if (socket.connected && dj) {
      socket.emit('joinRoom', `general_${trackId}`);
      socket.emit('joinRoom', `user_${dj.id}`);
    }
  
    // Recebe mensagens do servidor
    socket.on('chat message', async (message) => {
      const isChatOpen = Number(selectedChat) === Number(message.chatId);
      const isRecipient = Number(message.receiveDJId) === Number(dj?.id);
    
      if (isChatOpen && isRecipient) {
        const messageId = [message.id];
        await messageActions.markMessagesAsRead(messageId, token);
      }
      
      setChats((prevChats) => {
        const chatId = message.chatId || 'general';
        const updatedChats = { ...prevChats };
  
        // Atualizando o chat, incluindo o DJ ID e a mensagem
        updatedChats[chatId] = [
          ...(updatedChats[chatId] || []),
          {
            id: message.id,
            djId: message.djId,
            receiveDJId: message.receiveDJId,
            message: message.message,
            createdAt: message.createdAt,
            read: isChatOpen && isRecipient, // Marca como lida se o chat estiver aberto e o destinatário for o DJ atual
          },
        ];
  
        return updatedChats;
      });
    });
  
    // Recebe notificações de mensagens lidas do servidor
    socket.on('messagesMarkedAsRead', ({ messageIds }) => {
      setChats((prevChats) => {
        const updatedChats = { ...prevChats };
  
        // Atualiza o estado das mensagens para marcá-las como lidas
        Object.keys(updatedChats).forEach((chatId) => {
          updatedChats[chatId] = updatedChats[chatId].map((message) =>
            messageIds.includes(message.id) ? { ...message, read: true } : message
          );
        });
  
        return updatedChats;
      });
    });
  
    socket.emit('joinRoom', `track_${trackId}`);
    socket.on('track deleted', handleTrackDeleted);
    socket.on('dj created', handleDJCreated);
    socket.on('dj updated', handleDJUpdated);
    socket.on('dj deleted', handleDJDeleted);
    socket.on('typing', handleDJTyping);

  
    // Limpeza do evento `connect` para evitar múltiplas adições
    return () => {
      socket.off('connect', handleSocketConnect);
      socket.off('chat message');
      socket.off('messagesMarkedAsRead');
      socket.off('track deleted', handleTrackDeleted);
      socket.off('dj created', handleDJCreated);
      socket.off('dj updated', handleDJUpdated);
      socket.off('dj deleted', handleDJDeleted);
      socket.off('typing', handleDJTyping);
    };
  
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dj]);

  const closeMenu = useCallback(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeMenu]);

  // Funções para lidar com o toque
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    // Calcula a distância de deslocamento horizontal
    const distance = touchEndX - touchStartX;
    
    // Define o valor mínimo para considerar um swipe
    if (distance > 20) {
      setIsMenuOpen(true); // Abre o menu se o deslize for da esquerda para a direita
    }

    if (distance < -20) {
      setIsMenuOpen(false); // Fecha o menu se o deslize for da direita para a esquerda
    }
  };

  const handleFocus = () => {
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200); // Delay para permitir clique nos itens
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  }

  const handleChangeMessageInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);

    socket.emit('typing', {
      chatId: selectedChat,
      djId: dj?.id,
      trackId: trackId,
    });

    if (event.target.value === '') {
      setInputHeight(0);
    }
  }

  const handleSubmitMessage = async (djId: string | null, message: string, textareaElement: HTMLTextAreaElement) => {
    if (selectedDJChat) {
      const response = await messageActions.sendMessage(selectedDJChat, message, token);
         
      setSelectedChat(String(response?.data.chatId));
    } else if (djId === 'general') {
      await messageActions.sendMessage(null, message, token);
    } else {
      await messageActions.sendMessage(djId, message, token);
    }
  
    setMessage('');
    textareaElement.style.height = 'auto';
  }

  const handleMarkAsRead = async (chatId: string) => {
    const messages = chats[chatId];
    const unreadMessages = messages.filter(message => !message.read && message.djId !== dj?.id); // Filtra as mensagens não lidas e não enviadas pelo cliente
    const unreadMessageIds = unreadMessages.map(message => message.id); // Extrai os IDs das mensagens não lidas
    if (unreadMessageIds.length > 0) {
      await messageActions.markMessagesAsRead(unreadMessageIds, token);
    }
  };

  const filteredDJs = useMemo(() => {
    return djs.filter(djItem => 
      djItem.id !== dj?.id && 
      djItem.djName.toLowerCase().includes(search.toLowerCase())
    );
  }, [djs, dj, search]);

  const existingChatDJIds = useMemo(() => {
    return Object.keys(chats).reduce((acc, chatId) => {
      const chat = chats[chatId];
      const lastMessage = chat[chat.length - 1];
      const otherDJId = lastMessage.djId === dj?.id ? lastMessage.receiveDJId : lastMessage.djId;
      acc.add(otherDJId);
      return acc;
    }, new Set<string>());
  }, [chats, dj]);

  const getDJName = (djId: string | number | null | undefined) => {
    const dj = djs.find(dj => dj.id === djId);
    return dj ? `${dj.djName} ` : '';
  };

  const getDJCharacter = (djId: string | number | null) => {
    const dj = djs.find(dj => dj.id === djId);
    return dj ? dj.characterPath : logo;
  }

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Filtra a última mensagem enviada para o chat "todos"
  const lastGeneralMessage = useMemo(() => {
    const generalMessages = chats['general'] || [];
    return {
      djId: generalMessages[generalMessages.length - 1]?.djId || '',
      message: generalMessages[generalMessages.length - 1] || '',
    }
  }, [chats]);

  const isFirstMessageInSeries = (messages: { djId: string; receiveDJId: string; message: string }[], index: number) => {
    if (index === 0) return true;
    return messages[index - 1].djId !== messages[index].djId;
  };

  const handleViewProfile = (djId: string) => {
    const profileUrl = `/track/profile/${trackId}/${djId}`;
    navigate(profileUrl);
  };

  const handleStartChat = (djId: string) => {
    // Converte djId para número
    const djIdNumber = Number(djId);
  
    // Verifica se já existe um chat com o djId especificado
    let chatFound = false;
    for (const chatId in chats) {
      if (chatId === 'general') continue; // Ignora o chat geral
      const chat = chats[chatId];
      for (const message of chat) {
        if (Number(message.djId) === djIdNumber || Number(message.receiveDJId) === djIdNumber) {
          setSelectedChat(chatId);
          setSelectedDJChat(djIdNumber);
          chatFound = true;
          break;
        }
      }
      if (chatFound) break;
    }
  
    // Se o chat não existir, inicie um novo chat
    if (!chatFound) {
      setSelectedChat(null);
      setSelectedDJChat(djIdNumber);
    }
  };

  const getRankClass = (djId: string) => {
    const dj = djs.find(dj => dj.id === djId); // Supondo que você tenha uma lista de DJs com seus rankings
    if (!dj) return '';
    switch (dj.ranking) {
      case 1:
        return 'gold';
      case 2:
        return 'silver';
      case 3:
        return 'bronze';
      default:
        return '';
    }
  };

  const getMedalIcon = (djId: string) => {
    const dj = djs.find(dj => dj.id === djId); // Supondo que você tenha uma lista de DJs com seus rankings
    if (!dj) return '';
    switch (dj.ranking) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '';
    }
  }

  const handleReply = (message: Message) => {
    setMessageToReply(message);
  }

  const renderPopover = (djId: string) => (
    <Popover id={`popover-${djId}`}>
      <Popover.Body>
        <Button variant="link" onClick={() => handleViewProfile(String(djId))}>Perfil</Button>
        {(djId !== dj?.id && selectedChat === 'general') && (
          <Button variant="link" onClick={() => handleStartChat(String(djId))}>Papinho</Button>
        )}
      </Popover.Body>
    </Popover>
  );

  return (
    <div
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
    >
      <MessagePopup
        show={showPopup}
        handleClose={() => setShowPopup(false)}
        message={popupMessage}
        redirectTo={redirectTo}
      />
      {isLoading ? (
        <Container
          className="d-flex justify-content-center align-items-center"
          style={{ height: '100vh' }}
        >
          <img src={logo} alt="Loading Logo" className="logo-spinner" />
        </Container>
      ) : (
        <>
          <Container>
            <Header dj={dj} isSlideMenuOpen={isMenuOpen} toggleMenu={setIsMenuOpen}/>
            <Row>
              <Col md={3} className="d-none d-xxl-block">
                <Menu dj={dj} />
              </Col>
              <Col md={12} lg={12} xl={12} xxl={3} className={`chat-list ${!selectedChat && !selectedDJChat ? 'active' : ''}`} style={{ borderRight: '1px solid #cccccc', overflowY: 'auto', height: '90vh' }}>
                <div style={{ position: 'relative' }}>
                  <Form.Control
                    type='text'
                    placeholder='Novo papinho'
                    value={search}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className="my-3 search-input"
                    style={{ 
                      textAlign: 'center', 
                      backgroundColor: '#000000',
                      color: 'white'
                    }}
                  />
                  {showSuggestions && filteredDJs.length > 0 && (
                    <ListGroup style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000 }}>
                      {filteredDJs.filter(djItem => !existingChatDJIds.has(djItem.id)).map(djItem => (
                        <ListGroup.Item 
                          key={djItem.id} 
                          style={{ backgroundColor: '#000000', color: 'white', border: 'none' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.color = 'black';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#000000';
                            e.currentTarget.style.color = 'white';
                          }}
                          onClick={() => {
                            setSelectedDJChat(djItem.id);
                            setSelectedChat(null);
                          }}
                        >
                          {djItem.djName}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </div>
                <ListGroup>
                  <ListGroup.Item
                    className="text-center"
                    style={{
                      backgroundColor: '#000000',
                      color: 'white',
                      border: 'none',
                      borderBottom: '1px solid #cccccc',
                      paddingRight: 0,
                      paddingLeft: 0
                    }}
                  >
                    <div
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        cursor: 'pointer', 
                        textAlign: 'left',
                        backgroundColor: selectedChat === 'general' ? '#333333' : '#000000',
                      }} 
                      onClick={() => {
                        setSelectedChat('general');
                        setSelectedDJChat(null);
                      }}
                    >
                      <Image
                        src={logo}
                        alt={trackName}
                        roundedCircle
                        style={{ width: '50px', height: '50px', marginRight: '10px' }}
                      />
                      <div>
                        <h5 style={{ margin: 0}}>{trackName}</h5>
                        <p style={{ margin: 0 }}>
                          {djTyping['general']?.isTyping ? (
                            <span style={{ color: 'rgb(13, 110, 253)'}}> 
                              <strong>
                              {getDJName(djTyping['general'].typingDJId)} está digitando...
                              </strong>
                            </span>
                          ) : (
                            <>
                              <strong>
                                {lastGeneralMessage.djId === dj?.id ? 'Você' : lastGeneralMessage.djId ? getDJName(lastGeneralMessage.djId) : ''}
                              </strong>
                              {lastGeneralMessage.message.message && (
                                <>
                                  <strong>:</strong> &nbsp;
                                </>
                              )}
                              {(() => {
                                const djName = lastGeneralMessage.djId === dj?.id ? 'Você' : getDJName(lastGeneralMessage.djId);
                                const nameLength = djName.length; // Comprimento do nome + ": "
                                const maxMessageLength = 29 - nameLength;
                                return truncateText(lastGeneralMessage.message.message, maxMessageLength);
                              })()}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </ListGroup.Item>
                  {Object.keys(chats)
                    .filter(chatId => chatId !== 'general')
                    .sort((a, b) => {
                      const lastMessageA = chats[a][chats[a].length - 1];
                      const lastMessageB = chats[b][chats[b].length - 1];
                      return new Date(lastMessageB.createdAt).getTime() - new Date(lastMessageA.createdAt).getTime();
                    }).map(chatId => (
                  <ListGroup.Item
                    key={chatId}
                    className="text-center"
                    style={{
                      backgroundColor: '#000000',
                      color: 'white',
                      border: 'none',
                      borderBottom: '1px solid #cccccc',
                      paddingRight: 0,
                      paddingLeft: 0,
                      maxHeight: '100px',
                      overflowY: 'auto'
                    }}
                  >
                    <div
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        cursor: 'pointer', 
                        textAlign: 'left',
                        backgroundColor: selectedChat === chatId ? '#333333' : '#000000',
                      }} 
                      onClick={() => {
                        setSelectedChat(chatId);
                        setSelectedDJChat(
                          chats[chatId][chats[chatId].length - 1].receiveDJId ===
                            dj?.id ? chats[chatId][chats[chatId].length - 1].djId :
                            chats[chatId][chats[chatId].length - 1].receiveDJId
                        );
                        handleMarkAsRead(chatId)
                      }}
                    >
                      <Image
                        src={getDJCharacter(
                          chats[chatId][chats[chatId].length - 1].djId === dj?.id
                            ? chats[chatId][chats[chatId].length - 1].receiveDJId
                            : chats[chatId][chats[chatId].length - 1].djId
                        )}
                        alt={getDJName(
                          chats[chatId][chats[chatId].length - 1].djId === dj?.id
                            ? chats[chatId][chats[chatId].length - 1].receiveDJId
                            : chats[chatId][chats[chatId].length - 1].djId
                        )}
                        roundedCircle
                        style={{ width: '50px', height: '50px', marginRight: '10px' }}
                      />
                      <div>
                        {selectedChat !== chatId && unreadMessages[chatId] ? (
                          <span className="notification-bubble">
                            {unreadMessages[chatId]}
                          </span>
                        ) : ''}
                        <h5 style={{ margin: 0, position: 'relative' }}>
                          {getDJName(
                            chats[chatId][chats[chatId].length - 1].djId === dj?.id
                              ? chats[chatId][chats[chatId].length - 1].receiveDJId
                              : chats[chatId][chats[chatId].length - 1].djId
                          )}
                        </h5>
                        {djTyping[chatId]?.isTyping ? (
                          <span style={{ color: 'rgb(13, 110, 253)'}}>
                            <strong>
                              digitando...
                            </strong>
                          </span>
                        ) : (
                        <p style={{ margin: 0 }}>
                          {truncateText(chats[chatId][chats[chatId].length - 1].message, 28)}
                        </p>
                        )}
                      </div>
                    </div>
                  </ListGroup.Item>
                  ))}
                </ListGroup>
              </Col>
              <Col md={12} lg={12} xl={12} xxl={6} className={`chat-container ${selectedChat || selectedDJChat ? 'active' : ''}`}>
                {!selectedChat && !selectedDJChat ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <h3 style={{ color: 'white' }}>Selecione um papinho</h3>
                  </div>
                ) : (
                  <>
                    <div style={{ backgroundColor: '#222222', borderRadius: '8px', padding: '8px' }}>
                    <div style={{ display: 'flex', cursor: selectedChat !== 'general' ? 'pointer' : 'default' }}>
                      <FaArrowLeft
                        onClick={() => {
                          setSelectedChat(null);
                          setSelectedDJChat(null);
                        }}
                        style={{ cursor: 'pointer', marginRight: '15px', color: 'white' }}
                      />
                        {selectedChat !== 'general' ? (
                          <Image
                            src={selectedDJChat ? getDJCharacter(selectedDJChat) : getDJCharacter(
                              selectedChat !== null && chats[selectedChat][chats[selectedChat].length - 1].djId === dj?.id
                                ? chats[selectedChat][chats[selectedChat].length - 1].receiveDJId
                                : selectedChat ? chats[selectedChat][chats[selectedChat].length - 1].djId : ''
                            )}
                            alt={selectedDJChat ? getDJName(selectedDJChat) : getDJName(
                              selectedChat !== null && chats[selectedChat][chats[selectedChat].length - 1].djId === dj?.id
                                ? chats[selectedChat][chats[selectedChat].length - 1].receiveDJId
                                : selectedChat ? chats[selectedChat][chats[selectedChat].length - 1].djId : ''
                            )}
                            roundedCircle
                            style={{ width: '50px', height: '50px' }}
                            onClick={() => navigate(`/track/profile/${trackId}/${selectedDJChat}`)}
                          />
                        ) : (
                          <Image
                            src={selectedDJChat ? getDJCharacter(selectedDJChat) : logo}
                            alt={selectedDJChat ? getDJName(selectedDJChat) : trackName}
                            roundedCircle
                            style={{ width: '50px', height: '50px' }}
                          />
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '15px', color: 'white', height: '60px' }}>
                          <h3>
                            {selectedDJChat ? getDJName(selectedDJChat) : selectedChat === 'general' ? trackName : getDJName(
                              selectedChat !== null && chats[selectedChat][chats[selectedChat].length - 1].djId === dj?.id
                                ? chats[selectedChat][chats[selectedChat].length - 1].receiveDJId
                                : selectedChat ? chats[selectedChat][chats[selectedChat].length - 1].djId : ''
                            )}
                          </h3>
                          <span>
                            {selectedChat !== null && djTyping[selectedChat]?.isTyping ? (
                              selectedChat === 'general' ? (
                                `${getDJName(djTyping[selectedChat].typingDJId)} está digitando...`
                              ) : (
                                'digitando...'
                              )
                            ) : (
                              ''
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      ref={containerRef}
                      className="chat-container"
                      style={{ backgroundColor: '#000000', color: 'white', height: '72vh', display: 'flex', flexDirection: 'column-reverse', overflowY: 'auto', paddingBottom: messageToReply ? `${inputHeight + 60}px` : `${inputHeight}px`}}
                    >
                      <div className="messages">
                      {selectedChat !== null && chats[selectedChat]?.map((msg, index) => (
                        <div
                          key={index}
                          className="message"
                          style={{
                            display: 'flex',
                            flexDirection: msg.djId === dj?.id ? 'row-reverse' : 'row',
                            alignItems: msg.djId === dj?.id ? 'flex-end' : 'flex-start',
                            marginBottom: '0.5%'
                          }}
                        >
                          {msg.djId !== dj?.id && (
                              <div style={{ width: '50px', height: '50px', marginRight: '10px' }}>
                                {selectedChat === 'general' && isFirstMessageInSeries(chats[selectedChat], index) && (
                                  <OverlayTrigger
                                    trigger="click"
                                    placement="top"
                                    overlay={renderPopover(msg.djId)}
                                    rootClose
                                  >
                                    <Image
                                      src={getDJCharacter(msg.djId)}
                                      alt={getDJName(msg.djId)}
                                      roundedCircle
                                      style={{ width: '50px', height: '50px', cursor: 'pointer' }}
                                    />
                                  </OverlayTrigger>
                                )}
                              </div>
                            )}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: msg.djId === dj?.id ? 'flex-end' : 'flex-start', width: '100%' }}>
                            <div
                              key={msg.id}
                              onMouseEnter={() => setHoveredMessageId(msg.id)}
                              onMouseLeave={() => setHoveredMessageId(null)}
                              className={`message-text ${getRankClass(msg.djId)} bi bi-chat-dots ${msg.djId === dj?.id ? 'bg-primary msg-right' : ''}`}
                              style={{
                                backgroundColor: msg.djId !== dj?.id ? '#333333' : '',
                                marginRight: '10px',
                                color: 'white',
                                borderRadius: '20px',
                                padding: '10px 15px',
                                position: 'relative',
                                maxWidth: '80%',
                                wordBreak: 'break-word',
                                margin: isFirstMessageInSeries(chats[selectedChat], index) ? '20px 0 0' : '0.3% 0 0',
                                marginLeft: selectedChat !== 'general' && msg.djId !== dj?.id ? '-50px' : '0',
                                display: 'flex',
                                flexDirection: 'column',
                              }}
                            >
                              <p className={`message-text ${getRankClass(msg.djId)}`} style={{ margin: 0 }}>
                                {selectedChat === 'general' && msg.djId !== dj?.id && (
                                  <>
                                    <strong>
                                      {getDJName(msg.djId)}
                                      {getMedalIcon(msg.djId)}
                                    </strong>
                                    <br />
                                  </>
                                )}
                                {msg.message}
                              </p>
                              {hoveredMessageId === msg.id && (
                                <button
                                  style={{
                                    position: 'absolute',
                                    right: '0px',
                                    top: '7px',
                                    transform: 'translateY(-50%)',
                                    backgroundColor: 'transparent',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                  }}
                                  onClick={() => handleReply(msg)}
                                >
                                  <FaReply style={{ fontSize: '12px' }} />
                                </button>
                              )}
                            </div>
                            {msg.djId === dj?.id && msg.read && index === chats[selectedChat].length - 1 && selectedChat !== 'general' && (
                              <small style={{ marginTop: '5px', color: 'gray', alignSelf: 'flex-end', marginRight: '10px' }}>
                                visto
                              </small>
                            )}
                          </div>
                        </div>
                      ))}
                      </div>
                    </div>
                    <div style={{ position: 'relative', width: '100%', height: '100px' /* ou o tamanho que desejar */ }}>
                      <div
                        style={{
                          position: 'absolute',  // Fixa a div em relação ao pai
                          bottom: '0',           // Ancorada na parte inferior
                          left: '0',
                          right: '0',
                          display: 'flex',
                          alignItems: 'flex-end',
                          backgroundColor: '#222222',
                          padding: '8px',
                          borderRadius: '5px'
                          // Remova ou ajuste o marginTop se não for necessário
                        }}
                      >
                        <div style={{ width: '100%', position: 'relative' }}>
                          {messageToReply && (
                              <div className='text-light' style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '5px', borderRadius: '5px', marginBottom: '5px' }}>
                                <strong>{messageToReply.djId === dj?.id ? 'você' : getDJName(messageToReply.djId)}</strong>
                                <p>{messageToReply.message}</p>
                                <button
                                  onClick={() => setMessageToReply(null)}
                                  style={{
                                    position: 'absolute',
                                    top: '5px',
                                    right: '5px',
                                    backgroundColor: 'transparent',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <FaTimes />
                                </button>
                              </div>
                            )}
                          <Form.Control
                            as="textarea"
                            rows={1}
                            placeholder="Digite sua mensagem"
                            className="my-3 search-input"
                            value={message}
                            onChange={handleChangeMessageInput}
                            onInput={(e) => {
                              const target = e.target as HTMLTextAreaElement;
                              target.style.height = 'auto';
                              const newHeight = Math.min(target.scrollHeight, 150);
                              target.style.height = `${newHeight}px`;
                              // Se houver padding ou margens internas, adicione ao newHeight:
                              setInputHeight(newHeight - 50); // 16px a mais para compensar o padding, por exemplo
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmitMessage(selectedChat, message, e.target as HTMLTextAreaElement);
                              }
                            }}
                            style={{
                              backgroundColor: '#000000',
                              color: 'white',
                              overflowY: 'auto',
                              resize: 'none',
                              width: '100%',
                              maxHeight: '150px' // Altura máxima
                            }}
                          />
                        </div>
                        <Button
                          variant="primary"
                          className="my-3"
                          onClick={() => {
                            const textareaElement = document.querySelector('.search-input') as HTMLTextAreaElement;
                            handleSubmitMessage(selectedChat, message, textareaElement);
                          }}
                          style={{
                            marginLeft: '8px',
                            maxHeight: '40px'
                          }}
                        >
                          <FaPaperPlane />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </Col>
            </Row>
          </Container>
          {showVotePopup && (
            <VotePopup
              showVotePopup={showVotePopup}
              setShowVotePopup={setShowVotePopup} 
              playingNow={playingNow}
              djPlayingNow={djPlayingNow}
            />
          )}
        </>
      )}
    </div>
  );
}

const mapStateToProps = (state: RootState) => ({
  token: state.djReducer.token
});

const ChatConnected = connect(mapStateToProps)(Chat);

export default ChatConnected;