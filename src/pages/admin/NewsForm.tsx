// src/pages/admin/NewsForm.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faArrowLeft,
  faTimes,
  faEye,
  faDownload,
  faUpload,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import {
  getNews,
  createNews,
  updateNews,
  getActualitesCategories,
} from "../../services/api";
import { Actualite, ActualiteCategorie } from "../../types/types";
import { toast } from "react-toastify";
import AdminLayout from "./AdminLayout";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useT } from "../../i18n";
import { downloadMedia, mediaUrl, openMedia } from "../../utils/content";

// ✅ Custom Quill Toolbar (same as MinisterForm)
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

interface FileWithPreview extends File {
  preview?: string;
}

const NewsForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { t } = useT();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<FileWithPreview | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [arabicText, setArabicText] = useState("");
  const [frenchText, setFrenchText] = useState("");
  const [categories, setCategories] = useState<ActualiteCategorie[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<Actualite>();

  // Watch the date value to format it for the input
  const dateValue = watch("datepublication");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getActualitesCategories();
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error(t("حدث خطأ أثناء جلب التصنيفات", "Erreur lors du chargement des catégories"));
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isEditMode) {
      const fetchNews = async () => {
        try {
          setIsLoading(true);
          const response = await getNews();
          const newsItem = response.data.find(
            (n: Actualite) => n.id === parseInt(id!)
          );
          if (newsItem) {
            // Format date for input field (YYYY-MM-DD)
            const formattedDate = newsItem.datepublication
              ? new Date(newsItem.datepublication).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0];

            reset({
              ...newsItem,
              datepublication: formattedDate,
            });
            setArabicText(newsItem.textarabe || "");
            setFrenchText(newsItem.textfrancais || "");
            if (newsItem.image) {
              setExistingImage(newsItem.image);
            }
          }
        } catch (error) {
          console.error("Error fetching news:", error);
          toast.error(t("حدث خطأ أثناء جلب بيانات الخبر", "Erreur lors du chargement de l'actualité"));
        } finally {
          setIsLoading(false);
        }
      };
      fetchNews();
    } else {
      // Set default date to today for new items
      setValue("datepublication", new Date().toISOString().split("T")[0]);
    }
  }, [id, isEditMode, reset, setValue]);

  const handleFileDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const files = event.dataTransfer.files;
      if (files && files[0] && files[0].type.startsWith("image/")) {
        const file = files[0] as FileWithPreview;
        file.preview = URL.createObjectURL(file);
        setImageFile(file);
        setValue("image", file as any); // Set form value
      }
      setIsDragOver(false);
    },
    [setValue]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (
      e.target.files &&
      e.target.files[0] &&
      e.target.files[0].type.startsWith("image/")
    ) {
      const file = e.target.files[0] as FileWithPreview;
      file.preview = URL.createObjectURL(file);
      setImageFile(file);
      setValue("image", file as any); // Set form value
    }
  };

  const removeFile = () => {
    setImageFile(null);
    setValue("image", null as any);
    if (imageFile?.preview) {
      URL.revokeObjectURL(imageFile.preview);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleViewImage = () => {
    openMedia(existingImage);
  };

  const handleDownloadImage = () => {
    downloadMedia(existingImage, "news-image.jpg");
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const onSubmit = async (data: Actualite) => {
    setIsLoading(true);
    try {
      let base64Image: string | null = null;

      if (imageFile) {
        base64Image = await toBase64(imageFile);
      } else if (existingImage && isEditMode) {
        base64Image = existingImage;
      }

      // Convert date to ISO format for the API
      const publicationDate = data.datepublication
        ? new Date(data.datepublication).toISOString()
        : new Date().toISOString();

      const payload: any = {
        id: isEditMode ? parseInt(id!) : undefined,
        titrearabe: data.titrearabe,
        titrefrancais: data.titrefrancais,
        textarabe: arabicText,
        textfrancais: frenchText,
        image: base64Image,
        categorieid: data.categorieid,
        datepublication: publicationDate,
      };

      if (isEditMode) {
        await updateNews(parseInt(id!), payload);
        toast.success(t("تم تحديث الخبر بنجاح", "Actualité mise à jour avec succès"));
      } else {
        await createNews(payload);
        toast.success(t("تمت إضافة الخبر بنجاح", "Actualité ajoutée avec succès"));
      }

      navigate("/admin/news");
    } catch (error) {
      console.error("Error saving news:", error);
      toast.error(t("حدث خطأ أثناء حفظ البيانات", "Erreur lors de l'enregistrement des données"));
    } finally {
      setIsLoading(false);
    }
  };

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (imageFile?.preview) {
        URL.revokeObjectURL(imageFile.preview);
      }
    };
  }, [imageFile]);

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

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-mauritania-green-dark">
          {isEditMode ? t("تعديل الخبر", "Modifier l'actualité") : t("إضافة خبر جديد", "Ajouter une actualité")}
        </h1>
        <button
          onClick={() => navigate("/admin/news")}
          className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition duration-300 inline-flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="rtl:rotate-180" />
          {t("رجوع", "Retour")}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Titles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Arabic title */}
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="titrearabe">
                {t("العنوان (عربي)", "Titre en arabe")} *
              </label>
              <input
                id="titrearabe"
                type="text"
                dir="rtl"
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

            {/* French title */}
            <div>
              <label
                className="block text-gray-700 mb-2"
                htmlFor="titrefrancais"
              >
                {t("العنوان (فرنسي)", "Titre en français")} *
              </label>
              <input
                id="titrefrancais"
                type="text"
                dir="ltr"
                {...register("titrefrancais", { required: t("هذا الحقل مطلوب", "Ce champ est obligatoire") })}
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

          {/* Category and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Category select */}
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="categorieid">
                {t("التصنيف", "Catégorie")} *
              </label>
              <select
                {...register("categorieid", { required: t("اختر تصنيفاً", "Choisissez une catégorie") })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green"
              >
                <option value="">{t("-- اختر تصنيفاً --", "-- Choisissez une catégorie --")}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nomarabe} / {cat.nomfrancais}
                  </option>
                ))}
              </select>
              {errors.categorieid && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.categorieid.message}
                </p>
              )}
            </div>

            {/* Date input */}
            <div>
              <label
                className="block text-gray-700 mb-2"
                htmlFor="datepublication"
              >
                {t("تاريخ النشر", "Date de publication")} *
              </label>
              <div className="relative">
                <input
                  id="datepublication"
                  type="date"
                  {...register("datepublication", {
                    required: t("هذا الحقل مطلوب", "Ce champ est obligatoire"),
                  })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green ${
                    errors.datepublication
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="absolute end-3 top-3 text-gray-400 pointer-events-none"
                />
              </div>
              {errors.datepublication && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.datepublication.message}
                </p>
              )}
            </div>
          </div>

          {/* Arabic text */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">{t("النص (عربي)", "Contenu en arabe")}</label>
            <div className="rtl-quill">
              <ReactQuill
                theme="snow"
                value={arabicText}
                onChange={setArabicText}
                modules={quillModules}
                className="h-64 mb-16"
              />
            </div>
          </div>

          {/* French text */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">{t("النص (فرنسي)", "Contenu en français")}</label>
            <div className="ltr-quill">
              <ReactQuill
                theme="snow"
                value={frenchText}
                onChange={setFrenchText}
                modules={quillModules}
                className="h-64 mb-16"
              />
            </div>
          </div>

          {/* Enhanced Image Upload */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">{t("صورة الخبر", "Image de l'actualité")}</label>

            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragOver
                  ? "border-mauritania-green bg-mauritania-green-light"
                  : "border-gray-300 hover:border-mauritania-green"
              }`}
              onDrop={handleFileDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() =>
                document.getElementById("image-file-input")?.click()
              }
            >
              <input
                id="image-file-input"
                type="file"
                accept="image/*"
                {...register("image")}
                onChange={handleFileSelect}
                className="hidden"
              />

              {imageFile ? (
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <img
                      src={imageFile.preview}
                      alt={t("معاينة", "Aperçu")}
                      className="h-32 w-32 object-cover rounded-md mb-2"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      aria-label={t("إزالة الصورة", "Supprimer l'image")}
                      title={t("إزالة الصورة", "Supprimer l'image")}
                      className="absolute -top-2 -end-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <FontAwesomeIcon icon={faTimes} className="text-xs" />
                    </button>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1 truncate max-w-full">
                    {imageFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(imageFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : existingImage ? (
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <img
                      src={mediaUrl(existingImage) || undefined}
                      alt={t("الصورة الحالية", "Image actuelle")}
                      className="h-32 w-32 object-cover rounded-md mb-2"
                    />
                  </div>
                  <p className="text-sm font-medium text-green-700 mb-2">
                    {t("صورة موجودة", "Image existante")}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewImage();
                      }}
                      className="text-mauritania-green hover:text-mauritania-green-dark text-sm"
                    >
                      <FontAwesomeIcon icon={faEye} className="me-1" /> {t("معاينة", "Aperçu")}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadImage();
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <FontAwesomeIcon icon={faDownload} className="me-1" />{" "}
                      {t("تحميل", "Télécharger")}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="bg-gray-100 p-3 rounded-lg inline-block mb-3">
                    <FontAwesomeIcon
                      icon={faUpload}
                      className="text-gray-400 text-2xl"
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    {t("اسحب الصورة هنا أو انقر للاختيار", "Glissez l'image ici ou cliquez pour la sélectionner")}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF</p>
                </div>
              )}
            </div>

            {isEditMode && !imageFile && (
              <p className="text-sm text-gray-500 mt-2">
                {t("اتركه فارغاً للحفاظ على الصورة الحالية", "Laissez vide pour conserver l'image actuelle")}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-mauritania-green text-white py-2 px-6 rounded-md hover:bg-mauritania-green-dark transition duration-300 focus:outline-none focus:ring-2 focus:ring-mauritania-green focus:ring-opacity-50 disabled:opacity-50 inline-flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faSave} />
              {isLoading ? t("جاري الحفظ...", "Enregistrement…") : t("حفظ البيانات", "Enregistrer")}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default NewsForm;
