import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api, { initCsrf } from "../utils/api";

// Custom HTML Rich Text Editor component
const HtmlEditor = ({ value, onChange, label }) => {
  const [activeSubTab, setActiveSubTab] = useState("write");
  const textareaRef = useRef(null);

  const insertTag = (openTag, closeTag = "") => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selected = text.substring(start, end);
    const replacement = openTag + selected + closeTag;
    const newValue = text.substring(0, start) + replacement + text.substring(end);
    onChange(newValue);
    
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + openTag.length, start + openTag.length + selected.length);
    }, 10);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-gray-300 text-sm font-medium font-[textFont]">{label}</label>
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveSubTab("write")}
            className={`px-3 py-1 text-xs rounded-md transition ${activeSubTab === "write" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
          >
            ✏️ Write
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("preview")}
            className={`px-3 py-1 text-xs rounded-md transition ${activeSubTab === "preview" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
          >
            👁️ Preview
          </button>
        </div>
      </div>

      {activeSubTab === "write" ? (
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
          <div className="flex flex-wrap gap-1 bg-slate-900/80 p-2 border-b border-slate-800">
            <button type="button" onClick={() => insertTag("<b>", "</b>")} className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded font-bold" title="Bold">B</button>
            <button type="button" onClick={() => insertTag("<i>", "</i>")} className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded italic" title="Italic">I</button>
            <button type="button" onClick={() => insertTag("<u>", "</u>")} className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded underline" title="Underline">U</button>
            <button type="button" onClick={() => insertTag("<h3>", "</h3>")} className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded font-mono" title="Heading 3">H3</button>
            <button type="button" onClick={() => insertTag("<p>", "</p>")} className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded" title="Paragraph">P</button>
            <button type="button" onClick={() => insertTag("<ul>\n  <li>", "</li>\n</ul>")} className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded" title="Unordered List">List</button>
            <button type="button" onClick={() => insertTag('<a href="#" target="_blank" class="text-blue-500 hover:underline">', "</a>")} className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded" title="Link">Link</button>
            <button type="button" onClick={() => onChange("")} className="px-2.5 py-1 text-xs bg-red-950/40 hover:bg-red-900/30 text-red-300 rounded ml-auto" title="Clear">Clear</button>
          </div>
          <textarea
            ref={textareaRef}
            rows={8}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent border-0 text-white px-4 py-3 font-[textFont] focus:outline-none focus:ring-0 transition"
            placeholder="Type HTML contents here..."
          />
        </div>
      ) : (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 min-h-[220px] max-h-[300px] overflow-y-auto text-gray-300 font-[textFont] leading-relaxed prose prose-invert">
          {value ? (
            <div dangerouslySetInnerHTML={{ __html: value }} />
          ) : (
            <span className="text-gray-600 italic">Nothing to preview</span>
          )}
        </div>
      )}
    </div>
  );
};

