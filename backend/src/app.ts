import * as express from 'express';
import * as http from 'http';
import accessControl from './middlewares/accessControl';
import router from './routes';
import { initSocket } from './utils/socketIO';

// Classe principal da aplicação
class App {
  public app: express.Express; // Instância do Express
  private server: http.Server; // Instância do servidor HTTP

  constructor() {
    this.app = express(); // Inicialize o Express

    this.server = http.createServer(this.app); // Criar o servidor HTTP

    initSocket(this.server); // Inicialize o Socket.IO

    this.config(); // Configure o Express

    this.routes(); // Configure as rotas

    this.app.get('/', (req, res) => res.json({ ok: true })); // Rota pra verificar se o servidor está online
  }

  // Método para configurar o Express
  private config(): void {
    this.app.use(express.json()); // Habilita o uso de JSON
    this.app.use(accessControl); // Habilita o middleware de controle de acesso
  }

  // Método para configurar as rotas
  private routes(): void {
    this.app.use(router); // Habilita as rotas
  }

  // Método para iniciar o servidor
  public start(PORT: string | number): void {
    // Inicia o servidor na porta especificada
    this.server.listen(PORT, () => {
      console.log(`Running on port ${PORT}`); // Exibe uma mensagem no console
    });
  }
}

export { App }; // Exporta a classe App
export const { app } = new App(); // Exporta a instância do Express