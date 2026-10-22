package com.internlink.core.infrastructure.security.crypto;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import javax.crypto.AEADBadTagException;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AesGcmDataCipherTest {

    private AesGcmDataCipher cipher;
    private AadBuilder aadBuilder;

    @BeforeEach
    void setUp() {
        cipher = new AesGcmDataCipher();
        aadBuilder = new AadBuilder();
    }

    @Test
    @DisplayName("Mã hóa và giải mã thành công với AAD hợp lệ")
    void shouldEncryptAndDecryptSuccessfullyWithValidAad() throws Exception {
        byte[] plaintext = "Nội dung biên bản thỏa thuận thực tập 3 bên".getBytes(StandardCharsets.UTF_8);
        byte[] aad = aadBuilder.buildAad(
                1,
                UUID.randomUUID(),
                UUID.randomUUID(),
                "INTERNSHIP_APPLICATION",
                UUID.randomUUID(),
                "AGREEMENT"
        );

        EncryptedDataResult result = cipher.encrypt(plaintext, aad);

        assertThat(result.ciphertextWithTag()).isNotNull();
        assertThat(result.ciphertextWithTag().length).isEqualTo(plaintext.length + 16);
        assertThat(result.nonce()).hasSize(12);
        assertThat(result.tag()).hasSize(16);
        assertThat(result.dek()).hasSize(32);

        byte[] decrypted = cipher.decrypt(result.ciphertextWithTag(), result.dek(), result.nonce(), aad);
        assertThat(new String(decrypted, StandardCharsets.UTF_8)).isEqualTo("Nội dung biên bản thỏa thuận thực tập 3 bên");
    }

    @Test
    @DisplayName("Ném ngoại lệ khi ciphertext bị can thiệp (Tampered Ciphertext)")
    void shouldFailWhenCiphertextIsTampered() throws Exception {
        byte[] plaintext = "Secret Content".getBytes(StandardCharsets.UTF_8);
        byte[] aad = "v1|test".getBytes(StandardCharsets.UTF_8);

        EncryptedDataResult result = cipher.encrypt(plaintext, aad);

        byte[] tamperedCiphertext = result.ciphertextWithTag().clone();
        tamperedCiphertext[0] ^= 0x01; // Sửa đổi 1 bit đầu tiên

        assertThatThrownBy(() -> cipher.decrypt(tamperedCiphertext, result.dek(), result.nonce(), aad))
                .isInstanceOf(GeneralSecurityException.class);
    }

    @Test
    @DisplayName("Ném ngoại lệ khi AAD bị tráo đổi (Swapping Attack)")
    void shouldFailWhenAadIsSwapped() throws Exception {
        byte[] plaintext = "Secret Content".getBytes(StandardCharsets.UTF_8);
        byte[] authenticAad = aadBuilder.buildAad(1, UUID.randomUUID(), UUID.randomUUID(), "APPLICATION", UUID.randomUUID(), "AGREEMENT");
        byte[] swappedAad = aadBuilder.buildAad(1, UUID.randomUUID(), UUID.randomUUID(), "APPLICATION", UUID.randomUUID(), "AGREEMENT");

        EncryptedDataResult result = cipher.encrypt(plaintext, authenticAad);

        assertThatThrownBy(() -> cipher.decrypt(result.ciphertextWithTag(), result.dek(), result.nonce(), swappedAad))
                .isInstanceOf(GeneralSecurityException.class);
    }
}
