import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import db from '.';
import SequelizeTrack from './SequelizeTrack';

// Classe responsável pela criação do modelo de chat
class SequelizeChat extends Model<
  InferAttributes<SequelizeChat>,
  InferCreationAttributes<SequelizeChat>
> {
  declare id?: number; // ID da mensagem
  declare trackId: number; // ID da track
}

// Inicialização do modelo de chat
SequelizeChat.init(
  {
    // Coluna de id
    id: {
      type: DataTypes.INTEGER, // Tipo inteiro
      allowNull: false, // Não pode ser nulo
      primaryKey: true, // É uma chave primária
      unique: true, // É um valor único
      autoIncrement: true, // Auto incremento
    },
    // Coluna de mensagem
    trackId: {
      type: DataTypes.INTEGER, // Tipo inteiro
      allowNull: false, // Não pode ser nulo
      field: 'track_id', // Nome da coluna no banco de dados
    },
  },
  {
    sequelize: db, // Conexão com o banco de dados
    tableName: 'chats', // Nome da tabela
    timestamps: false, // Não cria as colunas de timestamp
  }
);

// Associação entre as tabelas de chat e track
SequelizeTrack.hasMany(SequelizeChat, {
  foreignKey: 'trackId', // Chave estrangeira
  as: 'chatMessages', // Lista de mensagens associadas a uma track específica
});

SequelizeChat.belongsTo(SequelizeTrack, {
  foreignKey: 'trackId', // Chave estrangeira
  as: 'track', // Associação para identificar a track associada à mensagem
});

export default SequelizeChat;
