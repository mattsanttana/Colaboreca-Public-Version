// import React, { useEffect } from 'react';
// import { Card, Button, Container } from 'react-bootstrap';

// type Props = {
//   trackId: string | undefined;
// }

// const QueuePreview: React.FC<Props> = ({trackId}) => {
//   const [queue, setQueue] = useState<string[]>([]);

//   useEffect(() => {
//     const fetchQueue = async () => {
//       const response = await fetch(`http://localhost:3001/queue/${trackId}`);
//       const data = await response.json();
//       setQueue(data);
//     }

//     fetchQueue();
//   }, [trackId]);
  
//   return (
//     <Container className="py-4">
//       <Card
//         className="text-center text-light"
//         style={{ backgroundColor: '#000000', boxShadow: '0 0 0 0.5px #ffffff' }}
//       >
//         <Card.Body>
//           <Card.Title>Fila</Card.Title>
//           <p>música 1</p>
//           <p>música 2</p>
//           <p>música 3</p>
//           <p>música 4</p>
//           <p>música 5</p>
//           <Button>Ver fila</Button>
//         </Card.Body>
//       </Card>
//     </Container>
//   )
// }

// export default QueuePreview