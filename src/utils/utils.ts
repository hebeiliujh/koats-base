import xss from "xss";
import { createHash, createCipheriv, createDecipheriv, randomBytes } from "crypto";


const key = randomBytes(32); // 256 位的共享密钥
const iv = randomBytes(16); // 初始向量，16 字节
const algorithm = "aes-256-gcm"; // 加密算法和操作模式

export const filterXss = (str: string, maxLength?: number) => {
  const result = xss(str);
  if (maxLength && str.length <= maxLength) {
    if (result.length > maxLength) {
      return result.substr(0, maxLength);
    }
  }
  return result;
};

export const random = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min)) + min;
};

export const generateHash = (text: string, salt: string | number) => {
  text = `${text}|${salt}`;
  const sha1 = createHash("sha1");
  sha1.update(text, "utf8");
  return sha1.digest("hex");
};

// aes 加密
export const aesEncrypt = (text: string) => {
  const cipher = createCipheriv(algorithm, key, iv); // 初始化加密算法
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  // const tag = cipher.getAuthTag(); // 生成标签，用于验证密文的来源

  return encrypted;
};

// aes 解密
export const aesDecrypt = (text: string) => {
  const decipher = createDecipheriv(algorithm, key, iv); // 初始化解密算法
  // decipher.setAuthTag(tag); // 传入验证标签，验证密文的来源
  let decrypted = decipher.update(text, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

export const valueToByteArray = (value: any, bytes_length: number) => {
  const bytes_array = [];
  while (bytes_length > 0){
      const byte = value & 0xFF;
      value >>= 8;
      bytes_length--;

      bytes_array.push(byte);
  }
  return bytes_array.reverse();
}

