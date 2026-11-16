import React from "react";
import { Minister } from "../types/types";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface MinisterCardProps {
  minister: Minister;
}

const MinisterCard: React.FC<MinisterCardProps> = ({ minister }) => {
  return (
    <div className="bg-white rounded-lg shadow-custom overflow-hidden mb-12">
      <div className="flex flex-col md:flex-row">
        {/* Minister Photo */}
        <div className="md:w-1/3 p-6">
          <img
            src={
              minister.image ||
              "https://via.placeholder.com/300x400/007a45/FFFFFF?text=وزير+العقارات"
            }
            alt={minister.titrearabe}
            className="w-full h-auto rounded-lg shadow-md"
          />
        </div>

        {/* Minister Details */}
        <div className="md:w-2/3 p-6">
          <h3 className="text-2xl font-bold text-mauritania-green-dark mb-4">
            {minister.titrearabe}
          </h3>
          <h4 className="text-lg text-gray-600 mb-6">
            {minister.titrefrancais}
          </h4>

          {/* Arabic Bio */}
          <div className="mb-8">
            <h5 className="text-lg font-semibold text-mauritania-green-dark mb-2">
              السيرة الذاتية
            </h5>
            <div className="prose max-w-none">
              <ReactQuill
                value={minister.textarabe}
                readOnly={true}
                theme="bubble"
                modules={{ toolbar: false }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinisterCard;
