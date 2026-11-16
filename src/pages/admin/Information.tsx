// src/pages/admin/Information.tsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faUpload,
  faTimes,
  faEye,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { Information as InfoType } from "../../types/types";
import {
  getInformation,
  createInformation,
  updateInformation,
} from "../../services/api";
import AdminLayout from "./AdminLayout";

const InformationAdmin: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [existingLogo, setExistingLogo] = useState<string | null>(null);
  const [formData, setFormData] = useState<InfoType>({
    nomsite: "",
    logo: "",
    adresse: "",
    telephone: "",
    email: "",
    horaires: "",
  });

  useEffect(() => {
    fetchInformation();
  }, []);

  const fetchInformation = async () => {
    try {
      setIsLoading(true);
      const response = await getInformation();
      if (response.data && response.data.length > 0) {
        const info = response.data[0];
        setFormData(info);
        if (info.logo) {
          setExistingLogo(info.logo);
        }
      }
    } catch (error) {
      console.error("Error fetching information:", error);
      toast.error("حدث خطأ أثناء جلب البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        setLogoFile(file);
      } else {
        toast.error("الرجاء اختيار ملف صورة");
      }
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let base64Logo: string | null = null;

      if (logoFile) {
        base64Logo = await toBase64(logoFile);
      } else if (existingLogo) {
        base64Logo = existingLogo;
      }

      const payload = {
        ...formData,
        logo: base64Logo,
      };

      if (formData.id) {
        await updateInformation(formData.id, payload);
        toast.success("تم تحديث المعلومات بنجاح");
      } else {
        await createInformation(payload);
        toast.success("تم حفظ المعلومات بنجاح");
      }

      fetchInformation(); // Refresh data
    } catch (error) {
      console.error("Error saving information:", error);
      toast.error("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mauritania-green"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-mauritania-green-dark">
          إدارة المعلومات العامة
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          {/* Logo Upload */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">شعار الموقع</label>
            <div className="flex items-center space-x-4">
              {logoFile ? (
                <div className="relative">
                  <img
                    src={URL.createObjectURL(logoFile)}
                    alt="Logo preview"
                    className="h-20 w-20 object-contain border rounded"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-xs" />
                  </button>
                </div>
              ) : existingLogo ? (
                <div className="relative">
                  <img
                    src={`data:image/jpeg;base64,${existingLogo}`}
                    alt="Site logo"
                    className="h-20 w-20 object-contain border rounded"
                  />
                </div>
              ) : (
                <div className="h-20 w-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                  <FontAwesomeIcon icon={faUpload} className="text-gray-400" />
                </div>
              )}

              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoSelect}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded cursor-pointer hover:bg-gray-300"
                >
                  اختر شعاراً
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  JPG, PNG, GIF - الحجم الأقصى 2MB
                </p>
              </div>
            </div>
          </div>

          {/* Site Name */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">اسم الموقع</label>
            <input
              type="text"
              name="nomsite"
              value={formData.nomsite}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green"
              required
            />
          </div>

          {/* Address */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">العنوان</label>
            <input
              type="text"
              name="adresse"
              value={formData.adresse}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green"
              required
            />
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">الهاتف</label>
            <input
              type="tel"
              name="telephone"
              value={formData.telephone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green"
              required
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green"
              required
            />
          </div>

          {/* Working Hours */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">ساعات العمل</label>
            <input
              type="text"
              name="horaires"
              value={formData.horaires}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-mauritania-green text-white py-2 px-6 rounded-md hover:bg-mauritania-green-dark transition duration-300 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faSave} className="ml-2" />
              {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default InformationAdmin;
