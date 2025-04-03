import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import db from '.';
import SequelizeChat from './SequelizeChat';
import SequelizeDJ from './SequelizeDJ';

// Classe responsável pela criação do modelo de mensagem
class SequelizeMessage extends Model<
  InferAttributes<SequelizeMessage>,
  InferCreationAttributes<SequelizeMessage>
> {
  declare id?: number; // ID da mensagem
  declare chatId?: number | null; // ID do chat
  declare trackId: number; // ID da pista
  declare djId: number; // ID do DJ
  declare receiveDJId?: number | null; // ID do DJ que recebeu a mensagem
  declare message: string; // Mensagem
  declare createdAt: Date; // Data de criação
  declare read?: boolean; // Mensagem lida
  declare isReply?: boolean; // Mensagem de resposta
  declare replyTo?: number | null; // ID da mensagem respondida
}

// Inicialização do modelo de mensagem
SequelizeMessage.init(
  {
    // Coluna de id
    id: {
      type: DataTypes.INTEGER, // Tipo inteiro
      allowNull: false, // Não pode ser nulo
      primaryKey: true, // É uma chave primária
      unique: true, // É um valor único
      autoIncrement: true, // Auto incremento
    },
    // Coluna de id do chat
    chatId: {
      type: DataTypes.INTEGER, // Tipo inteiro
      allowNull: true, // Pode ser nulo
      field: 'chat_id', // Nome da coluna no banco de dados
    },
    // Coluna de id da pista
    trackId: {
      type: DataTypes.INTEGER, // Tipo inteiro
      allowNull: false, // Não pode ser nulo
      field: 'track_id', // Nome da coluna no banco de dados
    },
    // Coluna de id do DJ
    receiveDJId: {
      type: DataTypes.INTEGER, // Tipo inteiro
      allowNull: true, // Pode ser nulo
      field: 'receive_dj_id', // Nome da coluna no banco de dados
    },
    // Coluna de mensagem
    djId: {
      type: DataTypes.INTEGER, // Tipo inteiro
      allowNull: false, // Não pode ser nulo
      field: 'dj_id', // Nome da coluna no banco de dados
    },
    // Coluna de mensagem
    message: {
      type: DataTypes.TEXT, // Tipo texto
      allowNull: false, // Não pode ser nulo
    },
    // Coluna de data de criação
    createdAt: {
      type: DataTypes.DATE, // Tipo data
      allowNull: false, // Não pode ser nulo
      field: 'created_at', // Nome da coluna no banco de dados
      defaultValue: new Date(), // Valor padrão
    },
    // Coluna de mensagem lida
    read: {
      type: DataTypes.BOOLEAN, // Tipo booleano
      allowNull: false, // Não pode ser nulo
      defaultValue: false, // Valor padrão
    },
    // Coluna de mensagem de resposta
    isReply: {
      type: DataTypes.BOOLEAN, // Tipo booleano
      allowNull: false, // Não pode ser nulo
      defaultValue: false, // Valor padrão
      field: 'is_reply', // Nome da coluna no banco de dados
    },
    // Coluna de id da mensagem respondida
    replyTo: {
      type: DataTypes.INTEGER, // Tipo inteiro
      allowNull: true, // Pode ser nulo
      defaultValue: null, // Valor padrão
      field: 'reply_to', // Nome da coluna no banco de dados
    },
  },
  {
    sequelize: db, // Conexão com o banco de dados
    tableName: 'messages', // Nome da tabela
    timestamps: false, // Não utiliza timestamps
  }
);

// Associações entre as tabelas de mensagem e chat
SequelizeChat.hasMany(SequelizeMessage, {
  foreignKey: 'chatId', // Chave estrangeira
  as: 'chatMessages', // Lista de mensagens associadas a um chat específico
});

SequelizeMessage.belongsTo(SequelizeChat, {
  foreignKey: 'chatId', // Chave estrangeira
  as: 'chat', // Associação para identificar o chat associado à mensagem
});

// Associações entre as tabelas de mensagem e DJs
SequelizeDJ.hasMany(SequelizeMessage, {
  foreignKey: 'djId', // Chave estrangeira
  as: 'djMessages', // Lista de mensagens associadas a um DJ específico
});

SequelizeMessage.belongsTo(SequelizeDJ, {
  foreignKey: 'djId', // Chave estrangeira
  as: 'dj', // Associação para identificar o DJ associado à mensagem
});

export default SequelizeMessage;