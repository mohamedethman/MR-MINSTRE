import React from "react";
import { Legislation } from "../types/types";
import { useT } from "../i18n";
import { downloadMedia } from "../utils/content";

interface LegislationCardProps {
  legislation: Legislation;
}

const LegislationCard: React.FC<LegislationCardProps> = ({ legislation }) => {
  const { t, pair, dir, formatDate } = useT();
  const [primaryTitle, secondaryTitle] = pair(legislation.titrearabe, legislation.titrefrancais);
  const handleDownload = (fileData: string, fileName: string) => {
    downloadMedia(fileData, fileName, "application/pdf");
  };

  return (
    <div dir={dir} className="bg-white p-6 rounded-lg shadow-custom hover:shadow-md transition duration-300">
      <h3 className="text-xl font-bold text-mauritania-green-dark mb-2">
        {primaryTitle}
      </h3>
      <h4 className="text-lg text-gray-700 mb-2">
        {secondaryTitle}
      </h4>
      <div className="flex justify-between items-center">
        <span className="text-gray-600">
          {legislation.datesortie
            ? formatDate(legislation.datesortie)
            : t("غير محدد التاريخ", "Date non précisée")}
        </span>
        <div className="flex gap-2">
          {pair(
          <button
            key="ar"
            onClick={() =>
              legislation.fichierarabe &&
              handleDownload(
                legislation.fichierarabe,
                `legislation-ar-${legislation.id}.pdf`
              )
            }
            className={`bg-mauritania-green text-white py-1 px-4 rounded-md hover:bg-mauritania-green-dark transition duration-300 ${
              !legislation.fichierarabe && "opacity-50 cursor-not-allowed"
            }`}
            disabled={!legislation.fichierarabe}
            title={
              legislation.fichierarabe
                ? t("تحميل الملف العربي", "Télécharger la version arabe")
                : t("لا يوجد ملف عربي متاح", "Aucune version arabe disponible")
            }
          >
            {t("عربي", "Arabe")}
          </button>,
          <button
            key="fr"
            onClick={() =>
              legislation.fichierfrancais &&
              handleDownload(
                legislation.fichierfrancais,
                `legislation-fr-${legislation.id}.pdf`
              )
            }
            className={`bg-mauritania-green text-white py-1 px-4 rounded-md hover:bg-mauritania-green-dark transition duration-300 ${
              !legislation.fichierfrancais && "opacity-50 cursor-not-allowed"
            }`}
            disabled={!legislation.fichierfrancais}
            title={
              legislation.fichierfrancais
                ? t("تحميل الملف الفرنسي", "Télécharger la version française")
                : t("لا يوجد ملف فرنسي متاح", "Aucune version française disponible")
            }
          >
            {t("فرنسي", "Français")}
          </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LegislationCard;
