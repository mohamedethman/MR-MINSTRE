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

  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
              const isBase64 = !minister.image.startsWith("data:image/");
              const formattedImage = isBase64
                ? `data:image/jpeg;base64,${minister.image}`
                : minister.image;
              setImagePreview(formattedImage);
            }
          }
        } catch (error) {
          console.error("Error fetching minister:", error);
          toast.error("حدث خطأ أثناء جلب بيانات الوزير");
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
        // Use existing imagePreview
        base64Image = imagePreview.startsWith("data:image/")
          ? imagePreview.split(",")[1]
          : imagePreview;
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
        toast.success("تم تحديث بيانات الوزير بنجاح");
      } else {
        await createMinister(payload);
        toast.success("تم إضافة الوزير بنجاح");
      }

      navigate("/admin/ministers");
    } catch (error) {
      console.error("Error saving minister:", error);
      toast.error("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setIsLoading(false);
    }
  };

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
            {isEditMode ? "تعديل بيانات الوزير" : "إضافة وزير جديد"}
          </h1>
          <button
            onClick={() => navigate("/admin/ministers")}
            className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition duration-300"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="ml-2" />
            رجوع
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
                  اللقب (عربي) *
                </label>
                <input
                  id="titrearabe"
                  dir="rtl"
                  type="text"
                  {...register("titrearabe", { required: "هذا الحقل مطلوب" })}
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
                  اللقب (فرنسي) *
                </label>
                <input
                  id="titrefrancais"
                  dir="ltr"
                  type="text"
                  {...register("titrefrancais", {
                    required: "هذا الحقل مطلوب",
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
                  محاذاة النص (عربي)
                </label>
                <select
                  value={arabicAlignment}
                  onChange={(e) => setArabicAlignment(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="right">يمين</option>
                  <option value="center">وسط</option>
                  <option value="left">يسار</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  محاذاة النص (فرنسي)
                </label>
                <select
                  value={frenchAlignment}
                  onChange={(e) => setFrenchAlignment(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>

            {/* Rich Text Editors */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">النص (عربي)</label>
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
              <label className="block text-gray-700 mb-2">النص (فرنسي)</label>
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
              <label className="block text-gray-700 mb-2">محاذاة الصورة</label>
              <select
                value={imageAlignment}
                onChange={(e) => setImageAlignment(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="left">يسار</option>
                <option value="center">وسط</option>
                <option value="right">يمين</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">صورة الوزير</label>
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
                    alt="Preview"
                    className="h-40 w-40 object-cover rounded-md"
                  />
                </div>
              )}
            </div>

            {/* Color Pickers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 mb-2">لون النص</label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">لون الخلفية</label>
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
                className="bg-mauritania-green text-white py-2 px-6 rounded-md hover:bg-mauritania-green-dark transition duration-300"
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

export default MinisterForm;
