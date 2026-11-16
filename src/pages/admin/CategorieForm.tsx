import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import AdminLayout from "./AdminLayout";
import {
  getActualitesCategories,
  createActualiteCategorie,
  updateActualiteCategorie,
  deleteActualiteCategorie,
} from "../../services/api";
import { ActualiteCategorie } from "../../types/types";

const CategorieForm: React.FC = () => {
  const [categories, setCategories] = useState<ActualiteCategorie[]>([]);
  const { register, handleSubmit, reset } = useForm<ActualiteCategorie>();

  const fetchCategories = async () => {
    try {
      const response = await getActualitesCategories();
      setCategories(response.data);
    } catch (err) {
      toast.error("خطأ في جلب التصنيفات");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onSubmit = async (data: ActualiteCategorie) => {
    try {
      if (data.id) {
        await updateActualiteCategorie(data.id, data);
        toast.success("تم تحديث التصنيف");
      } else {
        await createActualiteCategorie(data);
        toast.success("تم إضافة التصنيف");
      }
      reset({});
      fetchCategories();
    } catch (err) {
      toast.error("خطأ في الحفظ");
    }
  };

  const handleEdit = (cat: ActualiteCategorie) => {
    reset(cat);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!window.confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      await deleteActualiteCategorie(id);
      toast.success("تم حذف التصنيف");
      fetchCategories();
    } catch (err) {
      toast.error("خطأ في الحذف");
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">إدارة التصنيفات</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="الاسم بالعربي"
            {...register("nomarabe", { required: true })}
            className="w-full px-3 py-2 border rounded-md"
          />
          <input
            type="text"
            placeholder="Nom en Français"
            {...register("nomfrancais", { required: true })}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <button className="bg-mauritania-green text-white py-2 px-4 rounded-md">
          حفظ
        </button>
      </form>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">#</th>
            <th className="border px-2 py-1">العربي</th>
            <th className="border px-2 py-1">فرنسي</th>
            <th className="border px-2 py-1">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id}>
              <td className="border px-2 py-1">{cat.id}</td>
              <td className="border px-2 py-1">{cat.nomarabe}</td>
              <td className="border px-2 py-1">{cat.nomfrancais}</td>
              <td className="border px-2 py-1">
                <button
                  onClick={() => handleEdit(cat)}
                  className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                >
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  حذف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
};

export default CategorieForm;
