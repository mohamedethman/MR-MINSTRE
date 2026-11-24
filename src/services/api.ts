// api.ts
import axios from "axios";
import { cachedFetch, invalidateCache } from "./cache";

let authToken: string | null = null;

// Setter function so you can update the token after login
export const setAuthToken = (token: string) => {
  authToken = token;
};

const api = axios.create({
  // Production builds call the API on the same site ("/api", proxied to the backend);
  // local dev sets REACT_APP_API_URL in .env.development.
  baseURL: process.env.REACT_APP_API_URL || "/api",
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (config.method?.toUpperCase() !== "OPTIONS" && authToken) {
      config.headers["Authorization"] = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Called when the backend says the session is no longer valid (set by AuthContext).
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  onUnauthorized = handler;
};

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // A successful write makes cached reads of that endpoint stale (e.g. PUT /actualites/3 -> "/actualites").
    const method = (response.config.method || "get").toLowerCase();
    if (method !== "get") {
      const segment = String(response.config.url || "").split("?")[0].split("/").filter(Boolean)[0];
      invalidateCache(segment ? `/${segment}` : "");
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const isLoginCall = String(error.config?.url || "").includes("/auth/login");
    if (status === 401 && !isLoginCall) {
      onUnauthorized?.();
    } else if (status === 403) {
      console.error("Forbidden: token invalid, missing or without permission");
    }
    return Promise.reject(error);
  }
);

/** Cached GET for public content (see services/cache.ts). Resolves like axios: { data }. */
const cachedGet = <T = any>(url: string): Promise<{ data: T }> =>
  cachedFetch(url, () => api.get<T>(url).then((r) => r.data)).then((data) => ({ data: data as T }));

// API endpoints
export const getMinisters = () => cachedGet("/aproposministere");
export const getNews = () => cachedGet("/actualites");
export const deleteNews = (id: number) => api.delete(`/actualites/${id}`);
export const getNewsCategorie = () => cachedGet("/actualitescategories");
/** Menu rows; the home page layout is stored here (see services/homeLayout.ts). */
export const getMenus = () => cachedGet("/menu");
// api.ts

export const createMinister = (data: {
  id?: number;
  titrearabe: string;
  titrefrancais: string;
  textarabe: string;
  textfrancais: string;
  image: string | null; // base64 image or null
}) => {
  return api.post("/aproposministere", data);
};

export const updateMinister = (
  id: number,
  data: {
    titrearabe: string;
    titrefrancais: string;
    textarabe: string;
    textfrancais: string;
    image: string | null;
  }
) => {
  return api.put(`/aproposministere/${id}`, data);
};
export const deleteMinister = (id: number) =>
  api.delete(`/aproposministere/${id}`);
export const createNews = (data: {
  id?: number;
  titrearabe: string;
  titrefrancais: string;
  textarabe: string;
  textfrancais: string;
  image: string | null; // base64 image or null
}) => {
  return api.post("/actualites", data);
};
// Actualites Categories
export const getActualitesCategories = () => cachedGet("/actualitescategories");
export const createActualiteCategorie = (data: {
  nomarabe: string;
  nomfrancais: string;
}) => api.post("/actualitescategories", data);
export const updateActualiteCategorie = (
  id: number,
  data: { nomarabe: string; nomfrancais: string }
) => api.put(`/actualitescategories/${id}`, data);
export const deleteActualiteCategorie = (id: number) =>
  api.delete(`/actualitescategories/${id}`);

export const updateNews = (
  id: number,
  data: {
    titrearabe: string;
    titrefrancais: string;
    textarabe: string;
    textfrancais: string;
    image: string | null;
  }
) => {
  return api.put(`/actualites/${id}`, data);
};

// Add these to your existing api.ts file

// Announcements API
export const getAnnouncements = () => cachedGet("/annonces");
export const getAnnouncementById = (id: number) => cachedGet(`/annonces/${id}`);

export const createAnnouncement = (data: {
  titrearabe: string;
  titrefrancais: string;
  textarabe: string;
  textfrancais: string;
  datepublication: string;
}) => api.post("/annonces", data);
export const updateAnnouncement = (
  id: number,
  data: {
    titrearabe: string;
    titrefrancais: string;
    textarabe: string;
    textfrancais: string;
    datepublication: string;
  }
) => api.put(`/annonces/${id}`, data);
export const deleteAnnouncement = (id: number) => api.delete(`/annonces/${id}`);
// Information API
export const getInformation = () => cachedGet("/informations");
export const updateInformation = (id: number, data: any) =>
  api.put(`/informations/${id}`, data);
export const createInformation = (data: any) => api.post("/informations", data);

// Messages API
export const getMessages = () => api.get("/messages");
export const getMessage = (id: number) => api.get(`/messages/${id}`);
export const updateMessage = (id: number, data: any) =>
  api.put(`/messages/${id}`, data);
export const deleteMessage = (id: number) => api.delete(`/messages/${id}`);
export const createMessage = (data: any) => api.post("/messages", data);

// Legislation API
export const getLegislations = () => cachedGet("/lois");
export const createLegislation = (data: {
  titrearabe: string;
  titrefrancais: string;
  datesortie: string;
  fichierarabe: string | null;
  fichierfrancais: string | null;
}) => api.post("/lois", data);
export const updateLegislation = (
  id: number,
  data: {
    titrearabe: string;
    titrefrancais: string;
    datesortie: string;
    fichierarabe: string | null;
    fichierfrancais: string | null;
  }
) => api.put(`/lois/${id}`, data);
export const deleteLegislation = (id: number) => api.delete(`/lois/${id}`);
// Slider API
// Slider API
// Fix getSliderById to accept parameter
export const getSliderById = (id: number) => api.get(`/slides/${id}`);

// Add getSliders function
export const getSliders = () => cachedGet("/slides");
export const createSlider = (data: {
  titrearabe: string;
  titrefrancais: string;
  textarabe: string;
  textfrancais: string;
  image: string | null; // base64
  actif: boolean;
  buttons?: {
    titrearabe: string;
    titrefrancais: string;
    lien: string;
  }[];
}) => api.post("/slides", data);

export const updateSlider = (
  id: number,
  data: {
    titrearabe: string;
    titrefrancais: string;
    textarabe: string;
    textfrancais: string;
    image: string | null; // base64
    actif: boolean;
    buttons?: {
      titrearabe: string;
      titrefrancais: string;
      lien: string;
    }[];
  }
) => api.put(`/slides/${id}`, data);

export const deleteSlider = (id: number) => api.delete(`/slides/${id}`);
// Bibliothèque Categories API
export const getBibliothequeCategories = () =>
  api.get("/bibliothequecategorie");
export const createBibliothequeCategorie = (data: {
  nomarabe: string;
  nomfrancais: string;
}) => api.post("/bibliothequecategorie", data);
export const updateBibliothequeCategorie = (
  id: number,
  data: { nomarabe: string; nomfrancais: string }
) => api.put(`/bibliothequecategorie/${id}`, data);
export const deleteBibliothequeCategorie = (id: number) =>
  api.delete(`/bibliothequecategorie/${id}`);

// Bibliothèque Items API
export const getBibliothequeItems = () => api.get("/bibliotheque");
export const getBibliothequeByCategory = (categorieId: number) =>
  api.get(`/menu/categorie/${categorieId}`);
export const createBibliothequeItem = (data: {
  descriptionarabe: string;
  descriptionfrancais: string;
  fichiers: string[]; // Base64
  categorieId: number;
  ordre: number;
  etat: boolean;
}) => api.post("/bibliotheque", data);
export const updateBibliothequeItem = (
  id: number,
  data: {
    descriptionarabe: string;
    descriptionfrancais: string;
    fichiers: string[];
    categorieId: number;
    ordre: number;
    etat: boolean;
  }
) => api.put(`/bibliotheque/${id}`, data);
export const deleteBibliothequeItem = (id: number) =>
  api.delete(`/bibliotheque/${id}`);
// Public ministry content
export const getTachesMinistere = () => cachedGet("/tachesministere");
export const getListeTaches = () => cachedGet("/listetaches");
export const getStructureAdministrative = () => cachedGet("/structureadministrative");
export const getProjets = () => cachedGet("/projets");
export const getSousEtablissements = () => cachedGet("/sousetablissements");
export const getComptesSociaux = () => cachedGet("/comptessociaux");
export const getVideos = () => cachedGet("/videos");
export const getMotMinistre = () => cachedGet("/motministre");
export const getProceduresServices = () => cachedGet("/procedures-services");

export default api;
