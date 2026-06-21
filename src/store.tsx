import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { buildSeed, DATA_VERSION, STORAGE_KEY, type AppData } from './data';

// ---------------------------------------------------------------------------
//  Persistence
// ---------------------------------------------------------------------------

interface Persisted {
  version: number;
  data: AppData;
}

function loadFromStorage(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildSeed();
    const parsed = JSON.parse(raw) as Persisted;
    if (!parsed || typeof parsed !== 'object' || !parsed.data) return buildSeed();
    return normalize(parsed.data);
  } catch {
    return buildSeed();
  }
}

/** Defensive top-level shape check so a partial import never crashes the app. */
function normalize(d: AppData): AppData {
  const seed = buildSeed();
  return {
    meta: { ...seed.meta, ...(d.meta ?? {}) },
    schools: Array.isArray(d.schools) ? d.schools : seed.schools,
    loanScholarships: Array.isArray(d.loanScholarships) ? d.loanScholarships : seed.loanScholarships,
    milestones: Array.isArray(d.milestones) ? d.milestones : seed.milestones,
    essays: Array.isArray(d.essays) ? d.essays : seed.essays,
    tasks: Array.isArray(d.tasks) ? d.tasks : seed.tasks,
    recommenders: Array.isArray(d.recommenders) ? d.recommenders : seed.recommenders,
  };
}

// ---------------------------------------------------------------------------
//  Unique ids for items added at runtime
// ---------------------------------------------------------------------------

export function uid(prefix = 'id'): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
    }
  } catch {
    /* ignore */
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

// ---------------------------------------------------------------------------
//  Context
// ---------------------------------------------------------------------------

interface StoreValue {
  data: AppData;
  /** Apply an immutable update by mutating a structural clone. */
  mutate: (recipe: (draft: AppData) => void) => void;
  exportJson: () => void;
  importJson: (file: File) => Promise<void>;
  resetToSeed: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadFromStorage());

  // Persist on every change (debounced to the next tick via the effect).
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
    }
    try {
      const payload: Persisted = { version: DATA_VERSION, data };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* storage full / unavailable — ignore */
    }
  }, [data]);

  const mutate = useCallback((recipe: (draft: AppData) => void) => {
    setData((prev) => {
      const next = structuredClone(prev);
      recipe(next);
      return next;
    });
  }, []);

  const exportJson = useCallback(() => {
    const payload: Persisted = { version: DATA_VERSION, data };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `mba-tracker-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [data]);

  const importJson = useCallback(async (file: File) => {
    const text = await file.text();
    const parsed = JSON.parse(text) as Persisted | AppData;
    // Accept either the wrapped { version, data } shape or a bare AppData blob.
    const raw = (parsed as Persisted).data ? (parsed as Persisted).data : (parsed as AppData);
    setData(normalize(raw));
  }, []);

  const resetToSeed = useCallback(() => {
    setData(buildSeed());
  }, []);

  const value = useMemo<StoreValue>(
    () => ({ data, mutate, exportJson, importJson, resetToSeed }),
    [data, mutate, exportJson, importJson, resetToSeed],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
}
