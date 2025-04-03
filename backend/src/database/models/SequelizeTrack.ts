import {
  DataTypes, Model, InferAttributes, InferCreationAttributes
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