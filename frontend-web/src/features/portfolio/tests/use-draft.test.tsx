import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDraft } from '../use-draft';

afterEach(() => { cleanup(); localStorage.clear(); vi.useRealTimers(); });
describe('portfolio drafts', () => {
  it('serializes concurrent flushes with the latest acknowledged version', async () => {
    let resolveFirst!: (v: { version: number }) => void;
    const save = vi.fn().mockImplementationOnce(() => new Promise(resolve => { resolveFirst = resolve; })).mockResolvedValue({ version: 2 });
    const { result } = renderHook(() => useDraft<string>('draft', 'initial', 0, false, save));
    act(() => result.current.change('first'));
    let first!: Promise<unknown>;
    act(() => { first = result.current.flush(); });
    act(() => result.current.change('latest'));
    let next!: Promise<unknown>; let duplicate!: Promise<unknown>;
    act(() => { next = result.current.flush(); duplicate = result.current.flush(); });
    await act(async () => { resolveFirst({ version: 1 }); await Promise.all([first, next, duplicate]); });
    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenNthCalledWith(2, 'latest', 1);
    expect(result.current.version()).toBe(2);
    expect(localStorage.getItem('draft')).toBeNull();
  });
  it('preserves recoverable content when a save fails', async () => {
    const save = vi.fn().mockRejectedValue(new Error('Offline'));
    const { result, unmount } = renderHook(() => useDraft<string>('draft', '', null, false, save));
    act(() => result.current.change('Nội dung chưa đồng bộ'));
    await act(async () => { await expect(result.current.flush()).rejects.toThrow('Offline'); });
    expect(result.current.message).toContain('Offline');unmount();
    const recovered = renderHook(() => useDraft('draft', '', null, false, save));
    expect(recovered.result.current.recovery).not.toBeNull();
    act(() => recovered.result.current.recovery?.());
    expect(recovered.result.current.value).toBe('Nội dung chưa đồng bộ');
  });
  it('autosaves after typing settles', async () => {
    vi.useFakeTimers();const save = vi.fn().mockResolvedValue({ version: 1 });
    const { result } = renderHook(() => useDraft<string>('draft', '', null, true, save));
    act(() => result.current.change('Báo cáo hôm nay'));
    await act(async () => { await vi.advanceTimersByTimeAsync(1800); });
    expect(save).toHaveBeenCalledWith('Báo cáo hôm nay', null);
    expect(result.current.message).toBe('Đã lưu');
  });
});
