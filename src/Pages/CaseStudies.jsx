import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";

/* ================= IMAGE MODAL ================= */
const ImageModal = ({ image, onClose }) => {
  if (!image) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white text-3xl font-[textFont]"
      >
        ✕
      </button>

      <img
        src={image}
        alt="Preview"
        className="max-w-[90%] max-h-[90%] rounded-lg shadow-xl"
      />
    </div>
  );
};

/* ================= MAIN COMPONENT ================= */
export default function CaseStudies() {
  const [caseStudies, setCaseStudies] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  /* ---------- fetch data ---------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/case-studies");
        const list = res.data?.list || [];

        const formatted = list.map((item) => {
          let imageUrl = null;
          if (Array.isArray(item.image) && item.image.length > 0) {
            const first = item.image[0];
            imageUrl = typeof first === "string" ? first : (first.signedUrl || first.url || null);
          } else if (item.image && typeof item.image === "object") {
            imageUrl = item.image.signedUrl || item.image.url || null;
          } else if (typeof item.image === "string") {
            if (item.image.startsWith("[")) {
              try {
                const parsed = JSON.parse(item.image);
                imageUrl = typeof parsed[0] === "string" ? parsed[0] : (parsed[0]?.url || null);
              } catch {
                imageUrl = item.image;
              }
            } else {
              imageUrl = item.image;
            }
          }

          return {
            id: item.Id,
            title: item.Title,
            shortDesc: item.shortDesc,
            image: imageUrl,
          };
        });

        setCaseStudies(formatted);
      } catch (err) {
        console.error("❌ CaseStudies error:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="bg-[#010616] min-h-screen pt-20 pb-32 mt-32">
      <div className="max-w-6xl mx-auto px-4">

        {/* Page Header */}
        <div className="mb-16">
          {/* <span className="inline-block border border-gray-600 text-gray-300 mb-6 px-4 py-2 text-sm font-normal rounded-full">
            CASE STUDIES
          </span> */}
          <h2 className="text-4xl sm:text-5xl lg:text-fs-54 font-[heading] leading-tight bg-gradient-to-r from-gray-500 via-neutral-300 to-slate-200 bg-clip-text text-transparent">
            Case Studies
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {caseStudies.map((study, index) => (
            <div
              key={study.id}
              className={`group cursor-pointer ${index % 2 === 0
                ? "mt-8 lg:mt-12"
                : "mt-8 lg:-mt-16"
                }`}
            >
              {/* IMAGE CARD */}
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={study.image || "/placeholder.svg"}
                  alt={study.title}
                  className="w-full h-72 sm:h-80 lg:h-[420px] object-cover"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                  <h3 className="text-white text-xl font-[heading] mb-2">
                    {study.title}
                  </h3>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-3 font-[textFont]">
                    {study.shortDesc}
                  </p>

                  <div className="flex justify-end">
                    <Link
                      to={`/case-studies/${study.id}`}
                      className="w-14 h-14 border border-white/40 rounded-full flex items-center justify-center text-white"
                    >
                      <i className="fa-solid fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* IMAGE MODAL */}
      <ImageModal
        image={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </section>
  );
}
