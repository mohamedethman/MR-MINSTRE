import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock } from "@fortawesome/free-solid-svg-icons";
import { getInformation } from "../../services/api";
import { Information } from "../../types/types";
import { mediaUrl } from "../../utils/content";
import { APP_VERSION, ministryName as getMinistryName } from "../../utils/site";
import { useT } from "../../i18n";
import { useLanguage } from "../../context/LanguageContext";

interface LoginFormData {
  username: string;
  password: string;
}


const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t, isArabic, dir } = useT();
  const { toggleLanguage } = useLanguage();
  const republicName = t("الجمهورية الإسلامية الموريتانية", "République Islamique de Mauritanie");
  const [isLoading, setIsLoading] = useState(false);
  const [information, setInformation] = useState<Information | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  useEffect(() => {
    getInformation()
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length) setInformation(response.data[0]);
      })
      .catch(() => undefined);
  }, []);

  const ministryName = getMinistryName(isArabic);
  const logoSource = mediaUrl(information?.logo);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.username, data.password);
      navigate("/admin/dashboard");
      toast.success(t("تم تسجيل الدخول بنجاح", "Connexion réussie"));
    } catch (error) {
      toast.error(t("فشل تسجيل الدخول. الرجاء التحقق من البيانات المدخلة", "Échec de la connexion. Veuillez vérifier vos identifiants"));
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Already logged in (e.g. after a refresh): skip the login form.
  if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />;

  return (
    <div
      dir={dir}
      className="flex h-[100dvh] flex-col overflow-y-auto bg-gradient-to-l from-mauritania-green to-mauritania-green-dark"
    >
      <div className="flex min-h-0 flex-1 items-center justify-center px-4 pb-4 pt-12">
        <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
          {/* Language toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="absolute end-3 top-3 z-10 rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-mauritania-green-dark transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-mauritania-green"
            title={t("تغيير اللغة", "Changer de langue")}
            lang={isArabic ? "fr" : "ar"}
          >
            {isArabic ? "Français" : "العربية"}
          </button>

          {/* Logo, half outside the card */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-mauritania-gold bg-white shadow-xl ring-4 ring-white">
              {logoSource ? (
                <img src={logoSource} alt={ministryName || t("شعار الوزارة", "Logo du ministère")} className="h-full w-full object-contain p-1" />
              ) : (
                <span aria-hidden="true" className="text-lg font-bold text-mauritania-green-dark">MO</span>
              )}
            </div>
          </div>

          <div className="rounded-t-2xl px-8 pb-4 pt-12 text-center">
            <p className="text-xs font-semibold text-gray-500">{republicName}</p>
            {ministryName && (
              <p className="mt-1 text-sm font-bold leading-snug text-mauritania-green-dark">{ministryName}</p>
            )}
            <div className="mx-auto my-2 h-1 w-10 rounded-full bg-[#ce1f26]" />
            <h2 className="text-xl font-bold text-gray-800">{t("تسجيل الدخول", "Connexion")}</h2>
            <p className="text-xs text-gray-500">{t("لوحة التحكم", "Tableau de bord")}</p>
          </div>

          <div className="px-8 pb-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label htmlFor="username" className="mb-1 block text-sm font-semibold text-gray-700">
                  {t("اسم المستخدم", "Nom d'utilisateur")}
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
                    <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    autoComplete="username"
                    {...register("username", { required: t("اسم المستخدم مطلوب", "Le nom d'utilisateur est obligatoire") })}
                    className="w-full rounded-lg border border-gray-300 py-2.5 pe-3 ps-10 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-mauritania-green"
                    placeholder={t("أدخل اسم المستخدم", "Saisissez votre nom d'utilisateur")}
                  />
                </div>
                {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>}
              </div>
              <div className="mb-5">
                <label htmlFor="password" className="mb-1 block text-sm font-semibold text-gray-700">
                  {t("كلمة المرور", "Mot de passe")}
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
                    <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    {...register("password", { required: t("كلمة المرور مطلوبة", "Le mot de passe est obligatoire") })}
                    className="w-full rounded-lg border border-gray-300 py-2.5 pe-3 ps-10 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-mauritania-green"
                    placeholder={t("أدخل كلمة المرور", "Saisissez votre mot de passe")}
                  />
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-mauritania-green-dark px-4 py-2.5 font-bold text-white transition duration-300 hover:bg-mauritania-green focus:outline-none focus:ring-2 focus:ring-mauritania-green focus:ring-opacity-50 disabled:opacity-70"
              >
                {isLoading ? t("جاري تسجيل الدخول...", "Connexion en cours…") : t("تسجيل الدخول", "Se connecter")}
              </button>
            </form>
          </div>
        </div>
      </div>

      <footer className="shrink-0 space-y-0.5 border-t border-white/15 px-4 py-2 text-center text-xs text-white/85">
        <p>
          © {new Date().getFullYear()} {ministryName ? `${ministryName} - ` : ""}
          {republicName}
        </p>
        <p>
          {t("إصدار المشروع", "Version du projet")} <span dir="ltr">{APP_VERSION}</span>
        </p>
      </footer>
    </div>
  );
};

export default Login;
