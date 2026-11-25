import { DataTypes, QueryInterface } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.addColumn('messages', 'previous_message', {
      type: DataTypes.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('messages', 'edited_at', {
      type: DataTypes.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.removeColumn('messages', 'edited_at');
    await queryInterface.removeColumn('messages', 'previous_message');
  },
};
