/**
 * CONCEPT: TypeScript Type Definition for a Data Model
 *
 * This file defines the shape of a news post as stored on disk (JSON).
 * It's the "source of truth" type — other files transform this into different
 * shapes for display or editing.
 *
 * Key TypeScript concepts:
 * - `type` keyword — defines an object shape (similar to `interface` but cannot
 *   be extended with `extends`; preferred for data records)
 * - Optional properties (`?`) — the field may be missing from the JSON entirely
 * - Union with null (`string | null`) — the field exists but may be explicitly null
 * - `?: string | null` — field can be absent, undefined, OR null (maximum flexibility
 *   for JSON data that evolves over time)
 * - `Array<{...}>` — inline anonymous type for array elements
 *
 * News posts stored locally in `data/news-posts.json`.
 */
export type LocalNewsPost = {
  id: number;
  slug: string;
  title: string;
  /** Short text for card / excerpt */
  excerptPlain: string;
  /** HTML article body (safely escaped on input) */
  bodyHtml: string;
  date: string;

  // Optional + nullable fields below. The `?` means the key itself may not
  // exist in the JSON (older posts lack these fields). The `| null` allows
  // explicit null values (e.g., when a user removes an image).
  /** Relative URL, e.g. /uploads/news/foo.jpg */
  imageSrc?: string | null;
  /** MP4 or similar in public/uploads */
  videoSrc?: string | null;
  /** Byline on publish, e.g. "Created by Nenad Bulović" */
  createdByLine?: string | null;
  /** Full description text (for editing); if missing, extracted from bodyHtml */
  descriptionPlain?: string | null;
  /** Stored YouTube embed URL (optional, for editing) */
  youtubeEmbedStored?: string | null;
  /** MIME type for the local video when saved */
  videoMime?: string | null;
  /** Multiple images below text (same layout as gallery) */
  galleryImageSrcs?: string[] | null;
  /** Multiple YouTube embed URLs (nocookie embed) */
  galleryYoutubeEmbeds?: string[] | null;
  /** Multiple local video files */
  galleryVideos?: Array<{ src: string; mime: string }> | null;
  /** Which gallery image is the hero cover below the title (must be one of galleryImageSrcs) */
  coverImageSrc?: string | null;
};
