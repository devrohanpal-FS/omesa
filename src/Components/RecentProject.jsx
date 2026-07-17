import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import api from "../utils/api";

export default function RecentProjects({ limit }) {
  const [projects, setProjects] = useState([]);
  const visibleProjects = limit ? projects.slice(0, limit) : projects;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/portfolio-tiles");
        const list = res.data?.list || [];

        const formatted = list.map((row) => {
          const title = row?.Title || row?.title || row?.name || "Untitled";
          const category = row?.category || row?.Category || "";
          const description = row?.LongDescription || row?.description || row?.Description || row?.desc || "";
          const dateField = row?.date || row?.Date || null;

           let Images = [];
          const candidates = row?.images || row?.Images || row?.image || row?.Image || null;

          if (Array.isArray(candidates) && candidates.length > 0) {
            Images = candidates
              .map((att) => {
                const url = typeof att === "string" ? att : (att?.signedUrl || att?.signed_url || att?.url || null);
                return url ? { url, raw: att } : null;
              })
              .filter(Boolean);
          } else if (candidates && typeof candidates === "object") {
            const url = candidates.signedUrl || candidates.signed_url || candidates.url || null;
            if (url) Images = [{ url, raw: candidates }];
          } else if (typeof candidates === "string") {
            if (candidates.startsWith("[")) {
              try {
                const parsed = JSON.parse(candidates);
                if (Array.isArray(parsed)) {
                  Images = parsed.map(x => ({ url: typeof x === "string" ? x : (x?.url || ""), raw: x })).filter(x => x.url);
                }
              } catch {
                Images = [{ url: candidates, raw: candidates }];
              }
            } else {
              Images = [{ url: candidates, raw: candidates }];
            }
          }

          return {
            id: row?.Id ?? row?.id ?? Math.random().toString(36).slice(2, 9),
            title,
            category,
            description,
            date: dateField,
            Images,
            thumbnail: row?.thumbnail || null,
            raw: row,
          };
        });

        // sort by date (newest first)
        const sorted = formatted.sort((a, b) => {
          const ta = a.date ? new Date(a.date).getTime() : 0;
          const tb = b.date ? new Date(b.date).getTime() : 0;
          return tb - ta;
        });

        setProjects(sorted);
        console.log("✨ Formatted & sorted projects:", sorted);
      } catch (error) {
        console.error("❌ Failed to fetch local records:", error);
      }
    };

    fetchData();
  }, []);

  // AOS Init
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <section className="bg-[#010616] max-w-full text-white px-4 sm:py-4 sm:px-6 lg:px-8 lg:py-4">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16">
          <p className=" ml-2 font-[HeadingFont] text-sm text-left border w-fit py-2 px-2 rounded-full border-gray-500 font-medium text-gray-400 uppercase tracking-wider mb-4">
            OUR WORK
          </p>
          <h2 className="py-5 text-3xl text-left md:text-5xl lg:text-fs-54 font-[HeadingFont] font-semibold mb-6 leading-tight bg-gradient-to-r from-gray-500 via-neutral-300 to-slate-200 bg-clip-text text-transparent">
            Projects where ideas became
            <br className="hidden sm:block" />
            experiences
          </h2>
          <p className="text-gray-400 text-left max-w-xl text-lg leading-relaxed font-[textFont]">
            Every project begins with a question: how do we make people stop,
            feel, and remember? From experiences to bold campaigns, we craft
            spaces and stories that connect brands to their audiences in ways
            that last.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="max-w-full mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
       
          {visibleProjects.map((project, index) => (

              <div
                data-aos="fade-up"
                data-aos-delay={index * 150}
                key={project.id}
              >
                <ProjectCard project={project} index={index} />
              </div>
            ))}
          </div>
          <div className="mt-5 pb-4 text-center ">
            <h2 className="text-center text-fs-24 font-[HeadingFont] font-semibold py-5">
              More project you should look.
            </h2>
            <Link to="/portfolio">
              <button className="bg-white text-center rounded-full py-2 px-7 border-2 font-[textFont] border-gray-300 text-base text-gray-950 hover:bg-transparent hover:text-white transition-all duration-300 ease-in-out ">
                More Projects
                <i className="fa-solid fa-arrow-right text-base pl-2 text-gray-950 hover:text-white transition-all duration-300 ease-in-out"></i>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// Card Component (unchanged, uses signedUrl stored in Images.url)
export function ProjectCard({ project, index }) {
  const [isHovered, setIsHovered] = useState(false);
  const isOffset = index % 2 === 0;

  const offsetClass = isOffset ? "lg:mt-16" : "";

  const { title, category, description, Images, thumbnail } = project;
  const imageUrl = thumbnail || Images?.[0]?.url || "/placeholder.svg";

  return (
    <div
      className={`group cursor-pointer max-w-full ${offsetClass}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative bg-[#010616] rounded-lg overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-64 sm:h-80 lg:h-full object-cover block"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />

        {/* Hover Overlay */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            isHovered ? "opacity-100 bg-black/30" : "opacity-0"
          }`}
        />

        {/* Arrow Icon */}
        <div className="absolute bottom-6 right-6 w-16 h-16 border-2 rounded-full flex items-center justify-center transition-all duration-300">
          <Link
            to={`/portfolio/${project.id}`}
            className="text-white text-lg w-5 h-5 flex items-center justify-center"
          >
            <i className="fa-solid fa-arrow-right text-lg"></i>
          </Link>
        </div>
      </div>

      {/* Text Info */}
      <div className="space-y-3 mt-4">
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider font-[textFont]">
          {category}
        </p>
        <h3 className="text-xl lg:text-3xl font-normal text-white transition-colors duration-200">
          {title}
        </h3>
        <p className="text-gray-400 leading-relaxed font-[textFont]">
          {description}
        </p>
      </div>
    </div>
  );
}
