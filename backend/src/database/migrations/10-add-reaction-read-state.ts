import { DataTypes, QueryInterface } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.addColumn('message_reactions', 'read', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.bulkUpdate('message_reactions', { read: true }, {});
    await queryInterface.bulkUpdate(
      'messages',
      { read: true },
      { chat_id: null, is_reply: true }
    );
  },

  down(queryInterface: QueryInterface) {
    return queryInterface.removeColumn('message_reactions', 'read');
  },
};
