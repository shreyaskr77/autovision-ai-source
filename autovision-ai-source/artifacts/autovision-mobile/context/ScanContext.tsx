import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AnalysisResponse } from '@workspace/api-client-react';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type SelectedImage = {
  uri: string;
  name: string;
  type: string;
};

export type SavedScan = {
  id: string;
  image: SelectedImage;
  result: AnalysisResponse;
  savedAt: string;
};

type ScanContextValue = {
  image: SelectedImage | null;
  result: AnalysisResponse | null;
  history: SavedScan[];
  setImage: (image: SelectedImage | null) => void;
  setResult: (result: AnalysisResponse | null) => void;
  saveCurrentScan: () => Promise<void>;
  deleteScan: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  isHydrated: boolean;
};

const ScanContext = createContext<ScanContextValue | null>(null);
const STORAGE_KEY = '@autovision/scan-history';

export function ScanProvider({ children }: { children: ReactNode }) {
  const [image, setImage] = useState<SelectedImage | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [history, setHistory] = useState<SavedScan[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (value) setHistory(JSON.parse(value) as SavedScan[]);
      })
      .catch(() => undefined)
      .finally(() => setIsHydrated(true));
  }, []);

  const persist = async (next: SavedScan[]) => {
    setHistory(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const saveCurrentScan = async () => {
    if (!image || !result) return;
    const next: SavedScan[] = [
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, image, result, savedAt: new Date().toISOString() },
      ...history,
    ].slice(0, 25);
    await persist(next);
  };

  const deleteScan = async (id: string) => persist(history.filter((scan) => scan.id !== id));
  const clearHistory = async () => persist([]);

  const value = useMemo(
    () => ({ image, result, history, setImage, setResult, saveCurrentScan, deleteScan, clearHistory, isHydrated }),
    [image, result, history, isHydrated],
  );

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
}

export function useScan() {
  const context = useContext(ScanContext);
  if (!context) throw new Error('useScan must be used within ScanProvider');
  return context;
}