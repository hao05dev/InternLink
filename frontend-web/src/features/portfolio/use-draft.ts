'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { errorText } from './api';

/** Serializes autosaves and retains a recoverable local copy until the server acknowledges it. */
export function useDraft<T>(key: string, initial: T, initialVersion: number | null, enabled: boolean,
  save: (value: T, version: number | null) => Promise<{ version: number | null }>) {
  const [value, setValue] = useState(initial); const [generation, setGeneration] = useState(0);
  const [message, setMessage] = useState(''); const [recovery, setRecovery] = useState<T | null>(null);
  const [saving, setSaving] = useState(false);
  const current = useRef({ value: initial, version: initialVersion, generation: 0, saved: 0 });
  const pending = useRef<Promise<{ version: number | null }> | null>(null);
  const mounted = useRef(true); const saveRef = useRef(save);
  useEffect(() => { saveRef.current = save; }, [save]);
  useEffect(() => { mounted.current = true; try { const stored = localStorage.getItem(key); if (stored) { const parsed = JSON.parse(stored); if (JSON.stringify(parsed.value) !== JSON.stringify(current.current.value)) setRecovery(parsed.value); } } catch { /* Browser storage may be unavailable. */ } return () => { mounted.current = false; }; }, [key]); // A changed key remounts the editor.
  const change = useCallback((next: T) => {
    current.current.value = next; current.current.generation += 1;
    setValue(next); setGeneration(current.current.generation); setMessage('Đang chờ lưu…');
    try { localStorage.setItem(key, JSON.stringify({ value: next, version: current.current.version })); } catch { setMessage('Chưa lưu được bản dự phòng trên thiết bị.'); }
  }, [key]);
  const flush = useCallback(async () => {
    while (pending.current) await pending.current;
    if (current.current.saved === current.current.generation && current.current.version !== null) return { version: current.current.version };
    const captured = { ...current.current }; setSaving(true); setMessage('Đang lưu…');
    const operation = saveRef.current(captured.value, captured.version); pending.current = operation;
    try {
      const result = await operation; current.current.version = result.version; current.current.saved = captured.generation;
      if (mounted.current) { setMessage('Đã lưu'); if (captured.generation === current.current.generation) { try { localStorage.removeItem(key); } catch { /* No effect on server save. */ } } }
      return result;
    } catch (error) { if (mounted.current) setMessage(`Chưa lưu: ${errorText(error)}`); throw error; }
    finally { pending.current = null; if (mounted.current) setSaving(false); }
  }, [key]);
  useEffect(() => {
    if (!enabled || generation === 0) return;
    const timer = setTimeout(() => { void flush().catch(() => undefined); }, 1800);
    return () => clearTimeout(timer);
  }, [generation, enabled, flush]);
  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => { if (current.current.saved !== current.current.generation) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', guard); return () => window.removeEventListener('beforeunload', guard);
  }, []);
  return { value, change, flush, saving, message, version: () => current.current.version,
    recovery: recovery ? () => { change(recovery); setRecovery(null); } : null,
    discardRecovery: () => { setRecovery(null); try { localStorage.removeItem(key); } catch { /* Optional recovery. */ } } };
}
