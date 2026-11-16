import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import {
  getActualitesCategories,
  createActualiteCategorie,
  updateActualiteCategorie,
  deleteActualiteCategorie,
} from "../../services/api";
import { ActualiteCategorie } from "../../types/types";
import { toast } from "react-toastify";
import AdminLayout from "./AdminLayout";
import { Link } from "react-router-dom";

const NewsCategories: React.FC = () => {
  const [categories, setCategories] = useState<ActualiteCategorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] =
    useState<ActualiteCategorie | null>(null);
  const [formData, setFormData] = useState({ nomarabe: "", nomfrancais: "" });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getActualitesCategories();
      setCategories(response.data);
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء جلب التصنيفات");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateActualiteCategorie(editingCategory.id!, formData);
        toast.success("تم تحديث التصنيف بنجاح");
      } else {
        await createActualiteCategorie(formData);
        toast.success("تمت إضافة التصنيف بنجاح");
      }
      setFormData({ nomarabe: "", nomfrancais: "" });
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء حفظ التصنيف");
    }
  };

  const handleEdit = (category: ActualiteCategorie) => {
    setEditingCategory(category);
    setFormData({
      nomarabe: category.nomarabe,
      nomfrancais: category.nomfrancais,
    });
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (window.confirm("هل أنت متأكد من حذف هذا التصنيف؟")) {
      try {
        await deleteActualiteCategorie(id);
        toast.success("تم حذف التصنيف بنجاح");
        fetchCategories();
      } catch (error) {
        console.error(error);
        toast.error("حدث خطأ أثناء حذف التصنيف");
      }
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-mauritania-green-dark mb-4 md:mb-0">
          إدارة التصنيفات
        </h1>
        <Link
          to="/admin/news/categories/new"
          className="bg-mauritania-green text-white py-2 px-4 rounded hover:bg-mauritania-green-dark transition duration-300"
        >
          <FontAwesomeIcon icon={faPlus} className="ml-2" />
          إضافة تصنيف جديد
        </Link>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الاسم (عربي)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الاسم (فرنسي)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cat.nomarabe}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cat.nomfrancais}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="text-mauritania-green hover:text-mauritania-green-dark mr-4"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-gray-600">
                    لا توجد تصنيفات متاحة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default NewsCategories;
