/**
 * Utility functions for stipend and currency formatting in Job Management
 */

export function formatVnd(amount?: number | null): string {
    if (amount == null || isNaN(amount) || amount <= 0) return '0 VNĐ';
    return `${new Intl.NumberFormat('vi-VN').format(amount)} VNĐ`;
}

export function formatStipend(amount?: number | null, fallback = 'Thỏa thuận'): string {
    if (amount == null || isNaN(amount) || amount <= 0) {
        return fallback;
    }
    return `${new Intl.NumberFormat('vi-VN').format(amount)} đ/tháng`;
}

export function describeVndAmount(amount?: number | null): string {
    if (amount == null || isNaN(amount) || amount <= 0) return '0 đồng';

    if (amount >= 1_000_000_000) {
        const ty = amount / 1_000_000_000;
        return `${Number(ty.toFixed(2))} tỷ đồng`;
    }

    if (amount >= 1_000_000) {
        const trieu = Math.floor(amount / 1_000_000);
        const nghin = Math.round((amount % 1_000_000) / 1_000);
        if (nghin > 0) {
            return `${trieu} triệu ${nghin} nghìn đồng`;
        }
        return `${trieu} triệu đồng`;
    }

    if (amount >= 1_000) {
        const nghin = Math.floor(amount / 1_000);
        return `${nghin} nghìn đồng`;
    }

    return `${amount} đồng`;
}
