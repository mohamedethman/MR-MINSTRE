import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebookF,
  faTwitter,
  faLinkedinIn,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

const Footer: React.FC = () => {
  return (
    <footer className="bg-mauritania-green-dark text-white py-16 px-8">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="footer-col">
          <h3 className="text-mauritania-gold text-xl font-bold mb-6 pb-2 relative after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-12 after:h-0.5 after:bg-mauritania-gold">
            روابط سريعة
          </h3>
          <ul className="space-y-2">
            <li>
              <a
                href="#"
                className="text-gray-300 hover:text-mauritania-gold hover:pr-2 transition duration-300"
              >
                الرئيسية
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-300 hover:text-mauritania-gold hover:pr-2 transition duration-300"
              >
                عن الوزارة
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-300 hover:text-mauritania-gold hover:pr-2 transition duration-300"
              >
                معالي الوزير
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-300 hover:text-mauritania-gold hover:pr-2 transition duration-300"
              >
                مهام الوزارة
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-300 hover:text-mauritania-gold hover:pr-2 transition duration-300"
              >
                الهيكل التنظيمي
              </a>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h3 className="text-mauritania-gold text-xl font-bold mb-6 pb-2 relative after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-12 after:h-0.5 after:bg-mauritania-gold">
            الخدمات
          </h3>
          <ul className="space-y-2">
            <li>
              <a
                href="#"
                className="text-gray-300 hover:text-mauritania-gold hover:pr-2 transition duration-300"
              >
                الاستعلام العقاري
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-300 hover:text-mauritania-gold hover:pr-2 transition duration-300"
              >
                التوثيق العقاري
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-300 hover:text-mauritania-gold hover:pr-2 transition duration-300"
              >
                الاستثمار العقاري
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-300 hover:text-mauritania-gold hover:pr-2 transition duration-300"
              >
                التعويضات
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-300 hover:text-mauritania-gold hover:pr-2 transition duration-300"
              >
                خدمات أخرى
              </a>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h3 className="text-mauritania-gold text-xl font-bold mb-6 pb-2 relative after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-12 after:h-0.5 after:bg-mauritania-gold">
            المواقع الحكومية
          </h3>
          <ul className="space-y-2">
            <li>
              <a
                href="#"
                className="text-gray-300 hover:text-mauritania-gold hover:pr-2 transition duration-300"
              >
                رئاسة الجمهورية
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-300 hover:text-mauritania-gold hover:pr-2 transition duration-300"
              >
                رئاسة الحكومة
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-300 hover:text-mauritania-gold hover:pr-2 transition duration-300"
              >
                الجريدة الرسمية
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-300 hover:text-mauritania-gold hover:pr-2 transition duration-300"
              >
                الخدمة المدنية
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-300 hover:text-mauritania-gold hover:pr-2 transition duration-300"
              >
                وزارة المالية
              </a>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h3 className="text-mauritania-gold text-xl font-bold mb-6 pb-2 relative after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-12 after:h-0.5 after:bg-mauritania-gold">
            اتصل بنا
          </h3>
          <div className="contact-item flex items-center gap-3 mb-4">
            <div className="contact-icon w-10 h-10 bg-mauritania-green text-white rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
            </div>
            <span>شارع الوزارة، نواكشوط، موريتانيا</span>
          </div>
          <div className="contact-item flex items-center gap-3 mb-4">
            <div className="contact-icon w-10 h-10 bg-mauritania-green text-white rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faPhone} />
            </div>
            <span>+222 1234 5678</span>
          </div>
          <div className="contact-item flex items-center gap-3 mb-4">
            <div className="contact-icon w-10 h-10 bg-mauritania-green text-white rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faEnvelope} />
            </div>
            <span>contact@mre.gov.mr</span>
          </div>
          <div className="contact-item flex items-center gap-3 mb-6">
            <div className="contact-icon w-10 h-10 bg-mauritania-green text-white rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faClock} />
            </div>
            <span>الأحد - الخميس: 8:00 صباحاً - 4:00 مساءً</span>
          </div>
          <div className="social-links flex gap-4">
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-mauritania-gold hover:text-mauritania-green-dark transition duration-300"
            >
              <FontAwesomeIcon icon={faFacebookF} />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-mauritania-gold hover:text-mauritania-green-dark transition duration-300"
            >
              <FontAwesomeIcon icon={faTwitter} />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-mauritania-gold hover:text-mauritania-green-dark transition duration-300"
            >
              <FontAwesomeIcon icon={faLinkedinIn} />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-mauritania-gold hover:text-mauritania-green-dark transition duration-300"
            >
              <FontAwesomeIcon icon={faYoutube} />
            </a>
          </div>
        </div>
      </div>
      <div className="container mx-auto text-center pt-8 mt-8 border-t border-white/10 text-gray-400 text-sm">
        <p>
          جميع الحقوق محفوظة © {new Date().getFullYear()} وزارة العقارات وأملاك
          الدولة - جمهورية موريتانيا الإسلامية
        </p>
      </div>
    </footer>
  );
};

export default Footer;
