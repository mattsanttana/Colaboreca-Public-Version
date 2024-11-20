import * as express from 'express';
import * as http from 'http';

import router from './routes';
import { initSocket } from './utils/socketIO'; // Importe a função de inicialização do Socket.IO

class App {
  public app: express.Express;
  private server: http.Server;

  constructor() {
    this.app = express();

    // Criar o servidor HTTP
    this.server = http.createServer(this.app);

    // Inicialize o Socket.IO
    initSocket(this.server);

    this.config();
    this.routes();

    // Não remover essa rota
    this.app.get('/', (req, res) => res.json({ ok: true }));
  }

  private config(): void {
    const accessControl: express.RequestHandler = (_req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*'); // Ajuste aqui se necessário
      res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS,PUT,PATCH');
      res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type'); // Inclua explicitamente os cabeçalhos permitidos
      next();
    };

    this.app.use(express.json());
    this.app.use(accessControl);
  }

  private routes(): void {
    this.app.use(router);
  }

  public start(PORT: string | number): void {
    this.server.listen(PORT, () => {
      console.log(`Running on port ${PORT}`);
      console.log(`Socket.IO is running on port ${PORT}`);
    });
  }
}

export { App };
export const { app } = new App();