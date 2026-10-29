package com.internlink.core.shared.validation;

import com.internlink.core.shared.exception.BadRequestException;

import java.util.List;

/** Giới hạn số dòng cho một lần import danh sách (sinh viên, giảng viên). */
public final class ImportRowLimit {

    public static final int MAX_ROWS = 1000;

    private ImportRowLimit() {}

    public static void check(List<?> rows) {
        if (rows == null || rows.isEmpty())
            throw new BadRequestException("Danh sách import không được rỗng");
        if (rows.size() > MAX_ROWS)
            throw new BadRequestException(
                    "Mỗi lần import tối đa " + MAX_ROWS + " dòng, file hiện có " + rows.size() + " dòng");
    }
}
