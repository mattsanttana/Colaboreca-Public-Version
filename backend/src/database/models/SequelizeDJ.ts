import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import db from '.';
import SequelizeTrack from './SequelizeTrack';

// Classe responsável pela criação do modelo de DJ
class SequelizeDJ extends Model<
  InferAttributes<SequelizeDJ>,
  InferCreationAttributes<SequelizeDJ>
  > {
  declare id?: number; // ID do DJ
  declare djName: string; // Nome do DJ
  declare characterPath: string; // Caminho da imagem do personagem
  declare score?: number; // Pontuação do DJ
  declare ranking?: number; // Ranking do DJ
  declare trackId: number; // ID da pista
}

// Inicialização do modelo de DJ
SequelizeDJ.init(
  {
    // Coluna de id
    id: {
      type: DataTypes.INTEGER, // Tipo inteiro
      allowNull: false, // Não pode ser nulo
      primaryKey: true, // É uma chave primária
      unique: true, // É um valor único
      autoIncrement: true, // Auto incremento
    },
    // Coluna de nome do DJ
    djName: {
      type: DataTypes.STRING, // Tipo string
      allowNull: false, // Não pode ser nulo
      field: 'dj_name', // Nome da coluna no banco de dados
    },
    // Coluna de caminho da imagem do personagem
    characterPath: {
      type: DataTypes.STRING, // Tipo string
      allowNull: false, // Não pode ser nulo
      field: 'character_path' // Nome da coluna no banco de dados
    },
    // Coluna de pontuação
    score: {
      type: DataTypes.FLOAT, // Tipo float
      allowNull: false, // Não pode ser nulo
      defaultValue: 0 // Valor padrão
    },
    // Coluna de ranking
    ranking: {
      type: DataTypes.INTEGER, // Tipo inteiro
      allowNull: false, // Não pode ser nulo
      defaultValue: 0 // Valor padrão
    },
    // Coluna de id da pista
    trackId: {
      type: DataTypes.INTEGER, // Tipo inteiro
      allowNull: false, // Não pode ser nulo
      field: 'track_id' // Nome da coluna no banco de dados
    }
  },
  {
    sequelize: db, // Conexão com o banco de dados
    tableName: 'djs', // Nome da tabela
    timestamps: false, // Não cria as colunas de timestamp
  });

// Associação entre as tabelas de DJs e track  
SequelizeTrack.hasMany(SequelizeDJ, {
  foreignKey: 'trackId', // Chave estrangeira
  as: 'djs', // Lista de DJs associados a uma track específica
});

SequelizeDJ.belongsTo(SequelizeTrack, {
  foreignKey: 'trackId', // Chave estrangeira
  as: 'track', // Associação para identificar a track associada ao DJ
});

export default SequelizeDJ;