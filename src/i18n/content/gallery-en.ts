import type { GalleryItem } from "@/config/gallery";

export type GalleryAlbumEnPatch = {
  title?: string;
  description?: string;
  coverAlt?: string;
  attachments?: { label?: string }[];
  items?: GalleryItem[];
};

/** English overrides for `data/gallery-albums.json` (keyed by slug). */
export const galleryAlbumsEn: Record<string, GalleryAlbumEnPatch> = {
  "treneri-i-majstori": {
    title: "Coaches and masters",
    description: "ITF dobok, black belts, and club moments with coaches.",
    items: [
      {
        kind: "image",
        src: "/galerija/treneri-frane-gringo-neno.png",
        alt: "Three taekwondo masters in dobok with black belts on the mat",
        caption: "Frane, Gringo, and Neno — club masters",
      },
      {
        kind: "image",
        src: "/galerija/treneri-janez-i-nenad.png",
        alt: "Two coaches in stance in the training hall",
        caption: "Coaches at training",
      },
      {
        kind: "image",
        src: "/galerija/treneri-neno-mirko.png",
        alt: "Two coaches in dobok with black belts in the school gym",
        caption: "Experienced club coaches",
      },
      {
        kind: "image",
        src: "/galerija/trener-nenad-bulovic-vi-dan.png",
        alt: "Dr. sc. Nenad Bulović in dobok, VI DAN ITF",
        caption: "Dr. sc. Nenad Bulović, VI DAN (2023)",
      },
      {
        kind: "image",
        src: "/galerija/trener-neno-kod-lutke-2023.png",
        alt: "Head coach with BOB training dummy",
        caption: "Coach with training dummy",
      },
      {
        kind: "image",
        src: "/galerija/trener-neno-i-polaznik-leo-1.png",
        alt: "Coach and student with yellow belt in the hall",
        caption: "Coach with a student",
      },
      {
        kind: "image",
        src: "/galerija/trener-neno-i-polaznik-leo-3.png",
        alt: "Coach and student on the mat",
        caption: "Training with the youngest",
      },
    ],
  },
  "trening-i-zivot-kluba": {
    title: "Training and club life",
    description: "Atmosphere in the hall — work with children and training equipment.",
    items: [
      {
        kind: "image",
        src: "/galerija/grupa-clanovi-dvorana.png",
        alt: "Group of club members in dobok — children, juniors, and adults with coaches",
        caption: "Community in the hall — different belt levels",
      },
      {
        kind: "image",
        src: "/galerija/trening-os-brda-dvorana.png",
        alt: "Children at training in the school gym with a coach",
        caption: 'Training in the hall (Elementary School "BRDA")',
      },
      {
        kind: "image",
        src: "/galerija/trening-niko-sparring-stav.png",
        alt: "Student in dobok and sparring gloves in ready stance",
        caption: "Technique training and sparring gear",
      },
      {
        kind: "image",
        src: "/galerija/trening-niko-sparring-stav-2.png",
        alt: "Student in dobok with ITF logo and sparring gloves",
        caption: "Training in the hall",
      },
    ],
  },
  "arhiva-i-povijest": {
    title: "Archive and history",
    description: "Old photographs, demonstrations, and memories from club history.",
    items: [
      {
        kind: "image",
        src: "/galerija/arhiva-demonstracija-yop-chagi.png",
        alt: "Demonstration of a flying side kick in sparring gear",
        caption: "Technique demonstration (archive)",
      },
      {
        kind: "image",
        src: "/galerija/arhiva-sparring.png",
        alt: "Two fighters sparring, archive photo",
        caption: "Sparring (archive)",
      },
      {
        kind: "image",
        src: "/galerija/arhiva-sparring-dragan-more.png",
        alt: "Two masters sparring by the sea — black belts, sunny day",
        caption: "Sparring by the sea (archive)",
      },
      {
        kind: "image",
        src: "/galerija/arhiva-naslovnica-knjige-koreja.png",
        alt: "Book cover — Korea",
        caption: "From club history — Korea",
      },
    ],
  },
  "promocija-i-grafika": {
    title: "Promotion and graphics",
    description: "Club poster, leaflet, and illustrative artwork.",
    items: [
      {
        kind: "image",
        src: "/galerija/promo-grb-itf-split.png",
        alt: "Official emblem of Taekwondo Club Split — ITF identity on white background",
        caption: "Club emblem (ITF)",
      },
      {
        kind: "image",
        src: "/galerija/promo-poster-taekwondo-split.png",
        alt: "Taekwondo Club Split poster with acrobatic kicks",
        caption: "Taekwondo Club Split poster",
      },
      {
        kind: "image",
        src: "/galerija/promo-letak-2023-stranica-1.png",
        alt: "Club leaflet 2023, page 1",
        caption: "Tri-fold leaflet 2023 — page 1",
      },
      {
        kind: "image",
        src: "/galerija/promo-letak-2023-stranica-2.png",
        alt: "Club leaflet 2023, page 2",
        caption: "Tri-fold leaflet 2023 — page 2",
      },
      {
        kind: "image",
        src: "/galerija/grafika-tim-ilustracija.png",
        alt: "Illustration of a group of taekwondo masters with black belts",
        caption: "Team illustration",
      },
    ],
  },
  letci: {
    title: "Leaflets",
    description: "Information leaflets for youth and veterans — preview in gallery, PDF and Word for download.",
    coverAlt: "Leaflet — youth (preview)",
    attachments: [
      { label: "Leaflet — youth (PDF)" },
      { label: "Leaflet — youth (Word)" },
      { label: "Leaflet — veterans (PDF)" },
      { label: "Leaflet — veterans (Word)" },
    ],
    items: [
      {
        kind: "image",
        src: "/galerija/letak-mladi-pregled-pdf.png",
        alt: "Youth leaflet preview — PDF version",
        caption: "Leaflet — youth (PDF)",
      },
      {
        kind: "image",
        src: "/galerija/letak-mladi-pregled-docx.png",
        alt: "Youth leaflet preview — Word version",
        caption: "Leaflet — youth (Word)",
      },
      {
        kind: "image",
        src: "/galerija/letak-veterani-pregled-pdf.png",
        alt: "Veterans leaflet preview — PDF version",
        caption: "Leaflet — veterans (PDF)",
      },
      {
        kind: "image",
        src: "/galerija/letak-veterani-pregled-docx.png",
        alt: "Veterans leaflet preview — Word version",
        caption: "Leaflet — veterans (Word)",
      },
    ],
  },
  "povijest-diplome-i-video": {
    title: "History, certificates, and videos",
    description:
      "ICTF certificates, club diplomas and posters, membership card design, and short videos from the hall. Material “Taekwondo in Split” is also available as a Word file.",
    coverAlt: 'Book cover / material "Taekwondo in Split"',
    attachments: [{ label: 'Download Word — Taekwondo in Split (cover page)' }],
    items: [
      {
        kind: "image",
        src: "/galerija/povijest-ictf-vi-dan-nenad-bulovic.png",
        alt: "ICTF Black Belt Certificate — Dr. sc. Nenad Bulović, VI DAN (2012)",
        caption: "ICTF — VI DAN black belt (Nenad Bulović)",
      },
      {
        kind: "image",
        src: "/galerija/povijest-naslovnica-knjige-tkd-split.png",
        alt: 'Cover of "Taekwondo in Split" material — Dr. sc. Nenad Bulović in dobok',
        caption: "Taekwondo in Split — cover",
      },
      {
        kind: "image",
        src: "/galerija/povijest-diploma-trenera-1979.png",
        alt: "Taekwondo coach diploma, Croatian Sports Federation — Nenad Bulović (1979)",
        caption: "Coach diploma (1979)",
      },
      {
        kind: "image",
        src: "/galerija/povijest-plakat-hrvatska-bih-2025.png",
        alt: "Taekwondo spectacle poster Croatia vs Bosnia and Herzegovina, Split 2025",
        caption: "Spectacle poster (2025)",
      },
      {
        kind: "image",
        src: "/galerija/povijest-diploma-spektakl-2025.png",
        alt: "Taekwondo spectacle diploma — September 2025",
        caption: "Spectacle diploma (2025)",
      },
      {
        kind: "image",
        src: "/galerija/povijest-diploma-spektakl-2025-sudionici.png",
        alt: "Participant diploma for Taekwondo spectacle (2025)",
        caption: "Participant diploma (2025)",
      },
      {
        kind: "image",
        src: "/galerija/povijest-clanska-karta.png",
        alt: "Taekwon-Do Club Split membership card design",
        caption: "Membership card — design",
      },
      {
        kind: "videoFile",
        src: "/galerija/video/tkd-dvorana-2023-11.mp4",
        title: "Training hall (November 2023)",
        caption: "Short video from the club training hall.",
      },
      {
        kind: "videoFile",
        src: "/galerija/video/tkd-2023-12.mp4",
        title: "Club moment (December 2023)",
        caption: "Video from training / an event.",
      },
      {
        kind: "videoFile",
        src: "/galerija/video/tkd-klub-2024-11.mp4",
        title: "Training / event (November 2024)",
        caption: "Longer clip from the hall.",
      },
      {
        kind: "videoFile",
        src: "/galerija/video/tkd-2026-02.mp4",
        title: "Training hall (February 2026)",
        caption: "Video from training.",
      },
    ],
  },
};
