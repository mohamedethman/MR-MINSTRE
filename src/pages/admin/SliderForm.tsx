import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { createSlider, updateSlider, getSliderById } from "../../services/api";
import { toBase64 } from "../../utils/fileUtils";
import { Slider } from "../../types/types";
import { toast } from "react-toastify";

const SliderForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<Slider>({
    defaultValues: {
      titrearabe: "",
      titrefrancais: "",
      textarabe: "",
      textfrancais: "",
      image: null,
      actif: true,
      ordre: 0,
      buttons: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "buttons",
  });

  useEffect(() => {
    if (isEditMode && id) {
      const fetchSlider = async () => {
        try {
          const response = await getSliderById(Number(id));
          const data = response.data;
          reset({
            ...data,
            image: data.image || null,
          });
        } catch (error) {
          console.error("Error fetching slider:", error);
          toast.error("تعذر تحميل بيانات السلايدر");
        }
      };
      fetchSlider();
    }
  }, [id, isEditMode, reset]);

  const onSubmit = async (formData: Slider) => {
    setIsLoading(true);
    try {
      let base64Image: string | null = null;

      if (formData.image) {
        if (formData.image instanceof FileList && formData.image.length > 0) {
          const file = formData.image[0];
          base64Image = await toBase64(file);
        } else if (typeof formData.image === "string") {
          base64Image = formData.image;
        }
      }

      const payload = {
        id: formData.id,
        titrearabe: formData.titrearabe,
        titrefrancais: formData.titrefrancais,
        textarabe: formData.textarabe,
        textfrancais: formData.textfrancais,
        actif: formData.actif,
        ordre: formData.ordre || 0,
        image: base64Image,
        buttons: formData.buttons || [],
      };

      if (isEditMode && formData.id) {
        await updateSlider(formData.id, payload);
        toast.success("تم تحديث السلايدر بنجاح");
      } else {
        await createSlider(payload);
        toast.success("تم إضافة السلايدر بنجاح");
      }

      navigate("/admin/sliders");
    } catch (error) {
      console.error("Error saving slider:", error);
      toast.error("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditMode ? "تعديل سلايدر" : "إضافة سلايدر"}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              العنوان بالعربية *
            </label>
            <input
              {...register("titrearabe", { required: "مطلوب" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.titrearabe && (
              <span className="text-red-500 text-sm">
                {errors.titrearabe.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              العنوان بالفرنسية *
            </label>
            <input
              {...register("titrefrancais", { required: "مطلوب" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.titrefrancais && (
              <span className="text-red-500 text-sm">
                {errors.titrefrancais.message}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              النص بالعربية *
            </label>
            <textarea
              {...register("textarabe", { required: "مطلوب" })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.textarabe && (
              <span className="text-red-500 text-sm">
                {errors.textarabe.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              النص بالفرنسية *
            </label>
            <textarea
              {...register("textfrancais", { required: "مطلوب" })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.textfrancais && (
              <span className="text-red-500 text-sm">
                {errors.textfrancais.message}
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الصورة
          </label>
          <input
            type="file"
            accept="image/*"
            {...register("image")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            {...register("actif")}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">مفعل</label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الترتيب
          </label>
          <input
            type="number"
            {...register("ordre")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">الأزرار</h3>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="border p-4 rounded-md mb-4 bg-gray-50"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    عنوان بالعربية *
                  </label>
                  <input
                    placeholder="عنوان بالعربية"
                    {...register(`buttons.${index}.titrearabe` as const, {
                      required: "مطلوب",
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre en français *
                  </label>
                  <input
                    placeholder="Titre en français"
                    {...register(`buttons.${index}.titrefrancais` as const, {
                      required: "مطلوب",
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lien *
                  </label>
                  <input
                    placeholder="Lien"
                    {...register(`buttons.${index}.lien` as const, {
                      required: "مطلوب",
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
              >
                حذف
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              append({ titrearabe: "", titrefrancais: "", lien: "" })
            }
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            إضافة زر
          </button>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/admin/sliders")}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? "جاري الحفظ..." : "حفظ"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SliderForm;
