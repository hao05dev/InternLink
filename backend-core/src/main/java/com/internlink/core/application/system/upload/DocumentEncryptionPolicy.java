package com.internlink.core.application.system.upload;

import com.internlink.core.shared.enums.ContextType;
import com.internlink.core.shared.enums.DocumentType;
import org.springframework.stereotype.Component;

import java.util.EnumSet;
import java.util.Set;

/**
 * Xác định chính sách bảo mật cho từng loại tài liệu:
 * Quyết định tài liệu nào bắt buộc phải mã hóa lai (Envelope Encryption) trước khi lưu trữ.
 */
@Component
public class DocumentEncryptionPolicy {

    private static final Set<DocumentType> ENCRYPTED_DOC_TYPES = EnumSet.of(
            DocumentType.AGREEMENT,
            DocumentType.EXTERNAL_EVALUATION,
            DocumentType.EVIDENCE
    );

    /**
     * Kiểm tra nhanh theo loại tài liệu xem có thuộc diện bắt buộc mã hóa hay không.
     */
    public static boolean isEncryptedType(DocumentType docType) {
        return docType != null && ENCRYPTED_DOC_TYPES.contains(docType);
    }

    /**
     * Kiểm tra xem tài liệu có thuộc diện bắt buộc mã hóa lai phía máy chủ hay không.
     *
     * @param docType loại tài liệu
     * @param contextType ngữ cảnh tài liệu
     * @return true nếu tài liệu bắt buộc phải được mã hóa lai
     */
    public boolean shouldEncrypt(DocumentType docType, ContextType contextType) {
        return isEncryptedType(docType);
    }
}
