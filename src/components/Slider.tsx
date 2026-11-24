import React, { useState, useEffect, useCallback } from "react";
import { getSliders } from "../services/api";
import { Slider as SliderType } from "../types/types";
import { useLanguage } from "../context/LanguageContext";
import { getTranslation } from "../utils/translations";
import { mediaUrl } from "../utils/content";
import RichText from "./RichText";

const Slider: React.FC = () => {
  const [sliders, setSliders] = useState<SliderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { language } = useLanguage();
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetchSliders();
  }, []);

  useEffect(() => {
    if (sliders.length > 1 && !isPaused) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % sliders.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [sliders.length, isPaused]);

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const response = await getSliders();
      const activeSliders = response.data
        .filter((slider: SliderType) => slider.actif)
        .sort(
          (a: SliderType, b: SliderType) => (a.ordre || 0) - (b.ordre || 0)
        );

      setSliders(activeSliders);
    } catch (error) {
      console.error("Error fetching sliders:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % sliders.length);
  }, [sliders.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + sliders.length) % sliders.length);
  }, [sliders.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  if (loading) {
    return (
      <div className="h-96 bg-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mauritania-green"></div>
          <p className="mt-2 text-gray-600">
            {getTranslation("loadingSliders", language)}
          </p>
        </div>
      </div>
    );
  }

  if (sliders.length === 0) return null;

  return (
    <section
      className="relative h-96 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative h-full">
        {sliders.map((slider, index) => (
          <div
            key={slider.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${
                  mediaUrl(typeof slider.image === "string" ? slider.image : null) || ""
                })`,
              }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            </div>

            <div className="container mx-auto h-full flex items-center relative z-10 px-4">
              <div
                className={`text-white max-w-2xl ${
                  language === "ar" ? "text-right" : "text-left"
                }`}
              >
                <h2 className="text-4xl font-bold mb-4">
                  {language === "ar" ? slider.titrearabe : slider.titrefrancais}
                </h2>
                <RichText
                  html={language === "ar" ? slider.textarabe : slider.textfrancais}
                  dir={language === "ar" ? "rtl" : "ltr"}
                  className="mb-6 !text-xl !text-white [&_*]:!text-white"
                />

                {slider.buttons?.map((btn, i) => (
                  <a
                    key={i}
                    href={btn.lien}
                    className="inline-block bg-mauritania-gold text-mauritania-green-dark font-semibold py-3 px-8 rounded hover:bg-yellow-600 transition duration-300 mr-2"
                  >
                    {language === "ar" ? btn.titrearabe : btn.titrefrancais}
                  </a>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      {sliders.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition duration-300 z-20"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition duration-300 z-20"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {sliders.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full ${
                  index === currentSlide
                    ? "bg-mauritania-gold"
                    : "bg-white bg-opacity-50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default Slider;
