import "../../styles/chat/ChatMessageActions.css";
import React, { useEffect, useRef, useState } from "react";
import { FaEllipsisV, FaReply } from "react-icons/fa";
import { Message } from "../../types/Chat";

type ChatMessageActionsProps = {
  message: Message;
  currentDJId: number | undefined;
  ownerDJId: number | null;
  isModerator: boolean;
  isGeneralChat: boolean;
  isHovered: boolean;
  isEmojiPickerOpen: boolean;
  onMenuOpenChange: (isOpen: boolean) => void;
  onReply: (message: Message) => void;
  onEdit: (messageId: number, content: string) => Promise<boolean>;
  onDelete: (messageId: number) => Promise<boolean>;
  onSetModerator: (djId: number, enabled: boolean) => Promise<boolean>;
  onTimeoutDJ: (
    djId: number,
    type: "chat" | "queue",
    durationMs: number
  ) => Promise<boolean>;
  onRemoveTimeoutDJ: (djId: number, type: "chat" | "queue") => Promise<boolean>;
};

const TIMEOUT_PRESETS = [
  { label: "5 min", minutes: 5 },
  { label: "10 min", minutes: 10 },
  { label: "30 min", minutes: 30 },
  { label: "1 hora", minutes: 60 },
];

const ChatMessageActions: React.FC<ChatMessageActionsProps> = ({
  message,
  currentDJId,
  ownerDJId,
  isModerator,
  isGeneralChat,
  isHovered,
  isEmojiPickerOpen,
  onMenuOpenChange,
  onReply,
  onEdit,
  onDelete,
  onSetModerator,
  onTimeoutDJ,
  onRemoveTimeoutDJ,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [timeoutType, setTimeoutType] = useState<"chat" | "queue" | null>(null);
  const [customMinutes, setCustomMinutes] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(message.message);
  const [editError, setEditError] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isOwner = currentDJId === ownerDJId;
  const isOwnMessage = message.djId === currentDJId;
  const targetIsOwner = message.djId === ownerDJId;
  const targetIsModerator = Boolean(message.dj?.isModerator);
  const canModerateTarget =
    isGeneralChat
    && !targetIsOwner
    && !isOwnMessage
    && (isOwner || (isModerator && !targetIsModerator));
  const canDelete =
    isOwnMessage || (isGeneralChat && (isOwner || isModerator));
  const canChangeRole = isOwner && isGeneralChat && !targetIsOwner && !isOwnMessage;
  const canTimeout = canModerateTarget;
  const hasChatTimeout =
    Boolean(message.dj?.chatTimeoutUntil) &&
    Date.parse(message.dj?.chatTimeoutUntil || "") > Date.now();
  const hasQueueTimeout =
    Boolean(message.dj?.queueTimeoutUntil) &&
    Date.parse(message.dj?.queueTimeoutUntil || "") > Date.now();
  const canShowMenu = !message.deletedAt && (canDelete || canChangeRole || canTimeout);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsidePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node
        && !containerRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
        onMenuOpenChange(false);
        setTimeoutType(null);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        onMenuOpenChange(false);
        setTimeoutType(null);
      }
    };
    document.addEventListener("pointerdown", handleOutsidePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onMenuOpenChange]);

  useEffect(() => {
    if (!isEditing) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSavingEdit) setIsEditing(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isEditing, isSavingEdit]);

  const closeMenu = () => {
    setIsOpen(false);
    onMenuOpenChange(false);
    setTimeoutType(null);
    setError("");
  };

  const deleteMessage = async () => {
    if (await onDelete(message.id)) closeMenu();
    else setError("Não foi possível apagar a mensagem.");
  };

  const setModerator = async () => {
    if (
      await onSetModerator(
        message.djId,
        !message.dj?.isModerator
      )
    ) {
      closeMenu();
    } else {
      setError("Não foi possível alterar o cargo de moderador.");
    }
  };

  const applyTimeout = async (type: "chat" | "queue", minutes: number) => {
    if (!Number.isFinite(minutes) || minutes < 1 || minutes > 10080) {
      setError("Informe um tempo entre 1 minuto e 7 dias.");
      return;
    }
    if (await onTimeoutDJ(message.djId, type, minutes * 60_000)) {
      closeMenu();
    } else {
      setError("Não foi possível aplicar o timeout.");
    }
  };

  const removeTimeout = async (type: "chat" | "queue") => {
    if (await onRemoveTimeoutDJ(message.djId, type)) closeMenu();
    else setError("Não foi possível remover o timeout.");
  };

  const startEditing = () => {
    setEditDraft(message.message);
    setEditError("");
    setIsOpen(false);
    onMenuOpenChange(false);
    setIsEditing(true);
  };

  const saveEdit = async () => {
    if (!editDraft.trim()) {
      setEditError("A mensagem não pode ficar vazia.");
      return;
    }

    setIsSavingEdit(true);
    const saved = await onEdit(message.id, editDraft.trim());
    setIsSavingEdit(false);
    if (saved) setIsEditing(false);
    else setEditError("Não foi possível editar a mensagem.");
  };

  return (
    <div className="chat-message-actions">
      {isEditing && (
        <div
          className="chat-edit-message-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSavingEdit) {
              setIsEditing(false);
            }
          }}
        >
          <section
            className="chat-edit-message-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-edit-message-title"
          >
            <h2 id="chat-edit-message-title">Editar mensagem</h2>
            <textarea
              aria-label="Texto da mensagem"
              value={editDraft}
              onChange={(event) => setEditDraft(event.target.value)}
              autoFocus
            />
            {editError && <span role="alert">{editError}</span>}
            <div className="chat-edit-message-buttons">
              <button
                type="button"
                disabled={isSavingEdit}
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSavingEdit}
                onClick={saveEdit}
              >
                {isSavingEdit ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </section>
        </div>
      )}
      {!message.deletedAt && (isHovered || isOpen || isEmojiPickerOpen) && (
        <button
          type="button"
          aria-label="Responder mensagem"
          title="Responder"
          className={`chat-button ${
            message.djId === currentDJId ? "chat-button-sent" : ""
          }`}
          onClick={() => onReply(message)}
        >
          <FaReply className="chat-fareply" />
        </button>
      )}
      {canShowMenu && (
        <div
          className={`chat-message-actions-menu ${
            message.djId === currentDJId ? "chat-message-actions-menu-sent" : ""
          }`}
          ref={containerRef}
        >
          {isOpen && (
            <div className="chat-message-actions-popover" role="menu">
              {timeoutType ? (
                <>
                  <strong>
                    Timeout pra{" "}
                    {timeoutType === "chat" ? "conversar" : "tocar"}
                  </strong>
                  <div className="chat-timeout-presets">
                    {TIMEOUT_PRESETS.map(({ label, minutes }) => (
                      <button
                        key={label}
                        type="button"
                        role="menuitem"
                        onClick={() => applyTimeout(timeoutType, minutes)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <label className="chat-timeout-custom">
                    Personalizado (minutos)
                    <input
                      type="number"
                      min="1"
                      max="10080"
                      value={customMinutes}
                      onChange={(event) => setCustomMinutes(event.target.value)}
                    />
                  </label>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() =>
                      applyTimeout(timeoutType, Number(customMinutes))
                    }
                  >
                    Aplicar tempo personalizado
                  </button>
                </>
              ) : (
                <>
                  {isOwnMessage && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={startEditing}
                    >
                      Editar mensagem
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={deleteMessage}
                    >
                      Apagar mensagem
                    </button>
                  )}
                  {canChangeRole && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={setModerator}
                    >
                      {message.dj?.isModerator
                        ? "Remover moderador"
                        : "Tornar moderador"}
                    </button>
                  )}
                  {canTimeout && (
                    <>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => setTimeoutType("chat")}
                      >
                        Timeout para conversar
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => setTimeoutType("queue")}
                      >
                        Timeout pra tocar
                      </button>
                    </>
                  )}
                  {isOwner && isGeneralChat && hasChatTimeout && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => removeTimeout("chat")}
                    >
                      Remover timeout do chat
                    </button>
                  )}
                  {isOwner && isGeneralChat && hasQueueTimeout && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => removeTimeout("queue")}
                    >
                      Remover timeout pra tocar
                    </button>
                  )}
                </>
              )}
              {error && <span className="chat-moderation-error" role="alert">{error}</span>}
            </div>
          )}
          {(isHovered || isOpen || isEmojiPickerOpen) && (
            <button
              type="button"
              className="chat-actions-toggle"
              aria-label="Mais ações da mensagem"
              aria-expanded={isOpen}
              onClick={() => {
                setIsOpen(!isOpen);
                onMenuOpenChange(!isOpen);
                setTimeoutType(null);
                setError("");
              }}
            >
              <FaEllipsisV />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatMessageActions;
