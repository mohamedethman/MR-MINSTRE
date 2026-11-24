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
import { useT } from "../../i18n";
import PageHeader from "../../components/PageHeader";
import LocationMap from "../../components/LocationMap";

const Contact: React.FC = () => {
  const [information, setInformation] = useState<Information | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { t, isArabic, dir } = useT();

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
      toast.success(
        t(
          "تم إرسال رسالتك بنجاح. سنرد عليك في أقرب وقت ممكن.",
          "Votre message a bien été envoyé. Nous vous répondrons dans les meilleurs délais."
        )
      );
      reset();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(
        t(
          "حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.",
          "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer."
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={dir}>
        <div role="status" aria-label={t("جاري التحميل...", "Chargement…")} className="animate-spin rounded-full h-12 w-12 border-b-2 border-mauritania-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" dir={dir}>
      <PageHeader
        title={t("تواصل معنا", "Contactez-nous")}
        subtitle={t("يسعدنا تلقي استفساراتكم وملاحظاتكم", "Nous serons heureux de recevoir vos questions et remarques")}
      />

      {/* Contact Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="bg-white p-8 rounded-lg shadow-custom">
            <h3 className="text-2xl font-bold text-mauritania-green-dark mb-6">
              {t("معلومات الاتصال", "Coordonnées")}
            </h3>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-mauritania-green text-white p-3 rounded-full me-4">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{t("العنوان", "Adresse")}</h4>
                  <p className="text-gray-600">
                    {(isArabic
                      ? information?.adressear || information?.adresse
                      : information?.adresse || information?.adressear) || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-mauritania-green text-white p-3 rounded-full me-4">
                  <FontAwesomeIcon icon={faPhone} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{t("الهاتف", "Téléphone")}</h4>
                  <p className="text-gray-600">
                    {information?.telephone || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-mauritania-green text-white p-3 rounded-full me-4">
                  <FontAwesomeIcon icon={faEnvelope} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{t("البريد الإلكتروني", "Adresse e-mail")}</h4>
                  <p className="text-gray-600">
                    {information?.email || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-mauritania-green text-white p-3 rounded-full me-4">
                  <FontAwesomeIcon icon={faClock} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{t("ساعات العمل", "Horaires d'ouverture")}</h4>
                  <p className="text-gray-600">
                    {(isArabic
                      ? information?.horairesar || information?.horaires
                      : information?.horaires || information?.horairesar) || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-lg shadow-custom">
            <h3 className="text-2xl font-bold text-mauritania-green-dark mb-6">
              {t("أرسل رسالة", "Envoyer un message")}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 mb-2">
                  {t("الاسم الكامل", "Nom complet")} *
                </label>
                <input
                  type="text"
                  id="name"
                  {...register("nom", { required: t("الاسم مطلوب", "Le nom est obligatoire") })}
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
                  {t("البريد الإلكتروني", "Adresse e-mail")} *
                </label>
                <input
                  type="email"
                  id="email"
                  {...register("email", {
                    required: t("البريد الإلكتروني مطلوب", "L'adresse e-mail est obligatoire"),
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: t("بريد إلكتروني غير صالح", "Adresse e-mail invalide"),
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
                  {t("الموضوع", "Objet")} *
                </label>
                <input
                  type="text"
                  id="subject"
                  {...register("objet", { required: t("الموضوع مطلوب", "L'objet est obligatoire") })}
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
                  {t("الرسالة", "Message")} *
                </label>
                <textarea
                  id="message"
                  rows={5}
                  {...register("message", { required: t("الرسالة مطلوبة", "Le message est obligatoire") })}
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
                {isSending ? t("جاري الإرسال...", "Envoi en cours…") : t("إرسال الرسالة", "Envoyer")}
              </button>
            </form>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12 bg-white p-6 rounded-lg shadow-custom">
          <h3 className="text-2xl font-bold text-mauritania-green-dark mb-6">
            {t("موقعنا على الخريطة", "Notre emplacement sur la carte")}
          </h3>
          <LocationMap className="h-80" />
        </div>
      </div>
    </div>
  );
};

export default Contact;
