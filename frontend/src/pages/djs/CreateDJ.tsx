import '../../styles/djs/CreateDJ.css';
import { lazy, Suspense, useEffect, useState } from 'react';
import { Button, Container, Image, Spinner } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { charactersPaths, horizontalLogo, logo } from '../../assets/images/characterPath';
import { saveToken } from '../../redux/actions';
import { RootState } from '../../redux/store';
import useDJ from '../../utils/useDJ';
import DJCreationFields from './DJCreationFields';

const MessagePopup = lazy(() => import('../shared/MessagePopup'));

interface CreateDJProps {
  token: string;
}

const CreateDJ: React.FC<CreateDJProps> = ({ token }) => {
  const { trackId = '' } = useParams<{ trackId: string }>();
  const [djName, setDJName] = useState('');
  const [characterPath, setCharacterPath] = useState(
    charactersPaths[Math.floor(Math.random() * charactersPaths.length)],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [popupMessageData, setPopupMessageData] = useState({ message: '', redirectTo: '', show: false });
  const dispatch = useDispatch();
  const djActions = useDJ();
  const navigate = useNavigate();
  const isDJNameValid = djName.length >= 3 && djName.length <= 16;

  useEffect(() => {
    const fetchData = async () => {
      const response = await djActions.getDJData(token);
      if (Number(response?.data?.dj?.trackId) === Number(trackId)) {
        navigate(`/track/${response?.data.dj.trackId}`);
        return;
      }
      setIsLoading(false);
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = async () => {
    if (!isDJNameValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const dj = await djActions.createDJ({
        djName,
        characterPath,
        trackId: Number(trackId),
      });

      if (dj?.status === 201) {
        dispatch(saveToken(dj.data.token));
        navigate(`/track/${trackId}`);
      } else if (dj?.status === 400) {
        setPopupMessageData({ message: 'Este vulgo já existe, por favor tente outro', redirectTo: '', show: true });
      } else if (dj?.status === 401) {
        setPopupMessageData({ message: 'Pista excluída, por favor entre em uma nova pista', redirectTo: '/', show: true });
      } else {
        setPopupMessageData({ message: 'Algo deu errado, por favor tente novamente em alguns minutos', redirectTo: '/', show: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && isDJNameValid) {
      handleClick();
    }
  };

  return (
    <>
      <Suspense fallback={<Spinner />}>
        <MessagePopup
          data={popupMessageData}
          onHide={() => setPopupMessageData({ ...popupMessageData, show: false })}
        />
      </Suspense>
      {isLoading ? (
        <Container className="d-flex justify-content-center align-items-center create-dj-container">
          <Image alt="Logo de carregamento" className="logo-spinner" src={logo} />
        </Container>
      ) : (
        <Container
          className="d-flex flex-column align-items-center justify-content-center gradient-border create-dj-container-2"

        >
          <Image alt="Logo horizontal" className="img-fluid shadow-lg mb-3 create-dj-image" src={horizontalLogo} />
          <h1 className="create-dj-title"

          >
            Crie seu DJ
          </h1>
          <div className="create-dj-wrapper">
            <DJCreationFields
              characterPath={characterPath}
              djName={djName}
              onCharacterChange={setCharacterPath}
              onDJNameChange={(event) => setDJName(event.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button className="primary-button w-100" disabled={!isDJNameValid || isSubmitting} onClick={handleClick} variant="primary">
              {isSubmitting ? <Spinner animation="border" size="sm" /> : isDJNameValid ? 'Criar DJ' : 'Preencha seu vulgo'}
            </Button>
          </div>
        </Container>
      )}
    </>
  );
};

const mapStateToProps = (state: RootState) => ({ token: state.reducer.token });
const CreateDJConnected = connect(mapStateToProps)(CreateDJ);

export default CreateDJConnected;
