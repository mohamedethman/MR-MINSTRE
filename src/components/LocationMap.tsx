import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDirections, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { useT } from "../i18n";
import { MINISTRY_LOCATION } from "../utils/site";

interface LocationMapProps {
  className?: string;
}

/**
 * Embedded map pinned on the ministry building (MINISTRY_LOCATION), using
 * Google Maps' key-less embed. Coordinates are used rather than the address
 * text so the pin lands on the exact building.
 */
const LocationMap: React.FC<LocationMapProps> = ({ className = "h-64" }) => {
  const { t, language } = useT();
  const point = `${MINISTRY_LOCATION.lat},${MINISTRY_LOCATION.lng}`;

  const embedUrl = `https://maps.google.com/maps?q=${point}&hl=${language}&z=17&output=embed`;
  const openUrl = `https://www.google.com/maps/search/?api=1&query=${point}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${point}`;

  return (
    <div>
      <iframe
        title={t("خريطة موقع الوزارة", "Carte de localisation du ministère")}
        src={embedUrl}
        className={`${className} w-full rounded-lg border-0`}
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-mauritania-green hover:underline"
        >
          <FontAwesomeIcon icon={faDirections} />
          {t("الاتجاهات إلى الوزارة", "Itinéraire vers le ministère")}
        </a>
        <a
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-mauritania-green hover:underline"
        >
          <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs" />
          {t("فتح في خرائط Google", "Ouvrir dans Google Maps")}
        </a>
      </div>
    </div>
  );
};

export default LocationMap;
