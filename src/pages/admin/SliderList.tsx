import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faEyeSlash,
  faArrowUp,
  faArrowDown,
} from "@fortawesome/free-solid-svg-icons";
import { getSliders, deleteSlider, updateSlider } from "../../services/api";
import { SliderApiData } from "../../types/types";
import { toast } from "react-toastify";
import AdminLayout from "./AdminLayout";

const SliderList: React.FC = () => {
  const [sliders, setSliders] = useState<SliderApiData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const response = await getSliders();
      const sortedSliders = response.data.sort(
        (a: SliderApiData, b: SliderApiData) => (a.ordre || 0) - (b.ordre || 0)
      );
      setSliders(sortedSliders);
    } catch (error) {
      console.error("Error fetching sliders:", error);
      toast.error("حدث خطأ أثناء جلب بيانات السلايدر");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذا السلايدر؟")) {
      try {
        await deleteSlider(id);
        toast.success("تم حذف السلايدر بنجاح");
        fetchSliders();
      } catch (error) {
        console.error("Error deleting slider:", error);
        toast.error("حدث خطأ أثناء حذف السلايدر");
      }
    }
  };

  const handleToggleStatus = async (slider: SliderApiData) => {
    try {
      await updateSlider(slider.id!, {
        ...slider,
        actif: !slider.actif,
      });
      toast.success(
        `تم ${slider.actif ? "إلغاء تفعيل" : "تفعيل"} السلايدر بنجاح`
      );
      fetchSliders();
    } catch (error) {
      console.error("Error toggling slider status:", error);
      toast.error("حدث خطأ أثناء تغيير حالة السلايدر");
    }
  };

  const handleReorder = async (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === sliders.length - 1)
    ) {
      return;
    }

    const newSliders = [...sliders];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    const currentOrder = newSliders[index].ordre || 0;
    const targetOrder = newSliders[targetIndex].ordre || 0;

    newSliders[index].ordre = targetOrder;
    newSliders[targetIndex].ordre = currentOrder;

    newSliders.sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
    setSliders(newSliders);

    try {
      await updateSlider(newSliders[index].id!, newSliders[index]);
      await updateSlider(newSliders[targetIndex].id!, newSliders[targetIndex]);
      toast.success("تم تغيير الترتيب بنجاح");
    } catch (error) {
      console.error("Error reordering sliders:", error);
      toast.error("حدث خطأ أثناء تغيير الترتيب");
      fetchSliders();
    }
  };

  // Helper function to get image URL safely
  const getImageUrl = (image: string | null | undefined): string => {
    if (!image) return "https://via.placeholder.com/96x64?text=No+Image";

    if (image.startsWith("data:") || image.startsWith("http")) {
      return image;
    }

    return `data:image/jpeg;base64,${image}`;
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-mauritania-green-dark mb-4 md:mb-0">
          إدارة السلايدر الرئيسي
        </h1>
        <Link
          to="/admin/sliders/new"
          className="bg-mauritania-green text-white py-2 px-4 rounded hover:bg-mauritania-green-dark transition duration-300 flex items-center"
        >
          <FontAwesomeIcon icon={faPlus} className="ml-2" />
          إضافة سلايدر جديد
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mauritania-green"></div>
          <p className="mt-2 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      ) : sliders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">لا توجد سلايدرات متاحة</p>
          <Link
            to="/admin/sliders/new"
            className="inline-block mt-4 bg-mauritania-green text-white py-2 px-4 rounded hover:bg-mauritania-green-dark"
          >
            إضافة سلايدر جديد
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الصورة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    العنوان (عربي)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    العنوان (فرنسي)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الترتيب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sliders.map((slider, index) => (
                  <tr
                    key={slider.id}
                    className={!slider.actif ? "opacity-50 bg-gray-50" : ""}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex-shrink-0 h-16 w-24">
                        <img
                          className="h-16 w-24 object-cover rounded"
                          src={getImageUrl(slider.image)}
                          alt={slider.titrearabe || slider.titrefrancais}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/96x64?text=Error";
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {slider.titrearabe || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {slider.titrefrancais || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => handleReorder(index, "up")}
                          disabled={index === 0}
                          className={`p-1 mb-1 ${
                            index === 0
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-mauritania-green hover:text-mauritania-green-dark"
                          }`}
                        >
                          <FontAwesomeIcon icon={faArrowUp} />
                        </button>
                        <span className="mx-2 font-bold">
                          {slider.ordre || 0}
                        </span>
                        <button
                          onClick={() => handleReorder(index, "down")}
                          disabled={index === sliders.length - 1}
                          className={`p-1 mt-1 ${
                            index === sliders.length - 1
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-mauritania-green hover:text-mauritania-green-dark"
                          }`}
                        >
                          <FontAwesomeIcon icon={faArrowDown} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleToggleStatus(slider)}
                        className={`p-2 rounded-full ${
                          slider.actif
                            ? "bg-green-100 text-green-600 hover:bg-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        title={slider.actif ? "إلغاء التفعيل" : "تفعيل"}
                      >
                        <FontAwesomeIcon
                          icon={slider.actif ? faEye : faEyeSlash}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/admin/sliders/edit/${slider.id}`}
                        className="text-mauritania-green hover:text-mauritania-green-dark mr-4"
                        title="تعديل"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Link>
                      <button
                        onClick={() => handleDelete(slider.id!)}
                        className="text-red-600 hover:text-red-900"
                        title="حذف"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default SliderList;
