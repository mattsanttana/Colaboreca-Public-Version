import { FindOptions, Transaction, WhereOptions } from "sequelize";
import SequelizeMessage from "../database/models/SequelizeMessage";
import SequelizeMessageReaction from "../database/models/SequelizeMessageReaction";
import SequelizeDJ from "../database/models/SequelizeDJ";
import { Op } from 'sequelize';

// Classe responsável pelo modelo de mensagem
export default class MessageModel {
  private messageModel = SequelizeMessage; // Instância do modelo de mensagem

  private readonly messageIncludes = [
    {
      model: SequelizeDJ,
      as: 'dj',
      attributes: ['id', 'djName', 'characterPath', 'score', 'ranking', 'trackId'],
    },
    {
      model: SequelizeDJ,
      as: 'receiveDJ',
      attributes: ['id', 'djName', 'characterPath', 'score', 'ranking', 'trackId'],
    },
  ];

  private readonly reactionInclude = {
    model: SequelizeMessageReaction,
    as: 'reactions',
    attributes: ['id', 'messageId', 'djId', 'emoji', 'createdAt', 'read'],
  };

  private isMissingReactionTable(error: unknown): boolean {
    if (!(error instanceof Error)) return false;

    const databaseError = error as Error & {
      original?: { code?: string; errno?: number };
      parent?: { code?: string; errno?: number };
    };

    return [databaseError.original, databaseError.parent].some(
      (cause) => cause?.code === 'ER_NO_SUCH_TABLE' || cause?.errno === 1146
    );
  }

