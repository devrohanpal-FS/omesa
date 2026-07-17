import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get("/api/upcoming-events");
        const list = res.data?.list || [];
        const item = list.find((e) => String(e.Id || e.id) === String(id));

        if (!item) {
          setEvent(null);
          return;
        }

        const title = item.Title || "";
        const description = item.description || "";
        const date = item.Date || "";
        const address = item.Address || "";

        let images = [];
        if (item.image) {
          if (typeof item.image === "string" && item.image.startsWith("[")) {
            try {
              images = JSON.parse(item.image).map(x => typeof x === "string" ? { url: x } : { url: x?.signedUrl || x?.url || "" });
            } catch {
              images = [{ url: item.image }];
            }
          } else if (Array.isArray(item.image)) {
            images = item.image.map(x => typeof x === "string" ? { url: x } : { url: x?.signedUrl || x?.url || "" });
          } else {
            images = [{ url: item.image }];
          }
        }

        setEvent({
          id: item.Id || item.id,
          title,
          description,
          date,
          address,
          images,
        });
      } catch (error) {
        console.error("❌ Error fetching event details:", error);
      }
    };

    fetchEvent();
  }, [id]);

  if (!event)
    return <div className="text-white p-10 font-[textFont] bg-[#010616] min-h-screen">Loading event details...</div>;

  return (
    <div className="h-full pt-28 w-full bg-[#010616]">
      {/* Banner */}
      <div className=" bg-gradient-to-r from-[#03051E] via-[#0e1f4b] to-[#1D53B7]"></div>

      <div className="h-full bg-[#010616] text-white p-4 md:p-8">
        {/* Info Section */}
        <div className="max-w-6xl mx-auto border border-gray-800 rounded-lg p-6 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="font-[HeadingFont] text-fs-20 font-semibold mb-2">
                Event Name
              </h3>
              <p className="text-gray-400 font-[textFont] text-fs-16 font-light">
                {event.title}
              </p>
            </div>
            <div>
              <h3 className="font-[HeadingFont] text-fs-20 font-semibold mb-2">
                Event Date / Time
              </h3>
              <p className="text-gray-400 font-[textFont] text-fs-16 font-light">
                {event.date}
              </p>
            </div>
            <div>
              <h3 className="font-[HeadingFont] text-fs-20 font-semibold mb-2">
                Location & Venue
              </h3>
              <p className="text-gray-400 font-[textFont] text-fs-16 font-light">
                {event.address}
              </p>
            </div>
          </div>
        </div>

        {/* Overview Section */}
        <div className="max-w-6xl mx-auto mb-24">
          <div className="flex flex-col md:flex-row lg:gap-12">
            <div className="md:w-1/4">
              <span className="inline-block mt-[20px] py-2 px-4 rounded-full text-fs-12 font-semibold font-[HeadingFont] border-2 border-gray-500 ">
                EVENT OVERVIEW
              </span>
            </div>
            <div className="md:w-3/4">
              <h2 className="text-fs-32 font-normal md:text-4xl text-gray-300 font-[HeadingFont] mb-6">
                {event.title}
              </h2>
              <p className="text-gray-400 mb-8 text-fs-20 font-[textFont] leading-relaxed">
                {event.description}
              </p>

              {/* Swiper Image Gallery */}
              {event.images && event.images.length > 0 && (
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
                    {event.images.map((img, idx) => (
                      <SwiperSlide key={idx} className="relative w-full h-full flex items-center justify-center bg-black">
                        <img
                          src={img.url}
                          alt={event.title}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
