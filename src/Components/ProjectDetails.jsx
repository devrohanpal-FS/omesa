import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const VideoPlayer = ({ url }) => {
  if (!url) return null;

  // Check if it's YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch) {
    const embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-black shadow-2xl">
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
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-black shadow-2xl">
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
          className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-black shadow-2xl"
          dangerouslySetInnerHTML={{ __html: url }}
        />
      );
    }
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-black shadow-2xl">
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
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-black shadow-2xl">
      <video
        src={url}
        controls
        className="w-full h-auto max-h-[500px]"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
    </div>
  );
};

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get("/api/portfolio-tiles");
        const list = res.data?.list || [];
        const item = list.find((p) => String(p.Id) === String(id));

        if (!item) {
          setProject(null);
          return;
        }

        const title = item.Title || "";
        const longDesc = item.longdescription || item.description || "";
        const category = item.category || "";
        const date = item.date || "";
        const videoUrl = item.videoUrl || null;

        let images = [];
        if (Array.isArray(item.images)) {
          images = item.images
            .map((att) => {
              const url = typeof att === "string" ? att : (att?.signedUrl || att?.signed_url || att?.url || null);
              const title = typeof att === "string" ? null : (att?.title || att?.name || null);
              return url ? { title, url } : null;
            })
            .filter(Boolean);
        }

        setProject({
          id: item.Id,
          title,
          longDesc,
          category,
          date,
          images,
          videoUrl,
        });
      } catch (error) {
        console.error("❌ Error fetching project details:", error);
      }
    };

    fetchProject();
  }, [id]);

  if (!project)
    return <div className="text-white p-10 font-[textFont]">Loading project...</div>;

  return (
    <div className="h-full pt-32 w-full bg-[#010616]">
      {/* Banner */}
      <div className=" bg-gradient-to-r from-[#03051E] via-[#0e1f4b] to-[#1D53B7]"></div>

      <div className="h-full bg-[#010616] text-white p-4 md:p-8">
        {/* Info Section */}
        <div className="max-w-6xl mx-auto border border-gray-800 rounded-lg p-6 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="font-[HeadingFont] text-fs-20 font-semibold mb-2">
                Client Name
              </h3>
              <p className="text-gray-400 font-[textFont] text-fs-16 font-light">
                {project.title}
              </p>
            </div>
            <div>
              <h3 className="font-[HeadingFont] text-fs-20 font-semibold mb-2">
                Project Date
              </h3>
              <p className="text-gray-400 font-[textFont] text-fs-16 font-light">
                {project.date}
              </p>
            </div>
            <div>
              <h3 className="font-[HeadingFont] text-fs-20 font-semibold mb-2">
                Project Type
              </h3>
              <p className="text-gray-400 font-[textFont] text-fs-16 font-light">
                {project.category}
              </p>
            </div>
          </div>
        </div>

        {/* Overview Section */}
        <div className="max-w-6xl mx-auto mb-24">
          <div className="flex flex-col md:flex-row lg:gap-12">
            <div className="md:w-1/4">
              <span className="inline-block mt-[20px] py-2 px-4 rounded-full text-fs-12 font-semibold font-[HeadingFont] border-2 border-gray-500 ">
                PROJECT OVERVIEW
              </span>
            </div>
            <div className="md:w-3/4">
              <h2 className="text-fs-32 font-normal md:text-4xl text-gray-300 font-[HeadingFont] mb-6">
                {project.title}
              </h2>
              <p className="text-gray-400 mb-8 text-fs-20 font-[textFont]">
                {project.longDesc}
              </p>

              {/* Swiper Image Gallery */}
              {project.images && project.images.length > 0 && (
                <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 p-2 mb-10 shadow-2xl">
                  <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    navigation
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                    spaceBetween={20}
                    slidesPerView={1}
                    className="rounded-xl overflow-hidden aspect-video max-h-[550px] !pb-10"
                  >
                    {project.images.map((img, idx) => (
                      <SwiperSlide key={idx} className="relative w-full h-full flex items-center justify-center bg-black">
                        <img
                          src={img.url}
                          alt={img.title || `${project.title} ${idx + 1}`}
                          className="w-full h-full object-contain max-h-[500px]"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg";
                          }}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              )}

              {/* Video Player Block (Only shows if videoUrl exists) */}
              {project.videoUrl && (
                <div className="mt-12 space-y-6">
                  <h3 className="text-2xl font-[HeadingFont] text-gray-300 font-semibold border-b border-gray-800 pb-3">
                    Project Video
                  </h3>
                  <VideoPlayer url={project.videoUrl} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
