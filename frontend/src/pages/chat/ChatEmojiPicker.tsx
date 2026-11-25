import "../../styles/chat/ChatEmojiPicker.css";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import { FaSmile } from "react-icons/fa";
import useFetchChatData from "../../utils/useFetchChatData";

const EmojiPicker = React.lazy(() => import("emoji-picker-react"));
const loadPortugueseEmojiData = () =>
  import("emoji-picker-react/data/emojis-pt");

type ChatEmojiPickerProps = Pick<
  ReturnType<typeof useFetchChatData>,
  "message" | "setMessage" | "setInputHeight"
> & {
  inputRef: React.RefObject<HTMLTextAreaElement>;
};

const ChatEmojiPicker: React.FC<ChatEmojiPickerProps> = ({
  message,
  setMessage,
  setInputHeight,
  inputRef,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsidePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !pickerRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const insertEmoji = (emoji: string) => {
    const textarea = inputRef.current;
    const cursorPosition = textarea?.selectionStart ?? message.length;
    const selectionEnd = textarea?.selectionEnd ?? cursorPosition;
    const nextMessage =
      message.slice(0, cursorPosition) +
      emoji +
      message.slice(selectionEnd);

    setMessage(nextMessage);
    requestAnimationFrame(() => {
      if (!textarea) return;
      textarea.focus();
      const nextCursorPosition = cursorPosition + emoji.length;
      textarea.setSelectionRange(nextCursorPosition, nextCursorPosition);
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 150);
      textarea.style.height = `${newHeight}px`;
      setInputHeight(newHeight - 50);
    });
  };

  return (
    <div className="chat-emoji-control" ref={pickerRef}>
      {isOpen && (
        <Suspense
          fallback={
            <div className="chat-emoji-loading" role="status">
              Carregando emojis...
            </div>
          }
        >
          <EmojiPicker
            className="chat-emoji-picker"
            theme="dark"
            emojiStyle="native"
            width="min(300px, calc(100vw - 32px))"
            height={360}
            lazyLoadEmojis
            emojiData={loadPortugueseEmojiData}
            onEmojiClick={({ emoji }) => insertEmoji(emoji)}
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
        </Suspense>
      )}
      <Button
        type="button"
        variant="link"
        className="chat-emoji-toggle"
        aria-label="Abrir seletor de emoji"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setIsOpen((open) => !open)}
      >
        <FaSmile />
      </Button>
    </div>
  );
};

export default ChatEmojiPicker;
