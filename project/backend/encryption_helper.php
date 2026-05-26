<?php
// backend/encryption_helper.php
require_once 'config.php';

/**
 * Encrypts a string using AES-256-GCM
 */
function encryptField($plaintext) {
    if (empty($plaintext)) return null;

    $iv_length = openssl_cipher_iv_length(CIPHER_METHOD);
    $iv = openssl_random_pseudo_bytes($iv_length);

    // Encrypt the data. $tag is populated by reference.
    $ciphertext = openssl_encrypt($plaintext, CIPHER_METHOD, ENCRYPTION_KEY, 0, $iv, $tag);

    // We base64 encode each part separately, then join with :: 
    // This prevents "random characters" from breaking the split logic later.
    return base64_encode($ciphertext) . '::' . base64_encode($iv) . '::' . base64_encode($tag);
}

/**
 * Decrypts a string formatted as "Ciphertext::IV::Tag"
 */
function decryptField($encryptedData) {
    if (empty($encryptedData)) return null;

    // Split the string into its 3 parts
    $parts = explode('::', $encryptedData);
    
    // If it's not in our 3-part format, return the original (it might not be encrypted)
    if (count($parts) !== 3) {
        return $encryptedData; 
    }

    // Decode each part from Base64
    $ciphertext = base64_decode($parts[0]);
    $iv         = base64_decode($parts[1]);
    $tag        = base64_decode($parts[2]);

    // Decrypt using OpenSSL
    $decrypted = openssl_decrypt($ciphertext, CIPHER_METHOD, ENCRYPTION_KEY, 0, $iv, $tag);

    return $decrypted === false ? "Decryption Error" : $decrypted;
}
?>