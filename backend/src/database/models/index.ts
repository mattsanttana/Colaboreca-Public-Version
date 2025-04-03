import { Sequelize } from 'sequelize';
import * as config from '../config/database';

const sequelize = new Sequelize(config) // Cria uma nova instância do Sequelize

export default sequelize; // Exporta a instância do Sequelize