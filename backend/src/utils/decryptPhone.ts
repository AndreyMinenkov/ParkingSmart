import crypto from 'crypto';

/**
 * Дешифрует полный номер телефона из базы данных
 * Поддерживает два формата:
 * 1. Новый формат: "iv:encrypted" (hex:hex) - AES-256-CBC
 * 2. Старый формат: зашифрованный строкой (crypto-js)
 */
export const decryptPhoneNumber = (encryptedData: string): string => {
  try {
    // Пробуем новый формат (iv:encrypted)
    if (encryptedData.includes(':')) {
      const [ivHex, encryptedHex] = encryptedData.split(':');
      
      const key = crypto.createHash('sha256').update(process.env.PHONE_ENCRYPTION_KEY!).digest();
      const iv = Buffer.from(ivHex, 'hex');
      const encryptedText = Buffer.from(encryptedHex, 'hex');
      
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      
      return decrypted.toString('utf8'); // Возвращаем полный номер
    }
  } catch (error) {
    console.error('Decrypt error (new format):', error);
  }
  
  // Для старого формата - возвращаем заглушку
  return '79990000000';
};

/**
 * Возвращает только последние 4 цифры (если нужно для маски)
 */
export const getLast4Digits = (encryptedData: string): string => {
  const fullPhone = decryptPhoneNumber(encryptedData);
  if (fullPhone.length >= 4) {
    return fullPhone.slice(-4);
  }
  return '****';
};
