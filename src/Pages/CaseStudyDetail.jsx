import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../utils/api";

export default function CaseStudyDetail() {
  const { id } = useParams();
  const [study, setStudy] = useState(null);

  useEffect(() => {
    const fetchStudy = async () => {
      try {
        const res = await api.get(`/api/case-studies/${id}`);
        const item = res.data;

        let images = [];
        if (item.image) {
          if (typeof item.image === "string" && item.image.startsWith("[")) {
            try {
              images = JSON.parse(item.image).map(x => typeof x === "string" ? x : (x?.url || ""));
            } catch {
              images = [item.image];
            }
          } else if (Array.isArray(item.image)) {
            images = item.image.map(x => typeof x === "string" ? x : (x?.url || ""));
          } else {
            images = [item.image];
          }
        }

        let deliverables = [];
        if (item.deliverables) {
          try {
            deliverables = typeof item.deliverables === "string" ? JSON.parse(item.deliverables) : item.deliverables;
          } catch {
            deliverables = [];
          }
        }

        let bulletPoints = [];
        if (item.bulletPoints) {
          try {
            bulletPoints = typeof item.bulletPoints === "string" ? JSON.parse(item.bulletPoints) : item.bulletPoints;
          } catch {
            bulletPoints = [];
          }
        }

        setStudy({
          id: item.Id,
          title: item.Title,
          description: item.description,
          longDesc: item.LongDescription || "",
          descs: [
            item.desc1,
            item.desc2,
            item.desc3,
            item.desc4,
            item.desc5,
            item.desc6,
          ].filter(Boolean),
          images,
          deliverables,
          bulletPoints,
        });
      } catch (err) {
        console.error("❌ Case study fetch error", err);
      }
    };

    fetchStudy();
  }, [id]);

  if (!study) return <div className="text-white p-10 font-[textFont]">Loading...</div>;

  return (
    <div className="h-full p-32 w-full bg-[#010616]">
      {/* Banner (same as portfolio) */}
      <div className=" bg-gradient-to-r from-[#03051E] via-[#0e1f4b] to-[#1D53B7]" />

      <div className="text-white p-4 md:p-8">
        {/* Info Section */}
        <div className="max-w-6xl mx-auto border border-gray-800 rounded-lg p-6 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="font-[HeadingFont] text-fs-20 font-semibold mb-2">
                Client Name
              </h3>
              <p className="text-gray-400 font-[textFont]">{study.title}</p>
            </div>
            <div>
              <h3 className="font-[HeadingFont] text-fs-20 font-semibold mb-2">
                Type
              </h3>
              <p className="text-gray-400 font-[textFont]">Case Study</p>
            </div>
            <div>
              <h3 className="font-[HeadingFont] text-fs-20 font-semibold mb-2">
                Project Type
              </h3>
              <p className="text-gray-400 font-[textFont]">Design / Development</p>
            </div>
          </div>
        </div>

        {/* Content Section (Redesigned Grid with Sidebar) */}
        <div className="max-w-6xl mx-auto mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Left Column: Case Study Main Overview & Details */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <span className="inline-block mb-4 py-2 px-4 rounded-full text-fs-12 font-semibold border border-gray-500 font-[HeadingFont]">
                  CASE STUDY OVERVIEW
                </span>
                <h2 className="text-fs-32 md:text-4xl text-gray-300 font-[HeadingFont] mb-6 leading-tight font-semibold bg-gradient-to-r from-gray-500 via-neutral-300 to-slate-200 bg-clip-text text-transparent">
                  {study.title}
                </h2>
                <p className="text-gray-400 mb-8 text-lg font-[textFont] leading-relaxed">
                  {study.description}
                </p>
              </div>

              {/* Extra descriptions (Rendered dynamically if present, else fallback to longDesc) */}
              {study.descs && study.descs.length > 0 ? (
                <div className="space-y-4 text-gray-300 text-fs-18 font-[textFont] leading-relaxed">
                  {study.descs.map((d, i) => (
                    <p key={i}>{d}</p>
                  ))}
                </div>
              ) : (
                study.longDesc && (
                  <p className="text-gray-300 text-fs-18 font-[textFont] leading-relaxed whitespace-pre-line">
                    {study.longDesc}
                  </p>
                )
              )}

              {/* Images Grid */}
              {study.images && study.images.length > 0 && (
                <div className="mt-10 space-y-6">
                  <div className="rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-black">
                    <img
                      src={study.images[0]}
                      alt={study.title}
                      className="w-full h-auto object-cover max-h-[500px]"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  </div>
                  {study.images.length > 1 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {study.images.slice(1).map((img, idx) => (
                        <div key={idx} className="rounded-lg overflow-hidden border border-slate-800 bg-black aspect-video hover:scale-[1.02] transition-transform duration-300">
                          <img
                            src={img}
                            alt={`${study.title} ${idx + 2}`}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => window.open(img, "_blank")}
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Sidebar (Deliverables & Key Highlights) */}
            <div className="lg:col-span-1 space-y-8">

              {/* Deliverables Section */}
              {study.deliverables && study.deliverables.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                  <h3 className="text-xl font-[heading] text-gray-300 mb-6 text-left">
                    Key Deliverables
                  </h3>
                  <ul className="list-disc ml-5 text-left">
                    {study.deliverables.map((item, index) => (
                      <li key={index} className="py-2">
                        <div className="text-gray-300 text-xl font-[textFont]">
                          {item.title}
                          {item.description && (
                            <span className="block text-gray-400 text-sm font-[textFont] leading-relaxed mt-1">
                              {item.description}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Highlights / Bullet Points Section */}
              {study.bulletPoints && study.bulletPoints.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 text-left">
                  <h3 className="text-xl font-[HeadingFont] text-white font-semibold border-b border-gray-800 pb-3 flex items-center gap-2">
                    ✨ Key Highlights
                  </h3>
                  <ul className="space-y-3">
                    {study.bulletPoints.map((bp, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-300 font-[textFont] text-base leading-relaxed">
                        <span className="text-blue-500 font-bold select-none mt-0.5">✓</span>
                        <span>{bp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
