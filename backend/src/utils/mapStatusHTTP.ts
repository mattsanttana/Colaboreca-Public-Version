// Esta função mapeia o status HTTP para o número correspondente
export default function mapStatusHTTP(status: string): number {
  switch (status) {
    case 'OK': return 200;
    case 'CREATED': return 201;
    case 'NO_CONTENT': return 204;
    case 'INVALID_DATA': return 400;
    case 'UNAUTHORIZED': return 401;
    case 'NOT_FOUND': return 404;
    case 'CONFLICT': return 409;
    case 'UNPROCESSABLE_ENTITY': return 422;
    default: return 500;
  }
}