  private isMissingReactionReadColumn(error: unknown): boolean {
    if (!(error instanceof Error)) return false;

    const databaseError = error as Error & {
      original?: { code?: string; errno?: number; sqlMessage?: string };
      parent?: { code?: string; errno?: number; sqlMessage?: string };
    };

    return [databaseError.original, databaseError.parent].some((cause) => {
      const description = `${databaseError.message} ${cause?.sqlMessage || ''}`
        .toLowerCase()
        .replace(/[`'"]/g, '');
      return (
        cause?.errno === 1054
        && description.includes('read')
        && description.includes('reaction')
      );
    });
  }

  private isMissingMessageEditColumn(error: unknown): boolean {
    if (!(error instanceof Error)) return false;

    const databaseError = error as Error & {
      original?: { errno?: number; sqlMessage?: string };
      parent?: { errno?: number; sqlMessage?: string };
    };

    return [databaseError.original, databaseError.parent].some((cause) => {
      const description = `${databaseError.message} ${cause?.sqlMessage || ''}`
        .toLowerCase()
        .replace(/[`'"]/g, '');
      return (
        cause?.errno === 1054
        && (description.includes('previous_message') || description.includes('edited_at'))
      );
    });
  }

  private withoutMessageEditColumns(findOptions: FindOptions): FindOptions {
    const attributes = findOptions.attributes;
    if (Array.isArray(attributes)) {
      return {
        ...findOptions,
        attributes: attributes.filter((attribute) => {
          if (typeof attribute === 'string') {
            return attribute !== 'previousMessage' && attribute !== 'editedAt';
          }
          return !(
            Array.isArray(attribute)
            && typeof attribute[1] === 'string'
            && ['previousMessage', 'editedAt'].includes(attribute[1])
          );
        }),
      };
    }

    const excludedAttributes =
      attributes && !Array.isArray(attributes) && Array.isArray(attributes.exclude)
        ? attributes.exclude
        : [];
    return {
      ...findOptions,
      attributes: {
        exclude: [...excludedAttributes, 'previousMessage', 'editedAt'],
      },
    };
  }

  private getIncludes(includeReactions: boolean) {
    return includeReactions
      ? [...this.messageIncludes, this.reactionInclude]
      : this.messageIncludes;
  }

  // Método para criar uma mensagem
  async create(
    data: {
      chatId: number | null,
      trackId: number,
      djId: number,
      receiveDJId: number | null,
      message: string,
      createdAt: Date,
      isReply?: boolean,
      replyTo?: number | null
    },
    options: { transaction: Transaction }
  ) {

    const { chatId, trackId, djId, receiveDJId, message, createdAt, isReply, replyTo } = data; // Destruturação dos dados

    // Cria uma mensagem
    const response = await this.messageModel.create({
      chatId,
      trackId,
      djId,
      receiveDJId,
      message,
      createdAt,
      isReply,
      replyTo
    }, options);

    const createdMessage = response.get();
    const hydratedMessage = await this.findOne({
      where: { id: createdMessage.id },
    }, options);

    return hydratedMessage ?? createdMessage; // Retorna a mensagem com os DJs relacionados
  }

  // Método para atualizar mensagens
  async update(messageIds: (number | string)[], options: { transaction: Transaction }) { 
    // Atualiza mensagens
    const response = await this.messageModel.update(
      {
        read: true,
      },
      {
        where: {
          id: {
            [Op.in]: messageIds,
          },
        },
        ...options,
      }
    );
    return response; // Retorna a resposta
  }

  // Método para buscar uma mensagem
  async findOne(findOptions: FindOptions, options?: { transaction: Transaction }) {
    try {
      const response = await this.messageModel.findOne({
        ...findOptions,
        include: this.messageIncludes,
        ...options,
      });
      return response?.get();
    } catch (error) {
      if (!this.isMissingMessageEditColumn(error)) throw error;

      console.warn(
        'The message edit-history columns are missing; run pending database migrations. Loading messages without edit history.'
      );
      const response = await this.messageModel.findOne({
        ...this.withoutMessageEditColumns(findOptions),
        include: this.messageIncludes,
        ...options,
      });
      if (!response) return undefined;
      return {
        ...response.get(),
        previousMessage: null,
        editedAt: null,
      };
    }
  }

  // Método para buscar todas as mensagens
  async findAll(
    findOptions: FindOptions,
    options?: { transaction: Transaction },
    includeReactions = false
  ) {
    let queryOptions = findOptions;
    let includeReactionReadState = includeReactions;
    let includeReactionTable = includeReactions;
    let includeEditHistory = true;

    while (true) {
      const include = includeReactionTable
        ? [
            ...this.messageIncludes,
            includeReactionReadState
              ? this.reactionInclude
              : {
                  ...this.reactionInclude,
                  attributes: ['id', 'messageId', 'djId', 'emoji', 'createdAt'],
                },
          ]
        : this.messageIncludes;

      try {
        const response = await this.messageModel.findAll({
          ...(includeEditHistory
            ? queryOptions
            : this.withoutMessageEditColumns(queryOptions)),
          include,
          ...options,
        });
        return response.map((message) => {
          const plainMessage = message.get();
          return {
            ...plainMessage,
            ...(!includeEditHistory
              ? { previousMessage: null, editedAt: null }
              : {}),
            ...(!includeReactionReadState && includeReactionTable
              ? {
                  reactions: (message.reactions || []).map((reaction) => ({
                      ...reaction.get(),
                      read: true,
                  })),
                }
              : {}),
          };
        });
      } catch (error) {
        if (includeEditHistory && this.isMissingMessageEditColumn(error)) {
          includeEditHistory = false;
          console.warn(
            'The message edit-history columns are missing; run pending database migrations. Loading messages without edit history.'
          );
          continue;
        }
        if (includeReactionReadState && this.isMissingReactionReadColumn(error)) {
          includeReactionReadState = false;
          console.warn(
            'The message_reactions.read column is missing; run pending database migrations. Loading reactions as already read.'
          );
          continue;
        }
        if (includeReactionTable && this.isMissingReactionTable(error)) {
          includeReactionTable = false;
          console.warn(
            'The message_reactions table is missing; run pending database migrations. Loading chats without reactions.'
          );
          continue;
        }
        throw error;
      }
    }
  }

  // Método para buscar todas as mensagens
  async delete(where: WhereOptions, options: { transaction: Transaction }) {
    const response = await this.messageModel.destroy({ where, ...options }); // Deleta uma mensagem
    return response; // Retorna a resposta
  }
}
