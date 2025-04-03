import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import db from '.';
import SequelizeMusic from './SequelizeMusic';
import { Vote } from '../../interfaces/votes/IVote';
import SequelizeDJ from './SequelizeDJ';

// Classe responsável pela criação do modelo de voto
class SequelizeVote extends Model<
  InferAttributes<SequelizeVote>,
  InferCreationAttributes<SequelizeVote>
  > {
  declare id?: number; // ID do voto
  declare djId: number; // ID do DJ
  declare musicId: number; // ID da música
  declare vote: Vote; // Voto
  declare trackId: number; // ID da pista
}

// Inicialização do modelo de voto
SequelizeVote.init(
  {
    // Coluna de id
    id: {
      type: DataTypes.INTEGER, // Tipo inteiro
      allowNull: false, // Não pode ser nulo
      primaryKey: true, // É uma chave primária
      unique: true, // É um valor único
      autoIncrement: true, // Auto incremento
    },
    // Coluna de id do DJ
    djId: {
      type: DataTypes.INTEGER, // Tipo inteiro
      allowNull: false, // Não pode ser nulo
      field: 'dj_id', // Nome da coluna no banco de dados
    },
    // Coluna de id da música
    musicId: {
      type: DataTypes.INTEGER, // Tipo inteiro
      allowNull: false, // Não pode ser nulo
      field: 'music_id', // Nome da coluna no banco de dados
    },
    // Coluna de voto
    vote: {
      type: DataTypes.ENUM('very_good', 'good', 'normal', 'bad', 'very_bad'), // Tipo enum
      allowNull: false, // Não pode ser nulo
    },
    // Coluna de id da pista
    trackId: {
      type: DataTypes.INTEGER, // Tipo inteiro
      allowNull: false, // Não pode ser nulo
      field: 'track_id', // Nome da coluna no banco de dados
    },
  },
  {
    sequelize: db, // Conexão com o banco de dados
    modelName: 'vote', // Nome do modelo
    timestamps: false, // Não cria as colunas `createdAt` e `updatedAt`
  }
);

// Associação entre as tabelas de voto e música
SequelizeMusic.hasMany(SequelizeVote, {
  foreignKey: 'musicId',
  as: 'votes',
});

SequelizeDJ.hasMany(SequelizeVote, {
  foreignKey: 'djId',
  as: 'votes',
});

export default SequelizeVote;