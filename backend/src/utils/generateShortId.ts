export default function generateShortId(): number {
  const timestampInMilliseconds = Date.now();
  const timestampString = timestampInMilliseconds.toString();

  // Get the last digit of the timestamp for the first digit of the ID
  const firstDigit = timestampString.slice(-1);

  // Get the next 5 digits of the timestamp for the rest of the ID
  const nextFiveDigits = timestampString.slice(-6, -1);

  const sixDigitId = firstDigit + nextFiveDigits;

  return parseInt(sixDigitId, 10);
}