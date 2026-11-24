import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { createSlider, updateSlider, getSliderById } from "../../services/api";
import { toBase64 } from "../../utils/fileUtils";
import { Slider } from "../../types/types";
import { toast } from "react-toastify";
import AdminLayout from "./AdminLayout";
import { useT } from "../../i18n";

const SliderForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { t } = useT();
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
          toast.error(t("تعذر تحميل بيانات السلايدر", "Impossible de charger les données de la diapositive"));
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
        toast.success(t("تم تحديث السلايدر بنجاح", "Diapositive mise à jour avec succès"));
      } else {
        await createSlider(payload);
        toast.success(t("تم إضافة السلايدر بنجاح", "Diapositive ajoutée avec succès"));
      }

      navigate("/admin/sliders");
    } catch (error) {
      console.error("Error saving slider:", error);
      toast.error(t("حدث خطأ أثناء حفظ البيانات", "Erreur lors de l'enregistrement des données"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditMode ? t("تعديل سلايدر", "Modifier la diapositive") : t("إضافة سلايدر", "Ajouter une diapositive")}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("العنوان بالعربية", "Titre en arabe")} *
            </label>
            <input
              dir="rtl"
              {...register("titrearabe", { required: t("مطلوب", "Obligatoire") })}
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
              {t("العنوان بالفرنسية", "Titre en français")} *
            </label>
            <input
              dir="ltr"
              {...register("titrefrancais", { required: t("مطلوب", "Obligatoire") })}
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
              {t("النص بالعربية", "Texte en arabe")} *
            </label>
            <textarea
              dir="rtl"
              {...register("textarabe", { required: t("مطلوب", "Obligatoire") })}
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
              {t("النص بالفرنسية", "Texte en français")} *
            </label>
            <textarea
              dir="ltr"
              {...register("textfrancais", { required: t("مطلوب", "Obligatoire") })}
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
            {t("الصورة", "Image")}
          </label>
          <input
            type="file"
            accept="image/*"
            {...register("image")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("actif")}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="block text-sm text-gray-900">{t("مفعل", "Actif")}</label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("الترتيب", "Ordre")}
          </label>
          <input
            type="number"
            {...register("ordre")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t("الأزرار", "Boutons")}</h3>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="border p-4 rounded-md mb-4 bg-gray-50"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("عنوان بالعربية", "Titre en arabe")} *
                  </label>
                  <input
                    dir="rtl"
                    placeholder={t("عنوان بالعربية", "Titre en arabe")}
                    {...register(`buttons.${index}.titrearabe` as const, {
                      required: t("مطلوب", "Obligatoire"),
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("عنوان بالفرنسية", "Titre en français")} *
                  </label>
                  <input
                    dir="ltr"
                    placeholder={t("عنوان بالفرنسية", "Titre en français")}
                    {...register(`buttons.${index}.titrefrancais` as const, {
                      required: t("مطلوب", "Obligatoire"),
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("الرابط", "Lien")} *
                  </label>
                  <input
                    dir="ltr"
                    placeholder={t("الرابط", "Lien")}
                    {...register(`buttons.${index}.lien` as const, {
                      required: t("مطلوب", "Obligatoire"),
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
                {t("حذف", "Supprimer")}
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
            {t("إضافة زر", "Ajouter un bouton")}
          </button>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/sliders")}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
          >
            {t("إلغاء", "Annuler")}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? t("جاري الحفظ...", "Enregistrement…") : t("حفظ", "Enregistrer")}
          </button>
        </div>
      </form>
    </div>
    </AdminLayout>
  );
};

export default SliderForm;
