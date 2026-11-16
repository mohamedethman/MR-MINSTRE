import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import {
  getBibliothequeCategories,
  createBibliothequeCategorie,
  updateBibliothequeCategorie,
} from "../../../services/api";
import { BibliothequeCategorie } from "../../../types/types";
import { toast } from "react-toastify";
import AdminLayout from "../AdminLayout";

const CategorieForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BibliothequeCategorie>();

  useEffect(() => {
    if (isEditMode) {
      const fetchCategory = async () => {
        try {
          setIsLoading(true);
          const response = await getBibliothequeCategories();
          const category = response.data.find(
            (c: BibliothequeCategorie) => c.id === parseInt(id!)
          );
          if (category) {
            reset(category);
          }
        } catch (error) {
          console.error("Error fetching category:", error);
          toast.error("حدث خطأ أثناء جلب بيانات التصنيف");
        } finally {
          setIsLoading(false);
        }
      };
      fetchCategory();
    }
  }, [id, isEditMode, reset]);

  const onSubmit = async (data: BibliothequeCategorie) => {
    setIsLoading(true);
    try {
      if (isEditMode) {
        await updateBibliothequeCategorie(parseInt(id!), data);
        toast.success("تم تحديث التصنيف بنجاح");
      } else {
        await createBibliothequeCategorie(data);
        toast.success("تمت إضافة التصنيف بنجاح");
      }
      navigate("/admin/bibliotheque/categories");
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-mauritania-green-dark">
          {isEditMode ? "تعديل التصنيف" : "إضافة تصنيف جديد"}
        </h1>
        <button
          onClick={() => navigate("/admin/bibliotheque/categories")}
          className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition duration-300"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="ml-2" />
          رجوع
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Arabic name */}
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="nomarabe">
                الاسم (عربي) *
              </label>
              <input
                id="nomarabe"
                type="text"
                {...register("nomarabe", { required: "هذا الحقل مطلوب" })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green ${
                  errors.nomarabe ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.nomarabe && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.nomarabe.message}
                </p>
              )}
            </div>

            {/* French name */}
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="nomfrancais">
                الاسم (فرنسي) *
              </label>
              <input
                id="nomfrancais"
                type="text"
                {...register("nomfrancais", { required: "هذا الحقل مطلوب" })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green ${
                  errors.nomfrancais ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.nomfrancais && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.nomfrancais.message}
                </p>
              )}
            </div>
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

export default CategorieForm;
