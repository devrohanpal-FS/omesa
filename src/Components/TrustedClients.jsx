import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function TrustedClients() {
  const testimonials = [
    {
      id: 1,
      text: "Omesa transformed our pavilion at India Energy Week into a vibrant, interactive space that truly reflected GAIL’s commitment to innovation and sustainability. Visitors were impressed, and so were we.",
      name: "S. R. Gupta",
      role: "General Manager – Marketing, GAIL (India) Ltd",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1171&auto=format&fit=crop",
    },
    {
      id: 2,
      text: "The LT Foods booth at World Food India felt less like an exhibit and more like a living brand experience. Omesa’s attention to detail and storytelling approach set a new benchmark for us.",
      name: "Rohit Anand",
      role: "Head of Branding, LT Foods",
      image: "https://plus.unsplash.com/premium_photo-1690086519096-0594592709d3?q=80&w=1171&auto=format&fit=crop",
    },
    {
      id: 3,
      text: "At Gastech, Omesa gave Greenko a global-ready presence. The design was bold yet minimal, creating a perfect backdrop for engaging conversations with international delegates.",
      name: "Arjun Reddy",
      role: "Director – Corporate Communications, Greenko Group",
      image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1171&auto=format&fit=crop",
    },
    {
      id: 4,
      text: "Our vision for AM Green’s hydrogen pavilion came to life beautifully at ICGH 2024. Omesa created an inviting and thoughtful space that made complex ideas easy to grasp.",
      name: "Kavita Mehra",
      role: "VP – Marketing, AM Green",
      image: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=1170&auto=format&fit=crop",
    },
    {
      id: 5,
      text: "The interactive kiosks Omesa developed for our exhibition were a crowd magnet. Visitors loved engaging with our product stories in a fresh, intuitive way.",
      name: "Priya Bhatia",
      role: "Marketing Manager, Solis Pharma (India)",
      image: "https://images.unsplash.com/photo-1544725176-7c40e5a71c51?q=80&w=1170&auto=format&fit=crop",
    },
    {
      id: 6,
      text: "Omesa designed a mural for our Bangalore office that has completely transformed the space. It’s not just décor — it’s a conversation starter for every visitor.",
      name: "Ramesh Iyer",
      role: "CEO, Navtara Tech Pvt Ltd (India)",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1170&auto=format&fit=crop",
    },
    {
      id: 7,
      text: "The corporate film they produced for us struck the perfect balance between storytelling and professionalism. It worked wonders across our digital campaigns.",
      name: "Nikita Kapoor",
      role: "Digital Lead, FreshHarvest Foods (India)",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1170&auto=format&fit=crop",
    },
    {
      id: 8,
      text: "At the Milan Food Expo, Omesa’s design for our booth helped us stand out in a sea of global competitors. The seamless blend of technology and design was impressive.",
      name: "Luca Romano",
      role: "Export Director, Bella Vita Foods (Italy)",
      image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=1170&auto=format&fit=crop",
    },
    {
      id: 9,
      text: "Our annual leadership summit was executed flawlessly by Omesa. From logistics to branding, every element reflected precision and creativity.",
      name: "Deepak Verma",
      role: "VP Operations, IndusPower Solutions (India)",
      image: "https://images.unsplash.com/photo-1541534401786-2077eed87a72?q=80&w=1170&auto=format&fit=crop",
    },
    {
      id: 10,
      text: "The interactive wall Omesa built for our cultural centre in Singapore has become a major attraction. Their ability to merge art and technology is outstanding.",
      name: "Amelia Tan",
      role: "Curator, Urban Arts Collective (Singapore)",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1170&auto=format&fit=crop",
    },
  ];


  return (
    <div className="bg-[#010616] p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row items-stretch gap-6">
      {/* Left Card */}
      <div
        className="w-full lg:w-[55vw] relative lg:right-10 overflow-hidden rounded-xl p-6 sm:p-8 lg:p-12 lg:p-24"
        style={{ backgroundImage: "url('/backgroundImages/blue.jpg')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}
      >
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm mb-6 sm:mb-8">
          <span className="text-white font-[HeadingFont] tracking-wide">
            TRUSTED AGENCY
          </span>
        </div>

         {/* Main Content */}
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-fs-58 font-semibold font-[HeadingFont] text-white leading-tight">
            Trusted by the industry leaders.
          </h2>
          <p className="text-blue-100 font-[textFont] text-fs-16 font-light sm:text-lg leading-relaxed max-w-md">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit
            tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.
          </p>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          {/* Profile Images */}
          <div className="flex -space-x-3">
            {[1, 2, 3].map((_, index) => (
              <div
                key={index}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-white overflow-hidden"
              >
                <img
                  src="/placeholder.svg?height=48&width=48"
                  alt="Client testimonial"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Stats */}
          <div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              128 K+
            </div>
            <div className="text-blue-100 text-sm">Reviews</div>
          </div>
        </div>
      </div>

      {/* Right Card */}
      <div className="w-full lg:w-[45vw] relative overflow-hidden rounded-xl">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          // pagination={{ clickable: true }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          loop={true}
          className="h-full"
          breakpoints={{
            320: {
              slidesPerView: 1,
              spaceBetween: 10,
            },
            640: {
              slidesPerView: 1,
              spaceBetween: 15,
            },
            1024: {
              slidesPerView: 1,
              spaceBetween: 20,
            },
          }}
        >
          {testimonials.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="absolute inset-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative h-full min-h-[350px] sm:min-h-[450px] lg:min-h-[400px] flex flex-col justify-end p-6 sm:p-8 lg:p-12">
                <div className="space-y-2 sm:space-y-3">
                  <blockquote className="text-lg sm:text-xl lg:text-2xl font-light text-white leading-relaxed italic">
                    "{item.text}"
                  </blockquote>
                  <div className="space-y-1">
                    <div className="text-base sm:text-lg font-semibold text-white">
                      {item.name}
                    </div>
                    <div className="text-gray-300 text-xs sm:text-sm">
                      {item.role}
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
