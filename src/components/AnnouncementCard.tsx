import React from "react";
import { Announcement } from "../types/types";

interface AnnouncementCardProps {
  announcement: Announcement;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-custom hover:shadow-md transition duration-300">
      <div className="text-mauritania-gold font-semibold mb-2">
        {new Date(announcement.datepublication).toLocaleDateString("ar-MA")}
      </div>
      <h3 className="text-xl font-bold text-mauritania-green-dark mb-3">
        {announcement.titrearabe}
      </h3>
      <p className="text-gray-600 mb-4">{announcement.textarabe}</p>
      <a
        href="#"
        className="text-mauritania-green font-semibold hover:text-mauritania-green-dark transition duration-300"
      >
        التفاصيل الكاملة
      </a>
    </div>
  );
};

export default AnnouncementCard;
