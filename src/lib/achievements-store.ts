/**
 * CONCEPT: Generic Store Pattern Reuse
 *
 * This follows the same JSON-file store pattern as news-store.ts and
 * gallery-store.ts. The consistency across all stores means:
 * - New developers learn the pattern once, apply it everywhere
 * - Bugs fixed in one store suggest fixes in others
 * - All data is in `data/*.json` — easy to back up or version control
 *
 * Additional pattern: `Partial<Omit<T, "id">>` in updateAchievementById —
 * `Omit` removes the `id` field (shouldn't be changed), `Partial` makes all
 * remaining fields optional (only patch what you send).
 */

import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import type { ClubAchievement } from "@/config/club-achievements";

const FILE = join(process.cwd(), "data", "achievements.json");

async function ensureDataDir(): Promise<void> {
  await mkdir(join(process.cwd(), "data"), { recursive: true });
}

export async function readAchievements(): Promise<ClubAchievement[]> {
  try {
    const raw = await readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as ClubAchievement[];
  } catch {
    return [];
  }
}

export async function writeAchievements(rows: ClubAchievement[]): Promise<void> {
  await ensureDataDir();
  await writeFile(FILE, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
}

export async function findAchievementById(id: string): Promise<ClubAchievement | null> {
  const rows = await readAchievements();
  return rows.find((r) => r.id === id) ?? null;
}

export async function appendAchievement(row: ClubAchievement): Promise<void> {
  const rows = await readAchievements();
  rows.push(row);
  await writeAchievements(rows);
}

// CONCEPT: `Partial<Omit<ClubAchievement, "id">>` is a composed utility type:
// - `Omit<T, "id">` creates a type like T but without the `id` field
// - `Partial<T>` makes all properties optional (adds `?` to each)
// Result: you can pass any subset of fields to update, but never change the id.
export async function updateAchievementById(
  id: string,
  patch: Partial<Omit<ClubAchievement, "id">>,
): Promise<ClubAchievement | null> {
  const rows = await readAchievements();
  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  const prev = rows[idx];
  const next: ClubAchievement = { ...prev, ...patch, id };
  if ("ageGroup" in patch && patch.ageGroup === undefined) {
    delete next.ageGroup;
  }
  if ("kategorija" in patch && patch.kategorija === undefined) {
    delete next.kategorija;
  }
  if ("pojas" in patch && patch.pojas === undefined) {
    delete next.pojas;
  }
  if ("photoSrc" in patch && patch.photoSrc === undefined) {
    delete next.photoSrc;
  }
  rows[idx] = next;
  await writeAchievements(rows);
  return rows[idx];
}

export async function deleteAchievementById(id: string): Promise<boolean> {
  const rows = await readAchievements();
  const next = rows.filter((r) => r.id !== id);
  if (next.length === rows.length) return false;
  await writeAchievements(next);
  return true;
}
