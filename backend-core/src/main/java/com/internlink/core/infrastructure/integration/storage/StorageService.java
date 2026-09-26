package com.internlink.core.infrastructure.integration.storage;

import com.internlink.core.shared.enums.StorageProvider;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

/**
 * Interface trừu tượng hóa dịch vụ lưu trữ tệp tin.
 * Cho phép linh hoạt chuyển đổi hoặc mở rộng giữa Local Disk, Google Drive, AWS S3, v.v.
 * mà không làm ảnh hưởng đến tầng nghiệp vụ (DocumentService) và Controller.
 */
public interface StorageService {

    /**
     * Lưu trữ tệp tin vào hệ thống lưu trữ đích.
     *
     * @param file      Tệp tin tải lên từ người dùng
     * @param subFolder Thư mục phụ phân nhóm (theo contextType, ví dụ: 'CV', 'EVALUATION', 'LOGBOOK')
     * @return Thông tin chi tiết tệp sau khi lưu trữ (checksum, fileId, path, v.v.)
     */
    StoredFileInfo store(MultipartFile file, String subFolder);

    /**
     * Tải tệp tin dưới dạng Resource phục vụ việc đọc/tải về an toàn.
     *
     * @param providerFileId Mã nhận diện tệp do nhà cung cấp lưu trữ cấp
     * @return Đối tượng Resource đại diện cho dữ liệu tệp
     */
    Resource loadAsResource(String providerFileId);

    /**
     * Xóa tệp tin khỏi hệ thống lưu trữ.
     *
     * @param providerFileId Mã nhận diện tệp
     */
    void delete(String providerFileId);

    /**
     * Trả về loại nhà cung cấp lưu trữ mà service này triển khai.
     */
    StorageProvider getProviderType();
}
