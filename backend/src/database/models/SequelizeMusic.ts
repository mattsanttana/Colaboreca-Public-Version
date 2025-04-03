import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import db from '.';
import SequelizeDJ from './SequelizeDJ';
import SequelizeTrack from './SequelizeTrack';

// Classe responsável pela criação do modelo de música
class SequelizeMusic extends Model<
  InferAttributes<SequelizeMusic>,
  InferCreationAttributes<SequelizeMusic>
> {
  declare id?: number; // ID da música
  declare cover: string; // Capa da música
  declare name: string; // Nome da música
  declare artists: string; // Artistas da música
  declare musicURI: string; // URI da música
  declare djId: number; // ID do DJ
  declare trackId: number; // ID da pista
  declare pointsApllied?: boolean; // Pontos aplicados
}

// Inicialização do modelo de música
SequelizeMusic.init(
  {
    // Coluna de id
    id: {
      type: DataTypes.INTEGER, // Tipo inteiro
      allowNull: false, // Não pode ser nulo
      primaryKey: true, // É uma chave primária
      unique: true, // É um valor único
      autoIncrement: true, // Auto incremento
    },
    // Coluna de capa
    cover: {
      type: DataTypes.STRING, // Tipo texto
      allowNull: false, // Não pode ser nulo
      field: 'cover', // Nome da coluna no banco de dados
    },
    // Coluna de nome
    name: {
      type: DataTypes.STRING, // Tipo texto
      allowNull: false, // Não pode ser nulo
      field: 'name', // Nome da coluna no banco de dados
    },
    // Coluna de artistas
    artists: {
      type: DataTypes.STRING, // Tipo texto
      allowNull: false, // Não pode ser nulo
      field: 'artists', // Nome da coluna no banco de dados
    },
    // Coluna de URI da música
    musicURI: {
      type: DataTypes.STRING, // Tipo texto
      allowNull: false, // Não pode ser nulo
      field: 'track_uri', // Nome da coluna no banco de dados
    },
    // Coluna de id do DJ
    djId: {
      type: DataTypes.INTEGER, // Tipo inteiro
      allowNull: false, // Não pode ser nulo
      field: 'dj_id', // Nome da coluna no banco de dados
    },
    // Coluna de id da pista
    trackId: {
      type: DataTypes.INTEGER, // Tipo inteiro
      allowNull: false, // Não pode ser nulo
      field: 'track_id', // Nome da coluna no banco de dados
    },
    // Coluna de pontos aplicados
    pointsApllied: {
      type: DataTypes.BOOLEAN, // Tipo booleano
      defaultValue: false, // Valor padrão
      allowNull: false, // Não pode ser nulo
      field: 'points_apllied', // Nome da coluna no banco de dados
    },
  },
  {
    sequelize: db, // Conexão com o banco de dados
    modelName: 'musics', // Nome do modelo
    timestamps: false, // Não cria colunas de data de criação/atualização
  }
);

// Associação entre as tabelas de músicas e DJs
SequelizeDJ.hasMany(SequelizeMusic, {
  foreignKey: 'djId',
  as: 'colaborecaQueue',
});

SequelizeMusic.belongsTo(SequelizeDJ, {
  foreignKey: 'djId',
  as: 'dj',
});

// Associação entre músicas e pistas
SequelizeTrack.hasMany(SequelizeMusic, {
  foreignKey: 'trackId',
  as: 'colaborecaQueue',
});

SequelizeMusic.belongsTo(SequelizeTrack, {
  foreignKey: 'trackId',
  as: 'track',
});

export default SequelizeMusic;