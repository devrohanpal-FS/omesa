import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";

export default function UpcomingEvents() {
  const [events, setEvents] = useState([]);

  /* ---------- fetch events ---------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/upcoming-events");
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
            description: item.description,
            date: item.Date,
            address: item.Address,
            image: imageUrl,
          };
        });

        setEvents(formatted);
      } catch (error) {
        console.error("❌ UpcomingEvents error:", error);
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
            EVENTS
          </span> */}
          <h2 className="text-4xl sm:text-5xl lg:text-fs-54 font-[heading] leading-tight bg-gradient-to-r from-gray-500 via-neutral-300 to-slate-200 bg-clip-text text-transparent">
            Upcoming Events
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {events.map((event, index) => (
            <div
              key={event.id}
              className={`group cursor-pointer ${index % 2 === 0
                ? "mt-8 lg:mt-12"
                : "mt-8 lg:-mt-16"
                }`}
            >
              {/* IMAGE CARD */}
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={event.image || "/placeholder.svg"}
                  alt={event.title}
                  className="w-full h-72 sm:h-80 lg:h-[420px] object-cover"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">

                  <p className="text-sm text-blue-400 font-[textFont] mb-1 uppercase tracking-wider font-semibold">
                    {event.address}
                  </p>

                  <h3 className="text-white text-xl font-[heading] mb-2 font-semibold">
                    {event.title}
                  </h3>

                  <p className="text-gray-300 text-sm mb-6 line-clamp-3 font-[textFont] leading-relaxed">
                    {event.description}
                  </p>

                  <div className="flex items-center justify-between border-t border-white/10 pt-4">
                    <div>
                      <p className="text-xs text-gray-400 tracking-wider mb-1 font-[textFont]">
                        EVENT TIME
                      </p>
                      <p className="text-sm text-white font-[textFont]">
                        {event.date}
                      </p>
                    </div>

                    <Link
                      to={`/events/${event.id}`}
                      className="w-14 h-14 border border-white/40 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors duration-300"
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
    </section>
  );
}
