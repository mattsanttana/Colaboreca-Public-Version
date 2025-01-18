import { Options } from 'sequelize';

const config: Options = {
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME || 'COLABORECA',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  dialect: 'mysql',
  dialectOptions: {
    timezone: 'Z',
  },
  logging: false,
};

if (process.env.JAWSDB_BROWN_URL) {
  const url = new URL(process.env.JAWSDB_BROWN_URL);
  config.username = url.username;
  config.password = url.password;
  config.database = url.pathname.substring(1);
  config.host = url.hostname;
  config.port = parseInt(url.port);
}

export = config;