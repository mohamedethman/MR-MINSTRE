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

interface FileWithPreview extends File {
  preview?: string;
}

const BibliothequeForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
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
        toast.error("حدث خطأ أثناء جلب التصنيفات");
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
          toast.error("حدث خطأ أثناء جلب بيانات العنصر");
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
        toast.success("تم تحديث العنصر بنجاح");
      } else {
        await createBibliothequeItem(payload);
        toast.success("تمت إضافة العنصر بنجاح");
      }

      navigate("/admin/bibliotheque");
    } catch (error) {
      console.error("Error saving item:", error);
      toast.error("حدث خطأ أثناء حفظ البيانات");
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
          {isEditMode ? "تعديل العنصر" : "إضافة عنصر جديد"}
        </h1>
        <button
          onClick={() => navigate("/admin/bibliotheque")}
          className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition duration-300"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="ml-2" />
          رجوع
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
                الوصف (عربي) *
              </label>
              <textarea
                id="descriptionarabe"
                rows={3}
                {...register("descriptionarabe", {
                  required: "هذا الحقل مطلوب",
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
                الوصف (فرنسي) *
              </label>
              <textarea
                id="descriptionfrancais"
                rows={3}
                {...register("descriptionfrancais", {
                  required: "هذا الحقل مطلوب",
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
                التصنيف *
              </label>
              <select
                {...register("categorieId", {
                  required: "اختر تصنيفاً",
                  valueAsNumber: true,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green"
              >
                <option value="">-- اختر تصنيفاً --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nomarabe}
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
                الترتيب
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
                الحالة
              </label>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
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
                {etatValue === undefined || etatValue ? "نشط" : "غير نشط"}
              </span>
            </div>
          </div>

          {/* Enhanced File Upload */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">
              الملفات (صور أو فيديو)
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
                        {file.startsWith("/9j/") ||
                        file.startsWith("iVBORw") ||
                        file.startsWith("JVBER") ? (
                          <img
                            src={`data:image/jpeg;base64,${file}`}
                            alt={`Existing ${index}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-4">
                            <FontAwesomeIcon
                              icon={faDownload}
                              className="text-2xl mb-2"
                            />
                            <p className="text-xs truncate">ملف وسائط</p>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeExistingFile(index);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
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
                            alt={`Preview ${index}`}
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
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
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
                    <p className="text-sm text-gray-600">إضافة المزيد</p>
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
                    اسحب الملفات هنا أو انقر للاختيار
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG, GIF, MP4, MOV
                  </p>
                </div>
              )}
            </div>

            {isEditMode && (
              <p className="text-sm text-gray-500 mt-2">
                سيتم استبدال الملفات الحالية بالملفات الجديدة التي تقوم برفعها
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-mauritania-green text-white py-2 px-6 rounded-md hover:bg-mauritania-green-dark transition duration-300 focus:outline-none focus:ring-2 focus:ring-mauritania-green focus:ring-opacity-50 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faSave} className="ml-2" />
              {isLoading ? "جاري الحفظ..." : "حفظ البيانات"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default BibliothequeForm;
