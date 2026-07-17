import React, { useState, useEffect } from "react";
import api from "../utils/api";

export default function TestimonialSlider() {
  const [testimonials, setTestimonials] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await api.get("/api/testimonials");
        setTestimonials(res.data?.list || []);
      } catch (err) {
        console.error("Error fetching testimonials:", err);
      }
    };
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || testimonials.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const nextSlide = () => {
    if (testimonials.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    if (testimonials.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  if (testimonials.length === 0) {
    return null;
  }

  const currentTestimonial = testimonials[currentSlide];

  return (
    <div id="testBox" className="bg-gradient-to-r from-[#03051E] via-[#0e1f4b] to-[#1D53B7] ">
      <div className=" max-w-6xl mx-auto relative z-10 container min-h-[80vh] lg:min-h-[80vh] flex flex-col justify-center">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[80vh]">
          {/* Trust Section - Left Side */}
          <div className="space-y-8 text-white order-2 lg:order-1">
            <div className="space-y-6">
              <div className="inline-block">
                <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium tracking-wider border border-white/20">
                  {currentTestimonial.trustBadge}
                </span>
              </div>

              <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                {currentTestimonial.trustTitle}
              </h2>

              <p className="text-lg lg:text-xl text-white/80 leading-relaxed max-w-lg">
                {currentTestimonial.trustDescription}
              </p>
            </div>

            {/* Stats Section */}
            <div className="flex items-center space-x-6">
              <div className="flex -space-x-3">
                {currentTestimonial.avatars.map((avatar, index) => (
                  <div key={index} className="relative">
                    <img
                      src={avatar || "/placeholder.svg"}
                      alt={`User ${index + 1}`}
                      width={50}
                      height={50}
                      className="w-12 h-12 lg:w-14 lg:h-14 rounded-full border-3 border-white object-cover"
                      style={{ aspectRatio: "50/50", objectFit: "cover" }}
                    />
                  </div>
                ))}
              </div>

              <div>
                <div className="text-3xl lg:text-4xl font-bold">{currentTestimonial.reviewCount}</div>
                <div className="text-white/70 text-sm lg:text-base">{currentTestimonial.reviewLabel}</div>
              </div>
            </div>
          </div>

          {/* Testimonial Section - Right Side */}
          <div id="testBox" className="relative order-1 lg:order-2">
            <div  className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 lg:p-12 border border-white/20 shadow-2xl">
              {/* Quote */}
              <div className="space-y-6 text-white">
                <blockquote className="text-xl lg:text-2xl xl:text-3xl font-light italic leading-relaxed">
                  "{currentTestimonial.quote}"
                </blockquote>

                <div className="space-y-1">
                  <div className="font-semibold text-lg lg:text-xl">{currentTestimonial.author}</div>
                  <div className="text-white/70 text-sm lg:text-base">
                    {currentTestimonial.position} {currentTestimonial.company}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center space-x-4 mt-12">
          <button
            onClick={prevSlide}
            className="p-3 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <i className="fas fa-chevron-left"></i>
          </button>

          {/* Dots Indicator */}
          <div className="flex space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? "bg-white scale-125" : "bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="p-3 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
