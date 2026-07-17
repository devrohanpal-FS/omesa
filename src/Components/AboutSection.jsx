// src/components/AboutSection.jsx
import { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import { StatItem } from "./StateItems";
import { Link } from "react-router-dom";

export default function AboutSection({ isPreview = false }) {
  const [shouldAnimateStats, setShouldAnimateStats] = useState(false);
  const statsRef = useRef(null);
  const [Data, setData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/about-us");

        console.log("Local API Response:", res.data.list);

        if (res.data.list && res.data.list.length > 0) {
          setData(res.data.list[0]);
        }
      } catch (error) {
        console.error("Error fetching from local backend:", error);
      }
    };

    fetchData();
  }, []);

  // animation useEffect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldAnimateStats(true);
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    const currentStatsRef = statsRef.current;
    if (currentStatsRef) observer.observe(currentStatsRef);
    return () => {
      if (currentStatsRef) observer.unobserve(currentStatsRef);
    };
  }, []);

  return (
    <section className="bg-[#010616] py-16 px-4 md:py-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row text-center md:text-left mb-16 px-4">
          <div className="md:w-1/6 mt-9 mb-6 md:mb-0 flex justify-center md:justify-start">
            <span className="h-fit text-lg md:text-sm text-gray-400 tracking-widest uppercase border border-gray-600 px-4 py-2 rounded-full inline-block">
              About Us
            </span>
          </div>

          <div className="md:w-2/2">
            {/* NocoDB Title & Description */}
            <div className="p-8">
              <h2 className="text-2xl sm:text-3xl lg:text-fs-58 font-[heading] font-semibold leading-normal mb-6 bg-gradient-to-r from-gray-500 via-neutral-400 to-slate-300 bg-clip-text text-transparent">
                {Data?.Heding}
              </h2>
              <div className="text-gray-400 text-lg lg:text-lg sm:text-base md:text-lg leading-relaxed max-w-3xl mb-6 mx-auto md:mx-0 font-[textFont]">
                {isPreview ? (
                  <div>
                    <p>{(() => {
                      if (!Data?.Description) return "";
                      const stripped = Data.Description.replace(/<[^>]*>/g, " ");
                      if (stripped.length <= 220) return stripped;
                      return stripped.slice(0, 220).trim() + "...";
                    })()}</p>
                    <Link
                      to="/about"
                      className="inline-block mt-4 text-blue-500 hover:text-blue-400 font-semibold transition"
                    >
                      Read More →
                    </Link>
                  </div>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: Data?.Description }} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div ref={statsRef} className="space-y-12 lg:px-56 max-auto">
          <StatItem
            id="experience-stat"
            value={Data?.experience || 0}
            suffix=" +"
            label="Years of Experience"
            shouldAnimate={shouldAnimateStats}
            style={{ width: "52%" }}
          />
          <StatItem
            id="projects-stat"
            value={Data?.project || 0}
            suffix=" +"
            label="Successful Projects"
            shouldAnimate={shouldAnimateStats}

          />
          <StatItem
            id="satisfaction-stat"
            value={Data?.satisfaction || 0}
            suffix="%"
            label="Excellence Delivered"
            shouldAnimate={shouldAnimateStats}
          />
        </div>
      </div>
    </section>
  );
}
