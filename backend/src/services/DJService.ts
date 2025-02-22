import { UniqueConstraintError, Sequelize } from 'sequelize';
import * as config from '../database/config/database';
import DJModel from '../models/DJModel';
import TrackModel from '../models/TrackModel';
import JWT from '../utils/JWT';
import { getSocket } from '../utils/socketIO';

// Essa é classe que contém toda a lógica de negócio para o DJ
export default class DJService {
  constructor(
    // Injetar as dependências necessárias
    private sequelize: Sequelize = new Sequelize(config),
    private djModel: DJModel = new DJModel(),
    private trackModel: TrackModel = new TrackModel()
  ) { }

  // Método para criar um DJ
  async createDJ(data: { djName: string, characterPath: string, trackId: number }) {
    const { djName, trackId, characterPath } = data; // Receber os dados do DJ
    const io = getSocket(); // Obtenha a instância do Socket.IO

    try {
      const track = await this.trackModel.findOne({ id: trackId }); // Verificar se a pista existe

      // Se a pista não existir, retorne uma mensagem de erro
      if (!track) {
        return { status: 'UNAUTHORIZED', data: { message: 'This track does not exist' } };
      }

      const djExists = await this.djModel.findOne({ djName, trackId }); // Verificar se já existe um DJ com o mesmo nome

      // Se o DJ já existir, retorne uma mensagem de erro
      if (djExists) {
        return { status: 'CONFLICT', data: { message: 'DJ already exists' } };
      }

      const dj = await this.djModel.create(djName, characterPath, trackId); // Criar um novo DJ

      const token = JWT.sign({ id: dj.id, trackId }); // Gerar um token com o ID do DJ e o ID da pista

      const response = { ...dj, token }; // Retornar o DJ e o token

      
      io.to(`track_${trackId}`).emit('dj created', { dj }); // Emitir um evento para o Socket.IO de que um novo DJ foi criado
      
      return { status: 'CREATED', data: response }; // Retornar uma mensagem de sucesso e o status correspondente
    } catch (error) {
      // Se ocorrer um erro, exiba no console e retorne uma mensagem de erro
      console.error(error);
      if (error instanceof Error) {
        return { status: 'ERROR', data: { message: error.message } };
      } else {
        return { status: 'ERROR', data: { message: 'An unknown error occurred' } };
      }
    }
  }

