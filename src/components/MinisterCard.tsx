import React from "react";
import { Minister } from "../types/types";
import RichText from "./RichText";
import { mediaUrl } from "../utils/content";

interface MinisterCardProps {
  minister: Minister;
}

const MinisterCard: React.FC<MinisterCardProps> = ({ minister }) => {
  const image = mediaUrl(minister.image);
  return (
    <div className="mb-12 overflow-hidden rounded-lg bg-white shadow-custom">
      <div className="flex flex-col md:flex-row">
        {image && (
          <div className="p-6 md:w-1/3">
            <img src={image} alt={minister.titrearabe} className="h-auto w-full rounded-lg shadow-md" />
          </div>
        )}
        <div className="p-6 md:flex-1">
          <h3 className="mb-4 text-2xl font-bold text-mauritania-green-dark">{minister.titrearabe}</h3>
          <h4 className="mb-6 text-lg text-gray-600">{minister.titrefrancais}</h4>
          <RichText html={minister.textarabe} dir="rtl" />
        </div>
      </div>
    </div>
  );
};

export default MinisterCard;
