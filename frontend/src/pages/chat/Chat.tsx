import "../../styles/chat/Chat.css";
import React, { lazy, Suspense } from "react";
import { FaPaperPlane, FaArrowLeft, FaReply, FaTimes } from "react-icons/fa";
import { connect } from "react-redux";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  ListGroup,
  Image,
  Spinner,
} from "react-bootstrap";
import { RootState } from "../../redux/store";
import MessagePopup from "../shared/MessagePopup";
import { logo } from "../../assets/images/characterPath";
import RankingChangePopup from "../ranking/RankingChangePopup";
import useFetchChatData from "../../utils/useFetchChatData";
import useFetchTrackData from "../../utils/useFetchTrackData";
import useMenu from "../../utils/useMenu";
import useFetchPlaybackData from "../../utils/useFetchPlaybackData";
import { useNavigate } from "react-router-dom";
const Header = lazy(() => import("../shared/Header"));
const Menu = lazy(() => import("../shared/Menu"));
const VotePopup = lazy(() => import("../djs/VotePopup"));

interface Props {
  token: string;
}

const Chat: React.FC<Props> = ({ token }) => {
  const navigate = useNavigate();

  const {
    dj,
    djs,
    trackName,
    trackId,
    popupMessageData,
    setPopupMessageData,
    ownerDJId,
    setShowRankingChangePopup,
    previousRanking,
    showRankingChangePopup,
    globalPreviousRanking,
    queueSettings,
    setQueueSettings,
    refreshTrackSettings,
    setTrackName,
  } = useFetchTrackData(token);

  const {
    djPlayingNow,
    playingNow,
    showVotePopup,
    setShowVotePopup,
    isLoading,
  } = useFetchPlaybackData(token);

  const {
    search,
    handleChange,
    handleFocus,
    showSuggestions,
    availableDJs,
    sortedChatIds,
    handleStartChat,
    handleSelectChat,
    selectedChat,
    selectedDJChat,
    setSelectedChat,
    setSelectedDJChat,
    chats,
    djTyping,
    lastGeneralMessage,
    truncateText,
    handleReply,
    messageToReply,
    setMessageToReply,
    messageRefs,
    hoveredMessageId,
    setHoveredMessageId,
    chatContainerRef,
    inputHeight,
    setInputHeight,
    handleSubmitMessage,
    unreadMessages,
    isFirstMessageInSeries,
    scrollToMessage,
    getDJMessageById,
    message,
    handleChangeMessageInput,
    getChatDJ,
    selectedDJ,
  } = useFetchChatData(token, dj, djs, trackId);

  const {
    isMenuOpen,
    handleTouchEnd,
    handleTouchMove,
    handleTouchStart,
    setIsMenuOpen,
  } = useMenu();

  // Renderiza o componente
  return (
    // Envolve o componente em um container para lidar com eventos de toque
    <Container
      onTouchEnd={handleTouchEnd} // Adiciona evento de toque final
      onTouchMove={handleTouchMove} // Adiciona evento de movimento do toque
      onTouchStart={handleTouchStart} // Adiciona evento de toque inicial
    >
      {/* Caso o popup tenha que ser aberto e ainda não tiver carregado renderizar um spinner */}
      <Suspense fallback={<Spinner />}>
        {/* Popup de mensagem */}
        <MessagePopup
          data={popupMessageData} // Dados da mensagem
          onHide={() =>
            setPopupMessageData({ ...popupMessageData, show: false })
          } // Função para fechar o popup
        />
        {/* Popup de alteração de ranking */}
        <RankingChangePopup
          currentRanking={djs} // Envia o ranking atual como prop
          dj={dj} // Envia o DJ atual como prop
          ownerDJId={ownerDJId} // Envia o ID do DJ dono da pista como prop
          onHide={() => setShowRankingChangePopup(false)} // Função para fechar o popup
          previousRanking={previousRanking} // Envia o ranking anterior como prop
          show={showRankingChangePopup} // Envia o estado do popup como prop
          trackName={trackName} // Nome da pista'
        />
        {/* Popup de votação */}
        <VotePopup
          djPlayingNow={djPlayingNow} // Envia o DJ que está tocando a música atual como prop
          onHide={() => setShowVotePopup(false)} // Função para fechar o popup
          playingNow={playingNow} // Envia o estado de reprodução como prop
          show={showVotePopup} // Envia o estado do popup como prop
        />
      </Suspense>
      {/* Verifica se está carregando */}
      {isLoading ? (
        <Container className="d-flex justify-content-center align-items-center track-container">
          {/* Logo de carregamento */}
          <Image
            alt="Logo de carregamnto" // Texto alternativo
            className="logo-spinner" // Classe de animação de carregamnto
            src={logo} // Caminho da imagem
          />
        </Container>
      ) : (
        <Container>
          {/* Renderiza o cabeçalho */}
          <Header
            currentRanking={djs} // Envia o ranking atual como prop
            dj={dj} // Envia o DJ atual como prop
            isSlideMenuOpen={isMenuOpen} // Envia o estado do menu como prop (se o popup de votação estiver aberto, o menu não pode ser aberto)
            previousRanking={globalPreviousRanking} // Envia o ranking anterior como prop
            queueSettings={queueSettings}
            onSettingsChange={setQueueSettings}
            refreshTrackSettings={refreshTrackSettings}
            setTrackName={setTrackName}
            showVotePopup={showVotePopup} // Envia o estado do popup de votação
            token={token} // Envia o token do DJ como prop
            toggleMenu={setIsMenuOpen} // Função para alternar o estado do menu
            trackId={trackId} // Envia o ID da pista como prop
            trackName={trackName} // Envia o nome da pista como prop
          />
          <Row>
            <Col md={3} className="d-none d-xxl-block">
              <Menu
                currentRanking={djs} // Envia o ranking atual como prop
                dj={dj} // Envia o DJ atual como prop
                previousRanking={globalPreviousRanking} // Envia o ranking anterior como prop
                trackId={Number(trackId)} // Envia o ID da pista como prop
              />
            </Col>
            <Col
              md={12}
              lg={12}
              xl={12}
              xxl={3}
              id="chat-column"
              className={`chat-list ${
                !selectedChat && !selectedDJChat ? "active" : ""
              }`}
            >
              <div className="chat-wrapper">
                <Form.Control
                  type="text"
                  placeholder="Novo papinho"
                  value={search}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  className="my-3 custom-input chat-my-3"
                />
                {showSuggestions && availableDJs.length > 0 && (
                  <ListGroup className="chat-list">
                    {availableDJs.map((djItem) => (
                      <ListGroup.Item
                        className="chat-item"
                        key={djItem.id}
                        onClick={() => {
                          handleStartChat(djItem.id);
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
                  className="text-center chat-item-2"
                  style={{
                    backgroundColor:
                      selectedChat === "general" ? "#333333" : "#000000",
                  }}
                >
                  <div
                    className="chat-wrapper-2"
                    style={{
                      backgroundColor:
                        selectedChat === "general" ? "#333333" : "#000000",
                    }}
                    onClick={() => {
                      setSelectedChat("general");
                      setSelectedDJChat(null);
                    }}
                  >
                    <Image
                      className="chat-image"
                      src={logo}
                      alt={trackName}
                      roundedCircle
                    />
                    <div>
                      <h5 className="chat-heading">{trackName}</h5>
                      <p className="chat-text">
                        {djTyping["general"]?.isTyping ? (
                          <span className="chat-label">
                            <strong>
                              {djTyping["general"].typingDJ?.djName} está
                              digitando...
                            </strong>
                          </span>
                        ) : (
                          <>
                            <strong>
                              {lastGeneralMessage.djId === dj?.id
                                ? "Você"
                                : lastGeneralMessage.message.dj?.djName || ""}
                            </strong>
                            {lastGeneralMessage.message.message && (
                              <>
                                <strong>:</strong> &nbsp;
                              </>
                            )}
                            {(() => {
                              const djName =
                                lastGeneralMessage.djId === dj?.id
                                  ? "Você"
                                  : lastGeneralMessage.message.dj?.djName || "";
                              const nameLength = djName.length; // Comprimento do nome + ": "
                              const maxMessageLength = 29 - nameLength;
                              return truncateText(
                                lastGeneralMessage.message.message,
                                maxMessageLength
                              );
                            })()}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </ListGroup.Item>
                {sortedChatIds.map((chatId) => (
                  <ListGroup.Item
                    key={chatId}
                    className="text-center chat-item-3"
                    style={{
                      backgroundColor:
                        selectedChat === chatId ? "#333333" : "#000000",
                    }}
                  >
                    <div
                      className="chat-wrapper-3"
                      style={{
                        backgroundColor:
                          selectedChat === chatId ? "#333333" : "#000000",
                      }}
                      onClick={() => {
                        handleSelectChat(chatId);
                      }}
                    >
                      <Image
                        className="chat-image-2"
                        src={
                          getChatDJ(chats[chatId][chats[chatId].length - 1])
                            ?.characterPath || ""
                        }
                        alt={
                          getChatDJ(chats[chatId][chats[chatId].length - 1])
                            ?.djName || ""
                        }
                        roundedCircle
                      />
                      <div>
                        {selectedChat !== chatId && unreadMessages[chatId] ? (
                          <span className="notification-bubble">
                            {unreadMessages[chatId]}
                          </span>
                        ) : (
                          ""
                        )}
                        <h5 className="chat-heading-2">
                          {getChatDJ(chats[chatId][chats[chatId].length - 1])
                            ?.djName || ""}
                        </h5>
                        {djTyping[chatId]?.isTyping ? (
                          <span className="chat-label-2">
                            <strong>digitando...</strong>
                          </span>
                        ) : (
                          <p className="chat-text-2">
                            {truncateText(
                              chats[chatId][chats[chatId].length - 1].message,
                              28
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Col>
            <Col
              md={12}
              lg={12}
              xl={12}
              xxl={6}
              className={`chat-container ${
                selectedChat || selectedDJChat ? "active" : ""
              }`}
            >
              {!selectedChat && !selectedDJChat ? (
                <div className="chat-wrapper-4">
                  <h3 className="chat-heading-3">Selecione um papinho</h3>
                </div>
              ) : (
                <>
                  <div className="chat-wrapper-5">
                    <div
                      className="chat-wrapper-6"
                      style={{
                        cursor:
                          selectedChat !== "general" ? "pointer" : "default",
                      }}
                    >
                      <FaArrowLeft
                        onClick={() => {
                          setSelectedChat(null);
                          setSelectedDJChat(null);
                        }}
                        className="chat-cursor"
                      />
                      {selectedChat !== "general" ? (
                        <Image
                          className="chat-image-3"
                          src={
                            selectedDJChat
                              ? selectedDJ?.characterPath || ""
                              : selectedChat
                              ? getChatDJ(
                                  chats[selectedChat][
                                    chats[selectedChat].length - 1
                                  ]
                                )?.characterPath || ""
                              : ""
                          }
                          alt={
                            selectedDJChat
                              ? selectedDJ?.djName || ""
                              : selectedChat
                              ? getChatDJ(
                                  chats[selectedChat][
                                    chats[selectedChat].length - 1
                                  ]
                                )?.djName || ""
                              : ""
                          }
                          roundedCircle
                          onClick={() =>
                            navigate(
                              `/track/profile/${trackId}/${selectedDJChat}`
                            )
                          }
                        />
                      ) : (
                        <Image
                          className="chat-image-4"
                          src={
                            selectedDJChat
                              ? selectedDJ?.characterPath || logo
                              : logo
                          }
                          alt={
                            selectedDJChat
                              ? selectedDJ?.djName || trackName
                              : trackName
                          }
                          roundedCircle
                        />
                      )}
                      <div className="chat-wrapper-7">
                        <h3>
                          {selectedDJChat
                            ? selectedDJ?.djName || ""
                            : selectedChat === "general"
                            ? trackName
                            : selectedChat
                            ? getChatDJ(
                                chats[selectedChat][
                                  chats[selectedChat].length - 1
                                ]
                              )?.djName || ""
                            : ""}
                        </h3>
                        <span>
                          {selectedChat !== null &&
                          djTyping[selectedChat]?.isTyping
                            ? selectedChat === "general"
                              ? `${djTyping[selectedChat].typingDJ?.djName} está digitando...`
                              : "digitando..."
                            : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    ref={chatContainerRef}
                    className="chat-container chat-chat-container"
                    style={{
                      paddingBottom: messageToReply
                        ? `${inputHeight + 60}px`
                        : `${inputHeight}px`,
                    }}
                  >
                    <div className="messages">
                      {selectedChat !== null &&
                        chats[selectedChat]?.map((msg, index) => (
                          <div
                            key={index}
                            className="message chat-message"
                            style={{
                              flexDirection:
                                msg.djId === dj?.id ? "row-reverse" : "row",
                              alignItems:
                                msg.djId === dj?.id ? "flex-end" : "flex-start",
                            }}
                          >
                            {msg.djId !== dj?.id && (
                              <div className="chat-wrapper-8">
                                {selectedChat === "general" &&
                                  isFirstMessageInSeries(
                                    chats[selectedChat],
                                    index
                                  ) && (
                                    <Image
                                      className="chat-image-5"
                                      src={msg.dj?.characterPath || ""}
                                      alt={msg.dj?.djName || ""}
                                      roundedCircle
                                    />
                                  )}
                              </div>
                            )}
                            <div
                              className="chat-wrapper-9"
                              style={{
                                alignItems:
                                  msg.djId === dj?.id
                                    ? "flex-end"
                                    : "flex-start",
                              }}
                            >
                              <div
                                key={msg.id}
                                onMouseEnter={() => setHoveredMessageId(msg.id)}
                                onMouseLeave={() => setHoveredMessageId(null)}
                                className={`chat-message-text message-text rank-${
                                  msg.dj?.ranking ?? ""
                                } bi bi-chat-dots ${
                                  msg.djId === dj?.id
                                    ? "bg-primary msg-right"
                                    : ""
                                }`}
                                style={{
                                  backgroundColor:
                                    msg.djId !== dj?.id ? "#333333" : "",
                                  margin: isFirstMessageInSeries(
                                    chats[selectedChat],
                                    index
                                  )
                                    ? "20px 0 0"
                                    : "0.3% 0 0",
                                  marginLeft:
                                    selectedChat !== "general" &&
                                    msg.djId !== dj?.id
                                      ? "-50px"
                                      : "0",
                                }}
                              >
                                {msg.isReply && (
                                  <div
                                    className="text-light chat-wrapper-10"
                                    onClick={() => scrollToMessage(msg.replyTo)}
                                  >
                                    <strong>
                                      {Number(
                                        getDJMessageById(msg.replyTo)?.djId
                                      ) === Number(dj?.id)
                                        ? "você"
                                        : getDJMessageById(msg.replyTo)?.dj
                                            ?.djName || ""}
                                    </strong>
                                    <p>
                                      {truncateText(
                                        getDJMessageById(msg.replyTo)
                                          ?.message || "",
                                        62
                                      )}
                                    </p>
                                  </div>
                                )}
                                <p
                                  id="chat-text-3"
                                  className={`message-text rank-${
                                    msg.dj?.ranking ?? ""
                                  }`}
                                  ref={(el) =>
                                    (messageRefs.current[msg.id] = el)
                                  }
                                >
                                  {selectedChat === "general" &&
                                    msg.djId !== dj?.id && (
                                      <>
                                        <strong>
                                          {msg.dj?.djName || ""}
                                          {msg.dj?.ranking === 1
                                            ? "🥇"
                                            : msg.dj?.ranking === 2
                                            ? "🥈"
                                            : msg.dj?.ranking === 3
                                            ? "🥉"
                                            : ""}
                                        </strong>
                                        <br />
                                      </>
                                    )}
                                  {msg.message}
                                </p>
                                {hoveredMessageId === msg.id && (
                                  <button
                                    className="chat-button"
                                    onClick={() => handleReply(msg)}
                                  >
                                    <FaReply className="chat-fareply" />
                                  </button>
                                )}
                              </div>
                              {msg.djId === dj?.id &&
                                msg.read &&
                                index === chats[selectedChat].length - 1 &&
                                selectedChat !== "general" && (
                                  <small className="chat-small">visto</small>
                                )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="chat-wrapper-11">
                    <div className="chat-wrapper-12">
                      <div className="chat-wrapper-13">
                        {messageToReply && (
                          <div
                            className="text-light chat-wrapper-14"
                            onClick={() => scrollToMessage(messageToReply.id)}
                          >
                            <strong>
                              {messageToReply.djId === dj?.id
                                ? "você"
                                : messageToReply.dj?.djName || ""}
                            </strong>
                            <p>{truncateText(messageToReply.message, 77)}</p>
                            <button
                              onClick={() => setMessageToReply(null)}
                              className="chat-position"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        )}
                        <Form.Control
                          as="textarea"
                          rows={1}
                          placeholder="Digite sua mensagem"
                          className="my-3 custom-input chat-input"
                          value={message}
                          onChange={handleChangeMessageInput}
                          onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = "auto";
                            const newHeight = Math.min(
                              target.scrollHeight,
                              150
                            );
                            target.style.height = `${newHeight}px`;

                            setInputHeight(newHeight - 50);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSubmitMessage(
                                selectedChat,
                                message,
                                messageToReply,
                                e.target as HTMLTextAreaElement
                              );
                            }
                          }}
                        />
                      </div>
                      <Button
                        variant="primary"
                        className="my-3 chat-margin-left"
                        onClick={() => {
                          const textareaElement = document.querySelector(
                            ".custom-input"
                          ) as HTMLTextAreaElement;
                          handleSubmitMessage(
                            selectedChat,
                            message,
                            messageToReply,
                            textareaElement
                          );
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
      )}
    </Container>
  );
};

const mapStateToProps = (state: RootState) => ({
  token: state.reducer.token,
});

const ChatConnected = connect(mapStateToProps)(Chat);

export default ChatConnected;
