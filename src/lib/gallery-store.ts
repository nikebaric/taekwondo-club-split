import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import type { GalleryAlbum } from "@/config/gallery";

const FILE = join(process.cwd(), "data", "gallery-albums.json");

async function ensureDataDir(): Promise<void> {
  await mkdir(join(process.cwd(), "data"), { recursive: true });
}

export async function readGalleryAlbums(): Promise<GalleryAlbum[]> {
  try {
    const raw = await readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as GalleryAlbum[];
  } catch {
    return [];
  }
}

export async function writeGalleryAlbums(albums: GalleryAlbum[]): Promise<void> {
  await ensureDataDir();
  await writeFile(FILE, `${JSON.stringify(albums, null, 2)}\n`, "utf8");
}

export async function findGalleryAlbumBySlug(slug: string): Promise<GalleryAlbum | null> {
  const albums = await readGalleryAlbums();
  return albums.find((a) => a.slug === slug) ?? null;
}

export async function replaceGalleryAlbumBySlug(oldSlug: string, next: GalleryAlbum): Promise<boolean> {
  const albums = await readGalleryAlbums();
  const idx = albums.findIndex((a) => a.slug === oldSlug);
  if (idx === -1) return false;
  albums[idx] = next;
  await writeGalleryAlbums(albums);
  return true;
}

export async function appendGalleryAlbum(album: GalleryAlbum): Promise<void> {
  const albums = await readGalleryAlbums();
  albums.push(album);
  await writeGalleryAlbums(albums);
}

/** Ukloni album; vraća uklonjeni zapis ako postoji. */
export async function deleteGalleryAlbumBySlug(slug: string): Promise<GalleryAlbum | null> {
  const albums = await readGalleryAlbums();
  const idx = albums.findIndex((a) => a.slug === slug);
  if (idx === -1) return null;
  const [removed] = albums.splice(idx, 1);
  await writeGalleryAlbums(albums);
  return removed ?? null;
}

export function uniqueGallerySlug(base: string, albums: GalleryAlbum[]): string {
  const slugs = new Set(albums.map((a) => a.slug));
  if (!slugs.has(base)) return base;
  let i = 2;
  while (slugs.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}
