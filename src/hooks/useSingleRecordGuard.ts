import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import { useT } from "../i18n";

/**
 * For single-record sections: when the "new" form is opened while the record
 * already exists (e.g. typed URL), redirect to that record's edit form instead
 * of creating a duplicate. Returns true while the check is running.
 */
export const useSingleRecordGuard = (
  active: boolean,
  endpoint: string,
  editPath: (id: number | string) => string
): boolean => {
  const navigate = useNavigate();
  const { t } = useT();
  const [checking, setChecking] = useState(active);

  useEffect(() => {
    if (!active) {
      setChecking(false);
      return;
    }
    let cancelled = false;
    api
      .get(endpoint)
      .then((response) => {
        const first = Array.isArray(response.data) ? response.data[0] : null;
        if (!cancelled && first?.id != null) {
          toast.info(t("يوجد سجل بالفعل: يمكنك تعديله فقط.", "Un enregistrement existe déjà : vous pouvez seulement le modifier."));
          navigate(editPath(first.id), { replace: true });
        }
      })
      .catch(() => {
        // If the check fails, let the form open; the list page still limits additions.
      })
      .finally(() => !cancelled && setChecking(false));
    return () => {
      cancelled = true;
    };
    // editPath is a stable inline builder; only the inputs below matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, endpoint]);

  return checking;
};
