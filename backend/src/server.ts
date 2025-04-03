import * as dotenv from 'dotenv';
import { App } from './app';

dotenv.config(); // Carrega as variáveis de ambiente

const PORT = process.env.PORT || 3001; // Pega a porta do arquivo .env ou usa a porta 3001

new App().start(PORT); // Inicia a aplicação na porta especificada
