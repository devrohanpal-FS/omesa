import React, { useState, useEffect, useRef } from "react";
import { useMediaQuery } from "../Hooks/useMediaQuery";
import { Link } from "react-router-dom";
import api from "../utils/api";

function ServicesSection() {
  const [services, setServices] = useState([]);
  const [hoveredService, setHoveredService] = useState(null);
  const videoRefs = useRef({});
  const isSmallScreen = useMediaQuery("(max-width: 368px)");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/services");

        console.log("🔥 Services API Response:", res.data);

        if (res.data.list && res.data.list.length > 0) {
          const formatted = res.data.list.map((item) => ({
            id: item.Id,
            Number: item.Number,
            Title: item.title,
            description: item.description,
          }));

          // ✅ Sort by Number field
          const sorted = formatted.sort(
            (a, b) => parseInt(a.Number) - parseInt(b.Number)
          );
          setServices(sorted);

          console.log("✅ Formatted Services:", sorted);
        }
      } catch (error) {
        console.error("❌ Error fetching services:", error.response?.data || error);
      }
    };

    fetchData();
  }, []);

  // ✅ Initialize videoRefs
  useEffect(() => {
    services.forEach((service) => {
      videoRefs.current[service.id] = null;
    });
  }, [services]);

  // ✅ Play video on hover
  useEffect(() => {
    if (isSmallScreen) return;

    const video = videoRefs.current[hoveredService];
    if (hoveredService && video) {
      video.currentTime = 0;
      video.play().catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Video play error:", err);
        }
      });

      return () => {
        video.pause();
      };
    }
  }, [hoveredService, isSmallScreen]);

  return (
    <section className="w-full bg-[#010616] text-white px-4 sm:px-6 sm:py-4 lg:px-8">
      <div className="max-w-6xl mx-auto sm:py-5">
        {/* <h2 className="text-gray-400 uppercase text-xs sm:text-sm mb-2 border w-fit py-1 sm:py-2 px-3 sm:px-4 rounded-full border-gray-500">
          Our Services
        </h2> */}

        <h3 className="text-3xl sm:text-4xl lg:text-5xl font-[heading] py-6 sm:py-8 lg:py-10 bg-gradient-to-r from-gray-500 via-neutral-300 to-slate-200 bg-clip-text text-transparent">
          Our services cover
          <br />
          everything you need
        </h3>

        <div className="w-full">
          {services.map((service, index) => (
            <div
              key={service.id}
              onMouseEnter={() => setHoveredService(service.id)}
              onMouseLeave={() => setHoveredService(null)}
              className={`relative border-t border-gray-700 px-3 sm:px-4 py-6 sm:py-8 transition-all ${
                hoveredService === service.id
                  ? "bg-white/10"
                  : "hover:bg-white/5"
              } ${index === services.length - 1 ? "border-b" : ""}`}
            >
              {!isSmallScreen && (
                <video
                  ref={(el) => (videoRefs.current[service.id] = el)}
                  className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-500 ${
                    hoveredService === service.id ? "opacity-50" : "opacity-0"
                  }`}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                >
                  <source
                    src="https://d15n4qct5igon0.cloudfront.net/Anteprima_Showreel_mobile_cc439adc9d.mp4"
                    type="video/mp4"
                  />
                </video>
              )}

              {/* Content */}
              <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4 sm:gap-6 md:gap-8">
                {/* First Column - Number */}
                <div className="flex-none md:flex-[2] text-xl sm:text-2xl lg:text-3xl font-normal text-white">
                  {service.Number}
                </div>

                {/* Second Column - Title */}
                <div className="md:flex-[4]">
                  <h4 className="text-lg sm:text-xl lg:text-fs-38 font-medium font-[HeadingFont] text-white mb-1">
                    {service.Title}
                  </h4>
                </div>

                {/* Third Column - Description + Button */}
                <div className="md:flex-[4]">
                  <p className="text-white py-2 font-[textFont] text-sm sm:text-base">
                    {service.description}
                  </p>
                  <Link
                    to={`/service/details/${service.id}`}
                    className="inline-block mt-2 font-[textFont] text-xs sm:text-sm lg:text-fs-15 font-medium px-3 sm:px-4 py-1.5 sm:py-2 border rounded-full transition-all duration-300 hover:bg-white hover:text-black"
                  >
                    Learn More <i className="fas fa-arrow-right not-italic" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;
