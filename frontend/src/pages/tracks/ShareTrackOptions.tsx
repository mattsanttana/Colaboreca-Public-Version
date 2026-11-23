import '../../styles/tracks/ShareTrackOptions.css';
import React from 'react';
import { Button, Container, Modal } from 'react-bootstrap';
import { FiCopy } from 'react-icons/fi';
import {
  EmailIcon, EmailShareButton, FacebookIcon, FacebookShareButton, LinkedinIcon, LinkedinShareButton, RedditIcon, RedditShareButton, TelegramIcon,
  TelegramShareButton, TumblrIcon, TumblrShareButton, TwitterIcon, TwitterShareButton, WhatsappIcon, WhatsappShareButton
} from 'react-share';

// Props recebidas
interface props {
  onHide: () => void; // Função para fechar o modal
  show: boolean; // Estado de visibilidade do modal
  trackId: string; // ID da pista a ser compartilhada
}

const shareUrl = (trackId: string) => `http://localhost:5173/enter-track/${ trackId }`; // URL de compartilhamento da pista
const shareText = 'Clique no link e venha discotecar comigo!'; // Texto de compartilhamento

// Componente ShareOptions
const ShareOptions: React.FC<props> = ({ onHide, show, trackId }) => (
  <Modal
    centered // Centraliza o modal na tela
    className='custom-modal' // Classes personalizadas para o modal
    onHide={ onHide } // Função chamada ao fechar o modal
    show={ show } // Estado de visibilidade do modal
  >
    <Modal.Header className="share-track-options-header"
      closeButton // Botão de fechar o modal
 // Estilo do cabeçalho do modal
    >
      <Modal.Title>Compartilhar pista</Modal.Title> {/* Título do modal */}
    </Modal.Header>
    { /* Corpo do modal com os botões de compartilhamento */ }
    <Modal.Body>
      <Container
        className='d-flex flex-row justify-content-start align-items-center gap-3 share-track-options-justify-content-start' // Classes para layout flexível
        // Estilo do container para permitir rolagem horizontal
        style={{ 
          paddingBottom: '10px', 
          whiteSpace: 'nowrap', 
          width: '100%', 
          minHeight: '100%', 
          height: '100%', 
      }}>
        { /* Botão para copiar o link da pista */ }
        <div className='d-flex flex-column align-items-center'>
          <Button
            onClick={() => { navigator.clipboard.writeText(shareUrl(trackId)) }} // Copia o link para a área de transferência
            // Estilo do botão de copiar link
            style={{
              alignItems: 'center', 
              backgroundColor: '#a8dadc', 
              borderRadius: '50%', 
              display: 'flex', 
              height: '54px', 
              justifyContent: 'center', 
              padding: 0, 
              width: '54px', 
            }}
            title='Copiar link'
            variant='outline-dark'
          >
            { /* Ícone de copiar com tamanho 32px */ }
            <FiCopy size={ 32 } />
          </Button>
          { /* Texto abaixo do botão de copiar link */ }
          <span className="share-track-options-label"
            // Estilo do texto abaixo do botão de copiar link
            style={{ 
              marginTop: 4 
          }}>
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
          <span className="share-track-options-label-2"
            // Estilo do texto abaixo do ícone do WhatsApp
            style={{ 
              marginTop: 4 
          }}>
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
          <span className="share-track-options-label-3"
            style={{ 
              marginTop: 4 
          }}>
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
          <span className="share-track-options-label-4"
            // Estilo do texto abaixo do ícone do Twitter
            style={{ 
              marginTop: 4 
          }}>
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
          <span className="share-track-options-label-5"
            // Estilo do texto abaixo do ícone do Tumblr
            style={{ 
              marginTop: 4  
          }}>
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
          <span className="share-track-options-label-6"
            // Estilo do texto abaixo do ícone do LinkedIn
            style={{ 
              marginTop: 4 
          }}>
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
          <span className="share-track-options-label-7"
            // Estilo do texto abaixo do ícone do e-mail
            style={{ 
              marginTop: 4 
          }}>
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
          <span className="share-track-options-label-8"
            // Estilo do texto abaixo do ícone do Reddit
            style={{ 
              marginTop: 4 
          }}>
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
          <span className="share-track-options-label-9"
            // Estilo do texto abaixo do ícone do Telegram
            style={{ 
              marginTop: 4 
          }}>
            Telegram
          </span>
        </div>
      </Container>
    </Modal.Body>
  </Modal>
);

export default ShareOptions; // Exporta o componente ShareOptions
