import { useState, useEffect } from "react";
import api from "../utils/api";

export default function ClientSliderService() {
  const [logos, setLogos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/clients-logo");

        console.log("🔍 Raw API Response:", res.data);

        const list = res?.data?.list;
        if (!list || !Array.isArray(list)) {
          console.error("⚠️ 'list' missing or not an array:", res.data);
          return;
        }

        const formatted = list.map((row) => {
          const name = row?.logoname || row?.name || "client";

          let logo = "";

          if (Array.isArray(row?.logoImage) && row.logoImage.length > 0) {
            const first = row.logoImage[0];
            logo = typeof first === "string" ? first : (first?.signedUrl || first?.url || "");
          } else if (row?.logoImage && typeof row.logoImage === "object") {
            logo = row.logoImage?.signedUrl || row.logoImage?.url || "";
          } else if (typeof row?.logoImage === "string") {
            if (row.logoImage.startsWith("[")) {
              try {
                const parsed = JSON.parse(row.logoImage);
                const first = parsed[0];
                logo = typeof first === "string" ? first : (first?.url || "");
              } catch {
                logo = row.logoImage;
              }
            } else {
              logo = row.logoImage;
            }
          }

          return {
            id: row?.Id ?? row?.id ?? Math.random().toString(36).slice(2, 9),
            name,
            logo,
          };
        });

        // 🚀 Remove empty logos
        const filtered = formatted.filter((item) => item.logo);

        // 🚀 Remove duplicates (logo + name)
        const uniqueLogos = [];
        const seen = new Set();

        filtered.forEach((item) => {
          const key = item.logo + item.name;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueLogos.push(item);
          }
        });

        console.log("✨ Unique logos:", uniqueLogos);

        setLogos(uniqueLogos);
      } catch (error) {
        console.error("❌ Failed to fetch logos:", error);
      }
    };

    fetchData();
  }, []);

  const extendedCompanies = logos;
  return (
    <div className="w-full bg-[#010616] py-16 overflow-hidden">
      <div className="max-w-6xl mx-auto px-2">
        <h2 className="text-2xl md:text-3xl font-[heading] text-white mb-12 text-center md:text-left">
          Trusted by Companies
        </h2>

        <div className="relative overflow-hidden">
          <div className="marquee-track">
            <div className="marquee-content">
              {extendedCompanies.map((company, index) => (
                <div key={`${company.id}-${index}`} className="logo-item">
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={`${company.name} logo`}
                      className="h-12 w-auto object-contain opacity-80 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">{company.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .marquee-track {
          overflow: hidden;
          position: relative;
          width: 100%;
          height: auto;
        }

        .marquee-content {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .logo-item {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 150px;
        }

        @keyframes scroll-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}