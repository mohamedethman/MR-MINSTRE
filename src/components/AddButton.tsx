import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useT } from "../i18n";

interface AddButtonProps {
  to: string;
  label: string;
  /**
   * True when the section only allows one record and it already exists:
   * the button is greyed out and explains that the record must be edited instead.
   */
  limitReached?: boolean;
}

/** "Ajouter" button of admin lists, disabled for single-record sections that are already filled. */
const AddButton: React.FC<AddButtonProps> = ({ to, label, limitReached = false }) => {
  const { t } = useT();
  const reason = t(
    "هذا القسم يقبل سجلاً واحداً فقط. عدّل السجل الموجود أو احذفه لإضافة سجل جديد.",
    "Cette section n'accepte qu'un seul enregistrement. Modifiez l'enregistrement existant, ou supprimez-le pour en ajouter un nouveau."
  );

  if (limitReached) {
    return (
      <div className="flex flex-col items-end gap-1">
        <span
          role="button"
          aria-disabled="true"
          title={reason}
          className="inline-flex cursor-not-allowed select-none items-center gap-2 rounded bg-gray-300 px-4 py-2 text-gray-600"
        >
          <FontAwesomeIcon icon={faLock} className="text-sm" />
          {label}
        </span>
        <span className="max-w-xs text-end text-xs text-gray-500">
          {t("سجل واحد فقط مسموح به", "Un seul enregistrement autorisé")}
        </span>
      </div>
    );
  }

  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 rounded bg-mauritania-green px-4 py-2 text-white transition hover:bg-mauritania-green-dark"
    >
      <FontAwesomeIcon icon={faPlus} />
      {label}
    </Link>
  );
};

export default AddButton;
