import { AES, enc } from "crypto-js";

export function encodePassword(password: string) {
  const secretKey = process.env.AES_KEY;
  const encrypted = AES.encrypt(password, secretKey).toString();
  return encrypted;
}

export function decodePassword(password: string) {
  const secretKey = process.env.AES_KEY;
  const decrypted = AES.decrypt(password, secretKey)?.toString(enc.Utf8);
  return decrypted;
}
