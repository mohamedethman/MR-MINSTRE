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
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import {
  getBibliothequeItems,
  createBibliothequeItem,
  updateBibliothequeItem,
  getBibliothequeCategories,
} from "../../../services/api";
import { BibliothequeItem, BibliothequeCategorie } from "../../../types/types";
import { toast } from "react-toastify";
import AdminLayout from "../AdminLayout";
import { useT } from "../../../i18n";
import { mediaKind, mediaUrl } from "../../../utils/content";

interface FileWithPreview extends File {
  preview?: string;
}

const BibliothequeForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { t, isArabic } = useT();
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [existingFiles, setExistingFiles] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [categories, setCategories] = useState<BibliothequeCategorie[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<BibliothequeItem>();

  const etatValue = watch("etat");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getBibliothequeCategories();
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
      const fetchItem = async () => {
        try {
          setIsLoading(true);
          const response = await getBibliothequeItems();
          const item = response.data.find(
            (i: BibliothequeItem) => i.id === parseInt(id!)
          );
          if (item) {
            reset({
              ...item,
              etat: item.etat !== undefined ? item.etat : true,
            });
            if (item.fichiers) {
              setExistingFiles(item.fichiers);
            }
          }
        } catch (error) {
          console.error("Error fetching item:", error);
          toast.error(t("حدث خطأ أثناء جلب بيانات العنصر", "Erreur lors du chargement de l'élément"));
        } finally {
          setIsLoading(false);
        }
      };
      fetchItem();
    } else {
      // Set default values for new items
      setValue("etat", true);
      setValue("ordre", 0);
    }
  }, [id, isEditMode, reset, setValue]);

  const handleFileDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const droppedFiles = Array.from(event.dataTransfer.files);
      const validFiles = droppedFiles.filter(
        (file) =>
          file.type.startsWith("image/") || file.type.startsWith("video/")
      );

      if (validFiles.length > 0) {
        const newFiles = validFiles.map((file) => {
          const fileWithPreview = file as FileWithPreview;
          fileWithPreview.preview = URL.createObjectURL(file);
          return fileWithPreview;
        });

        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      }
      setIsDragOver(false);
    },
    []
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter(
        (file) =>
          file.type.startsWith("image/") || file.type.startsWith("video/")
      );

      const newFiles = validFiles.map((file) => {
        const fileWithPreview = file as FileWithPreview;
        fileWithPreview.preview = URL.createObjectURL(file);
        return fileWithPreview;
      });

      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => {
      const newFiles = [...prevFiles];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const removeExistingFile = (index: number) => {
    setExistingFiles((prevFiles) => {
      const newFiles = [...prevFiles];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Extract only the base64 part (remove "data:image/jpeg;base64," prefix)
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const onSubmit = async (data: BibliothequeItem) => {
    setIsLoading(true);
    try {
      // Convert new files to base64
      const base64Files = await Promise.all(
        files.map((file) => toBase64(file))
      );

      // Combine with existing files (if any) - each file is a base64 string
      const allFiles = [...existingFiles, ...base64Files];

      const payload: any = {
        id: isEditMode ? parseInt(id!) : undefined,
        descriptionarabe: data.descriptionarabe,
        descriptionfrancais: data.descriptionfrancais,
        fichiers: allFiles, // This will be an array of base64 strings: ["base64string1", "base64string2", ...]
        categorieId: data.categorieId,
        ordre: data.ordre,
        etat: data.etat,
      };

      // Remove id if it's not edit mode (for creation)
      if (!isEditMode) {
        delete payload.id;
      }

      console.log("Payload being sent:", {
        ...payload,
        fichiers: payload.fichiers
          ? `Array with ${payload.fichiers.length} files`
          : "No files",
      });

      if (isEditMode) {
        await updateBibliothequeItem(parseInt(id!), payload);
        toast.success(t("تم تحديث العنصر بنجاح", "Élément mis à jour avec succès"));
      } else {
        await createBibliothequeItem(payload);
        toast.success(t("تمت إضافة العنصر بنجاح", "Élément ajouté avec succès"));
      }

      navigate("/admin/bibliotheque");
    } catch (error) {
      console.error("Error saving item:", error);
      toast.error(t("حدث خطأ أثناء حفظ البيانات", "Erreur lors de l'enregistrement des données"));
    } finally {
      setIsLoading(false);
    }
  };

  // Clean up object URLs
  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-mauritania-green-dark">
          {isEditMode ? t("تعديل العنصر", "Modifier l'élément") : t("إضافة عنصر جديد", "Ajouter un élément")}
        </h1>
        <button
          onClick={() => navigate("/admin/bibliotheque")}
          className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition duration-300 inline-flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="rtl:rotate-180" />
          {t("رجوع", "Retour")}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Arabic description */}
            <div>
              <label
                className="block text-gray-700 mb-2"
                htmlFor="descriptionarabe"
              >
                {t("الوصف (عربي)", "Description en arabe")} *
              </label>
              <textarea
                id="descriptionarabe"
                dir="rtl"
                rows={3}
                {...register("descriptionarabe", {
                  required: t("هذا الحقل مطلوب", "Ce champ est obligatoire"),
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green ${
                  errors.descriptionarabe ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.descriptionarabe && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.descriptionarabe.message}
                </p>
              )}
            </div>

            {/* French description */}
            <div>
              <label
                className="block text-gray-700 mb-2"
                htmlFor="descriptionfrancais"
              >
                {t("الوصف (فرنسي)", "Description en français")} *
              </label>
              <textarea
                id="descriptionfrancais"
                dir="ltr"
                rows={3}
                {...register("descriptionfrancais", {
                  required: t("هذا الحقل مطلوب", "Ce champ est obligatoire"),
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green ${
                  errors.descriptionfrancais
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {errors.descriptionfrancais && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.descriptionfrancais.message}
                </p>
              )}
            </div>
          </div>

          {/* Category, Order and Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Category select */}
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="categorieId">
                {t("التصنيف", "Catégorie")} *
              </label>
              <select
                {...register("categorieId", {
                  required: t("اختر تصنيفاً", "Choisissez une catégorie"),
                  valueAsNumber: true,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green"
              >
                <option value="">{t("-- اختر تصنيفاً --", "-- Choisissez une catégorie --")}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {isArabic ? cat.nomarabe : cat.nomfrancais || cat.nomarabe}
                  </option>
                ))}
              </select>
              {errors.categorieId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.categorieId.message}
                </p>
              )}
            </div>

            {/* Order input */}
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="ordre">
                {t("الترتيب", "Ordre")}
              </label>
              <input
                id="ordre"
                type="number"
                {...register("ordre", { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green"
              />
            </div>

            {/* Status toggle */}
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="etat">
                {t("الحالة", "Statut")}
              </label>
              <div className="relative inline-block w-12 me-2 align-middle select-none">
                <input
                  type="checkbox"
                  id="etat"
                  {...register("etat")}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  checked={etatValue === undefined ? true : etatValue}
                  onChange={(e) => setValue("etat", e.target.checked)}
                />
                <label
                  htmlFor="etat"
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                    etatValue === undefined || etatValue
                      ? "bg-mauritania-green"
                      : "bg-gray-300"
                  }`}
                ></label>
              </div>
              <span className="text-gray-700 font-medium">
                {etatValue === undefined || etatValue ? t("نشط", "Actif") : t("غير نشط", "Inactif")}
              </span>
            </div>
          </div>

          {/* Enhanced File Upload */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">
              {t("الملفات (صور أو فيديو)", "Fichiers (images ou vidéos)")}
            </label>

            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragOver
                  ? "border-mauritania-green bg-mauritania-green-light"
                  : "border-gray-300 hover:border-mauritania-green"
              }`}
              onDrop={handleFileDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />

              {files.length > 0 || existingFiles.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Existing files */}
                  {existingFiles.map((file, index) => (
                    <div key={`existing-${index}`} className="relative group">
                      <div className="h-32 w-full bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                        {mediaKind(file) === "image" ? (
                          <img
                            src={mediaUrl(file) || undefined}
                            alt={`${t("ملف موجود", "Fichier existant")} ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-4">
                            <FontAwesomeIcon
                              icon={faDownload}
                              className="text-2xl mb-2"
                            />
                            <p className="text-xs truncate">{t("ملف وسائط", "Fichier multimédia")}</p>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeExistingFile(index);
                        }}
                        aria-label={t("إزالة الملف", "Retirer le fichier")}
                        title={t("إزالة الملف", "Retirer le fichier")}
                        className="absolute -top-2 -end-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FontAwesomeIcon icon={faTimes} className="text-xs" />
                      </button>
                    </div>
                  ))}

                  {/* New files */}
                  {files.map((file, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <div className="h-32 w-full bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                        {file.type.startsWith("image/") ? (
                          <img
                            src={file.preview}
                            alt={`${t("معاينة", "Aperçu")} ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-4">
                            <FontAwesomeIcon
                              icon={faDownload}
                              className="text-2xl mb-2"
                            />
                            <p className="text-xs truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        aria-label={t("إزالة الملف", "Retirer le fichier")}
                        title={t("إزالة الملف", "Retirer le fichier")}
                        className="absolute -top-2 -end-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FontAwesomeIcon icon={faTimes} className="text-xs" />
                      </button>
                    </div>
                  ))}

                  {/* Add more button */}
                  <div className="h-32 w-full border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center hover:border-mauritania-green transition-colors">
                    <FontAwesomeIcon
                      icon={faPlus}
                      className="text-gray-400 text-xl mb-2"
                    />
                    <p className="text-sm text-gray-600">{t("إضافة المزيد", "Ajouter d'autres fichiers")}</p>
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
                    {t("اسحب الملفات هنا أو انقر للاختيار", "Glissez les fichiers ici ou cliquez pour les sélectionner")}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG, GIF, MP4, MOV
                  </p>
                </div>
              )}
            </div>

            {isEditMode && (
              <p className="text-sm text-gray-500 mt-2">
                {t("سيتم استبدال الملفات الحالية بالملفات الجديدة التي تقوم برفعها", "Les fichiers actuels seront remplacés par les nouveaux fichiers que vous téléversez")}
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

export default BibliothequeForm;
