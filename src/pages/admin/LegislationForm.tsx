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
} from "@fortawesome/free-solid-svg-icons";
import {
  getLegislations,
  createLegislation,
  updateLegislation,
} from "../../services/api";
import { Legislation } from "../../types/types";
import { toast } from "react-toastify";
import AdminLayout from "./AdminLayout";

interface LegislationFormData {
  titrearabe: string;
  titrefrancais: string;
  datesortie: string;
}

interface FileWithPreview extends File {
  preview?: string;
}

const LegislationForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [arabicFile, setArabicFile] = useState<FileWithPreview | null>(null);
  const [frenchFile, setFrenchFile] = useState<FileWithPreview | null>(null);
  const [existingArabicFile, setExistingArabicFile] = useState<string>("");
  const [existingFrenchFile, setExistingFrenchFile] = useState<string>("");
  const [isDragOverArabic, setIsDragOverArabic] = useState(false);
  const [isDragOverFrench, setIsDragOverFrench] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LegislationFormData>();

  useEffect(() => {
    if (isEditMode) {
      const fetchLegislation = async () => {
        try {
          setIsLoading(true);
          const response = await getLegislations();
          const legislation = response.data.find(
            (l: Legislation) => l.id === parseInt(id!)
          );

          if (legislation) {
            setValue("titrearabe", legislation.titrearabe);
            setValue("titrefrancais", legislation.titrefrancais);
            setValue("datesortie", legislation.datesortie);

            setExistingArabicFile(legislation.fichierarabe || "");
            setExistingFrenchFile(legislation.fichierfrancais || "");
          }
        } catch (error) {
          console.error("Error fetching legislation:", error);
          toast.error("حدث خطأ أثناء جلب بيانات التشريع");
        } finally {
          setIsLoading(false);
        }
      };
      fetchLegislation();
    }
  }, [id, isEditMode, setValue]);

  const handleFileDrop = useCallback(
    (
      event: React.DragEvent<HTMLDivElement>,
      setFile: (file: FileWithPreview) => void,
      setFileName: (name: string) => void
    ) => {
      event.preventDefault();
      const files = event.dataTransfer.files;
      if (files && files[0]) {
        const file = files[0] as FileWithPreview;
        file.preview = URL.createObjectURL(file);
        setFile(file);
        setFileName(file.name);
      }
      setIsDragOverArabic(false);
      setIsDragOverFrench(false);
    },
    []
  );

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: FileWithPreview) => void,
    setFileName: (name: string) => void
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0] as FileWithPreview;
      file.preview = URL.createObjectURL(file);
      setFile(file);
      setFileName(file.name);
    }
  };

  const removeFile = (
    setFile: (file: null) => void,
    setFileName: (name: string) => void
  ) => {
    setFile(null);
    setFileName("");
  };

  const handleDragOver = (
    event: React.DragEvent<HTMLDivElement>,
    setIsDragOver: (state: boolean) => void
  ) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (setIsDragOver: (state: boolean) => void) => {
    setIsDragOver(false);
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleDownload = (fileData: string, fileName: string) => {
    if (!fileData) return;

    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,${fileData}`;
    link.download = fileName;
    link.click();
  };

  const handleView = (fileData: string) => {
    if (!fileData) return;

    const pdfWindow = window.open();
    if (pdfWindow) {
      pdfWindow.document.write(`
        <iframe width="100%" height="100%" src="data:application/pdf;base64,${fileData}"></iframe>
      `);
    }
  };

  const onSubmit = async (data: LegislationFormData) => {
    setIsLoading(true);

    try {
      let arabicBase64: string | null = null;
      let frenchBase64: string | null = null;

      if (arabicFile) {
        arabicBase64 = await toBase64(arabicFile);
      } else if (existingArabicFile && isEditMode) {
        arabicBase64 = existingArabicFile;
      }

      if (frenchFile) {
        frenchBase64 = await toBase64(frenchFile);
      } else if (existingFrenchFile && isEditMode) {
        frenchBase64 = existingFrenchFile;
      }

      const payload = {
        id: isEditMode ? parseInt(id!) : undefined,
        titrearabe: data.titrearabe,
        titrefrancais: data.titrefrancais,
        datesortie: data.datesortie,
        fichierarabe: arabicBase64,
        fichierfrancais: frenchBase64,
      };

      if (isEditMode) {
        await updateLegislation(parseInt(id!), payload);
        toast.success("تم تحديث التشريع بنجاح");
      } else {
        await createLegislation(payload);
        toast.success("تم إضافة التشريع بنجاح");
      }

      navigate("/admin/legislations");
    } catch (error) {
      console.error("Error saving legislation:", error);
      toast.error("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (arabicFile?.preview) {
        URL.revokeObjectURL(arabicFile.preview);
      }
      if (frenchFile?.preview) {
        URL.revokeObjectURL(frenchFile.preview);
      }
    };
  }, [arabicFile, frenchFile]);

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-mauritania-green-dark">
            {isEditMode ? "تعديل التشريع" : "إضافة تشريع جديد"}
          </h1>
          <button
            onClick={() => navigate("/admin/legislations")}
            className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition duration-300"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="ml-2" />
            رجوع
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
                  العنوان (عربي) *
                </label>
                <input
                  id="titrearabe"
                  dir="rtl"
                  type="text"
                  {...register("titrearabe", { required: "هذا الحقل مطلوب" })}
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
                  العنوان (فرنسي) *
                </label>
                <input
                  id="titrefrancais"
                  type="text"
                  {...register("titrefrancais", {
                    required: "هذا الحقل مطلوب",
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

            {/* Date Input */}
            <div className="mb-6">
              <label htmlFor="datesortie" className="block text-gray-700 mb-2">
                تاريخ الإصدار *
              </label>
              <input
                id="datesortie"
                type="date"
                {...register("datesortie", { required: "هذا الحقل مطلوب" })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green ${
                  errors.datesortie ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.datesortie && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.datesortie.message}
                </p>
              )}
            </div>

            {/* File Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Arabic File Upload */}
              <div>
                <label className="block text-gray-700 mb-2">
                  الملف (عربي) *
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragOverArabic
                      ? "border-mauritania-green bg-mauritania-green-light"
                      : "border-gray-300 hover:border-mauritania-green"
                  }`}
                  onDrop={(e) => handleFileDrop(e, setArabicFile, () => {})}
                  onDragOver={(e) => handleDragOver(e, setIsDragOverArabic)}
                  onDragLeave={() => handleDragLeave(setIsDragOverArabic)}
                  onClick={() =>
                    document.getElementById("arabic-file-input")?.click()
                  }
                >
                  <input
                    id="arabic-file-input"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) =>
                      handleFileSelect(e, setArabicFile, () => {})
                    }
                    className="hidden"
                  />

                  {arabicFile ? (
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-100 p-3 rounded-lg mb-2">
                        <FontAwesomeIcon
                          icon={faDownload}
                          className="text-mauritania-green text-2xl"
                        />
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-1 truncate max-w-full">
                        {arabicFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(arabicFile.size / 1024).toFixed(1)} KB
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(setArabicFile, () => {});
                        }}
                        className="mt-2 text-red-500 hover:text-red-700"
                      >
                        <FontAwesomeIcon icon={faTimes} /> إزالة
                      </button>
                    </div>
                  ) : existingArabicFile ? (
                    <div className="flex flex-col items-center">
                      <div className="bg-green-100 p-3 rounded-lg mb-2">
                        <FontAwesomeIcon
                          icon={faEye}
                          className="text-green-600 text-2xl"
                        />
                      </div>
                      <p className="text-sm font-medium text-green-700 mb-2">
                        ملف موجود
                      </p>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(existingArabicFile);
                          }}
                          className="text-mauritania-green hover:text-mauritania-green-dark"
                        >
                          <FontAwesomeIcon icon={faEye} /> معاينة
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(
                              existingArabicFile,
                              "document-arabic.pdf"
                            );
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FontAwesomeIcon icon={faDownload} /> تحميل
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="bg-gray-100 p-3 rounded-lg inline-block mb-3">
                        <FontAwesomeIcon
                          icon={faDownload}
                          className="text-gray-400 text-2xl"
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        اسحب الملف هنا أو انقر للاختيار
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, DOC, DOCX
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* French File Upload */}
              <div>
                <label className="block text-gray-700 mb-2">
                  الملف (فرنسي) *
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragOverFrench
                      ? "border-mauritania-green bg-mauritania-green-light"
                      : "border-gray-300 hover:border-mauritania-green"
                  }`}
                  onDrop={(e) => handleFileDrop(e, setFrenchFile, () => {})}
                  onDragOver={(e) => handleDragOver(e, setIsDragOverFrench)}
                  onDragLeave={() => handleDragLeave(setIsDragOverFrench)}
                  onClick={() =>
                    document.getElementById("french-file-input")?.click()
                  }
                >
                  <input
                    id="french-file-input"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) =>
                      handleFileSelect(e, setFrenchFile, () => {})
                    }
                    className="hidden"
                  />

                  {frenchFile ? (
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-100 p-3 rounded-lg mb-2">
                        <FontAwesomeIcon
                          icon={faDownload}
                          className="text-mauritania-green text-2xl"
                        />
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-1 truncate max-w-full">
                        {frenchFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(frenchFile.size / 1024).toFixed(1)} KB
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(setFrenchFile, () => {});
                        }}
                        className="mt-2 text-red-500 hover:text-red-700"
                      >
                        <FontAwesomeIcon icon={faTimes} /> إزالة
                      </button>
                    </div>
                  ) : existingFrenchFile ? (
                    <div className="flex flex-col items-center">
                      <div className="bg-green-100 p-3 rounded-lg mb-2">
                        <FontAwesomeIcon
                          icon={faEye}
                          className="text-green-600 text-2xl"
                        />
                      </div>
                      <p className="text-sm font-medium text-green-700 mb-2">
                        ملف موجود
                      </p>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(existingFrenchFile);
                          }}
                          className="text-mauritania-green hover:text-mauritania-green-dark"
                        >
                          <FontAwesomeIcon icon={faEye} /> معاينة
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(
                              existingFrenchFile,
                              "document-french.pdf"
                            );
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FontAwesomeIcon icon={faDownload} /> تحميل
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="bg-gray-100 p-3 rounded-lg inline-block mb-3">
                        <FontAwesomeIcon
                          icon={faDownload}
                          className="text-gray-400 text-2xl"
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        اسحب الملف هنا أو انقر للاختيار
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, DOC, DOCX
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-mauritania-green text-white py-2 px-6 rounded-md hover:bg-mauritania-green-dark transition duration-300 disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faSave} className="ml-2" />
                {isLoading ? "جاري الحفظ..." : "حفظ البيانات"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default LegislationForm;
