export interface Minister {
  id?: number;
  titrearabe: string;
  titrefrancais: string;
  textarabe: string;
  textfrancais: string;
  image?: any;
}

// ========== ACTUALITES ==========
export interface Actualite {
  id?: number;
  titrearabe: string;
  titrefrancais: string;
  textarabe: string;
  textfrancais: string;
  image?: any; // Base64
  datepublication: string; // ISO date string
  categorieid: number;
  lienar?: string;
  lienfr?: string;
}
// ========== ACTUALITES CATEGORIES ==========
export interface ActualiteCategorie {
  id?: number;
  nomarabe: string;
  nomfrancais: string;
}

export interface NewsItem {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  image: string;
}

export interface Announcement {
  id: number;
  titrearabe: string;
  titrefrancais: string;
  textarabe: string;
  textfrancais: string;
  datepublication: string;
}

export interface Legislation {
  id: number;
  titrearabe: string;
  titrefrancais: string;
  datesortie: string;
  fichierarabe: string;
  fichierfrancais: string;
}
export interface Information {
  id?: number;
  nomsite: string;
  nomsitear?: string;
  logo: string;
  adresse: string;
  adressear?: string;
  telephone: string;
  email: string;
  horaires: string;
  horairesar?: string;
}

export interface TacheMinistere {
  id: number;
  titrearabe: string;
  titrefrancais: string;
}

export interface ListeTacheMinistere {
  id: number;
  tacheid: number;
  titrearabe: string;
  titrefrancais: string;
}

export interface StructureAdministrative {
  id: number;
  titrearabe: string;
  titrefrancais: string;
  textarabe?: string;
  textfrancais?: string;
  fichierarabe?: string;
  fichierfrancais?: string;
}

export interface Projet {
  id: number;
  titrearabe: string;
  titrefrancais: string;
  descarabe?: string;
  descfrancais?: string;
  lien?: string;
  images?: { id: number; image: string }[];
}

export interface SousEtablissement {
  id: number;
  titrearabe: string;
  titrefrancais: string;
  descarabe?: string;
  descfrancais?: string;
  lien?: string;
  logo?: string;
}

export interface CompteSocial {
  id: number;
  nom: string;
  lien: string;
  icon?: string;
}

export interface Video {
  id: number;
  titrearabe: string;
  titrefrancais: string;
  descarabe?: string;
  descfrancais?: string;
  fichier?: string;
  lien?: string;
}

// Add interface for Message
export interface Message {
  id?: number;
  nom: string;
  email: string;
  objet: string;
  message: string;
  lu?: boolean;
  datecreation?: string;
}
export interface SliderFormData {
  id?: number;
  titrearabe: string;
  titrefrancais: string;
  textarabe: string;
  textfrancais: string;
  image: FileList | string | null; // For form handling
  actif: boolean;
  ordre?: number;
  buttons?: {
    titrearabe: string;
    titrefrancais: string;
    lien: string;
  }[];
}

export interface SliderApiData {
  id?: number;
  titrearabe: string;
  titrefrancais: string;
  textarabe: string;
  textfrancais: string;
  image: string | null; // For API - only string or null
  actif: boolean;
  ordre?: number;
  buttons?: {
    titrearabe: string;
    titrefrancais: string;
    lien: string;
  }[];
}
// Add to types.ts
export interface BibliothequeCategorie {
  id?: number;
  nomarabe: string;
  nomfrancais: string;
}

export interface BibliothequeItem {
  id?: number;
  descriptionarabe: string;
  descriptionfrancais: string;
  fichiers: string[]; // Base64 encoded files
  categorieId: number;
  ordre: number;
  etat: boolean;
}
// Keep the original Slider interface for backward compatibility
export interface Slider extends SliderFormData {}
