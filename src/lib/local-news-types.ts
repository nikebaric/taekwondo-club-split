/** Novosti pohranjene lokalno u `data/news-posts.json`. */
export type LocalNewsPost = {
  id: number;
  slug: string;
  title: string;
  /** Kratak tekst za karticu / excerpt */
  excerptPlain: string;
  /** HTML tijelo članka (sigurno escapeano pri unosu) */
  bodyHtml: string;
  date: string;
  /** Relativni URL, npr. /uploads/news/foo.jpg */
  imageSrc?: string | null;
  /** MP4 ili slično u public/uploads */
  videoSrc?: string | null;
  /** Potpis pri objavi, npr. "Created by Nenad Bulović" */
  createdByLine?: string | null;
  /** Pun tekst opisa (za uređivanje); ako nedostaje, izvlači se iz bodyHtml */
  descriptionPlain?: string | null;
  /** Zapamćeni YouTube embed URL (opcionalno, za uređivanje) */
  youtubeEmbedStored?: string | null;
  /** MIME za lokalni video kad je spašen */
  videoMime?: string | null;
  /** Više slika ispod teksta (isti prikaz kao galerija) */
  galleryImageSrcs?: string[] | null;
  /** Više YouTube ugrađenih URL-ova (nocookie embed) */
  galleryYoutubeEmbeds?: string[] | null;
  /** Više lokalnih video zapisa */
  galleryVideos?: Array<{ src: string; mime: string }> | null;
  /** Koja od slika u galeriji je naslovna ispod naslova (mora biti jedna od galleryImageSrcs) */
  coverImageSrc?: string | null;
};
