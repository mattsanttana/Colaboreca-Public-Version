import {
  DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional
} from 'sequelize';
import db from '.';

// Classe responsável pela criação do modelo da pista
class SequelizeTrack extends Model<
  InferAttributes<SequelizeTrack>,
  InferCreationAttributes<SequelizeTrack>
> {
  declare id: number; // ID da pista
  declare trackName: string; // Nome da pista
  declare spotifyToken: string; // Token do Spotify
  declare queueOpen: CreationOptional<boolean>; // Se a fila está aberta ou não
  declare maxSongsPerDJ: CreationOptional<number>; // Número máximo de músicas por DJ
  declare veryBadVotesToSkip: CreationOptional<number>; // Número de votos negativos para pular a música
  declare createdAt: Date; // Data de criação
  declare updatedAt: Date; // Data de atualização
}

// Inicialização do modelo da pista
SequelizeTrack.init(
  {
    // Coluna de id
    id: {
      type: DataTypes.INTEGER, // Tipo inteiro
      allowNull: false, // Não pode ser nulo
      primaryKey: true, // É uma chave primária
    },
    // Coluna de nome da pista
    trackName: {
      type: DataTypes.STRING, // Tipo texto
      allowNull: false, // Não pode ser nulo
      field: 'track_name', // Nome da coluna no banco de dados
    },
    // Coluna de token do Spotify
    spotifyToken: DataTypes.STRING(400), // Tipo string com 400 caracteres
    queueOpen: {
      type: DataTypes.BOOLEAN, // Tipo booleano
      allowNull: false, // Não pode ser nulo
      defaultValue: true, // Valor padrão é true
      field: 'queue_open', // Nome da coluna no banco de dados
    },
    maxSongsPerDJ: {
      type: DataTypes.INTEGER, // Tipo inteiro
      allowNull: false, // Não pode ser nulo
      defaultValue: 3, // Valor padrão é 3
      field: 'max_songs_per_dj', // Nome da coluna no banco de dados
    },
    veryBadVotesToSkip: {
      type: DataTypes.INTEGER, // Tipo inteiro
      allowNull: false, // Não pode ser nulo
      defaultValue: 0, // Valor padrão é 0
      field: 'very_bad_votes_to_skip', // Nome da coluna no banco de dados
    },
    // Coluna de data de criação
    createdAt: {
      type: DataTypes.DATE, // Tipo data
      allowNull: false, // Não pode ser nulo
      field: 'created_at', // Nome da coluna no banco de dados
    },
    // Coluna de data de atualização
    updatedAt: {
      type: DataTypes.DATE, // Tipo data
      allowNull: false, // Não pode ser nulo
      field: 'updated_at', // Nome da coluna no banco de dados
    },
  },
  {
    sequelize: db, // Conexão com o banco de dados
    tableName: 'tracks', // Nome da tabela
    timestamps: false, // Não cria as colunas `createdAt` e `updatedAt`
  });

export default SequelizeTrack;