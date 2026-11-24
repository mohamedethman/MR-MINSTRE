import React from "react";
import { Announcement } from "../types/types";
import { useT } from "../i18n";

interface AnnouncementCardProps {
  announcement: Announcement;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
}) => {
  const { t, isArabic, dir, formatDate } = useT();
  return (
    <div dir={dir} className="bg-white p-6 rounded-lg shadow-custom hover:shadow-md transition duration-300">
      <div className="text-mauritania-gold font-semibold mb-2">
        {formatDate(announcement.datepublication)}
      </div>
      <h3 className="text-xl font-bold text-mauritania-green-dark mb-3">
        {isArabic
          ? announcement.titrearabe || announcement.titrefrancais
          : announcement.titrefrancais || announcement.titrearabe}
      </h3>
      <p className="text-gray-600 mb-4">
        {isArabic
          ? announcement.textarabe || announcement.textfrancais
          : announcement.textfrancais || announcement.textarabe}
      </p>
      <a
        href="#"
        className="text-mauritania-green font-semibold hover:text-mauritania-green-dark transition duration-300"
      >
        {t("التفاصيل الكاملة", "Voir les détails")}
      </a>
    </div>
  );
};

export default AnnouncementCard;
