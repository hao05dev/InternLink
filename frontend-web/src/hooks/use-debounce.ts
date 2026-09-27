import { useEffect, useState } from "react";

/**
 * useDebounce Hook
 * Trì hoãn cập nhật giá trị sau một khoảng thời gian (mặc định 300ms)
 * Tránh gửi quá nhiều request lên server khi người dùng đang gõ phím
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}
