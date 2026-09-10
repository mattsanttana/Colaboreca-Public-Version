import { Modal} from 'react-bootstrap';
import { DJ } from '../types/DJ';
import Podium from './Podium';
import RankingTable from './RankingTable';

// Props recebidas
interface Props {
  currentRanking: DJ[]; // Ranking atual
  dj: DJ | undefined; // DJ atual
  onHide: () => void; // Função para fechar o popup
  previousRanking: DJ[]; // Ranking anterior
  show: boolean; // Estado para controlar a exibição do popup
  trackName: string; // Nome da pista
}

// Componente principal do popup de animação de alteração de ranking
const RankingChangePopup: React.FC<Props> = ({ currentRanking, dj, onHide, previousRanking, show, trackName }) => (
  <Modal
    className='custom-modal custom-modal-header' // Classe personalizada
    onHide={ onHide } // Função para fechar o popup
    show={ show } // Estado para mostrar o popup
  >
    <Modal.Header
      closeButton // Botão de fechar
      style={{ borderBottom: 'none' }} // Estilo do cabeçalho
    >
      <Modal.Title>Você subiu no ranque!</Modal.Title>
    </Modal.Header>
    <Modal.Body
      // Estilo do corpo do modal
      style={{
        maxHeight: '70vh', // Altura máxima do modal
        overflowY: 'auto' // Permite rolagem vertical
      }}
    >
      { /* Componente de pódio */ }
      <Podium
        dj={ dj } // DJ atual
        djs={ currentRanking.slice(0, 3) } // Lista de DJs para o pódio
        trackName={ trackName } // Nome da pista
      />
      <RankingTable
        currentRanking={ currentRanking } // Ranking atual
        dj={ dj } // DJ atual
        previousRanking={ previousRanking } // Ranking anterior
      />
    </Modal.Body>
    <Modal.Footer style={{ borderTop: 'none' }} />
  </Modal>
);

export default RankingChangePopup;
