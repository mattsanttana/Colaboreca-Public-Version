import { Options } from 'sequelize';

// Configuração do banco de dados
const config: Options = {
  username: process.env.DB_USER, // Usuário do banco de dados
  password: process.env.DB_PASS, // Senha do banco de dados
  database: process.env.DB_NAME || 'COLABORECA', // Nome do banco de dados
  host: process.env.DB_HOST, // Host do banco de dados
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306, // Porta do banco de dados
  dialect: 'mysql', // Tipo do banco de dados
  dialectOptions: {
    timezone: 'Z', // Fuso horário
  },
  logging: false, // Desabilita o log das queries executadas
};

// Configuração do banco de dados em produção
if (process.env.JAWSDB_BROWN_URL) {
  const url = new URL(process.env.JAWSDB_BROWN_URL); // URL de conexão com o banco de dados
  config.username = url.username; // Usuário do banco de dados
  config.password = url.password; // Senha do banco de dados
  config.database = url.pathname.substring(1); // Nome do banco de dados
  config.host = url.hostname; // Host do banco de dados
  config.port = parseInt(url.port); // Porta do banco de dados
}

export = config; // Exporta a configuração do banco de dados