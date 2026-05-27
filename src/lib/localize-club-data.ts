import type { ClubAchievement } from "@/config/club-achievements";
import type { ClubCalendarEvent } from "@/config/club-calendar-events";
import type { GalleryAlbum, GalleryItem } from "@/config/gallery";
import type { LocalNewsPost } from "@/lib/local-news-types";
import type { Locale } from "@/i18n/config";
import { achievementsEn } from "@/i18n/content/achievements-en";
import { calendarEventsEn } from "@/i18n/content/calendar-en";
import { galleryAlbumsEn } from "@/i18n/content/gallery-en";
import { newsPostsEn } from "@/i18n/content/news-en";
import { pickLocaleField } from "@/i18n/pick-locale";

export function localizeAchievement(row: ClubAchievement, locale: Locale): ClubAchievement {
  if (locale === "hr") return row;
  const en = achievementsEn[row.id];
  if (!en) return row;
  return {
    ...row,
    competition: pickLocaleField(locale, row.competition, en.competition),
    kategorija: row.kategorija
      ? pickLocaleField(locale, row.kategorija, en.kategorija)
      : row.kategorija,
  };
}

export function localizeCalendarEvent(row: ClubCalendarEvent, locale: Locale): ClubCalendarEvent {
  if (locale === "hr") return row;
  const en = calendarEventsEn[row.id];
  if (!en) return row;
  return {
    ...row,
    title: pickLocaleField(locale, row.title, en.title),
    place: pickLocaleField(locale, row.place, en.place),
    organizator: row.organizator
      ? pickLocaleField(locale, row.organizator, en.organizator)
      : row.organizator,
  };
}

function localizeGalleryItem(item: GalleryItem, patch: GalleryItem | undefined, locale: Locale): GalleryItem {
  if (locale === "hr" || !patch) return item;
  if (item.kind === "image" && patch.kind === "image") {
    return {
      ...item,
      alt: pickLocaleField(locale, item.alt, patch.alt),
      caption: item.caption ? pickLocaleField(locale, item.caption, patch.caption) : patch.caption ?? item.caption,
    };
  }
  if (item.kind === "youtube" && patch.kind === "youtube") {
    return {
      ...item,
      title: pickLocaleField(locale, item.title, patch.title),
      caption: item.caption ? pickLocaleField(locale, item.caption, patch.caption) : patch.caption ?? item.caption,
    };
  }
  if (item.kind === "videoFile" && patch.kind === "videoFile") {
    return {
      ...item,
      title: pickLocaleField(locale, item.title, patch.title),
      caption: item.caption ? pickLocaleField(locale, item.caption, patch.caption) : patch.caption ?? item.caption,
    };
  }
  return item;
}

export function localizeGalleryAlbum(album: GalleryAlbum, locale: Locale): GalleryAlbum {
  if (locale === "hr") return album;
  const en = galleryAlbumsEn[album.slug];
  if (!en) return album;
  return {
    ...album,
    title: pickLocaleField(locale, album.title, en.title),
    description: pickLocaleField(locale, album.description, en.description),
    coverAlt: album.coverAlt ? pickLocaleField(locale, album.coverAlt, en.coverAlt) : en.coverAlt ?? album.coverAlt,
    attachments: album.attachments?.map((a, i) => ({
      ...a,
      label: pickLocaleField(locale, a.label, en.attachments?.[i]?.label),
    })),
    items: album.items.map((item, i) => localizeGalleryItem(item, en.items?.[i], locale)),
  };
}

export function localizeNewsPost(post: LocalNewsPost, locale: Locale): LocalNewsPost {
  if (locale === "hr") return post;
  const en = newsPostsEn[post.slug];
  if (!en) return post;
  return {
    ...post,
    title: pickLocaleField(locale, post.title, en.title),
    excerptPlain: pickLocaleField(locale, post.excerptPlain, en.excerptPlain),
    descriptionPlain: post.descriptionPlain
      ? pickLocaleField(locale, post.descriptionPlain, en.descriptionPlain)
      : en.descriptionPlain,
    bodyHtml: pickLocaleField(locale, post.bodyHtml, en.bodyHtml),
  };
}
