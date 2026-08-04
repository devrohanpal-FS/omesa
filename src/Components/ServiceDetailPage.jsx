import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api";
import emailjs from "@emailjs/browser";

/* ---------- slug helper ---------- */

const SERVICE_TAB_MAP = {
  // Numeric IDs
  1: "Advertising & Brand Consulting",
  2: "Exhibition Design & Turnkey Solutions",
  3: "Events, Conferences & Hospitality",
  4: "Murals & Installations",
  5: "Digital & Media Production",
  6: "Interactive Exhibits & Displays",
  7: "Omesa Arts",

  // Text Slugs
  "advertising-and-brand-consulting": "Advertising & Brand Consulting",
  "exhibition-design-and-turnkey-solutions": "Exhibition Design & Turnkey Solutions",
  "events-conferences-and-hospitality": "Events, Conferences & Hospitality",
  "murals-and-installations": "Murals & Installations",
  "digital-and-media-production": "Digital & Media Production",
  "interactive-exhibits-and-displays": "Interactive Exhibits & Displays",
  "omesa-arts": "Omesa Arts",
};

const toSlug = (text) =>
  text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const ServiceDetailPage = () => {

  const { id } = useParams();
  const [service, setService] = useState(null);

  /* ---------- inquiry form ---------- */

  const [inquiry, setInquiry] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({
    name: false,
    email: false,
    subject: false,
    message: false,
  });

  const nameRegex = /^[A-Za-z\s]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleInquiryChange = (field, value) => {
    setInquiry((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: false }));
  };

  const handleInquirySubmit = (e) => {
    e.preventDefault();

    const newErrors = {
      name: !inquiry.name.trim() || !nameRegex.test(inquiry.name),
      email: !inquiry.email.trim() || !emailRegex.test(inquiry.email),
      subject: !inquiry.subject.trim(),
      message: inquiry.message.trim().length < 5,
    };

    setErrors(newErrors);

    if (!Object.values(newErrors).some((error) => error)) {

      const templateParams = {
        to_email: "info@omesa.in",
        from_name: inquiry.name,
        from_email: inquiry.email,
        subject: inquiry.subject,
        message: inquiry.message,
      };

      // Save contact inquiry locally
      api.post("/api/contact-inquiries", {
        name: inquiry.name,
        email: inquiry.email,
        subject: `Service Inquiry: ${inquiry.subject}`,
        message: inquiry.message
      }).catch((err) => {
        console.error("Local database inquiry save error:", err);
      });

      emailjs.send(
        "service_slptbe9",
        "template_6kmsfgf",
        templateParams,
        "AVDJ6-gG1yfcH_At0"
      )
        .then(() => {

          alert("Inquiry sent successfully!");

          setInquiry({
            name: "",
            email: "",
            subject: "",
            message: "",
          });

        })
        .catch((error) => {
          console.error("Email error:", error);
        });
    }
  };

  /* ---------- fetch service ---------- */

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await api.get(`/api/services/${id}`);
        const item = res.data;

        setService({
          id: item.Id,
          title: item.Title,
          oneLiner: item.OneLiner,
          description: item.description,
          longDesc: item.Long_Description,
          related: item.Related_services,
          image: item.image,
          images: item.images || [],
        });
      } catch (error) {
        console.error("Error fetching service:", error);
      }
    };

    fetchService();
  }, [id]);

  if (!service) {
    return <div className="text-white p-10">Loading service details...</div>;
  }

  return (

    <div className="h-full pt-32 w-full bg-[#010616]">

      {/* HEADER */}

      <div className=" bg-gradient-to-r from-[#03051E] via-[#0e1f4b] to-[#1D53B7]" />

      <div className="container mx-auto px-4 py-10">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* MAIN CONTENT */}

          <div className="lg:col-span-2 space-y-8">

            <div className="space-y-6">
              <div className="rounded-lg overflow-hidden border border-slate-800 bg-black">
                <img
                  src={
                    service.image ||
                    "https://kit.wof-pack.com/sirion/wp-content/uploads/sites/6/2025/02/developers-searching-for-bugs-1024x682.jpg"
                  }
                  alt={service.title}
                  className="w-full h-[400px] object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://kit.wof-pack.com/sirion/wp-content/uploads/sites/6/2025/02/developers-searching-for-bugs-1024x682.jpg";
                  }}
                />
              </div>

              {service.images && service.images.length > 1 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {service.images.slice(1).map((img, idx) => (
                    <div key={idx} className="rounded-lg overflow-hidden border border-slate-800 bg-black aspect-video hover:scale-[1.02] transition-transform duration-300">
                      <img
                        src={img}
                        alt={`${service.title} ${idx + 2}`}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => window.open(img, "_blank")}
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">

              <h3 className="bg-gradient-to-r from-gray-500 via-neutral-300 to-slate-200 bg-clip-text text-transparent font-[heading] text-3xl leading-loose">
                {service.oneLiner}
              </h3>

              <p className="text-gray-300 leading-loose text-lg font-[textFont]">
                {service.longDesc}
              </p>

            </div>

            <div className="pt-6">
              <Link
                to={`/portfolio?tab=${encodeURIComponent(
                  SERVICE_TAB_MAP[id] || SERVICE_TAB_MAP[service?.id] || service?.title || "All"
                )}`}
              >
                <button className="bg-white rounded-full py-2 px-7 border-2 font-[textFont] border-gray-300 text-gray-950 hover:bg-transparent hover:text-white transition">
                  Portfolio
                  <i className="fa-solid fa-arrow-right pl-2"></i>
                </button>
              </Link>
            </div>

          </div>

          {/* SIDEBAR */}

          <div className="space-y-6">

            {/* RELATED SERVICES */}

            <div className="bg-slate-900 border border-slate-800 rounded-lg">

              <div className="p-6">

                <h3 className="text-xl font-[heading] text-gray-300 mb-6">
                  Related Services
                </h3>

                <ul className="list-disc ml-5">

                  {service.related
                    ?.split("\n")
                    .filter(Boolean)
                    .map((item, index) => (

                      <li key={index} className="py-2">

                        <Link
                          to={`/service/details/${toSlug(item)}`}
                          className="text-gray-300 text-xl font-[textFont] hover:text-blue-600 transition"
                        >
                          {item}
                        </Link>

                      </li>

                    ))}

                </ul>

              </div>

            </div>

            {/* INQUIRY FORM */}

            <div className="bg-slate-900 border border-slate-800 rounded-lg">

              <div className="p-6">

                <h3 className="text-xl font-[heading] text-white mb-4">
                  Send Us An Inquiry
                </h3>

                <form onSubmit={handleInquirySubmit} className="space-y-4">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <input
                      placeholder="Your Name"
                      value={inquiry.name}
                      onChange={(e) => handleInquiryChange("name", e.target.value)}
                      className={`bg-slate-800 border ${errors.name ? "border-red-500" : "border-slate-700"
                        } text-white p-2 rounded`}
                    />

                    <input
                      type="email"
                      placeholder="Your Email"
                      value={inquiry.email}
                      onChange={(e) => handleInquiryChange("email", e.target.value)}
                      className={`bg-slate-800 border ${errors.email ? "border-red-500" : "border-slate-700"
                        } text-white p-2 rounded`}
                    />

                  </div>

                  <input
                    placeholder="Subject"
                    value={inquiry.subject}
                    onChange={(e) => handleInquiryChange("subject", e.target.value)}
                    className={`bg-slate-800 border ${errors.subject ? "border-red-500" : "border-slate-700"
                      } text-white p-2 rounded w-full`}
                  />

                  <textarea
                    rows={4}
                    placeholder="Your Message"
                    value={inquiry.message}
                    onChange={(e) => handleInquiryChange("message", e.target.value)}
                    className={`bg-slate-800 border ${errors.message ? "border-red-500" : "border-slate-700"
                      } text-white p-2 rounded w-full`}
                  />

                  <button
                    type="submit"
                    className="bg-gradient-to-r from-[#03051E] via-[#0e1f4b] to-[#1D53B7] text-gray-300 px-4 py-2 rounded"
                  >
                    Send Message
                  </button>

                </form>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ServiceDetailPage;