// src/pages/admin/Information.tsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faUpload,
  faTimes,
  faEye,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { Information as InfoType } from "../../types/types";
import {
  getInformation,
  createInformation,
  updateInformation,
} from "../../services/api";
import AdminLayout from "./AdminLayout";
import { useT } from "../../i18n";
import { mediaUrl } from "../../utils/content";
import { MINISTRY_NAME } from "../../utils/site";

const InformationAdmin: React.FC = () => {
  const { t } = useT();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [existingLogo, setExistingLogo] = useState<string | null>(null);
  const [formData, setFormData] = useState<InfoType>({
    nomsite: "",
    logo: "",
    adresse: "",
    telephone: "",
    email: "",
    horaires: "",
  });

  useEffect(() => {
    fetchInformation();
  }, []);
  const fetchInformation = async () => {
    try {
      setIsLoading(true);
      const response = await getInformation();
      if (response.data && response.data.length > 0) {
        const info = response.data[0];
        setFormData(info);
        if (info.logo) {
          setExistingLogo(info.logo);
        }
      }
    } catch (error) {
      console.error("Error fetching information:", error);
      toast.error(t("حدث خطأ أثناء جلب البيانات", "Erreur lors du chargement des données"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        setLogoFile(file);
      } else {
        toast.error(t("الرجاء اختيار ملف صورة", "Veuillez sélectionner un fichier image"));
      }
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let base64Logo: string | null = null;

      if (logoFile) {
        base64Logo = await toBase64(logoFile);
      } else if (existingLogo) {
        base64Logo = existingLogo;
      }

      const payload = {
        ...formData,
        // The ministry name is fixed; always store the official names.
        nomsite: MINISTRY_NAME.fr,
        nomsitear: MINISTRY_NAME.ar,
        logo: base64Logo,
      };

      if (formData.id) {
        await updateInformation(formData.id, payload);
        toast.success(t("تم تحديث المعلومات بنجاح", "Informations mises à jour avec succès"));
      } else {
        await createInformation(payload);
        toast.success(t("تم حفظ المعلومات بنجاح", "Informations enregistrées avec succès"));
      }

      fetchInformation(); // Refresh data
    } catch (error) {
      console.error("Error saving information:", error);
      toast.error(t("حدث خطأ أثناء حفظ البيانات", "Erreur lors de l'enregistrement des données"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-mauritania-green"
            role="status"
            aria-label={t("جاري التحميل...", "Chargement…")}
          ></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-mauritania-green-dark">
          {t("إدارة المعلومات العامة", "Gestion des informations générales")}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          {/* Logo Upload */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">{t("شعار الموقع", "Logo du site")}</label>
            <div className="flex items-center gap-4">
              {logoFile ? (
                <div className="relative">
                  <img
                    src={URL.createObjectURL(logoFile)}
                    alt={t("معاينة الشعار", "Aperçu du logo")}
                    className="h-20 w-20 object-contain border rounded"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    title={t("إزالة الشعار", "Retirer le logo")}
                    aria-label={t("إزالة الشعار", "Retirer le logo")}
                    className="absolute -top-2 -end-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-xs" />
                  </button>
                </div>
              ) : existingLogo ? (
                <div className="relative">
                  <img
                    src={mediaUrl(existingLogo) || undefined}
                    alt={t("شعار الموقع", "Logo du site")}
                    className="h-20 w-20 object-contain border rounded"
                  />
                </div>
              ) : (
                <div className="h-20 w-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                  <FontAwesomeIcon icon={faUpload} className="text-gray-400" />
                </div>
              )}

              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoSelect}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded cursor-pointer hover:bg-gray-300"
                >
                  {t("اختر شعاراً", "Choisir un logo")}
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  {t("JPG, PNG, GIF - الحجم الأقصى 2MB", "JPG, PNG, GIF - taille maximale 2 Mo")}
                </p>
              </div>
            </div>
          </div>

          {/* Site Name (fixed official name, read-only) */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">{t("اسم الموقع", "Nom du site")}</label>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <span className="mb-1 block text-xs text-gray-500">{t("بالعربية", "En arabe")}</span>
                <input
                  type="text"
                  dir="rtl"
                  value={MINISTRY_NAME.ar}
                  readOnly
                  aria-readonly="true"
                  className="w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-gray-700"
                />
              </div>
              <div>
                <span className="mb-1 block text-xs text-gray-500">{t("بالفرنسية", "En français")}</span>
                <input
                  type="text"
                  dir="ltr"
                  value={MINISTRY_NAME.fr}
                  readOnly
                  aria-readonly="true"
                  className="w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-gray-700"
                />
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {t("الاسم الرسمي للوزارة ثابت ولا يمكن تعديله.", "Le nom officiel du ministère est fixe et ne peut pas être modifié.")}
            </p>
          </div>

          {/* Address */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">{t("العنوان", "Adresse")}</label>
            <input
              type="text"
              name="adresse"
              value={formData.adresse}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green"
              required
            />
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">{t("الهاتف", "Téléphone")}</label>
            <input
              type="tel"
              name="telephone"
              value={formData.telephone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green"
              required
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              {t("البريد الإلكتروني", "E-mail")}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green"
              required
            />
          </div>

          {/* Working Hours */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">{t("ساعات العمل", "Horaires de travail")}</label>
            <input
              type="text"
              name="horaires"
              value={formData.horaires}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-mauritania-green text-white py-2 px-6 rounded-md hover:bg-mauritania-green-dark transition duration-300 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faSave} />
              {isSaving
                ? t("جاري الحفظ...", "Enregistrement…")
                : t("حفظ التغييرات", "Enregistrer les modifications")}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default InformationAdmin;
