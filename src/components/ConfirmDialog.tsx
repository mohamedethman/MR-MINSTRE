import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion, faTrash, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { useT } from "../i18n";

export interface ConfirmOptions {
  message: string;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" (default) for deletions, "warning" or "info" for other confirmations. */
  tone?: "danger" | "warning" | "info";
}

type ConfirmFn = (options: ConfirmOptions | string) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

const TONES = {
  danger: { icon: faTrash, badge: "bg-red-100 text-red-600", button: "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500" },
  warning: { icon: faTriangleExclamation, badge: "bg-amber-100 text-amber-600", button: "bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-500" },
  info: { icon: faCircleQuestion, badge: "bg-mauritania-green/10 text-mauritania-green", button: "bg-mauritania-green hover:bg-mauritania-green-dark focus-visible:ring-mauritania-green" },
};

/**
 * App-wide confirmation dialog replacing window.confirm.
 *
 *   const confirm = useConfirm();
 *   if (!(await confirm(t("…؟", "… ?")))) return;
 */
export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, dir } = useT();
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const confirm = useCallback<ConfirmFn>((input) => {
    resolver.current?.(false); // a previous dialog left open counts as cancelled
    lastFocus.current = document.activeElement as HTMLElement | null;
    setOptions(typeof input === "string" ? { message: input } : input);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = useCallback((result: boolean) => {
    resolver.current?.(result);
    resolver.current = null;
    setOptions(null);
    lastFocus.current?.focus?.();
  }, []);

  useEffect(() => {
    if (!options) return;
    // Focus "Cancel" first: the safe choice if Enter is pressed by reflex.
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [options, close]);

  const tone = TONES[options?.tone ?? "danger"];

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <div
          dir={dir}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px] animate-[fadeIn_.15s_ease-out]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close(false);
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-[popIn_.15s_ease-out]"
          >
            <div className="flex items-start gap-4">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${tone.badge}`}>
                <FontAwesomeIcon icon={tone.icon} className="text-lg" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id="confirm-title" className="text-lg font-bold text-gray-900">
                  {options.title ?? (options.tone && options.tone !== "danger" ? t("تأكيد", "Confirmation") : t("تأكيد الحذف", "Confirmer la suppression"))}
                </h2>
                <p id="confirm-message" className="mt-2 text-sm leading-6 text-gray-600">
                  {options.message}
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                ref={cancelRef}
                type="button"
                onClick={() => close(false)}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
              >
                {options.cancelLabel ?? t("إلغاء", "Annuler")}
              </button>
              <button
                type="button"
                onClick={() => close(true)}
                className={`rounded-lg px-5 py-2.5 font-semibold text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${tone.button}`}
              >
                {options.confirmLabel ?? (options.tone && options.tone !== "danger" ? t("تأكيد", "Confirmer") : t("حذف", "Supprimer"))}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = (): ConfirmFn => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error("useConfirm must be used within a ConfirmProvider");
  return context;
};
