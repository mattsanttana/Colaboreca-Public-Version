import { Card, Button, Container } from 'react-bootstrap';

const Queue = () => {
  return (
    <Container className="py-4">
      <Card
        className="text-center text-light"
        style={{ backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff' }}
      >
        <Card.Body>
          <Card.Title>Fila</Card.Title>
          <p>música 1</p>
          <p>música 2</p>
          <p>música 3</p>
          <p>música 4</p>
          <p>música 5</p>
          <Button>Ver fila</Button>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default Queue