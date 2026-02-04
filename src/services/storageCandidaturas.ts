import type { Candidatura } from "../types/candidatura";

const KEY = "job-tracker:candidaturas";

export function loadCandidaturas(): Candidatura[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as Candidatura[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function saveCandidaturas(items: Candidatura[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function clearCandidaturas() {
  localStorage.removeItem(KEY);
}