  // Método para encontrar o DJ e todos os DJs da pista cujo token foi fornecido
  async findDJData(authorization: string) {
    try {
      const token = authorization.split(' ')[1]; // Pegar o token do cabeçalho
      const decoded = JWT.verify(token); // Verificar se o token é válido

      // Se o token for inválido, retorne uma mensagem de erro
      if (typeof decoded === 'string') {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      const djId = decoded.id; // Pegar o ID do DJ

      const response = await this.djModel.findAll({ trackId: decoded.trackId });  // Encontrar todos os DJs da pista

      const dj = response.find((dj: { id?: number | undefined }) => dj.id === djId);  // Encontrar o DJ cujo ID é igual ao ID do DJ
      const djs = response; // Retornar todos os DJs

      return { status: 'OK', data: { dj, djs } }; // Retornar o DJ e todos os DJs com o status correspondente
    } catch (error) {
      // Se ocorrer um erro, exiba no console e retorne uma mensagem de erro
      console.error(error);
      if (error instanceof Error) {
        return { status: 'ERROR', data: { message: error.message } };
      } else {
        return { status: 'ERROR', data: { message: 'An unknown error occurred' } };
      }
    }
  }

  // Método para encontrar todos os DJs da pista cujo ID foi fornecido
  async findAllDJsForTrack(trackId: number) {
    try {
      const response = await this.djModel.findAll({ trackId }); // Encontrar todos os DJs da pista

      // Se não houver DJs, retorne uma mensagem de erro
      if (!response) {
        return { status: 'NOT_FOUND', data: { message: 'DJ not found' } };
      }

      return { status: 'OK', data: response }; // Retornar todos os DJs com o status correspondente
    } catch (error) {
      // Se ocorrer um erro, exiba no console e retorne uma mensagem de erro
      console.error(error);
      if (error instanceof Error) {
        return { status: 'ERROR', data: { message: error.message } };
      } else {
        return { status: 'ERROR', data: { message: 'An unknown error occurred' } };
      }
    }
  }

  // Método para encontrar um DJ específico pelo ID
  async findDJById(djId: number, trackId: number) {
    try {
      const response = await this.djModel.findOne({ id: djId }); // Encontrar um DJ pelo ID

      // Se o DJ não for encontrado, retorne uma mensagem de erro
      if (!response) {
        return { status: 'NOT_FOUND', data: { message: 'DJ not found' } };
      }

      return { status: 'OK', data: response }; // Retornar o DJ com o status correspondente
    } catch (error) {
      // Se ocorrer um erro, exiba no console e retorne uma mensagem de erro
      console.error(error);
      if (error instanceof Error) {
        return { status: 'ERROR', data: { message: error.message } };
      } else {
        return { status: 'ERROR', data: { message: 'An unknown error occurred' } };
      }
    }
  }

  // Método para verificar se o DJ é o proprietário do perfil
  async verifyIfTheDJIsTheProfileOwner(id: number, authorization: string) {
    try {
      const token = authorization.split(' ')[1]; // Pegar o token do cabeçalho
      const decoded = JWT.verify(token); // Verificar se o token é válido

      // Se o token for inválido, retorne uma mensagem de erro
      if (typeof decoded === 'string') {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      // Se o ID do DJ não for igual ao ID decodificado, retorne uma mensagem de erro
      if (id !== decoded.id) {
        return { status: 'UNAUTHORIZED', data: { message: 'This DJ is not the owner of this profile' } };
      }

      const dj = await this.djModel.findOne({ id: decoded.id }); // Encontrar o DJ pelo ID

      // Se o DJ não for encontrado, retorne uma mensagem de erro
      if (!dj) {
        return { status: 'NOT_FOUND', data: { message: 'DJ not found' } };
      }

      return { status: 'OK', data: { message: 'This DJ is the owner this profile' } }; // Retornar uma mensagem de sucesso
    } catch (error) {
      // Se ocorrer um erro, exiba no console e retorne uma mensagem de erro
      console.error(error);
      if (error instanceof Error) {
        return { status: 'ERROR', data: { message: error.message } };
      } else {
        return { status: 'ERROR', data: { message: 'An unknown error occurred' } };
      }
    }
  }

  // Método para atualizar o DJ
  async updateDJ(characterPath: string, djName: string, authorization: string) {
    const io = getSocket(); // Obtenha a instância do Socket.IO

    try {
      const token = authorization.split(' ')[1]; // Pegar o token do cabeçalho
      const decoded = JWT.verify(token); // Verificar se o token é válido

      // Se o token for inválido, retorne uma mensagem de erro
      if (typeof decoded === 'string') {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      const dj = await this.djModel.findOne({ id: decoded.id }); // Encontrar o DJ pelo ID

      // Se o DJ não for encontrado, retorne uma mensagem de erro
      if (!dj) {
        return { status: 'NOT_FOUND', data: { message: 'DJ not found' } };
      }

      const updatedFields: Partial<{ djName: string; characterPath: string; priority: number }> = {}; // Inicializar os campos atualizados

      // Se o nome do DJ for diferente do nome do DJ atual, atualize o nome do DJ
      if (djName !== undefined && djName !== dj.djName) {
        updatedFields['djName'] = djName;
      }

      // Se o caminho do personagem for diferente do caminho do personagem atual, atualize o caminho do personagem
      if (characterPath !== undefined && characterPath !== dj.characterPath) {
        updatedFields['characterPath'] = characterPath;
      }

      // Se não houver campos atualizados, retorne uma mensagem de sucesso
      if (Object.keys(updatedFields).length === 0) {
        return { status: 'OK', data: { message: 'No fields updated' } };
      }

      // Atualize o DJ com os campos atualizados
      const response = await this.djModel.update(updatedFields as { djName: string; characterPath: string; priority: number }, { id: decoded.id });

      // Se o DJ não for atualizado, retorne uma mensagem de erro
      if (response[0] === 0) {
        return { status: 'NOT_FOUND', data: { message: 'DJ not found' } };
      }

      io.to(`track_${decoded.trackId}`).emit('dj updated', { djId: decoded.id }); // Emitir um evento para o Socket.IO de que um DJ foi atualizado
      
      return { status: 'OK', data: { message: 'DJ updated successfully' } }; // Retornar uma mensagem de sucesso com o status correspondente
    } catch (error) {
      // Se ocorrer um erro, exiba no console e retorne uma mensagem de erro
      console.error(error);
      // Se o erro for de chave única, retorne uma mensagem de conflito
      if (error instanceof UniqueConstraintError) {
        return { status: 'CONFLICT', data: { message: 'DJ already exists' } };
      } else if (error instanceof Error) {
        return { status: 'ERROR', data: { message: error.message } };
      } else {
        return { status: 'ERROR', data: { message: 'An unknown error occurred' } };
      }
    }
  }

  // Método para deletar o DJ pelo token fornecido (No caso o usuário está excluindo o próprio perfil)
  async deleteDJ(authorization: string) {
    const io = getSocket(); // Obtenha a instância do Socket.IO

    try {
      const token = authorization.split(' ')[1]; // Pegar o token do cabeçalho

      const decoded = JWT.verify(token); // Verificar se o token é válido

      // Se o token for inválido, retorne uma mensagem de erro
      if (typeof decoded === 'string') {
        return { status: 'UNAUTHORIZED', data: { message: 'Invalid token' } };
      }

      const dj = await this.djModel.findOne({ id: decoded.id }); // Encontrar o DJ pelo ID

      // Se o DJ não for encontrado, retorne uma mensagem de erro
      if (!dj) {
        return { status: 'NOT_FOUND', data: { message: 'DJ not found' } };
      }

      const response = await this.djModel.delete({ id: decoded.id }); // Deletar o DJ

      // Se o DJ não for deletado, retorne uma mensagem de erro
      if (response === 0) {
        return { status: 'ERROR', data: { message: 'An error occurred' } };
      }

      io.to(`track_${decoded.trackId}`).emit('dj_deleted', { djId: decoded.id }); // Emitir um evento para o Socket.IO de que um DJ foi deletado

      return { status: 'OK', data: { message: 'DJ deleted successfully' } }; // Retornar uma mensagem de sucesso com o status correspondente
    } catch (error) {
      // Se ocorrer um erro, exiba no console e retorne uma mensagem de erro
      console.error(error);
      if (error instanceof Error) {
        return { status: 'ERROR', data: { message: error.message } };
      } else {
        return { status: 'ERROR', data: { message: 'An unknown error occurred' } };
      }
    }
  }
}
