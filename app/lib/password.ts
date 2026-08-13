const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SPECIAL = "!@#$%^&*()_+-=";
const ALL = UPPERCASE + LOWERCASE + DIGITS + SPECIAL;

export function generateRandomPassword(): string {
  const array = new Uint8Array(20);
  crypto.getRandomValues(array);

  const password: string[] = [];
  password.push(UPPERCASE[array[0] % UPPERCASE.length]);
  password.push(LOWERCASE[array[1] % LOWERCASE.length]);
  password.push(DIGITS[array[2] % DIGITS.length]);
  password.push(SPECIAL[array[3] % SPECIAL.length]);

  for (let i = 4; i < 20; i++) {
    password.push(ALL[array[i] % ALL.length]);
  }

  for (let i = password.length - 1; i > 0; i--) {
    const j = array[i] % (i + 1);
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join("");
}
