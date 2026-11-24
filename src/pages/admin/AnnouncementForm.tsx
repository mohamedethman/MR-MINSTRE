import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
} from "../../services/api";
import { Announcement } from "../../types/types";
import { toast } from "react-toastify";
import AdminLayout from "./AdminLayout";
import { useT } from "../../i18n";

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["link", "image"],
    [{ color: [] }, { background: [] }],
    ["clean"],
  ],
};

const AnnouncementForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { t } = useT();

  const [isLoading, setIsLoading] = useState(false);
  const [arabicText, setArabicText] = useState("");
  const [frenchText, setFrenchText] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
    watch,
  } = useForm<Announcement>();

  // Watch the date field to format it properly
  const dateValue = watch("datepublication");

  useEffect(() => {
    if (isEditMode) {
      const fetchAnnouncement = async () => {
        try {
          setIsLoading(true);
          const response = await getAnnouncements();
          const announcement = response.data.find(
            (a: Announcement) => a.id === parseInt(id!)
          );

          if (announcement) {
            // Convert the date from API to YYYY-MM-DD format for the date input
            const apiDate = new Date(announcement.datepublication);
            const formattedDate = apiDate.toISOString().split("T")[0];

            reset({
              ...announcement,
              datepublication: formattedDate,
            });
            setArabicText(announcement.textarabe || "");
            setFrenchText(announcement.textfrancais || "");
          }
        } catch (error) {
          console.error("Error fetching announcement:", error);
          toast.error(t("حدث خطأ أثناء جلب بيانات الإعلان", "Erreur lors du chargement de l'annonce"));
        } finally {
          setIsLoading(false);
        }
      };
      fetchAnnouncement();
    }
  }, [id, isEditMode, reset]);

  const onSubmit = async (data: Announcement) => {
    setIsLoading(true);

    try {
      // Format the date to include time component (ISO 8601 format)
      const formattedDate = dateValue
        ? `${dateValue}T12:00:00`
        : new Date().toISOString();

      const payload = {
        id: isEditMode ? parseInt(id!) : undefined,
        titrearabe: data.titrearabe,
        titrefrancais: data.titrefrancais,
        textarabe: arabicText,
        textfrancais: frenchText,
        datepublication: formattedDate,
      };

      if (isEditMode) {
        await updateAnnouncement(parseInt(id!), payload);
        toast.success(t("تم تحديث الإعلان بنجاح", "Annonce mise à jour avec succès"));
      } else {
        await createAnnouncement(payload);
        toast.success(t("تم إضافة الإعلان بنجاح", "Annonce ajoutée avec succès"));
      }

      navigate("/admin/announcements");
    } catch (error) {
      console.error("Error saving announcement:", error);
      toast.error(t("حدث خطأ أثناء حفظ البيانات", "Erreur lors de l'enregistrement des données"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <style>
        {`
          .rtl-quill .ql-editor {
            direction: rtl;
            text-align: right;
          }
          
          .rtl-quill .ql-editor ol, 
          .rtl-quill .ql-editor ul {
            padding-right: 1.5em;
            padding-left: 0;
          }
          
          .rtl-quill .ql-editor li:before {
            margin-left: 0.3em;
            margin-right: -1.5em;
          }
          
          .ltr-quill .ql-editor {
            direction: ltr;
            text-align: left;
          }
          
          .ltr-quill .ql-editor ol, 
          .ltr-quill .ql-editor ul {
            padding-left: 1.5em;
            padding-right: 0;
          }
        `}
      </style>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-mauritania-green-dark">
            {isEditMode ? t("تعديل الإعلان", "Modifier l'annonce") : t("إضافة إعلان جديد", "Ajouter une annonce")}
          </h1>
          <button
            onClick={() => navigate("/admin/announcements")}
            className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition duration-300 inline-flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="rtl:rotate-180" />
            {t("رجوع", "Retour")}
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Title Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label
                  htmlFor="titrearabe"
                  className="block text-gray-700 mb-2"
                >
                  {t("العنوان (عربي)", "Titre en arabe")} *
                </label>
                <input
                  id="titrearabe"
                  dir="rtl"
                  type="text"
                  {...register("titrearabe", { required: t("هذا الحقل مطلوب", "Ce champ est obligatoire") })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green ${
                    errors.titrearabe ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.titrearabe && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.titrearabe.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="titrefrancais"
                  className="block text-gray-700 mb-2"
                >
                  {t("العنوان (فرنسي)", "Titre en français")} *
                </label>
                <input
                  id="titrefrancais"
                  dir="ltr"
                  type="text"
                  {...register("titrefrancais", {
                    required: t("هذا الحقل مطلوب", "Ce champ est obligatoire"),
                  })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green ${
                    errors.titrefrancais ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.titrefrancais && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.titrefrancais.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="datepublication"
                className="block text-gray-700 mb-2"
              >
                {t("تاريخ النشر", "Date de publication")} *
              </label>
              <input
                id="datepublication"
                type="date"
                {...register("datepublication", {
                  required: t("هذا الحقل مطلوب", "Ce champ est obligatoire"),
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green ${
                  errors.datepublication ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.datepublication && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.datepublication.message}
                </p>
              )}
            </div>

            {/* Rich Text Editors */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">{t("المحتوى (عربي)", "Contenu en arabe")}</label>
              <div dir="rtl" className="rtl-quill">
                <ReactQuill
                  theme="snow"
                  value={arabicText}
                  onChange={setArabicText}
                  modules={quillModules}
                  className="h-64 mb-16"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">
                {t("المحتوى (فرنسي)", "Contenu en français")}
              </label>
              <div dir="ltr" className="ltr-quill">
                <ReactQuill
                  theme="snow"
                  value={frenchText}
                  onChange={setFrenchText}
                  modules={quillModules}
                  className="h-64 mb-16"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-mauritania-green text-white py-2 px-6 rounded-md hover:bg-mauritania-green-dark transition duration-300 inline-flex items-center gap-2 disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faSave} />
                {isLoading ? t("جاري الحفظ...", "Enregistrement…") : t("حفظ البيانات", "Enregistrer")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AnnouncementForm;
