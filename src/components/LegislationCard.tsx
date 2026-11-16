import React from "react";
import { Legislation } from "../types/types";

interface LegislationCardProps {
  legislation: Legislation;
}

const LegislationCard: React.FC<LegislationCardProps> = ({ legislation }) => {
  const handleDownload = (fileData: string, fileName: string) => {
    if (!fileData) return;

    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,${fileData}`;
    link.download = fileName;
    link.click();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-custom hover:shadow-md transition duration-300">
      <h3 className="text-xl font-bold text-mauritania-green-dark mb-2">
        {legislation.titrearabe}
      </h3>
      <h4 className="text-lg text-gray-700 mb-2">
        {legislation.titrefrancais}
      </h4>
      <div className="flex justify-between items-center">
        <span className="text-gray-600">
          {legislation.datesortie
            ? new Date(legislation.datesortie).toLocaleDateString("ar-MA")
            : "N/A"}
        </span>
        <div className="flex space-x-2">
          <button
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
                ? "تحميل الملف العربي"
                : "لا يوجد ملف عربي متاح"
            }
          >
            عربي
          </button>
          <button
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
                ? "تحميل الملف الفرنسي"
                : "لا يوجد ملف فرنسي متاح"
            }
          >
            فرنسي
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegislationCard;
