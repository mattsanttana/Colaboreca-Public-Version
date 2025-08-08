import { useState, useEffect, useCallback, useRef } from 'react';

// Hook personalizado para gerenciar o estado do menu
const useMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para controlar se o menu está aberto
  const [touchStartX, setTouchStartX] = useState(0); // Posição inicial do toque
  const [touchEndX, setTouchEndX] = useState(0); // Posição final do toque
  const menuRef = useRef<HTMLElement | null>(null); // Referência ao elemento do menu

  // Função para abrir o fechar o menu
  const closeMenu = useCallback(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isMenuOpen]);

  // Adiciona um evento de clique fora do menu para fechá-lo
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu(); // Fecha o menu
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeMenu]);

  // Função para lidar com o toque inicial
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  // Função para lidar com o movimento do toque
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.touches[0].clientX);
  };

  // Função para lidar com o toque final
  const handleTouchEnd = () => {
    const distance = touchEndX - touchStartX;

    if (distance > 200) {
      setIsMenuOpen(true) // Abre o menu se o deslize for da esquerda para a direita
    }

    if (distance < -200) {
      setIsMenuOpen(false) // Fecha o menu se o deslize for da direita para a esquerda
    }
  };

  // Retorna os estados e funções necessárias para o menu
  return {
    isMenuOpen,
    setIsMenuOpen,
    menuRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
}

export default useMenu; // Exporta o hook personalizado