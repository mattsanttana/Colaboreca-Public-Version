export default function generateShortId(): number {
  const timestampInMilliseconds = Date.now();
  const timestampString = timestampInMilliseconds.toString();
  const firstDigit = timestampString.slice(-1);
  const nextFiveDigits = timestampString.slice(-6, -1);
  const sixDigitId = firstDigit + nextFiveDigits;

  return parseInt(sixDigitId, 10);
}