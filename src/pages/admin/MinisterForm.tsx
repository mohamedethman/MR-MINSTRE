import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  getMinisters,
  createMinister,
  updateMinister,
} from "../../services/api";
import { Minister } from "../../types/types";
import { toast } from "react-toastify";
import AdminLayout from "./AdminLayout";
import { useSingleRecordGuard } from "../../hooks/useSingleRecordGuard";
import { useT } from "../../i18n";
import { mediaUrl } from "../../utils/content";

// ✅ Custom Quill Toolbar
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

const MinisterForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { t } = useT();

  const [isLoading, setIsLoading] = useState(false);
  // Only one minister record is shown on the site: "new" redirects to the existing one.
  const checkingSingle = useSingleRecordGuard(!isEditMode, "/aproposministere", (existingId) => `/admin/ministers/edit/${existingId}`);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // Image exactly as stored by the backend (base64 or file name), re-sent unchanged on save.
  const [storedImage, setStoredImage] = useState<string | null>(null);
  const [arabicText, setArabicText] = useState("");
  const [frenchText, setFrenchText] = useState("");
  const [arabicAlignment, setArabicAlignment] = useState<
    "left" | "center" | "right"
  >("right");
  const [frenchAlignment, setFrenchAlignment] = useState<
    "left" | "center" | "right"
  >("left");
  const [imageAlignment, setImageAlignment] = useState<
    "left" | "center" | "right"
  >("center");
  const [textColor, setTextColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<Minister>();

  useEffect(() => {
    if (isEditMode) {
      const fetchMinister = async () => {
        try {
          setIsLoading(true);
          const response = await getMinisters();
          const minister = response.data.find(
            (m: Minister) => m.id === parseInt(id!)
          );

          if (minister) {
            reset(minister);
            setArabicText(minister.textarabe || "");
            setFrenchText(minister.textfrancais || "");
            setArabicAlignment(minister.arabicAlignment || "right");
            setFrenchAlignment(minister.frenchAlignment || "left");
            setImageAlignment(minister.imageAlignment || "center");
            setTextColor(minister.textColor || "#000000");
            setBackgroundColor(minister.backgroundColor || "#ffffff");

            // ✅ Properly format base64 image for preview
            if (minister.image) {
              setStoredImage(minister.image);
              setImagePreview(mediaUrl(minister.image));
            }
          }
        } catch (error) {
          console.error("Error fetching minister:", error);
          toast.error(t("حدث خطأ أثناء جلب بيانات الوزير", "Erreur lors du chargement des données du ministre"));
        } finally {
          setIsLoading(false);
        }
      };
      fetchMinister();
    }
  }, [id, isEditMode, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Converts a File to a base64 string.
   * @param file The file to convert.
   * @returns A promise that resolves with the base64 string.
   */
  /*******  23429ff5-a574-4f1b-a693-fcab034b062c  *******/ const toBase64 = (
    file: File
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const onSubmit = async (data: Minister) => {
    setIsLoading(true);

    try {
      let base64Image: string | null = null;

      // Use new file if uploaded
      if (data.image && data.image.length > 0) {
        base64Image = await toBase64(data.image[0]);
      } else if (imagePreview) {
        // Unchanged image: send back what the backend gave us (base64 or file name).
        base64Image = storedImage ?? (imagePreview.startsWith("data:") ? imagePreview.split(",")[1] : imagePreview);
      }

      const payload = {
        id: isEditMode ? parseInt(id!) : undefined,
        titrearabe: data.titrearabe,
        titrefrancais: data.titrefrancais,
        textarabe: arabicText,
        textfrancais: frenchText,
        image: base64Image,
        arabicAlignment,
        frenchAlignment,
        imageAlignment,
        textColor,
        backgroundColor,
      };

      // ✅ Always call the API regardless of image change
      if (isEditMode) {
        await updateMinister(parseInt(id!), payload);
        toast.success(t("تم تحديث بيانات الوزير بنجاح", "Données du ministre mises à jour avec succès"));
      } else {
        await createMinister(payload);
        toast.success(t("تم إضافة الوزير بنجاح", "Ministre ajouté avec succès"));
      }

      navigate("/admin/ministers");
    } catch (error) {
      console.error("Error saving minister:", error);
      toast.error(t("حدث خطأ أثناء حفظ البيانات", "Erreur lors de l'enregistrement des données"));
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSingle) {
    return (
      <AdminLayout>
        <p className="py-12 text-center text-gray-600">{t("جاري التحميل...", "Chargement…")}</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Add the CSS for RTL/LTR styling */}
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
            {isEditMode ? t("تعديل بيانات الوزير", "Modifier les données du ministre") : t("إضافة وزير جديد", "Ajouter un ministre")}
          </h1>
          <button
            onClick={() => navigate("/admin/ministers")}
            className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition duration-300 inline-flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="rtl:rotate-180" />
            {t("رجوع", "Retour")}
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div
            className="bg-white rounded-lg shadow-md p-6"
            style={{ backgroundColor }}
          >
            {/* Titre Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label
                  htmlFor="titrearabe"
                  className="block text-gray-700 mb-2"
                >
                  {t("اللقب (عربي)", "Titre en arabe")} *
                </label>
                <input
                  id="titrearabe"
                  dir="rtl"
                  type="text"
                  {...register("titrearabe", { required: t("هذا الحقل مطلوب", "Ce champ est obligatoire") })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green ${
                    errors.titrearabe ? "border-red-500" : "border-gray-300"
                  }`}
                  style={{ color: textColor }}
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
                  {t("اللقب (فرنسي)", "Titre en français")} *
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
                  style={{ color: textColor }}
                />
                {errors.titrefrancais && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.titrefrancais.message}
                  </p>
                )}
              </div>
            </div>

            {/* Text Alignment Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 mb-2">
                  {t("محاذاة النص (عربي)", "Alignement du texte arabe")}
                </label>
                <select
                  value={arabicAlignment}
                  onChange={(e) => setArabicAlignment(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="right">{t("يمين", "Droite")}</option>
                  <option value="center">{t("وسط", "Centre")}</option>
                  <option value="left">{t("يسار", "Gauche")}</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  {t("محاذاة النص (فرنسي)", "Alignement du texte français")}
                </label>
                <select
                  value={frenchAlignment}
                  onChange={(e) => setFrenchAlignment(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="left">{t("يسار", "Gauche")}</option>
                  <option value="center">{t("وسط", "Centre")}</option>
                  <option value="right">{t("يمين", "Droite")}</option>
                </select>
              </div>
            </div>

            {/* Rich Text Editors */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">{t("النص (عربي)", "Contenu en arabe")}</label>
              <div
                dir="rtl"
                style={{ textAlign: arabicAlignment, color: textColor }}
                className="rtl-quill"
              >
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
              <label className="block text-gray-700 mb-2">{t("النص (فرنسي)", "Contenu en français")}</label>
              <div
                dir="ltr"
                style={{ textAlign: frenchAlignment, color: textColor }}
                className="ltr-quill"
              >
                <ReactQuill
                  theme="snow"
                  value={frenchText}
                  onChange={setFrenchText}
                  modules={quillModules}
                  className="h-64 mb-16"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">{t("محاذاة الصورة", "Alignement de l'image")}</label>
              <select
                value={imageAlignment}
                onChange={(e) => setImageAlignment(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="left">{t("يسار", "Gauche")}</option>
                <option value="center">{t("وسط", "Centre")}</option>
                <option value="right">{t("يمين", "Droite")}</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">{t("صورة الوزير", "Photo du ministre")}</label>
              <input
                type="file"
                accept="image/*"
                {...register("image")}
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {imagePreview && (
                <div
                  className={`mt-4 flex ${
                    imageAlignment === "center"
                      ? "justify-center"
                      : imageAlignment === "right"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <img
                    src={imagePreview}
                    alt={t("معاينة", "Aperçu")}
                    className="h-40 w-40 object-cover rounded-md"
                  />
                </div>
              )}
            </div>

            {/* Color Pickers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 mb-2">{t("لون النص", "Couleur du texte")}</label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">{t("لون الخلفية", "Couleur de fond")}</label>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-md"
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

export default MinisterForm;
