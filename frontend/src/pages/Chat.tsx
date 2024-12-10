import React, { useState, useEffect, useRef, useCallback, lazy, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaPaperPlane, FaArrowLeft } from 'react-icons/fa';
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
import { ChatMessage, Chats } from '../types/Chat';
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
  const [trackFound, setTrackFound] = useState(false);
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
  const [chats, setChats] = useState<{ [key: string]: { id: number, djId: string; receiveDJId: string; message: string, createdAt: Date, read: boolean }[] }>({});
  const [message, setMessage] = useState('');
  const [unreadMessages, setUnreadMessages] = useState<{ [key: string]: number }>({});
  const [messagesLoaded, setMessagesLoaded] = useState(false);

  const djActions = useDJ();
  const trackActions = useTrack();
  const playbackActions = usePlayback();
  const voteActions = useVote();
  const messageActions = useMessage();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const interval = useRef<number | null>(null);

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
          const newChats = djMessages.data.reduce((acc: Chats, message: ChatMessage) => {
            const chatId = message.chatId || 'general';
            acc[chatId] = [
              ...(acc[chatId] || []),
              {
                id: message.id,
                djId: message.djId,
                receiveDJId: message.receiveDJId,
                message: message.message,
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
          const [
            fetchedTrack,
            fetchedVerifyLogin,
            fetchedDJs,
            fetchedDJ,
            fetchedPlayingNow,
            fetchedDJPlayingNow,
            fetchedVerifyIfDJHasAlreadVoted,
          ] = await Promise.all([
            trackActions.getTrackById(trackId),
            djActions.verifyIfDJHasAlreadyBeenCreatedForThisTrack(token),
            djActions.getAllDJs(trackId),
            djActions.getDJByToken(token),
            playbackActions.getState(trackId),
            playbackActions.getDJAddedCurrentMusic(trackId),
            voteActions.verifyIfDJHasAlreadVoted(token),
          ]);
          
          if (fetchedVerifyLogin?.status !== 200) {
            setPopupMessage('Você não está logado, por favor faça login novamente');
            setRedirectTo('/enter-track');
            setShowPopup(true);
          }

          if (fetchedDJ?.status !== 200) {
            setPopupMessage('Você não é um DJ desta pista, por favor faça login');
            setRedirectTo('/enter-track');
            setShowPopup(true);
          }

          if (fetchedTrack?.status === 200) {
            setTrackFound(true);
            setTrackName(fetchedTrack.data.trackName);
            setPlayingNow(fetchedPlayingNow);
            setDJs(fetchedDJs);
            setDJ(fetchedDJ?.data);
            setDJPlayingNow(fetchedDJPlayingNow);
            setShowVotePopup(fetchedVerifyIfDJHasAlreadVoted);
          } else {
            setTrackFound(false);
          }
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

    socket.on('connect', handleSocketConnect);

    // Quando `dj` é atualizado, verifica se precisa entrar na sala do DJ
    if (socket.connected && dj) {
      socket.emit('joinRoom', `general_${trackId}`);
      socket.emit('joinRoom', `user_${dj.id}`);
    }

    // Recebe mensagens do servidor
    socket.on('chat message', (message) => {
      console.log('Nova mensagem recebida', message); // Imprime no console

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
            read: message.read
          }
        ];

        // Se o chat está aberto, marca as mensagens como lidas
        if (Number(selectedChat) === Number(message.chatId)) {
          updatedChats[chatId] = updatedChats[chatId].map(msg =>
            msg.id === message.id ? { ...msg, read: true } : msg
          );
        }

        return updatedChats;
      });

      // Se o chat está aberto, marca as mensagens como lidas
      if (Number(selectedChat) === Number(message.chatId)) {
        handleMarkAsRead(message.chatId);
      }
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

    // Limpeza do evento `connect` para evitar múltiplas adições
    return () => {
      socket.off('connect', handleSocketConnect);
      socket.off('chat message');
      socket.off('messagesMarkedAsRead');
    };
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dj, trackId, selectedChat]);

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
    if (distance > 200) {
      setIsMenuOpen(true); // Abre o menu se o deslize for da esquerda para a direita
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
    const unreadMessages = messages.filter(message => !message.read);
    const unreadMessageIds = unreadMessages.map(message => message.id); // Extrai os IDs das mensagens não lidas
    if (unreadMessageIds.length > 0) {
      await messageActions.markMessagesAsRead(unreadMessageIds, token); // Passa o array de IDs para markMessagesAsRead
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
      ) : trackFound && dj ? (
        <>
          <Container>
            <Header dj={dj} isSlideMenuOpen={isMenuOpen} toggleMenu={setIsMenuOpen}/>
            <Row>
              <Col md={3} className="d-none d-xxl-block">
                <Menu dj={dj} />
              </Col>
              <Col md={12} lg={12} xl={12} xxl={3} className={`chat-list ${!selectedChat && !selectedDJChat ? 'active' : ''}`} style={{ borderRight: '1px solid #cccccc', overflowY: 'auto' }}>
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
                          <strong>
                            {lastGeneralMessage.djId === dj.id ? 'Você' : lastGeneralMessage.djId ? getDJName(lastGeneralMessage.djId) : ''}
                          </strong>
                          {lastGeneralMessage.message.message && (
                            <>
                              <strong>:</strong> &nbsp;
                            </>
                          )}
                          {truncateText(lastGeneralMessage.message.message, 10)}
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
                            dj.id ? chats[chatId][chats[chatId].length - 1].djId :
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
                        <p style={{ margin: 0 }}>
                          {truncateText(chats[chatId][chats[chatId].length - 1].message, 10)}
                        </p>
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
                        className="mobile-only"
                        style={{ cursor: 'pointer', marginRight: '15px', color: 'white' }}
                      />
                        {selectedChat !== 'general' ? (
                          <OverlayTrigger
                            trigger="click"
                            placement="bottom"
                            overlay={renderPopover(String(selectedDJChat))}
                            rootClose
                          >
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
                            />
                          </OverlayTrigger>
                        ) : (
                          <Image
                            src={selectedDJChat ? getDJCharacter(selectedDJChat) : logo}
                            alt={selectedDJChat ? getDJName(selectedDJChat) : trackName}
                            roundedCircle
                            style={{ width: '50px', height: '50px' }}
                          />
                        )}
                        <h3 style={{ marginLeft: '15px', color: 'white' }}>
                          {selectedDJChat ? getDJName(selectedDJChat) : selectedChat === 'general' ? trackName : getDJName(
                            selectedChat !== null && chats[selectedChat][chats[selectedChat].length - 1].djId === dj?.id
                              ? chats[selectedChat][chats[selectedChat].length - 1].receiveDJId
                              : selectedChat ? chats[selectedChat][chats[selectedChat].length - 1].djId : ''
                            )}
                        </h3>
                      </div>
                    </div>
                    <div
                      ref={containerRef}
                      className="chat-container"
                      style={{ backgroundColor: '#000000', color: 'white', height: '72vh', display: 'flex', flexDirection: 'column-reverse', overflowY: 'auto' }}
                    >
                      <div className="messages">
                      {selectedChat !== null && chats[selectedChat]?.map((msg, index) => (
                        <div
                          key={index}
                          className="message"
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: msg.djId === dj.id ? 'flex-end' : 'flex-start',
                            marginBottom: '10px'
                          }}
                        >
                          <div
                            className={`bi bi-chat-dots ${msg.djId === dj.id ? 'bg-primary msg-right' : ''}`}
                            style={{
                              backgroundColor: msg.djId !== dj.id ? '#333333' : '',
                              marginRight: '10px',
                              color: 'white',
                              borderRadius: '20px',
                              padding: '10px 15px',
                              position: 'relative',
                              maxWidth: '80%',
                              wordBreak: 'break-word',
                              margin: isFirstMessageInSeries(chats[selectedChat], index) ? '20px 0 0' : '0.3%'
                            }}
                          >
                            <p className={`message-text ${getRankClass(msg.djId)}`} style={{ margin: 0 }}>
                              {selectedChat === 'general' && msg.djId !== dj.id && (
                                <>
                                  <strong>{getDJName(msg.djId)}</strong>
                                  <br />
                                </>
                              )}
                              {msg.message}
                            </p>
                          </div>
                          {msg.djId === dj.id && msg.read && index === chats[selectedChat].length - 1 && (
                            <small style={{ marginTop: '5px', color: 'gray', alignSelf: 'flex-end' }}>
                              visto
                            </small>
                          )}
                        </div>
                      ))}
                      </div>
                    </div>
                    <div style={{ position: 'relative', width: '100%' }}>
                      <div
                        style={{
                          display: 'flex', 
                          alignItems: 'flex-end', 
                          width: '100%', 
                          backgroundColor: '#222222', 
                          padding: '8px', 
                          borderRadius: '5px',
                          marginTop: '30px'
                        }}
                      >
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
                            target.style.height = `${Math.min(target.scrollHeight, 150)}px`; // Limite de altura para o campo
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
                            maxHeight: '150px', // Altura máxima
                          }}
                        />
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
      ) : (
        <Container className="text-center">
          <h1>Esta pista não existe</h1>
          <Button onClick={() => navigate("/")}>Página inicial</Button>
        </Container>
      )}
    </div>
  );
}

const mapStateToProps = (state: RootState) => ({
  token: state.djReducer.token
});

const ChatConnected = connect(mapStateToProps)(Chat);

export default ChatConnected;