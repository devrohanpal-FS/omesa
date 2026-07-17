

import { useState, useEffect } from "react";
import api from "../utils/api";

const TeamSection = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await api.get("/api/team-members");
        setTeamMembers(res.data.list || []);
      } catch (err) {
        console.error("❌ Failed to fetch team members:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  return (
    <section className="bg-[#010616] text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between gap-8 mb-12">
          <div className="flex-1">
            <span className="inline-block border border-gray-600 text-gray-300 mb-6 px-4 py-2 text-sm font-normal rounded-full">
              OUR TEAM
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-fs-54 font-[heading] leading-tight bg-gradient-to-r from-gray-500 via-neutral-300 to-slate-200 bg-clip-text text-transparent">
              Powering the Vision
            </h2>
          </div>
        </div>

        {/* Team Cards */}
        {loading ? (
          <div className="text-center text-gray-400 font-[textFont] py-10">Loading team...</div>
        ) : teamMembers.length === 0 ? (
          <div className="text-center text-gray-500 font-[textFont] py-10">No team members added yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-slate-700 transition duration-300">
                {/* Image Container */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-black">
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-[HeadingFont] text-fs-24 font-semibold text-white mb-2">{member.name}</h3>
                  <p className="text-fs-16 font-light text-gray-400 leading-relaxed font-[textFont]">{member.designation}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TeamSection;
