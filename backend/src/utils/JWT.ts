import { JwtPayload, Secret, sign, SignOptions, verify } from 'jsonwebtoken';

// Classe responsável por controlar o JWT
export default class JWT {
  private static secret: Secret = process.env.JWT_SECRET || ''; // Pega a chave secreta do arquivo .env

  // Configurações do JWT
  private static jwtConfig: SignOptions = {
    expiresIn: '10d',
    algorithm: 'HS256',
  };

  // Método para logar um usuário
  static sign(payload: JwtPayload): string {
    return sign({ ...payload }, this.secret, this.jwtConfig);
  }

  // Método para verificar um token
  static verify(token: string): JwtPayload | string {
    try {
      return verify(token, this.secret) as JwtPayload;
    } catch (error) {
      return 'Token must be a valid token';
    }
  }
}
