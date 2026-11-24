import React from "react";
import { NewsItem } from "../types/types";
import { useT } from "../i18n";

interface NewsCardProps {
  news: NewsItem;
}

const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
  const { t, dir } = useT();
  return (
    <div dir={dir} className="bg-white rounded-lg overflow-hidden shadow-custom hover:shadow-lg transition duration-300">
      <div className="h-48 overflow-hidden">
        <img
          src={news.image}
          alt={news.title}
          className="w-full h-full object-cover hover:scale-105 transition duration-500"
        />
      </div>
      <div className="p-6">
        <div className="text-mauritania-gold font-semibold mb-2">
          {news.date}
        </div>
        <h3 className="text-xl font-bold text-mauritania-green-dark mb-3">
          {news.title}
        </h3>
        <p className="text-gray-600 mb-4">{news.excerpt}</p>
        <a
          href="#"
          className="text-mauritania-green font-semibold hover:text-mauritania-green-dark transition duration-300"
        >
          {t("قراءة المزيد", "Lire la suite")}
        </a>
      </div>
    </div>
  );
};

export default NewsCard; // <-- This export makes it a module
