// Função que gera um ID curto de 6 dígitos
export default function generateShortId(): number {
  const timestampInMilliseconds = Date.now(); // Pega o timestamp atual em milissegundos
  const timestampString = timestampInMilliseconds.toString(); // Converte o timestamp para string
  const firstDigit = timestampString.slice(-1); // Pega o último dígito do timestamp
  const nextFiveDigits = timestampString.slice(-6, -1); // Pega os próximos cinco dígitos do timestamp
  const sixDigitId = firstDigit + nextFiveDigits; // Concatena os seis dígitos

  return parseInt(sixDigitId, 10); // Converte o ID para número e retorna
}