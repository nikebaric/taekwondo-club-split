/** Putanje koje smiju biti obrisane pri brisanju albuma ili medija (upload u administraciji). */
export function isGalleryManagedUpload(src: string): boolean {
  return src.startsWith("/uploads/gallery/");
}
