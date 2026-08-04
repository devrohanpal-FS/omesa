import { useState, useEffect } from "react";
import api from "../utils/api";
import { useSearchParams, Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

/**
 * Portfolio component — uses NocoDB and only uses signedUrl for images.
 */

const VideoPlayer = ({ url }) => {
  if (!url) return null;

  // Check if it's YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i);
  if (ytMatch) {
    const embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-800 bg-black shadow-2xl">
        <iframe
          src={embedUrl}
          className="absolute top-0 left-0 w-full h-full"
          title="Project Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  // Check if it's Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/i);
  if (vimeoMatch) {
    const embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-800 bg-black shadow-2xl">
        <iframe
          src={embedUrl}
          className="absolute top-0 left-0 w-full h-full"
          title="Project Video"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  // Check if it's embed format already
  if (url.includes("embed") || url.includes("iframe")) {
    if (url.startsWith("<iframe")) {
      return (
        <div
          className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-800 bg-black shadow-2xl"
          dangerouslySetInnerHTML={{ __html: url }}
        />
      );
    }
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-800 bg-black shadow-2xl">
        <iframe
          src={url}
          className="absolute top-0 left-0 w-full h-full"
          title="Project Video"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  // Treat as direct video link
  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-800 bg-black shadow-2xl animate-fade-in">
      <video
        src={url}
        controls
        className="w-full h-auto max-h-[500px]"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
    </div>
  );
};

const ProjectMediaModal = ({ project, onClose }) => {
  if (!project) return null;

  const mediaList = [];
  if (project.videoUrl) {
    mediaList.push({ type: "video", url: project.videoUrl });
  }
  if (project.images && project.images.length > 0) {
    project.images.forEach((img) => {
      mediaList.push({ type: "image", url: img.url, title: img.title });
    });
  }
  if (mediaList.length === 0 && project.thumbnail) {
    mediaList.push({ type: "image", url: project.thumbnail });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Scope Swiper styles locally inside the modal */}
      <style>{`
        .modal-swiper .swiper-button-next,
        .modal-swiper .swiper-button-prev {
          color: #ffffff !important;
          background: rgba(0, 0, 0, 0.4);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s ease, transform 0.2s ease;
        }
        .modal-swiper .swiper-button-next:hover,
        .modal-swiper .swiper-button-prev:hover {
          background: rgba(0, 0, 0, 0.7);
          transform: scale(1.05);
        }
        .modal-swiper .swiper-button-next::after,
        .modal-swiper .swiper-button-prev::after {
          font-size: 18px !important;
          font-weight: bold;
        }
        .modal-swiper .swiper-pagination-bullet {
          background: #ffffff !important;
          opacity: 0.5;
        }
        .modal-swiper .swiper-pagination-bullet-active {
          background: #3b82f6 !important;
          opacity: 1;
        }
        .modal-swiper {
          padding-bottom: 2.5rem !important;
        }
      `}</style>

      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white text-3xl hover:text-red-500 hover:scale-110 transition-all duration-300 z-50 bg-black/50 w-12 h-12 rounded-full flex items-center justify-center border border-white/10 shadow-lg"
        aria-label="Close modal"
      >
        ✕
      </button>

      <div className="w-full max-w-5xl bg-slate-950/70 border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-4 relative flex flex-col items-center max-h-[90vh]">
        {/* Title display */}
        {project.title && (
          <h3 className="text-white text-xl font-semibold mb-4 px-4 text-center font-[HeadingFont]">
            {project.title}
          </h3>
        )}

        <div className="w-full flex items-center justify-center overflow-y-auto">
          {mediaList.length === 0 ? (
            <div className="text-slate-400 py-10 font-[textFont]">No preview media available</div>
          ) : mediaList.length === 1 ? (
            <div className="w-full max-h-[70vh] flex items-center justify-center overflow-hidden rounded-xl py-2">
              {mediaList[0].type === "video" ? (
                <div className="w-full max-w-4xl px-4">
                  <VideoPlayer url={mediaList[0].url} />
                </div>
              ) : (
                <img
                  src={mediaList[0].url}
                  alt={mediaList[0].title || project.title}
                  className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-lg border border-slate-800"
                  onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                />
              )}
            </div>
          ) : (
            <div className="w-full">
              <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                spaceBetween={30}
                slidesPerView={1}
                className="modal-swiper w-full rounded-xl"
              >
                {mediaList.map((media, idx) => (
                  <SwiperSlide key={idx} className="flex items-center justify-center bg-black/20 rounded-xl px-12">
                    <div className="w-full max-h-[65vh] flex items-center justify-center overflow-hidden py-2">
                      {media.type === "video" ? (
                        <div className="w-full max-w-4xl">
                          <VideoPlayer url={media.url} />
                        </div>
                      ) : (
                        <img
                          src={media.url}
                          alt={media.title || `${project.title} - ${idx + 1}`}
                          className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-lg border border-slate-800"
                          onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                        />
                      )}
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Portfolio = () => {
  const [projects, setProjects] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);

  // ✅ Fetch portfolio
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/portfolio-tiles");
        const list = res.data?.list || [];

        const formatted = list.map((item) => {
          const id = item.Id ?? item.id;
          const title = item.Title || item.title || "";
          const description = item.Description || item.description || "";
          const category = item.Category || item.category || "";

          let images = [];
          const rawImages = item.images || item.Images || item.image || item.Image || [];
          if (Array.isArray(rawImages) && rawImages.length > 0) {
            images = rawImages.map(att => {
              const url = typeof att === "string" ? att : (att?.signedUrl || att?.signed_url || att?.url || null);
              return url ? { url } : null;
            }).filter(Boolean);
          } else if (rawImages && typeof rawImages === "object") {
            const url = rawImages.signedUrl || rawImages.signed_url || rawImages.url || null;
            if (url) images = [{ url }];
          } else if (typeof rawImages === "string") {
            if (rawImages.startsWith("[")) {
              try {
                const parsed = JSON.parse(rawImages);
                if (Array.isArray(parsed)) {
                  images = parsed.map(x => ({ url: typeof x === "string" ? x : (x?.url || "") })).filter(x => x.url);
                }
              } catch {
                images = [{ url: rawImages }];
              }
            } else {
              images = [{ url: rawImages }];
            }
          }

          const videoUrl = item.videoUrl || item.VideoUrl || null;

          return {
            id,
            title,
            description,
            category,
            images,
            thumbnail: item.thumbnail || null,
            videoUrl,
          };
        });

        setProjects(formatted);
      } catch (error) {
        console.error("❌ Error fetching portfolio:", error);
      }
    };

    fetchData();
  }, []);

  // ✅ Sync tab with URL
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");

    if (tabFromUrl) {
      const decodedTab = decodeURIComponent(tabFromUrl);
      setActiveTab(decodedTab);
    } else {
      setActiveTab("All");
    }
  }, [searchParams]);

  // Categories
  const categories = [
    "All",
    ...Array.from(
      new Set(projects.map((p) => p.category).filter(Boolean))
    ),
  ];

  const filteredProjects =
    activeTab === "All"
      ? projects
      : projects.filter((p) => p.category === activeTab);

  return (
    <div className="h-full w-full bg-[#010616]">
      {/* Gradient Header */}
      <div className="h-48 sm:h-56 md:h-64 lg:h-72 xl:h-28 w-full bg-gradient-to-r from-[#03051E] via-[#0e1f4b] to-[#1D53B7]"></div>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 lg:px-8 py-8">
        {/* ================= TABS ON TOP WITHOUT SLIDER ================= */}
        <nav className="flex flex-wrap items-center gap-4 mb-10 mt-7 justify-start">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setActiveTab(category);

                if (category === "All") {
                  setSearchParams({});
                } else {
                  setSearchParams({ tab: category });
                }
              }}
              className={`px-5 py-3 rounded-xl font-[textFont] text-fs-16 font-semibold transition-all duration-300 border ${
                activeTab === category
                  ? "bg-blue-600/10 text-blue-500 border-blue-500/20 shadow-[0_4px_20px_rgba(37,99,235,0.08)]"
                  : "text-slate-400 border-transparent hover:border-slate-800 hover:bg-slate-900/30 hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </nav>

        {/* ================= PORTFOLIO GRID ================= */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 mb-10">
          {filteredProjects.map((project) => {
            const imageUrl =
              project.thumbnail ||
              (project.images && project.images.length > 0
                ? project.images[0].url
                : "/placeholder.svg");

            return (
              <div
                key={project.id}
                className="mb-6 break-inside-avoid group cursor-pointer"
              >
                <div className="relative rounded-2xl overflow-hidden bg-[#050b24] shadow-lg">
                  <Link to={`/portfolio/${project.id}`}>
                    <img
                      src={imageUrl}
                      alt={project.title}
                      onError={(e) =>
                        (e.currentTarget.src = "/placeholder.svg")
                      }
                      className="w-full h-auto block object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-5">
                    <div className="flex justify-between items-center w-full">
                      <Link to={`/portfolio/${project.id}`} className="hover:underline flex-1">
                        <h3 className="text-white text-lg font-medium">
                          {project.title}
                        </h3>
                      </Link>

                      <button
                        onClick={() => setSelectedProject(project)}
                        className="w-11 h-11 border border-white/40 rounded-full flex items-center justify-center text-white ml-2 z-10"
                      >
                        👁
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <ProjectMediaModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
};

export default Portfolio;
