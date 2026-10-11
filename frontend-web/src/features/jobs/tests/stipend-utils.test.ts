import { describe, it, expect } from 'vitest';
import { formatVnd, formatStipend, describeVndAmount } from '../utils/stipend-utils';

describe('stipend-utils', () => {
    describe('formatVnd', () => {
        it('formats positive amount', () => {
            const result = formatVnd(4000000);
            expect(result).toContain('4.000.000');
            expect(result).toContain('VNĐ');
        });

        it('returns 0 VNĐ for invalid or zero amounts', () => {
            expect(formatVnd(0)).toBe('0 VNĐ');
            expect(formatVnd(-100)).toBe('0 VNĐ');
            expect(formatVnd(undefined)).toBe('0 VNĐ');
            expect(formatVnd(null)).toBe('0 VNĐ');
        });
    });

    describe('formatStipend', () => {
        it('formats valid stipend amount', () => {
            const result = formatStipend(5000000);
            expect(result).toContain('5.000.000');
            expect(result).toContain('đ/tháng');
        });

        it('returns fallback for zero or null amount', () => {
            expect(formatStipend(0)).toBe('Thỏa thuận');
            expect(formatStipend(null)).toBe('Thỏa thuận');
            expect(formatStipend(undefined)).toBe('Thỏa thuận');
            expect(formatStipend(0, 'Thương lượng')).toBe('Thương lượng');
        });
    });

    describe('describeVndAmount', () => {
        it('describes round millions correctly', () => {
            expect(describeVndAmount(4000000)).toBe('4 triệu đồng');
            expect(describeVndAmount(10000000)).toBe('10 triệu đồng');
        });

        it('describes millions with thousands', () => {
            expect(describeVndAmount(4500000)).toBe('4 triệu 500 nghìn đồng');
        });

        it('describes thousands', () => {
            expect(describeVndAmount(500000)).toBe('500 nghìn đồng');
        });

        it('handles zero or negative', () => {
            expect(describeVndAmount(0)).toBe('0 đồng');
            expect(describeVndAmount(-500)).toBe('0 đồng');
        });
    });
});
