import "../../styles/chat/Chat.css";
import React, { lazy, Suspense } from "react";
import { connect } from "react-redux";
import { Container, Image, Row, Spinner } from "react-bootstrap";
import { RootState } from "../../redux/store";
import { logo } from "../../assets/images/characterPath";
import MessagePopup from "../shared/MessagePopup";
import RankingChangePopup from "../ranking/RankingChangePopup";
import ChatList from "./ChatList";
import ChatConversation from "./ChatConversation";
import useFetchChatData from "../../utils/useFetchChatData";
import useFetchTrackData from "../../utils/useFetchTrackData";
import useMenu from "../../utils/useMenu";
import useFetchPlaybackData from "../../utils/useFetchPlaybackData";

const Header = lazy(() => import("../shared/Header"));
const Menu = lazy(() => import("../shared/Menu"));
const VotePopup = lazy(() => import("../djs/VotePopup"));

interface Props {
  token: string;
}

const Chat: React.FC<Props> = ({ token }) => {
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

  const chatData = useFetchChatData(token, dj, djs, trackId);
  const {
    isMenuOpen,
    handleTouchEnd,
    handleTouchMove,
    handleTouchStart,
    setIsMenuOpen,
  } = useMenu();

  return (
    <Container
      className="chat-route"
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
    >
      <Suspense fallback={<Spinner />}>
        <MessagePopup
          data={popupMessageData}
          onHide={() =>
            setPopupMessageData({ ...popupMessageData, show: false })
          }
        />
        <RankingChangePopup
          currentRanking={djs}
          dj={dj}
          ownerDJId={ownerDJId}
          onHide={() => setShowRankingChangePopup(false)}
          previousRanking={previousRanking}
          show={showRankingChangePopup}
          trackName={trackName}
        />
        <VotePopup
          djPlayingNow={djPlayingNow}
          onHide={() => setShowVotePopup(false)}
          playingNow={playingNow}
          show={showVotePopup}
        />
      </Suspense>
      {isLoading ? (
        <Container className="d-flex justify-content-center align-items-center track-container">
          <Image
            alt="Logo de carregamnto"
            className="logo-spinner"
            src={logo}
          />
        </Container>
      ) : (
        <Container className="chat-page gradient-border">
          <Header
            currentRanking={djs}
            dj={dj}
            isSlideMenuOpen={isMenuOpen}
            previousRanking={globalPreviousRanking}
            queueSettings={queueSettings}
            onSettingsChange={setQueueSettings}
            refreshTrackSettings={refreshTrackSettings}
            setTrackName={setTrackName}
            showVotePopup={showVotePopup}
            token={token}
            toggleMenu={setIsMenuOpen}
            trackId={trackId}
            trackName={trackName}
          />
          <Row className="chat-layout">
            <div className="d-none d-xxl-block col-md-3 chat-menu-column">
              <Menu
                currentRanking={djs}
                dj={dj}
                previousRanking={globalPreviousRanking}
                trackId={Number(trackId)}
              />
            </div>
            <ChatList
              dj={dj}
              trackName={trackName}
              logo={logo}
              search={chatData.search}
              handleChange={chatData.handleChange}
              handleFocus={chatData.handleFocus}
              showSuggestions={chatData.showSuggestions}
              availableDJs={chatData.availableDJs}
              handleStartChat={chatData.handleStartChat}
              selectedChat={chatData.selectedChat}
              selectedDJChat={chatData.selectedDJChat}
              setSelectedChat={chatData.setSelectedChat}
              setSelectedDJChat={chatData.setSelectedDJChat}
              sortedChatIds={chatData.sortedChatIds}
              chats={chatData.chats}
              djTyping={chatData.djTyping}
              lastGeneralMessage={chatData.lastGeneralMessage}
              truncateText={chatData.truncateText}
              handleSelectChat={chatData.handleSelectChat}
              getChatDJ={chatData.getChatDJ}
              unreadMessages={chatData.unreadMessages}
            />
            <ChatConversation
              selectedChat={chatData.selectedChat}
              selectedDJChat={chatData.selectedDJChat}
              setSelectedChat={chatData.setSelectedChat}
              setSelectedDJChat={chatData.setSelectedDJChat}
              chats={chatData.chats}
              djTyping={chatData.djTyping}
              selectedDJ={chatData.selectedDJ}
              getChatDJ={chatData.getChatDJ}
              dj={dj}
              trackName={trackName}
              trackId={trackId}
              chatContainerRef={chatData.chatContainerRef}
              inputHeight={chatData.inputHeight}
              messageToReply={chatData.messageToReply}
              scrollToMessage={chatData.scrollToMessage}
              truncateText={chatData.truncateText}
              setMessageToReply={chatData.setMessageToReply}
              message={chatData.message}
              handleChangeMessageInput={chatData.handleChangeMessageInput}
              setInputHeight={chatData.setInputHeight}
              handleSubmitMessage={chatData.handleSubmitMessage}
              isFirstMessageInSeries={chatData.isFirstMessageInSeries}
              getDJMessageById={chatData.getDJMessageById}
              messageRefs={chatData.messageRefs}
              hoveredMessageId={chatData.hoveredMessageId}
              setHoveredMessageId={chatData.setHoveredMessageId}
              handleReply={chatData.handleReply}
            />
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
