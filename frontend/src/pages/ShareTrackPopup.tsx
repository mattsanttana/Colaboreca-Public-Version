import React from 'react';
import { Button, Container, Modal } from 'react-bootstrap';
import { FiCopy } from 'react-icons/fi';
import {
  EmailIcon, EmailShareButton, FacebookIcon, FacebookShareButton, LinkedinIcon, LinkedinShareButton, RedditIcon, RedditShareButton, TelegramIcon,
  TelegramShareButton, TumblrIcon, TumblrShareButton, TwitterIcon, TwitterShareButton, WhatsappIcon, WhatsappShareButton
} from 'react-share';

// Props recebidas
interface SharePopupProps {
  handleClose: () => void; // Função para fechar o modal
  show: boolean; // Estado de visibilidade do modal
  trackId: string; // ID da pista a ser compartilhada
}

const shareUrl = (trackId: string) => `http://localhost:5173/enter-track/${ trackId }`; // URL de compartilhamento da pista
const shareText = 'Clique no link e venha discotecar comigo!'; // Texto de compartilhamento

// Componente SharePopup
const SharePopup: React.FC<SharePopupProps> = ({ handleClose, show, trackId }) => (
  <Modal
    centered // Centraliza o modal na tela
    className='custom-modal custom-modal-header' // Classes personalizadas para o modal
    onHide={ handleClose } // Função chamada ao fechar o modal
    show={ show } // Estado de visibilidade do modal
  >
    <Modal.Header
      closeButton // Botão de fechar o modal
      style={{ borderBottom: 'none'}} // Estilo do cabeçalho do modal
    >
      <Modal.Title>Compartilhar pista</Modal.Title> {/* Título do modal */}
    </Modal.Header>
    { /* Corpo do modal com os botões de compartilhamento */ }
    <Modal.Body>
      <Container
        className='d-flex flex-row justify-content-start align-items-center gap-3' // Classes para layout flexível
        // Estilo do container para permitir rolagem horizontal
        style={{
          overflowX: 'auto', // Permite rolagem horizontal
          paddingBottom: '10px', // Preenchimento inferior para evitar que o conteúdo fique colado na borda
          whiteSpace: 'nowrap', // Impede que o conteúdo quebre em várias linhas
          width: '100%', // ocupa toda a largura
          minHeight: '100%', // ocupa toda a altura
          height: '100%', // ocupa toda a altura
        }}
      >
        { /* Botão para copiar o link da pista */ }
        <div className='d-flex flex-column align-items-center'>
          <Button
            onClick={() => { navigator.clipboard.writeText(shareUrl(trackId)) }} // Copia o link para a área de transferência
            // Estilo do botão de copiar link
            style={{
              alignItems: 'center', // Alinha os itens no centro
              borderRadius: '50%', // Bordas arredondadas
              display: 'flex', // Exibe como flexbox
              height: '54px', // Altura do botão
              justifyContent: 'center', // Justifica o conteúdo no centro
              padding: 0, // Remove o preenchimento
              width: '54px', // Largura do botão
            }}
            title='Copiar link'
            variant='outline-dark'
          >
            { /* Ícone de copiar com tamanho 32px */ }
            <FiCopy size={ 32 } />
          </Button>
          { /* Texto abaixo do botão de copiar link */ }
          <span
            // Estilo do texto abaixo do botão de copiar link
            style={{
              fontSize: 12, // Tamanho da fonte
              marginTop: 4 // Espaçamento superior
            }}
          >
            Copiar link
          </span>
        </div>
        { /* Botão para compartilhar no WhatsApp */ }
        <div className='d-flex flex-column align-items-center'>
          <WhatsappShareButton
            title={ shareText } // Texto a ser compartilhado
            url={ shareUrl(trackId) } // URL a ser compartilhada
          >
            { /* Ícone do WhatsApp */ }
            <WhatsappIcon
              round // Arredonda o ícone
              size={ 48 } // Tamanho do ícone
            />
          </WhatsappShareButton>
          { /* Texto abaixo do ícone do WhatsApp */ }
          <span
            // Estilo do texto abaixo do ícone do WhatsApp
            style={{
              fontSize: 12, // Tamanho da fonte do texto abaixo do ícone
              marginTop: 4 // Espaçamento superior
            }}
          >
            WhatsApp
          </span>
        </div>
        { /* Botão para compartilhar no Facebook */ }
        <div className='d-flex flex-column align-items-center'>
          <FacebookShareButton
            title={ shareText } // Texto a ser compartilhado
            url={ shareUrl(trackId) } // URL a ser compartilhada
          >
            { /* Ícone do Facebook */ }
            <FacebookIcon
              round // Arredonda o ícone
              size={ 48 } // Tamanho do ícone
            />
          </FacebookShareButton>
          { /* Texto abaixo do ícone do Facebook */ }
          <span
            style={{
              fontSize: 12, // Tamanho da fonte do texto abaixo do ícone
              marginTop: 4 // Espaçamento superior
            }}
          >
            Facebook
          </span>
        </div>
        { /* Botão para compartilhar no Twitter */ }
        <div className='d-flex flex-column align-items-center'>
          <TwitterShareButton
            title={ shareText } // Texto a ser compartilhado
            url={ shareUrl(trackId) } // URL a ser compartilhada
          >
            { /* Ícone do Twitter */ }
            <TwitterIcon
              round // Arredonda o ícone
              size={ 48 } // Tamanho do ícone
            />
          </TwitterShareButton>
          { /* Texto abaixo do ícone do Twitter */ }
          <span
            // Estilo do texto abaixo do ícone do Twitter
            style={{
              fontSize: 12, // Tamanho da fonte do texto abaixo do ícone
              marginTop: 4 // Espaçamento superior
            }}
          >
            X
          </span>
        </div>
        { /* Botão para compartilhar no Tumblr */ }
        <div className='d-flex flex-column align-items-center'>
          <TumblrShareButton
            title={ shareText } // Texto a ser compartilhado
            url={ shareUrl(trackId) } // URL a ser compartilhada
          >
            { /* Ícone do Tumblr */ }
            <TumblrIcon
              round // Arredonda o ícone
              size={ 48 } // Tamanho do ícone
            />
          </TumblrShareButton>
          { /* Texto abaixo do ícone do Tumblr */ }
          <span
            // Estilo do texto abaixo do ícone do Tumblr
            style={{
              fontSize: 12, // Tamanho da fonte do texto abaixo do ícone
              marginTop: 4  // Espaçamento superior
            }}
          >
            Tumblr
          </span>
        </div>
        { /* Botão para compartilhar no LinkedIn */ }
        <div className='d-flex flex-column align-items-center'>
          <LinkedinShareButton
            title={ shareText } // Texto a ser compartilhado
            url={ shareUrl(trackId) } // URL a ser compartilhada
          >
            { /* Ícone do LinkedIn */ }
            <LinkedinIcon
              round // Arredonda o ícone
              size={ 48 } // Tamanho do ícone
            />
          </LinkedinShareButton>
          { /* Texto abaixo do ícone do LinkedIn */ }
          <span
            // Estilo do texto abaixo do ícone do LinkedIn
            style={{
              fontSize: 12, // Tamanho da fonte do texto abaixo do ícone
              marginTop: 4 // Espaçamento superior
            }}
          >
            LinkedIn
          </span>
        </div>
        { /* Botão para compartilhar por e-mail */ }
        <div className='d-flex flex-column align-items-center'>
          <EmailShareButton
            body={ shareText } // Texto do corpo do e-mail
            subject='Essa é o link para minha pista no Colaboreca' // Assunto do e-mail
            url={ shareUrl(trackId) } // URL a ser compartilhada
          >
            { /* Ícone do e-mail */ }
            <EmailIcon
              round // Arredonda o ícone
              size={ 48 } // Tamanho do ícone
            />
          </EmailShareButton>
          { /* Texto abaixo do ícone do e-mail */ }
          <span
            // Estilo do texto abaixo do ícone do e-mail
            style={{
              fontSize: 12, // Tamanho da fonte do texto abaixo do ícone
              marginTop: 4 // Espaçamento superior
            }}
          >
            E-mail
          </span>
        </div>
        { /* Botão para compartilhar no Reddit */ }
        <div className='d-flex flex-column align-items-center'>
          <RedditShareButton
            title={ shareText } // Texto a ser compartilhado
            url={ shareUrl(trackId) } // URL a ser compartilhada
          >
            { /* Ícone do Reddit */ }
            <RedditIcon
              round // Arredonda o ícone
              size={ 48 } // Tamanho do ícone
            />
          </RedditShareButton>
          { /* Texto abaixo do ícone do Reddit */ }
          <span
            // Estilo do texto abaixo do ícone do Reddit
            style={{
              fontSize: 12, // Tamanho da fonte do texto abaixo do ícone
              marginTop: 4 // Espaçamento superior
            }}
          >
            Reddit
          </span>
        </div>
        { /* Botão para compartilhar no Telegram */ }
        <div className='d-flex flex-column align-items-center'>
          <TelegramShareButton
            title={ shareText } // Texto a ser compartilhado
            url={ shareUrl(trackId) } // URL a ser compartilhada
          >
            { /* Ícone do Telegram */ }
            <TelegramIcon
              round // Arredonda o ícone
              size={ 48 } // Tamanho do ícone
            />
          </TelegramShareButton>
          { /* Texto abaixo do ícone do Telegram */ }
          <span
            // Estilo do texto abaixo do ícone do Telegram
            style={{
              fontSize: 12, // Tamanho da fonte do texto abaixo do ícone
              marginTop: 4 // Espaçamento superior
            }}
          >
            Telegram
          </span>
        </div>
      </Container>
    </Modal.Body>
  </Modal>
);

export default SharePopup; // Exporta o componente SharePopup