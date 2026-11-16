// src/pages/public/Contact.tsx
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { getInformation, createMessage } from "../../services/api";
import { Information } from "../../types/types";

const Contact: React.FC = () => {
  const [information, setInformation] = useState<Information | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    fetchInformation();
  }, []);

  const fetchInformation = async () => {
    try {
      setIsLoading(true);
      const response = await getInformation();
      if (response.data && response.data.length > 0) {
        setInformation(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching information:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setIsSending(true);
      await createMessage(data);
      toast.success("تم إرسال رسالتك بنجاح. سنرد عليك في أقرب وقت ممكن.");
      reset();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mauritania-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-mauritania-green-dark to-mauritania-green text-white py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">تواصل معنا</h1>
          <p className="text-xl">يسعدنا تلقي استفساراتكم وملاحظاتكم</p>
        </div>
      </section>

      {/* Contact Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="bg-white p-8 rounded-lg shadow-custom">
            <h3 className="text-2xl font-bold text-mauritania-green-dark mb-6">
              معلومات الاتصال
            </h3>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-mauritania-green text-white p-3 rounded-full mr-4">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">العنوان</h4>
                  <p className="text-gray-600">
                    {information?.adresse || "شارع الوزارة، نواكشوط، موريتانيا"}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-mauritania-green text-white p-3 rounded-full mr-4">
                  <FontAwesomeIcon icon={faPhone} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">الهاتف</h4>
                  <p className="text-gray-600">
                    {information?.telephone || "+222 1234 5678"}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-mauritania-green text-white p-3 rounded-full mr-4">
                  <FontAwesomeIcon icon={faEnvelope} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">البريد الإلكتروني</h4>
                  <p className="text-gray-600">
                    {information?.email || "contact@mre.gov.mr"}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-mauritania-green text-white p-3 rounded-full mr-4">
                  <FontAwesomeIcon icon={faClock} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">ساعات العمل</h4>
                  <p className="text-gray-600">
                    {information?.horaires ||
                      "الأحد - الخميس: 8:00 صباحاً - 4:00 مساءً"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-lg shadow-custom">
            <h3 className="text-2xl font-bold text-mauritania-green-dark mb-6">
              أرسل رسالة
            </h3>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 mb-2">
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  id="name"
                  {...register("nom", { required: "الاسم مطلوب" })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green ${
                    errors.nom ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.nom && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.nom.message as string}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  id="email"
                  {...register("email", {
                    required: "البريد الإلكتروني مطلوب",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "بريد إلكتروني غير صالح",
                    },
                  })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message as string}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="subject" className="block text-gray-700 mb-2">
                  الموضوع *
                </label>
                <input
                  type="text"
                  id="subject"
                  {...register("objet", { required: "الموضوع مطلوب" })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green ${
                    errors.objet ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.objet && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.objet.message as string}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="message" className="block text-gray-700 mb-2">
                  الرسالة *
                </label>
                <textarea
                  id="message"
                  rows={5}
                  {...register("message", { required: "الرسالة مطلوبة" })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-mauritania-green ${
                    errors.message ? "border-red-500" : "border-gray-300"
                  }`}
                ></textarea>
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.message.message as string}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="bg-mauritania-green text-white py-2 px-6 rounded-md hover:bg-mauritania-green-dark transition duration-300 disabled:opacity-50"
              >
                {isSending ? "جاري الإرسال..." : "إرسال الرسالة"}
              </button>
            </form>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12 bg-white p-6 rounded-lg shadow-custom">
          <h3 className="text-2xl font-bold text-mauritania-green-dark mb-6">
            موقعنا على الخريطة
          </h3>
          <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">خريطة الموقع ستظهر هنا</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
