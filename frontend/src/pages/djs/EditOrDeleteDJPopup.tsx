import '../../styles/djs/EditOrDeleteDJPopup.css';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Container, Form, Image, Modal } from 'react-bootstrap';
import { DJ } from '../../types/DJ';
import useDJ from '../../utils/useDJ';
import PopupMessageData from '../../types/PopupMessageData';

// Props para o componente EditOrDeleteDJPopup
interface Props {
  dj: DJ | undefined;
  token: string;
  editedCharacterPath: string;
  setEditedCharacterPath: (characterPath: string) => void;
  setShow: (show: boolean) => void; // Função para definir o estado do popup
  setPopupMessageData: (data: PopupMessageData) => void;
  setShowCharacterPopup: (show: boolean) => void; // Função para mostrar ou esconder o popup de seleção de personagens
  setShowDeleteConfirmation: (show: boolean) => void; // Função para mostrar ou esconder o popup de confirmação de exclusão
  show: boolean; // Estado que controla se o popup está visível
}

// Componente de popup para editar ou excluir DJ
const EditOrDeleteDJPopup: React.FC<Props> = ({
  dj, token, editedCharacterPath, setEditedCharacterPath, setPopupMessageData,
  setShowCharacterPopup, setShow, setShowDeleteConfirmation, show,
}) => {
  const [editedName, setEditedName] = useState<string>(''); // Novo nome do DJ
  const [isButtonDisabled, setIsButtonDisabled] = useState(false); // Estado do botão de salvar
  const [showTooltip, setShowTooltip] = useState(false); // Estado para exibir tooltip ao passar o mouse sobre o avatar

  const djActions = useDJ(); // Ações relacionadas ao DJ
  const characterRef = useRef<HTMLImageElement>(null); // Referência para o avatar do DJ

  // UseEffect para inicializar os valores editados com os dados do DJ
  useEffect(() => {
    const isSameAsDJ = editedCharacterPath === dj?.characterPath && editedName === dj?.djName; // Verifica se os valores editados são iguais aos do DJ atual
    const isNameTooShort = editedName.length < 3; // Verifica se o nome é muito curto
    const isNameTooBig = editedName.length > 16; // Verifica se o nome é muito grande

    setIsButtonDisabled(isSameAsDJ || isNameTooShort || isNameTooBig); // Desabilita o botão se os valores não foram alterados ou se o nome é inválido

    // Se o DJ estiver definido e os valores editados estiverem vazios, inicializa com os dados do DJ
    if (editedCharacterPath === '' && editedName === '' && dj) {
      setEditedCharacterPath(dj?.characterPath || ''); // Define o caminho do personagem editado
      setEditedName(dj?.djName || ''); // Define o nome do DJ editado
    }

  }, [dj, editedCharacterPath, editedName, setEditedCharacterPath]);

  // Função para fechar o popup e resetar os valores editados
  const handleClosePopup = () => {
    setShow(false); // Fecha o popup
    setShowCharacterPopup(false); // Fecha o popup de seleção de avatar
    setEditedCharacterPath(dj?.characterPath || ''); // Reseta o caminho do personagem editado
    setEditedName(dj?.djName || ''); // Reseta o nome do DJ editado
  };

  // Função para lidar com o pressionamento da tecla Enter
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Verifica se a tecla pressionada é Enter e se o botão não está desabilitado
    if (event.key === 'Enter' && !isButtonDisabled) {
      handleSaveChanges(); // Chama a função para salvar as alterações
    }
  };

  // Função para salvar as alterações feitas no DJ
  const handleSaveChanges = async () => {
    // Verifica se o nome e o caminho do personagem editados estão preenchidos
    if (!editedName || !editedCharacterPath) {
      // Se não estiverem preenchidos, exibe uma mensagem de erro
      setPopupMessageData({
        message: 'Por favor, preencha todos os campos.', // Mensagem de erro
        redirectTo: '', // Não há redirecionamento
        show: true // Exibe o popup
      });
      
      return; // Retorna para evitar continuar o processo de salvamento
    }

    const response = await djActions.updateDJ(editedName, editedCharacterPath, token); // Chama a ação para atualizar o DJ com os novos dados e o token fornecido

    // Verifica a resposta da atualização do DJ foi bem-sucedida
    if (response?.status === 200) {
      handleClosePopup(); // Fecha o popup se a atualização for bem-sucedida
    // Caso a reposta for 400 (Bad Request)
    } else if (response?.status === 400) {
      // Exibe uma mensagem de erro informando que o vulgo já existe
      setPopupMessageData({
        message: 'Este vulgo já existe', // Mensagem de erro
        redirectTo: '', // Não há redirecionamento
        show: true // Exibe o popup
      });
    // Em caso de qualquer outra resposta
    } else {
      // Exibe uma mensagem de erro genérica
      setPopupMessageData({
        message: 'Algo deu errado, por favor tente novamente em alguns minutos', // Mensagem de erro
        redirectTo: '', // Não há redirecionamento
        show: true // Exibe o popup
      });
    }
  };

  return (
    <Modal
      className='custom-modal edit-dj-popup' // Classe personalizada para o modal
      onHide={ handleClosePopup } // Função chamada ao fechar o modal
      show={ show } // Estado que controla se o modal está visível
    >
      { /* Cabeçalho do modal com título e botão de fechar */ }
      <Modal.Header
        className='custom-modal-header edit-or-delete-djpopup-custom-modal-header' // Classe personalizada para o cabeçalho do modal
        closeButton // Botão de fechar o modal
 // Estilo para remover a borda inferior
      >
        <Modal.Title>Editar/Excluir DJ</Modal.Title>
      </Modal.Header>
      { /* Corpo do modal com formulário para editar ou excluir DJ */ }
      <Modal.Body
        className='text-center edit-or-delete-djpopup-body' // Classe para centralizar o texto no corpo do modal
        onKeyDown={ handleKeyPress } // Função chamada ao pressionar uma tecla dentro do corpo do modal
        // Estilo para centralizar o conteúdo do modal
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          minHeight: '300px', 
      }}>
        { /* Formulário para editar o DJ */ }
        <Form>
          { /* Container para a imagem do personagem com tooltip */ }
          <Container
            className='dj-avatar-picker'
            onClick={ () => setShowCharacterPopup(true) } // Função chamada ao clicar na imagem do personagem
            onMouseEnter={ () => setShowTooltip(true) } // Função chamada ao passar o mouse sobre a imagem
            onMouseLeave={ () => setShowTooltip(false) } // Função chamada ao retirar o mouse da imagem
            ref={ characterRef } // Referência para o elemento do personagem
            // Estilo para o container da imagem do personagem
            style={{
              cursor: 'pointer', 
              position: 'relative' 
            }}
          >
            { /* Imagem do personagem editado */ }
            <Image
              alt={ editedName } // Texto alternativo para a imagem
              className='mb-3 dj-avatar-preview' // Classe para margem inferior
              src={ editedCharacterPath } // Caminho da imagem do personagem editado
            />
            { /* Tooltip que aparece ao passar o mouse sobre a imagem */ }
            { showTooltip && (
              <Container
                className='dj-avatar-tooltip'
                // Estilo para o tooltip
              >
                Alterar Avatar
              </Container>
            )}
          </Container>
          { /* Campo de entrada para editar o nome do DJ */ }
          <Form.Group className='mb-3'>
            { /* Rótulo para o campo de entrada */ }
            <Form.Control
              className='custom-input dj-name-input text-center' // Aplica o estilo do app ao campo e centraliza o texto
              type='text' // Tipo do campo de entrada
              onChange={ e => setEditedName(e.target.value) } // Função chamada ao alterar o valor do campo
              onKeyDown={ handleClosePopup } // Função chamada ao pressionar uma tecla dentro do campo
              value={ editedName } // Valor do campo de entrada
            />
          </Form.Group>
          { /* Botões para salvar alterações e excluir DJ */ }
          <Button
            className='primary-button'
            disabled={ isButtonDisabled } // Desabilita o botão se isButtonDisabled for true
            onClick={ handleSaveChanges } // Função chamada ao clicar no botão
            type='submit' // Tipo do botão como submit
            variant='primary' // Variante do botão como primária
          >
            Salvar
          </Button>
          <Button
            className='danger-button ms-2' // Estilo de ação destrutiva com espaçamento
            onClick={ () => setShowDeleteConfirmation(true) } // Função chamada ao clicar no botão
            variant='danger' // Variante do botão como perigosa (vermelha)
          >
            Excluir DJ
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default EditOrDeleteDJPopup; // Exporta o componente EditOrDeleteDJPopup como padrão
