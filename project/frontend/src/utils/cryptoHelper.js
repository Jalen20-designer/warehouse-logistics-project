// src/utils/cryptoHelper.js

// Ang 32-character key mula sa iyong config.php
const ENCRYPTION_KEY = "Wms_Logistics_Group3_Secret_Key!";

// Helper para i-convert ang Base64 papuntang Uint8Array
function base64ToUint8Array(base64) {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decrypts a string formatted as "Ciphertext::IV::Tag" using AES-256-GCM
 * @param {string} encryptedData 
 */
export async function decryptFieldInReact(encryptedData) {
  if (!encryptedData) return "";

  const parts = encryptedData.split('::');
  if (parts.length !== 3) {
    return encryptedData; // Ibalik nang hilaw kung hindi naman ito encrypted
  }

  try {
    const ciphertext = base64ToUint8Array(parts[0]);
    const iv = base64ToUint8Array(parts[1]);
    const tag = base64ToUint8Array(parts[2]);

    // I-import ang plain text key gamit ang TextEncoder ng browser
    const rawKey = new TextEncoder().encode(ENCRYPTION_KEY);
    const cryptoKey = await window.crypto.subtle.importKey(
      "raw",
      rawKey,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );

    // I-append ang Auth Tag sa dulo ng Ciphertext buffer (Required sa JS decryption)
    const combinedBuffer = new Uint8Array(ciphertext.length + tag.length);
    combinedBuffer.set(ciphertext);
    combinedBuffer.set(tag, ciphertext.length);

    // I-execute ang decryption
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
        tagLength: 128 // 128 bits
      },
      cryptoKey,
      combinedBuffer
    );

    // I-convert ang decrypted bytes papuntang readable string
    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    console.error("React Decryption Error:", error);
    return "Decryption Error";
  }
}