// Highlight / Bullet Points Manager
const BulletPointsManager = ({ value, onChange, label }) => {
  const list = typeof value === "string" && value.startsWith("[")
    ? JSON.parse(value)
    : (Array.isArray(value) ? value : (value ? value.split("\n").filter(Boolean) : []));

  const [inputVal, setInputVal] = useState("");

  const handleAdd = () => {
    if (!inputVal.trim()) return;
    const updated = [...list, inputVal.trim()];
    onChange(JSON.stringify(updated));
    setInputVal("");
  };

  const handleRemove = (idxToRemove) => {
    const updated = list.filter((_, idx) => idx !== idxToRemove);
    onChange(JSON.stringify(updated));
  };

  return (
    <div className="space-y-3">
      <label className="block text-gray-300 text-sm font-medium font-[textFont]">{label}</label>
      {list.length > 0 && (
        <ul className="space-y-2 bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
          {list.map((item, idx) => (
            <li key={idx} className="flex justify-between items-center text-sm font-[textFont] text-gray-300">
              <span className="flex items-center gap-2">🔹 {item}</span>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="text-red-500 hover:text-red-400 font-semibold px-2 py-1"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add highlight (e.g. UI/UX Design)"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-2 text-sm font-[textFont] focus:outline-none"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-xl"
        >
          Add
        </button>
      </div>
    </div>
  );
};

// Deliverables Manager
const DeliverablesManager = ({ value, onChange, label }) => {
  const list = typeof value === "string" && value.startsWith("[")
    ? JSON.parse(value)
    : (Array.isArray(value) ? value : []);

  const [newItem, setNewItem] = useState({ icon: "", title: "", description: "" });

  const handleAdd = () => {
    if (!newItem.title.trim() || !newItem.description.trim()) return;
    const updated = [...list, { ...newItem }];
    onChange(JSON.stringify(updated));
    setNewItem({ icon: "", title: "", description: "" });
  };

  const handleRemove = (idxToRemove) => {
    const updated = list.filter((_, idx) => idx !== idxToRemove);
    onChange(JSON.stringify(updated));
  };

  return (
    <div className="space-y-4">
      <label className="block text-gray-300 text-sm font-medium font-[textFont]">{label}</label>
      
      {list.length > 0 && (
        <div className="space-y-2 bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
          {list.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start border-b border-slate-800/80 pb-2 last:border-0 last:pb-0">
              <div className="space-y-1">
                <span className="font-semibold text-white text-sm flex items-center gap-2">
                  {item.icon && <span>{item.icon}</span>} {item.title}
                </span>
                <p className="text-xs text-gray-400 font-[textFont]">{item.description}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="text-red-500 hover:text-red-400 text-xs font-semibold px-2 py-1"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-900/30 p-3 border border-slate-800 rounded-xl">
        <input
          type="text"
          placeholder="Icon (optional emoji/class)"
          value={newItem.icon}
          onChange={(e) => setNewItem({ ...newItem, icon: e.target.value })}
          className="bg-slate-900 border border-slate-800 rounded-lg text-white px-3 py-2 text-xs font-[textFont]"
        />
        <input
          type="text"
          placeholder="Deliverable Title"
          value={newItem.title}
          onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
          className="bg-slate-900 border border-slate-800 rounded-lg text-white px-3 py-2 text-xs font-[textFont]"
        />
        <input
          type="text"
          placeholder="Short Description"
          value={newItem.description}
          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
          className="bg-slate-900 border border-slate-800 rounded-lg text-white px-3 py-2 text-xs font-[textFont]"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="sm:col-span-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium py-2 rounded-lg"
        >
          + Add Deliverable
        </button>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [activeTab, setActiveTab] = useState("AboutUs");
  const [data, setData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Authentication Check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await initCsrf();
        const res = await api.get("/api/auth/me");
        setUser(res.data.user);
      } catch {
        navigate("/admin?message=Please login to access the dashboard.");
      } finally {
        setLoadingUser(false);
      }
    };
    checkAuth();
  }, [navigate]);

  // Fetch Data based on tab
  const fetchData = async (tab) => {
    setLoadingData(true);
    setError("");
    setSuccess("");
    try {
      let endpoint = "";
      if (tab === "AboutUs") endpoint = "/api/about-us";
      else if (tab === "ClientsLogo") endpoint = "/api/clients-logo";
      else if (tab === "PortfolioTiles") endpoint = "/api/portfolio-tiles";
      else if (tab === "Services") endpoint = "/api/services";
      else if (tab === "CaseStudies") endpoint = "/api/case-studies";
      else if (tab === "UpcomingEvents") endpoint = "/api/upcoming-events";
      else if (tab === "Banner") endpoint = "/api/banner";
      else if (tab === "Testimonial") endpoint = "/api/testimonials";
      else if (tab === "ContactInquiry") endpoint = "/api/contact-inquiries";
      else if (tab === "TeamMember") endpoint = "/api/team-members";

      const res = await api.get(endpoint);
      setData(res.data.list || []);
    } catch {
      setError("Failed to fetch data for " + tab);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData(activeTab);
    }
  }, [user, activeTab]);

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
      navigate("/admin?message=Logged out successfully.");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // CRUD Operations
  const handleSaveEdit = async (e, itemToSave = null) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const item = itemToSave || editItem;
    if (!item) {
      setError("No item selected for saving.");
      return;
    }
    try {
      let endpoint = "";
      if (activeTab === "AboutUs") endpoint = `/api/about-us/${item.id}`;
      else if (activeTab === "ClientsLogo") endpoint = `/api/clients-logo/${item.Id || item.id}`;
      else if (activeTab === "PortfolioTiles") endpoint = `/api/portfolio-tiles/${item.Id || item.id}`;
      else if (activeTab === "Services") endpoint = `/api/services/${item.Id || item.id}`;
      else if (activeTab === "CaseStudies") endpoint = `/api/case-studies/${item.Id || item.id}`;
      else if (activeTab === "UpcomingEvents") endpoint = `/api/upcoming-events/${item.Id || item.id}`;
      else if (activeTab === "Banner") endpoint = `/api/banner/${item.id}`;
      else if (activeTab === "Testimonial") endpoint = `/api/testimonials/${item.Id || item.id}`;
      else if (activeTab === "TeamMember") endpoint = `/api/team-members/${item.Id || item.id}`;

      await api.put(endpoint, item);
      setSuccess("Record updated successfully!");
      setEditItem(null);
      fetchData(activeTab);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update record.");
    }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      let endpoint = "";
      if (activeTab === "ClientsLogo") endpoint = "/api/clients-logo";
      else if (activeTab === "PortfolioTiles") endpoint = "/api/portfolio-tiles";
      else if (activeTab === "Services") endpoint = "/api/services";
      else if (activeTab === "CaseStudies") endpoint = "/api/case-studies";
      else if (activeTab === "UpcomingEvents") endpoint = "/api/upcoming-events";
      else if (activeTab === "Testimonial") endpoint = "/api/testimonials";
      else if (activeTab === "TeamMember") endpoint = "/api/team-members";

      await api.post(endpoint, newItem);
      setSuccess("Record created successfully!");
      setShowAddForm(false);
      setNewItem({});
      fetchData(activeTab);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add record.");
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    setError("");
    setSuccess("");
    try {
      let endpoint = "";
      if (activeTab === "ClientsLogo") endpoint = `/api/clients-logo/${id}`;
      else if (activeTab === "PortfolioTiles") endpoint = `/api/portfolio-tiles/${id}`;
      else if (activeTab === "Services") endpoint = `/api/services/${id}`;
      else if (activeTab === "CaseStudies") endpoint = `/api/case-studies/${id}`;
      else if (activeTab === "UpcomingEvents") endpoint = `/api/upcoming-events/${id}`;
      else if (activeTab === "Testimonial") endpoint = `/api/testimonials/${id}`;
      else if (activeTab === "ContactInquiry") endpoint = `/api/contact-inquiries/${id}`;
      else if (activeTab === "TeamMember") endpoint = `/api/team-members/${id}`;

      await api.delete(endpoint);
      setSuccess("Record deleted successfully!");
      fetchData(activeTab);
    } catch {
      setError("Failed to delete record.");
    }
  };

  const handleFileUpload = async (e, onUploadSuccess) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setError("");
      setSuccess("Uploading file...");
      const res = await api.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccess("File uploaded successfully!");
      onUploadSuccess(res.data.url);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload file.");
    }
  };

  const getGalleryUrls = (val) => {
    if (!val) return [];
    if (typeof val !== "string") {
      if (Array.isArray(val)) {
        return val.map(x => typeof x === "string" ? x : (x.url || ""));
      }
      return [];
    }
    if (val.startsWith("[")) {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) {
          return parsed.map(x => typeof x === "string" ? x : (x.url || ""));
        }
        return [];
      } catch {
        return [val];
      }
    }
    return [val];
  };

  const renderGalleryManager = (label, value, onChange) => {
    const urls = getGalleryUrls(value);

    const handleAdd = (url) => {
      const updated = [...urls, url];
      onChange(JSON.stringify(updated));
    };

    const handleRemove = (index) => {
      const updated = urls.filter((_, idx) => idx !== index);
      onChange(JSON.stringify(updated));
    };

    return (
      <div className="space-y-4">
        <label className="block text-gray-300 text-sm font-medium font-[textFont]">{label}</label>
        
        {urls.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
            {urls.map((url, idx) => (
              <div key={idx} className="relative group border border-slate-800 rounded-lg overflow-hidden bg-black aspect-video">
                <img
                  src={url}
                  alt={`Gallery ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white rounded-full p-1.5 shadow transition opacity-0 group-hover:opacity-100 flex items-center justify-center"
                  style={{ width: "26px", height: "26px", fontSize: "12px" }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-4">
          <input
            type="text"
            id={`url-input-${label.replace(/\s+/g, "-")}`}
            placeholder="Or enter image/video URL directly..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (e.target.value.trim()) {
                  handleAdd(e.target.value.trim());
                  e.target.value = "";
                }
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              const inputEl = document.getElementById(`url-input-${label.replace(/\s+/g, "-")}`);
              if (inputEl && inputEl.value.trim()) {
                handleAdd(inputEl.value.trim());
                inputEl.value = "";
              }
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white font-[textFont] px-5 py-3 rounded-xl transition flex items-center justify-center gap-2 whitespace-nowrap"
          >
            ➕ Add URL
          </button>
          <label className="bg-slate-800 hover:bg-slate-700 text-white font-[textFont] px-5 py-3 rounded-xl cursor-pointer transition flex items-center justify-center gap-2 whitespace-nowrap">
            📁 Add File
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) =>
                handleFileUpload(e, (url) => {
                  handleAdd(url);
                })
              }
              className="hidden"
            />
          </label>
        </div>
      </div>
    );
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-[#010616] text-white flex items-center justify-center">
        <p className="text-xl font-[textFont]">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#010616] text-white pt-28 pb-16 px-4 md:px-8">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center border-b border-gray-800 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-[heading] bg-gradient-to-r from-white via-neutral-300 to-slate-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-400 font-[textFont] text-sm mt-1">Logged in as {user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600/20 border border-red-500/30 hover:bg-red-600/40 text-red-300 font-[textFont] px-5 py-2 rounded-xl transition"
        >
          Sign Out
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-2">
          {["AboutUs", "ClientsLogo", "PortfolioTiles", "Services", "CaseStudies", "UpcomingEvents", "Banner", "Testimonial", "ContactInquiry", "TeamMember"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setEditItem(null);
                setShowAddForm(false);
              }}
              className={`w-full text-left font-[textFont] font-medium py-3.5 px-5 rounded-xl transition-all duration-300 ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "bg-slate-900/50 hover:bg-slate-900 border border-slate-800 text-gray-400 hover:text-white"
              }`}
            >
              {tab === "AboutUs" && "ℹ️ About Us"}
              {tab === "ClientsLogo" && "🏢 Client Logos"}
              {tab === "PortfolioTiles" && "🎨 Portfolio Tiles"}
              {tab === "Services" && "💼 Services"}
              {tab === "CaseStudies" && "📚 Case Studies"}
              {tab === "UpcomingEvents" && "📅 Upcoming Events"}
              {tab === "Banner" && "📺 Hero Banner"}
              {tab === "Testimonial" && "💬 Testimonials"}
              {tab === "ContactInquiry" && "📨 Contact Inquiries"}
              {tab === "TeamMember" && "👥 Team Members"}
            </button>
          ))}
        </div>

        {/* Workspace Area */}
        <div className="lg:col-span-3 bg-[#050b24]/40 border border-gray-800 rounded-2xl p-6 backdrop-blur-md">
          {/* Notifications */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg mb-6 font-[textFont]">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm p-3 rounded-lg mb-6 font-[textFont]">
              ✅ {success}
            </div>
          )}

          {/* List and Form Sections */}
          {loadingData ? (
            <p className="text-gray-400 text-center py-12 font-[textFont]">Loading records...</p>
          ) : (
            <div>
              {/* Single item setups (AboutUs and Banner forms) */}
              {(activeTab === "AboutUs" || activeTab === "Banner") && data.length > 0 && (
                <div>
                  <h2 className="text-xl font-[heading] mb-6">Manage {activeTab}</h2>
                  <form
                    onSubmit={(e) => handleSaveEdit(e, data[0])}
                    className="space-y-6"
                  >
                    {activeTab === "AboutUs" && (
                      <>
                        <div>
                          <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Heading</label>
                          <input
                            type="text"
                            value={data[0]?.Heding || ""}
                            onChange={(e) => setData([{ ...data[0], Heding: e.target.value }])}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                          />
                        </div>
                        <HtmlEditor
                          label="Description"
                          value={data[0]?.Description || ""}
                          onChange={(val) => setData([{ ...data[0], Description: val }])}
                        />
                        <div>
                          <label className="block text-gray-300 text-sm mb-2 font-[textFont]">CTA (Call to Action Link)</label>
                          <input
                            type="text"
                            value={data[0]?.CTA || ""}
                            onChange={(e) => setData([{ ...data[0], CTA: e.target.value }])}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                            placeholder="https://..."
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Years of Experience</label>
                            <input
                              type="number"
                              value={data[0]?.experience || 0}
                              onChange={(e) => setData([{ ...data[0], experience: e.target.value }])}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Projects</label>
                            <input
                              type="number"
                              value={data[0]?.project || 0}
                              onChange={(e) => setData([{ ...data[0], project: e.target.value }])}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Satisfaction %</label>
                            <input
                              type="number"
                              value={data[0]?.satisfaction || 0}
                              onChange={(e) => setData([{ ...data[0], satisfaction: e.target.value }])}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {activeTab === "Banner" && (
                      <>
                        <div>
                          <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Title</label>
                          <input
                            type="text"
                            value={data[0]?.Title || ""}
                            onChange={(e) => setData([{ ...data[0], Title: e.target.value }])}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Second Line Text</label>
                          <input
                            type="text"
                            value={data[0]?.heading_line_2 || ""}
                            onChange={(e) => setData([{ ...data[0], heading_line_2: e.target.value }])}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Description</label>
                          <textarea
                            rows={3}
                            value={data[0]?.desc || ""}
                            onChange={(e) => setData([{ ...data[0], desc: e.target.value }])}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Video / Image URL (or Upload)</label>
                          <div className="flex gap-4">
                            <input
                              type="text"
                              value={data[0]?.video_url || ""}
                              onChange={(e) => setData([{ ...data[0], video_url: e.target.value }])}
                              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                            />
                            <label className="bg-slate-800 hover:bg-slate-700 text-white font-[textFont] px-5 py-3 rounded-xl cursor-pointer transition flex items-center justify-center">
                              📁 Upload
                              <input
                                type="file"
                                accept="image/*,video/*"
                                onChange={(e) => handleFileUpload(e, (url) => setData([{ ...data[0], video_url: url }]))}
                                className="hidden"
                              />
                            </label>
                          </div>
                          {data[0]?.video_url && (
                            <div className="mt-4 p-3 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center gap-4">
                              {data[0].video_url.match(/\.(mp4|webm|ogg)$/i) || data[0].video_url.includes("video") ? (
                                <video
                                  src={data[0].video_url}
                                  controls
                                  className="h-16 w-24 object-contain rounded border border-slate-700 bg-black"
                                />
                              ) : (
                                <img
                                  src={data[0].video_url}
                                  alt="Preview"
                                  className="h-16 w-16 object-contain rounded border border-slate-700 bg-black"
                                  onError={(e) => e.target.style.display = 'none'}
                                />
                              )}
                              <a
                                href={data[0].video_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                              >
                                🔗 Open file
                              </a>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-500 text-white font-[textFont] font-medium px-6 py-2.5 rounded-xl transition"
                    >
                      Save Changes
                    </button>
                  </form>
                </div>
              )}

              {/* CRUD Tables for Lists */}
              {activeTab !== "AboutUs" && activeTab !== "Banner" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-[heading]">Records in {activeTab}</h2>
                    {activeTab !== "ContactInquiry" && (
                      <button
                        onClick={() => {
                          setShowAddForm(true);
                          setEditItem(null);
                          setNewItem({});
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-[textFont] text-sm px-4 py-2 rounded-xl transition"
                      >
                        + Add Record
                      </button>
                    )}
                  </div>

                  {/* List View Table */}
                  {!showAddForm && !editItem && (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left text-sm text-gray-400 font-[textFont]">
                        <thead className="bg-slate-900 text-gray-300 border-b border-gray-800 uppercase text-xs font-semibold">
                          <tr>
                            <th className="py-3 px-4">ID</th>
                            {activeTab === "ClientsLogo" && <th className="py-3 px-4">Name</th>}
                            {(activeTab === "PortfolioTiles" || activeTab === "Services" || activeTab === "CaseStudies" || activeTab === "UpcomingEvents") && (
                              <th className="py-3 px-4">Title</th>
                            )}
                            {activeTab === "Testimonial" && (
                              <>
                                <th className="py-3 px-4">Author</th>
                                <th className="py-3 px-4">Company</th>
                              </>
                            )}
                            {activeTab === "ContactInquiry" && (
                              <>
                                <th className="py-3 px-4">Name</th>
                                <th className="py-3 px-4">Email</th>
                                <th className="py-3 px-4">Subject</th>
                              </>
                            )}
                            {activeTab === "PortfolioTiles" && <th className="py-3 px-4">Category</th>}
                            {activeTab === "UpcomingEvents" && <th className="py-3 px-4">Date</th>}
                            {activeTab === "TeamMember" && (
                              <>
                                <th className="py-3 px-4">Name</th>
                                <th className="py-3 px-4">Designation</th>
                                <th className="py-3 px-4">Display Order</th>
                              </>
                            )}
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 bg-[#050b24]/30">
                          {data.map((item) => (
                            <tr key={item.Id || item.id} className="hover:bg-slate-900/40 transition">
                              <td className="py-3 px-4 text-white font-medium">{item.Id || item.id}</td>
                              {activeTab === "ClientsLogo" && <td className="py-3 px-4">{item.logoname}</td>}
                              {(activeTab === "PortfolioTiles" || activeTab === "Services" || activeTab === "CaseStudies" || activeTab === "UpcomingEvents") && (
                                <td className="py-3 px-4">{item.Title || item.title}</td>
                              )}
                              {activeTab === "Testimonial" && (
                                <>
                                  <td className="py-3 px-4">{item.author}</td>
                                  <td className="py-3 px-4">{item.company}</td>
                                </>
                              )}
                              {activeTab === "ContactInquiry" && (
                                <>
                                  <td className="py-3 px-4">{item.name}</td>
                                  <td className="py-3 px-4">{item.email}</td>
                                  <td className="py-3 px-4">{item.subject}</td>
                                </>
                              )}
                              {activeTab === "PortfolioTiles" && <td className="py-3 px-4">{item.category}</td>}
                              {activeTab === "UpcomingEvents" && <td className="py-3 px-4">{item.Date}</td>}
                              {activeTab === "TeamMember" && (
                                <>
                                  <td className="py-3 px-4 font-semibold text-white">{item.name}</td>
                                  <td className="py-3 px-4">{item.designation}</td>
                                  <td className="py-3 px-4">{item.displayOrder}</td>
                                </>
                              )}
                              <td className="py-3 px-4 text-right space-x-2">
                                {activeTab === "ContactInquiry" ? (
                                  <button
                                    onClick={() => setEditItem(item)}
                                    className="text-blue-400 hover:text-blue-300 font-medium"
                                  >
                                    View
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setEditItem(item)}
                                    className="text-blue-400 hover:text-blue-300 font-medium"
                                  >
                                    Edit
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteRecord(item.Id || item.id)}
                                  className="text-red-400 hover:text-red-300 font-medium"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Add / Edit Form Modal-like sections */}
                  {(showAddForm || editItem) && (
                    <form onSubmit={showAddForm ? handleAddRecord : handleSaveEdit} className="space-y-6">
                      <h3 className="text-lg font-[heading] mb-4">
                        {activeTab === "ContactInquiry" ? "Inquiry Details" : (showAddForm ? "Add New Record" : "Edit Record")}
                      </h3>

                      {activeTab === "ClientsLogo" && (
                        <>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Logo Name</label>
                            <input
                              type="text"
                              value={showAddForm ? newItem.logoname || "" : editItem.logoname || ""}
                              onChange={(e) =>
                                showAddForm
                                  ? setNewItem({ ...newItem, logoname: e.target.value })
                                  : setEditItem({ ...editItem, logoname: e.target.value })
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Logo Image (URL or Upload)</label>
                            <div className="flex gap-4">
                              <input
                                type="text"
                                placeholder="https://..."
                                value={
                                  showAddForm
                                    ? newItem.logoImage || ""
                                    : typeof editItem.logoImage === "object"
                                    ? JSON.stringify(editItem.logoImage)
                                    : editItem.logoImage || ""
                                }
                                onChange={(e) =>
                                  showAddForm
                                    ? setNewItem({ ...newItem, logoImage: e.target.value })
                                    : setEditItem({ ...editItem, logoImage: e.target.value })
                                }
                                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                                required
                              />
                              <label className="bg-slate-800 hover:bg-slate-700 text-white font-[textFont] px-5 py-3 rounded-xl cursor-pointer transition flex items-center justify-center">
                                📁 Upload
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleFileUpload(e, (url) => {
                                      if (showAddForm) {
                                        setNewItem({ ...newItem, logoImage: url });
                                      } else {
                                        setEditItem({ ...editItem, logoImage: url });
                                      }
                                    })
                                  }
                                  className="hidden"
                                />
                              </label>
                            </div>
                            {(showAddForm ? newItem.logoImage : editItem.logoImage) && (
                              <div className="mt-4 p-3 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center gap-4">
                                <img
                                  src={showAddForm ? newItem.logoImage : editItem.logoImage}
                                  alt="Preview"
                                  className="h-16 w-16 object-contain rounded border border-slate-700 bg-black"
                                  onError={(e) => e.target.style.display = 'none'}
                                />
                                <a
                                  href={showAddForm ? newItem.logoImage : editItem.logoImage}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                                >
                                  🔗 Open file
                                </a>
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {activeTab === "PortfolioTiles" && (
                        <>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Title</label>
                            <input
                              type="text"
                              value={showAddForm ? newItem.Title || "" : editItem.Title || ""}
                              onChange={(e) =>
                                showAddForm
                                  ? setNewItem({ ...newItem, Title: e.target.value })
                                  : setEditItem({ ...editItem, Title: e.target.value })
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Description</label>
                            <input
                              type="text"
                              value={showAddForm ? newItem.description || "" : editItem.description || ""}
                              onChange={(e) =>
                                showAddForm
                                  ? setNewItem({ ...newItem, description: e.target.value })
                                  : setEditItem({ ...editItem, description: e.target.value })
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Category</label>
                            <input
                              type="text"
                              value={showAddForm ? newItem.category || "" : editItem.category || ""}
                              onChange={(e) =>
                                showAddForm
                                  ? setNewItem({ ...newItem, category: e.target.value })
                                  : setEditItem({ ...editItem, category: e.target.value })
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Long Description</label>
                            <textarea
                              rows={3}
                              value={showAddForm ? newItem.longdescription || "" : editItem.longdescription || ""}
                              onChange={(e) =>
                                showAddForm
                                  ? setNewItem({ ...newItem, longdescription: e.target.value })
                                  : setEditItem({ ...editItem, longdescription: e.target.value })
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                            />
                          </div>
                          <div>
                            {renderGalleryManager(
                              "Manage Image Gallery / Videos",
                              showAddForm ? newItem.images : editItem.images,
                              (val) => {
                                if (showAddForm) {
                                  setNewItem({ ...newItem, images: val });
                                } else {
                                  setEditItem({ ...editItem, images: val });
                                }
                              }
                            )}
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Project Thumbnail (URL or Upload)</label>
                            <div className="flex gap-4">
                              <input
                                type="text"
                                placeholder="https://..."
                                value={showAddForm ? newItem.thumbnail || "" : editItem.thumbnail || ""}
                                onChange={(e) =>
                                  showAddForm
                                    ? setNewItem({ ...newItem, thumbnail: e.target.value })
                                    : setEditItem({ ...editItem, thumbnail: e.target.value })
                                }
                                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                              />
                              <label className="bg-slate-800 hover:bg-slate-700 text-white font-[textFont] px-5 py-3 rounded-xl cursor-pointer transition flex items-center justify-center">
                                📁 Upload
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleFileUpload(e, (url) => {
                                      if (showAddForm) {
                                        setNewItem({ ...newItem, thumbnail: url });
                                      } else {
                                        setEditItem({ ...editItem, thumbnail: url });
                                      }
                                    })
                                  }
                                  className="hidden"
                                />
                              </label>
                            </div>
                            {(showAddForm ? newItem.thumbnail : editItem.thumbnail) && (
                              <div className="mt-4 p-3 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center gap-4">
                                <img
                                  src={showAddForm ? newItem.thumbnail : editItem.thumbnail}
                                  alt="Preview"
                                  className="h-16 w-16 object-contain rounded border border-slate-700 bg-black"
                                  onError={(e) => e.target.style.display = 'none'}
                                />
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Project Video URL</label>
                            <input
                              type="text"
                              placeholder="YouTube/Vimeo embed or direct video URL"
                              value={showAddForm ? newItem.videoUrl || "" : editItem.videoUrl || ""}
                              onChange={(e) =>
                                showAddForm
                                  ? setNewItem({ ...newItem, videoUrl: e.target.value })
                                  : setEditItem({ ...editItem, videoUrl: e.target.value })
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Date</label>
                            <input
                              type="text"
                              placeholder="YYYY-MM-DD"
                              value={showAddForm ? newItem.date || "" : editItem.date || ""}
                              onChange={(e) =>
                                showAddForm
                                  ? setNewItem({ ...newItem, date: e.target.value })
                                  : setEditItem({ ...editItem, date: e.target.value })
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                            />
                          </div>
                        </>
                      )}

                      {activeTab === "Services" && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Number</label>
                              <input
                                type="text"
                                value={showAddForm ? newItem.Number || "" : editItem.Number || ""}
                                onChange={(e) =>
                                  showAddForm
                                    ? setNewItem({ ...newItem, Number: e.target.value })
                                    : setEditItem({ ...editItem, Number: e.target.value })
                                }
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Title</label>
                              <input
                                type="text"
                                value={showAddForm ? newItem.title || "" : editItem.title || ""}
                                onChange={(e) =>
                                  showAddForm
                                    ? setNewItem({ ...newItem, title: e.target.value })
                                    : setEditItem({ ...editItem, title: e.target.value })
                                }
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">One Liner</label>
                            <input
                              type="text"
                              value={showAddForm ? newItem.OneLiner || "" : editItem.OneLiner || ""}
                              onChange={(e) =>
                                showAddForm
                                  ? setNewItem({ ...newItem, OneLiner: e.target.value })
                                  : setEditItem({ ...editItem, OneLiner: e.target.value })
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Description</label>
                            <textarea
                              rows={2}
                              value={showAddForm ? newItem.description || "" : editItem.description || ""}
                              onChange={(e) =>
                                showAddForm
                                  ? setNewItem({ ...newItem, description: e.target.value })
                                  : setEditItem({ ...editItem, description: e.target.value })
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Long Description</label>
                            <textarea
                              rows={4}
                              value={showAddForm ? newItem.Long_Description || "" : editItem.Long_Description || ""}
                              onChange={(e) =>
                                showAddForm
                                  ? setNewItem({ ...newItem, Long_Description: e.target.value })
                                  : setEditItem({ ...editItem, Long_Description: e.target.value })
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Related Services (Line breaks)</label>
                            <textarea
                              rows={3}
                              value={showAddForm ? newItem.Related_services || "" : editItem.Related_services || ""}
                              onChange={(e) =>
                                showAddForm
                                  ? setNewItem({ ...newItem, Related_services: e.target.value })
                                  : setEditItem({ ...editItem, Related_services: e.target.value })
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                            />
                          </div>
                          <div>
                            {renderGalleryManager(
                              "Manage Image Gallery / Videos",
                              showAddForm ? newItem.Attachments : editItem.Attachments,
                              (val) => {
                                if (showAddForm) {
                                  setNewItem({ ...newItem, Attachments: val });
                                } else {
                                  setEditItem({ ...editItem, Attachments: val });
                                }
                              }
                            )}
                          </div>
                        </>
                      )}

                      {activeTab === "CaseStudies" && (
                        <>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Title</label>
                            <input
                              type="text"
                              value={showAddForm ? newItem.Title || "" : editItem.Title || ""}
                              onChange={(e) =>
                                showAddForm
                                  ? setNewItem({ ...newItem, Title: e.target.value })
                                  : setEditItem({ ...editItem, Title: e.target.value })
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Short Description</label>
                            <input
                              type="text"
                              value={showAddForm ? newItem.shortDesc || "" : editItem.shortDesc || ""}
                              onChange={(e) =>
                                showAddForm
                                  ? setNewItem({ ...newItem, shortDesc: e.target.value })
                                  : setEditItem({ ...editItem, shortDesc: e.target.value })
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Overview Description</label>
                            <textarea
                              rows={2}
                              value={showAddForm ? newItem.description || "" : editItem.description || ""}
                              onChange={(e) =>
                                showAddForm
                                  ? setNewItem({ ...newItem, description: e.target.value })
                                  : setEditItem({ ...editItem, description: e.target.value })
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Long Description</label>
                            <textarea
                              rows={4}
                              value={showAddForm ? newItem.LongDescription || "" : editItem.LongDescription || ""}
                              onChange={(e) =>
                                showAddForm
                                  ? setNewItem({ ...newItem, LongDescription: e.target.value })
                                  : setEditItem({ ...editItem, LongDescription: e.target.value })
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                            />
                          </div>
                          <div>
                             {renderGalleryManager(
                               "Manage Image Gallery / Videos",
                               showAddForm ? newItem.image : editItem.image,
                               (val) => {
                                 if (showAddForm) {
                                   setNewItem({ ...newItem, image: val });
                                 } else {
                                   setEditItem({ ...editItem, image: val });
                                 }
                               }
                             )}
                           </div>
                           <div>
                             <DeliverablesManager
                               label="Deliverables"
                               value={showAddForm ? newItem.deliverables : editItem.deliverables}
                               onChange={(val) => {
                                 if (showAddForm) {
                                   setNewItem({ ...newItem, deliverables: val });
                                 } else {
                                   setEditItem({ ...editItem, deliverables: val });
                                 }
                               }}
                             />
                           </div>
                           <div>
                             <BulletPointsManager
                               label="Key Highlights / Bullet Points"
                               value={showAddForm ? newItem.bulletPoints : editItem.bulletPoints}
                               onChange={(val) => {
                                 if (showAddForm) {
                                   setNewItem({ ...newItem, bulletPoints: val });
                                 } else {
                                   setEditItem({ ...editItem, bulletPoints: val });
                                 }
                               }}
                             />
                           </div>
                        </>
                      )}

                      {activeTab === "UpcomingEvents" && (
                        <>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Title</label>
                            <input
                              type="text"
                              value={showAddForm ? newItem.Title || "" : editItem.Title || ""}
                              onChange={(e) =>
                                showAddForm
                                  ? setNewItem({ ...newItem, Title: e.target.value })
                                  : setEditItem({ ...editItem, Title: e.target.value })
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Description</label>
                            <textarea
                              rows={3}
                              value={showAddForm ? newItem.description || "" : editItem.description || ""}
                              onChange={(e) =>
                                showAddForm
                                  ? setNewItem({ ...newItem, description: e.target.value })
                                  : setEditItem({ ...editItem, description: e.target.value })
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Address / Location</label>
                            <input
                              type="text"
                              value={showAddForm ? newItem.Address || "" : editItem.Address || ""}
                              onChange={(e) =>
                                showAddForm
                                  ? setNewItem({ ...newItem, Address: e.target.value })
                                  : setEditItem({ ...editItem, Address: e.target.value })
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Date / Time</label>
                            <input
                              type="text"
                              value={showAddForm ? newItem.Date || "" : editItem.Date || ""}
                              onChange={(e) =>
                                showAddForm
                                  ? setNewItem({ ...newItem, Date: e.target.value })
                                  : setEditItem({ ...editItem, Date: e.target.value })
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Image / Video (URL or Upload)</label>
                            <div className="flex gap-4">
                              <input
                                type="text"
                                value={showAddForm ? newItem.image || "" : editItem.image || ""}
                                onChange={(e) =>
                                  showAddForm
                                    ? setNewItem({ ...newItem, image: e.target.value })
                                    : setEditItem({ ...editItem, image: e.target.value })
                                }
                                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                              />
                              <label className="bg-slate-800 hover:bg-slate-700 text-white font-[textFont] px-5 py-3 rounded-xl cursor-pointer transition flex items-center justify-center">
                                📁 Upload
                                <input
                                  type="file"
                                  accept="image/*,video/*"
                                  onChange={(e) =>
                                    handleFileUpload(e, (url) => {
                                      if (showAddForm) {
                                        setNewItem({ ...newItem, image: url });
                                      } else {
                                        setEditItem({ ...editItem, image: url });
                                      }
                                    })
                                  }
                                  className="hidden"
                                />
                              </label>
                            </div>
                            {(showAddForm ? newItem.image : editItem.image) && (
                              <div className="mt-4 p-3 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center gap-4">
                                {String(showAddForm ? newItem.image : editItem.image).match(/\.(mp4|webm|ogg)$/i) || String(showAddForm ? newItem.image : editItem.image).includes("video") ? (
                                  <video
                                    src={showAddForm ? newItem.image : editItem.image}
                                    controls
                                    className="h-16 w-24 object-contain rounded border border-slate-700 bg-black"
                                  />
                                ) : (
                                  <img
                                    src={showAddForm ? newItem.image : editItem.image}
                                    alt="Preview"
                                    className="h-16 w-16 object-contain rounded border border-slate-700 bg-black"
                                    onError={(e) => e.target.style.display = 'none'}
                                  />
                                )}
                                <a
                                  href={showAddForm ? newItem.image : editItem.image}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                                >
                                  🔗 Open file
                                </a>
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {activeTab === "Testimonial" && (
                        <>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Quote / Review Text</label>
                            <textarea
                              rows={4}
                              value={showAddForm ? newItem.quote || "" : editItem.quote || ""}
                              onChange={(e) =>
                                showAddForm
                                  ? setNewItem({ ...newItem, quote: e.target.value })
                                  : setEditItem({ ...editItem, quote: e.target.value })
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Author Name</label>
                              <input
                                type="text"
                                value={showAddForm ? newItem.author || "" : editItem.author || ""}
                                onChange={(e) =>
                                  showAddForm
                                    ? setNewItem({ ...newItem, author: e.target.value })
                                    : setEditItem({ ...editItem, author: e.target.value })
                                }
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Author Position</label>
                              <input
                                type="text"
                                value={showAddForm ? newItem.position || "" : editItem.position || ""}
                                onChange={(e) =>
                                  showAddForm
                                    ? setNewItem({ ...newItem, position: e.target.value })
                                    : setEditItem({ ...editItem, position: e.target.value })
                                }
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                                required
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Company</label>
                              <input
                                type="text"
                                value={showAddForm ? newItem.company || "" : editItem.company || ""}
                                onChange={(e) =>
                                  showAddForm
                                    ? setNewItem({ ...newItem, company: e.target.value })
                                    : setEditItem({ ...editItem, company: e.target.value })
                                }
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Trust Badge (e.g. TRUSTED AGENCY)</label>
                              <input
                                type="text"
                                value={showAddForm ? newItem.trustBadge || "" : editItem.trustBadge || ""}
                                onChange={(e) =>
                                  showAddForm
                                    ? setNewItem({ ...newItem, trustBadge: e.target.value })
                                    : setEditItem({ ...editItem, trustBadge: e.target.value })
                                }
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Trust Title</label>
                            <input
                              type="text"
                              value={showAddForm ? newItem.trustTitle || "" : editItem.trustTitle || ""}
                              onChange={(e) =>
                                showAddForm
                                  ? setNewItem({ ...newItem, trustTitle: e.target.value })
                                  : setEditItem({ ...editItem, trustTitle: e.target.value })
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Trust Description</label>
                            <textarea
                              rows={2}
                              value={showAddForm ? newItem.trustDescription || "" : editItem.trustDescription || ""}
                              onChange={(e) =>
                                showAddForm
                                  ? setNewItem({ ...newItem, trustDescription: e.target.value })
                                  : setEditItem({ ...editItem, trustDescription: e.target.value })
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Review Count (e.g. 128 K+)</label>
                              <input
                                type="text"
                                value={showAddForm ? newItem.reviewCount || "" : editItem.reviewCount || ""}
                                onChange={(e) =>
                                  showAddForm
                                    ? setNewItem({ ...newItem, reviewCount: e.target.value })
                                    : setEditItem({ ...editItem, reviewCount: e.target.value })
                                }
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Review Label (e.g. Happy Clients)</label>
                              <input
                                type="text"
                                value={showAddForm ? newItem.reviewLabel || "" : editItem.reviewLabel || ""}
                                onChange={(e) =>
                                  showAddForm
                                    ? setNewItem({ ...newItem, reviewLabel: e.target.value })
                                    : setEditItem({ ...editItem, reviewLabel: e.target.value })
                                }
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Avatars (comma separated urls or JSON array)</label>
                            <input
                              type="text"
                              value={
                                showAddForm
                                  ? newItem.avatars || ""
                                  : typeof editItem.avatars === "object"
                                  ? JSON.stringify(editItem.avatars)
                                  : editItem.avatars || ""
                              }
                              onChange={(e) =>
                                showAddForm
                                  ? setNewItem({ ...newItem, avatars: e.target.value })
                                  : setEditItem({ ...editItem, avatars: e.target.value })
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                            />
                          </div>
                        </>
                      )}

                      {activeTab === "ContactInquiry" && editItem && (
                        <>
                          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                            <div>
                              <h4 className="text-gray-400 text-xs uppercase font-semibold">From</h4>
                              <p className="text-white text-lg font-[textFont] mt-1">{editItem.name} &lt;{editItem.email}&gt;</p>
                            </div>
                            <div>
                              <h4 className="text-gray-400 text-xs uppercase font-semibold">Subject</h4>
                              <p className="text-white text-base font-[textFont] mt-1">{editItem.subject}</p>
                            </div>
                            <div>
                              <h4 className="text-gray-400 text-xs uppercase font-semibold">Date</h4>
                              <p className="text-white text-sm font-[textFont] mt-1">{new Date(editItem.createdAt).toLocaleString()}</p>
                            </div>
                            <div>
                              <h4 className="text-gray-400 text-xs uppercase font-semibold">Message</h4>
                              <p className="text-gray-300 text-base font-[textFont] mt-1 whitespace-pre-wrap leading-relaxed">{editItem.message}</p>
                            </div>
                          </div>
                        </>
                      )}

                      {activeTab === "TeamMember" && (
                        <>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Member Name</label>
                            <input
                              type="text"
                              value={showAddForm ? newItem.name || "" : editItem.name || ""}
                              onChange={(e) =>
                                showAddForm
                                  ? setNewItem({ ...newItem, name: e.target.value })
                                  : setEditItem({ ...editItem, name: e.target.value })
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Designation</label>
                            <input
                              type="text"
                              value={showAddForm ? newItem.designation || "" : editItem.designation || ""}
                              onChange={(e) =>
                                showAddForm
                                  ? setNewItem({ ...newItem, designation: e.target.value })
                                  : setEditItem({ ...editItem, designation: e.target.value })
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Profile Image (URL or Upload)</label>
                            <div className="flex gap-4">
                              <input
                                type="text"
                                placeholder="https://..."
                                value={showAddForm ? newItem.image || "" : editItem.image || ""}
                                onChange={(e) =>
                                  showAddForm
                                    ? setNewItem({ ...newItem, image: e.target.value })
                                    : setEditItem({ ...editItem, image: e.target.value })
                                }
                                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                                required
                              />
                              <label className="bg-slate-800 hover:bg-slate-700 text-white font-[textFont] px-5 py-3 rounded-xl cursor-pointer transition flex items-center justify-center">
                                📁 Upload
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleFileUpload(e, (url) => {
                                      if (showAddForm) {
                                        setNewItem({ ...newItem, image: url });
                                      } else {
                                        setEditItem({ ...editItem, image: url });
                                      }
                                    })
                                  }
                                  className="hidden"
                                />
                              </label>
                            </div>
                            {(showAddForm ? newItem.image : editItem.image) && (
                              <div className="mt-4 p-3 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center gap-4">
                                <img
                                  src={showAddForm ? newItem.image : editItem.image}
                                  alt="Preview"
                                  className="h-16 w-16 object-contain rounded border border-slate-700 bg-black"
                                  onError={(e) => e.target.style.display = 'none'}
                                />
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-2 font-[textFont]">Display Order (optional)</label>
                            <input
                              type="number"
                              value={showAddForm ? (newItem.displayOrder ?? "") : (editItem.displayOrder ?? "")}
                              onChange={(e) =>
                                showAddForm
                                  ? setNewItem({ ...newItem, displayOrder: e.target.value })
                                  : setEditItem({ ...editItem, displayOrder: e.target.value })
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-white px-4 py-3 font-[textFont] focus:outline-none focus:border-blue-600 transition"
                            />
                          </div>
                        </>
                      )}

                      <div className="flex gap-4">
                        {activeTab !== "ContactInquiry" && (
                          <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-500 text-white font-[textFont] font-medium px-6 py-2.5 rounded-xl transition"
                          >
                            {showAddForm ? "Add Record" : "Save Changes"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddForm(false);
                            setEditItem(null);
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-white font-[textFont] font-medium px-6 py-2.5 rounded-xl transition"
                        >
                          {activeTab === "ContactInquiry" ? "Back" : "Cancel"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
