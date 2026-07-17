import { useEffect, useState } from "react";
import api from "../utils/api";

// 🔒 STATIC words (unchanged)
const words = [
  "EXPERIENCES",
  "BRANDS",
  "EXHIBITIONS",
  "EVENTS",
  "MURALS",
  "DIGITAL",
  "MEDIA",
  "DISPLAYS",
  "STORIES",
  "IMPACT",
];

const HomeBanner = ({ scrollY }) => {
  const [Data, setData] = useState({});
  const [wordIndex, setWordIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [animateLines, setAnimateLines] = useState(false);

  // scroll animation
  const parallaxOffset = scrollY * 0.1;

  // 🔹 Local API fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/banner");

        console.log("Banner API Response:", res.data.list);

        if (res.data.list && res.data.list.length > 0) {
          setData(res.data.list[0]);
        }
      } catch (error) {
        console.error("Error fetching banner data:", error);
      }
    };

    fetchData();
  }, []);

  // Word cycling effect (UNCHANGED)
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % words.length);
        setFade(true);
      }, 400);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Initial animation trigger (UNCHANGED)
  useEffect(() => {
    setTimeout(() => setAnimateLines(true), 100);
  }, []);

  return (
    <div style={{ transform: `translateY(${parallaxOffset}px)` }}>
      <main className="relative sticky h-screen px-4 sm:px-6 lg:px-12 py-4 bg-gradient-to-r from-[#03051E] via-[#0e1f4b] to-[#1D53B7] overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        >
          <source
            src={Data?.video_url || "/BannerVideo/BannerVideo.mp4"}
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>

        <div className="max-w-5xl mt-16 sm:mt-24 lg:mt-28 relative z-10">
          <div className="space-y-8 text-left py-16 sm:py-24 md:py-32 lg:py-52 px-4 sm:px-8 md:px-16 lg:px-28">
            <div className="space-y-4">
              <h1
                id="HeadingBanner"
                className="leading-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-[heading] text-white"
              >
                <span
                  className={`block mb-1 transform transition-all duration-700 ease-out ${
                    animateLines
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0"
                  }`}
                >
                  {Data?.Title}
                </span>

                <span
                  className={`block transform transition-all duration-700 ease-out delay-100 ${
                    animateLines
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0"
                  }`}
                >
                  {Data?.heading_line_2}
                  <span
                    className={`italic font-normal inline-block min-w-[6ch] transition-all duration-500 ${
                      fade
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    } text-white`}
                  >
                    {words[wordIndex]}
                  </span>
                </span>
              </h1>

              <p
                className={`text-white text-sm sm:text-base md:text-lg lg:text-xl max-w-xl sm:max-w-2xl leading-relaxed mx-auto lg:mx-0 transform transition-all duration-700 ease-out delay-200 font-[textFont] ${
                  animateLines
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
              >
                {Data?.desc}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomeBanner;
