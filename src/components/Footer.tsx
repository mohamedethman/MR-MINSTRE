import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faInstagram,
  faLinkedinIn,
  faTiktok,
  faWhatsapp,
  faXTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "../context/LanguageContext";
import { getComptesSociaux, getInformation } from "../services/api";
import { CompteSocial, Information } from "../types/types";
import { mediaUrl, pickLang } from "../utils/content";
import { APP_VERSION, ministryName as getMinistryName } from "../utils/site";

const brandIcon = (account: CompteSocial) => {
  const key = `${account.nom} ${account.lien}`.toLowerCase();
  if (key.includes("facebook")) return faFacebookF;
  if (key.includes("instagram")) return faInstagram;
  if (key.includes("linkedin")) return faLinkedinIn;
  if (key.includes("youtube")) return faYoutube;
  if (key.includes("tiktok")) return faTiktok;
  if (key.includes("whatsapp") || key.includes("wa.me")) return faWhatsapp;
  if (key.includes("twitter") || key.includes("x.com")) return faXTwitter;
  return faGlobe;
};

const Footer: React.FC = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [information, setInformation] = useState<Information | null>(null);
  const [accounts, setAccounts] = useState<CompteSocial[]>([]);

  useEffect(() => {
    getInformation()
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length) setInformation(response.data[0]);
      })
      .catch(() => undefined);
    getComptesSociaux()
      .then((response) => {
        if (Array.isArray(response.data)) setAccounts(response.data.filter((a: CompteSocial) => a.lien));
      })
      .catch(() => undefined);
  }, []);

  const ministryName = getMinistryName(isArabic);
  const republicName = isArabic ? "الجمهورية الإسلامية الموريتانية" : "République Islamique de Mauritanie";
  const logoSource = mediaUrl(information?.logo);
  const address = pickLang(isArabic, information?.adressear, information?.adresse);

  return (
    <footer className="border-t border-gray-200 bg-white text-gray-700" dir={isArabic ? "rtl" : "ltr"}>
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-8 py-6 md:flex-row">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-300 bg-mauritania-green text-sm font-bold text-white">
            {logoSource ? <img src={logoSource} alt={ministryName} className="h-full w-full object-cover" /> : "MO"}
          </span>
          <div className="text-start">
            <p className="text-xs font-semibold leading-tight text-gray-600">{republicName}</p>
            {ministryName && <h2 className="mt-1 text-sm font-bold text-gray-800 md:text-base">{ministryName}</h2>}
            {(address || information?.telephone || information?.email) && (
              <p className="mt-1 text-xs text-gray-500">
                {[address, information?.telephone, information?.email].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </div>

        <nav aria-label={isArabic ? "روابط سريعة" : "Liens rapides"} className="flex flex-wrap items-center gap-6 text-sm font-medium">
          <Link to="/" className="transition-colors hover:text-[#ce1f26]">
            {isArabic ? "الرئيسية" : "Accueil"}
          </Link>
          <Link to="/contact" className="transition-colors hover:text-[#ce1f26]">
            {isArabic ? "اتصل بنا" : "Contact"}
          </Link>
          {accounts.map((account) => {
            const icon = mediaUrl(account.icon);
            return (
              <a
                key={account.id}
                href={account.lien}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={account.nom}
                title={account.nom}
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-gray-300 text-gray-600 transition-colors hover:border-mauritania-green hover:bg-mauritania-green hover:text-white"
              >
                {icon ? <img src={icon} alt="" className="h-5 w-5 object-contain" /> : <FontAwesomeIcon icon={brandIcon(account)} />}
              </a>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-gray-200 px-6 py-4 text-center text-sm text-gray-500">
        <p>
          © {new Date().getFullYear()} {ministryName ? `${ministryName} - ` : ""}
          {republicName}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          {isArabic ? "الإصدار" : "Version"} <span dir="ltr">{APP_VERSION}</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
