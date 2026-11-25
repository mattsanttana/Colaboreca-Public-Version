import "../../styles/chat/ChatEmojiPicker.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaPlus, FaSmile, FaTimes } from "react-icons/fa";
import { Image } from "react-bootstrap";
import { DJ } from "../../types/DJ";
import { Message, MessageReaction } from "../../types/Chat";

const EmojiPicker = React.lazy(() => import("emoji-picker-react"));
const loadPortugueseEmojiData = () =>
  import("emoji-picker-react/data/emojis-pt");

const quickReactions = [
  { emoji: "❤️", label: "Amei" },
  { emoji: "😂", label: "Hahaha" },
  { emoji: "😮", label: "Uau" },
  { emoji: "😢", label: "Triste" },
  { emoji: "😡", label: "Grrr" },
  { emoji: "👍", label: "Like" },
];

type ChatMessageReactionsProps = {
  message: Message;
  djs: DJ[];
  currentDJId: number | undefined;
  onToggleReaction: (messageId: number, emoji: string) => void;
  onPickerOpenChange: (isOpen: boolean) => void;
  isHovered: boolean;
  isActionMenuOpen: boolean;
  isSentByCurrentDJ: boolean;
};

const ChatMessageReactions: React.FC<ChatMessageReactionsProps> = ({
  message,
  djs,
  currentDJId,
  onToggleReaction,
  onPickerOpenChange,
  isHovered,
  isActionMenuOpen,
  isSentByCurrentDJ,
}) => {
  const [reactionPickerMode, setReactionPickerMode] = useState<
    "closed" | "quick" | "full"
  >("closed");
  const [isReactionDetailsOpen, setIsReactionDetailsOpen] = useState(false);
  const reactionControlRef = useRef<HTMLDivElement>(null);
  const groupedReactions = useMemo(() => {
    const groups = new Map<string, { count: number; selected: boolean }>();

    (message.reactions || []).forEach((reaction: MessageReaction) => {
      const group = groups.get(reaction.emoji) || {
        count: 0,
        selected: false,
      };
      group.count += 1;
      group.selected = group.selected || reaction.djId === currentDJId;
      groups.set(reaction.emoji, group);
    });

    return Array.from(groups.entries()).sort(
      ([, first], [, second]) => second.count - first.count,
    );
  }, [currentDJId, message.reactions]);
  const reactionsByDJ = useMemo(() => {
    const groups = new Map<number, string[]>();
    (message.reactions || []).forEach(({ djId, emoji }) => {
      const reactions = groups.get(djId) || [];
      reactions.push(emoji);
      groups.set(djId, reactions);
    });

    return Array.from(groups, ([djId, emojis]) => ({
      djId,
      emojis,
      dj: djs.find((candidate) => candidate.id === djId),
    }));
  }, [djs, message.reactions]);

  useEffect(() => {
    onPickerOpenChange(reactionPickerMode !== "closed");
  }, [onPickerOpenChange, reactionPickerMode]);

  useEffect(() => {
    if (!isReactionDetailsOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsReactionDetailsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isReactionDetailsOpen]);

  useEffect(() => {
    if (reactionPickerMode === "closed") return;

    const handleOutsidePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !reactionControlRef.current?.contains(event.target)
      ) {
        setReactionPickerMode("closed");
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setReactionPickerMode("closed");
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [reactionPickerMode]);

  const toggleReaction = (emoji: string) => {
    const alreadyReacted = (message.reactions || []).some(
      (reaction) =>
        reaction.djId === currentDJId && reaction.emoji === emoji,
    );
    if (alreadyReacted) return;

    onToggleReaction(message.id, emoji);
    setReactionPickerMode("closed");
  };

  return (
    <div className="chat-message-reactions">
      {groupedReactions.slice(0, 3).map(([emoji, reaction]) => (
        <button
          key={emoji}
          type="button"
          className={`chat-reaction chat-reaction-details-trigger ${
            reaction.selected ? "chat-reaction-selected" : ""
          }`}
          aria-label={`${emoji}, ${reaction.count} reações${
            reaction.selected ? ", sua reação" : ""
          }`}
          aria-haspopup="dialog"
          onClick={() => setIsReactionDetailsOpen(true)}
        >
          <span>{emoji}</span>
          <span>{reaction.count}</span>
        </button>
      ))}
      {groupedReactions.length > 3 && (
        <button
          type="button"
          className="chat-reaction chat-reaction-overflow"
          aria-label={`Ver todas as reações, ${groupedReactions.length - 3} tipos adicionais`}
          aria-haspopup="dialog"
          onClick={() => setIsReactionDetailsOpen(true)}
        >
          ...
        </button>
      )}
      {isReactionDetailsOpen && (
        <div
          className="chat-reaction-details-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsReactionDetailsOpen(false);
            }
          }}
        >
          <section
            className="chat-reaction-details"
            role="dialog"
            aria-modal="true"
            aria-label="Pessoas que reagiram à mensagem"
          >
            <header className="chat-reaction-details-header">
              <strong>Reações</strong>
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setIsReactionDetailsOpen(false)}
              >
                <FaTimes />
              </button>
            </header>
            <div className="chat-reaction-details-list">
              {reactionsByDJ.length === 0 ? (
                <span className="chat-reaction-details-empty">
                  Ainda não há reações.
                </span>
              ) : (
                reactionsByDJ.map(({ djId, emojis, dj: reactingDJ }) => (
                  <div className="chat-reaction-person" key={djId}>
                    {reactingDJ?.characterPath ? (
                      <Image
                        src={reactingDJ.characterPath}
                        alt=""
                        roundedCircle
                      />
                    ) : (
                      <span className="chat-reaction-person-avatar">
                        {(reactingDJ?.djName || "DJ").charAt(0).toUpperCase()}
                      </span>
                    )}
                    <strong>
                      {djId === currentDJId
                        ? "Você"
                        : reactingDJ?.djName || `DJ ${djId}`}
                    </strong>
                    <div className="chat-reaction-person-emojis">
                      {emojis.map((emoji) =>
                        djId === currentDJId ? (
                          <button
                            key={emoji}
                            type="button"
                            aria-label={`Remover sua reação ${emoji}`}
                            title="Remover sua reação"
                            onClick={() => onToggleReaction(message.id, emoji)}
                          >
                            {emoji}
                          </button>
                        ) : (
                          <span key={emoji} aria-label={emoji}>
                            {emoji}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}
      <div
        className={`chat-reaction-control ${
          isSentByCurrentDJ ? "chat-reaction-control-sent" : ""
        }`}
        ref={reactionControlRef}
      >
        {reactionPickerMode === "quick" && (
          <div className="chat-quick-reactions" aria-label="Reações rápidas">
            {quickReactions.map(({ emoji, label }) => {
              const selected = (message.reactions || []).some(
                (reaction) =>
                  reaction.emoji === emoji && reaction.djId === currentDJId,
              );

              return (
                <button
                  key={emoji}
                  type="button"
                  className={`chat-quick-reaction ${
                    selected ? "chat-reaction-selected" : ""
                  }`}
                  aria-label={`Reagir com ${label}`}
                  aria-pressed={selected}
                  title={label}
                  onClick={() => toggleReaction(emoji)}
                >
                  {emoji}
                </button>
              );
            })}
            <button
              type="button"
              className="chat-quick-reaction chat-quick-reaction-more"
              aria-label="Ver todos os emojis"
              title="Ver todos os emojis"
              onClick={() => setReactionPickerMode("full")}
            >
              <FaPlus />
            </button>
          </div>
        )}
        {reactionPickerMode === "full" && (
          <React.Suspense
            fallback={
              <div className="chat-emoji-loading" role="status">
                Carregando emojis...
              </div>
            }
          >
            <EmojiPicker
              className="chat-emoji-picker chat-reaction-emoji-picker"
              aria-label="Escolher reação"
              theme="dark"
              emojiStyle="native"
              width="min(300px, calc(100vw - 32px))"
              height={360}
              lazyLoadEmojis
              emojiData={loadPortugueseEmojiData}
              onEmojiClick={({ emoji }) => toggleReaction(emoji)}
              labels={{
                searchPlaceholder: "Buscar emoji",
                searchLabel: "Buscar emojis",
                searchClear: "Limpar busca",
                searchResultsNone: "Nenhum emoji encontrado",
                searchResultsOne: "1 emoji encontrado",
                searchResultsMany: "%n emojis encontrados",
                categoryNavigation: "Categorias de emoji",
                reactions: "Reações",
                expandReactions: "Ver todos os emojis",
                loading: "Carregando emojis",
                loadingError: "Não foi possível carregar os emojis",
                retryLoading: "Tentar novamente",
                skinToneNeutral: "Tom de pele padrão",
                skinToneLight: "Tom de pele claro",
                skinToneMediumLight: "Tom de pele médio-claro",
                skinToneMedium: "Tom de pele médio",
                skinToneMediumDark: "Tom de pele médio-escuro",
                skinToneDark: "Tom de pele escuro",
              }}
            />
          </React.Suspense>
        )}
        {(isHovered ||
          isActionMenuOpen ||
          reactionPickerMode !== "closed") && (
          <button
            type="button"
            className="chat-reaction-add"
            aria-label="Adicionar reação"
            aria-haspopup="dialog"
            aria-expanded={reactionPickerMode !== "closed"}
            onClick={() =>
              setReactionPickerMode((mode) =>
                mode === "closed" ? "quick" : "closed",
              )
            }
          >
            <FaSmile />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatMessageReactions;
