import express from "express";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || "omesa-secret-jwt-key-2026";

const resetSequenceIfEmpty = async (modelName, tableName) => {
  try {
    const count = await prisma[modelName].count();
    if (count === 0) {
      await prisma.$executeRawUnsafe(`DELETE FROM sqlite_sequence WHERE name = '${tableName}'`);
      console.log(`🔄 SQLite sequence reset for: ${tableName}`);
    }
  } catch (err) {
    console.error(`❌ Failed to reset sqlite_sequence for ${tableName}:`, err);
  }
};

// Ensure uploads directory exists
const UPLOADS_DIR = "./uploads";
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for videos
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploads folder statically
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Cookie configurations
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000, // 1 day
  path: "/",
};

// Double-Submit Cookie CSRF Middleware
const csrfProtection = (req, res, next) => {
  // Pass GET, HEAD, OPTIONS
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const csrfCookie = req.cookies["csrfToken"];
  const csrfHeader = req.headers["x-csrf-token"];

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return res.status(403).json({ error: "CSRF token validation failed. Forbidden." });
  }

  next();
};

app.use(csrfProtection);

// Helper middleware to check authentication
const authenticate = (req, res, next) => {
  const token = req.cookies["token"];
  if (!token) {
    return res.status(401).json({ error: "Access denied. Not authenticated." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.clearCookie("token");
    return res.status(401).json({ error: "Session expired or invalid. Please login again." });
  }
};

// --- File Upload Endpoint ---
app.post("/api/upload", authenticate, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// --- CSRF Endpoint ---
app.get("/api/csrf-token", (req, res) => {
  let token = req.cookies["csrfToken"];
  if (!token) {
    token = crypto.randomBytes(32).toString("hex");
  }
  res.cookie("csrfToken", token, {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  });
  res.json({ csrfToken: token });
});

// --- Authentication Endpoints ---
app.post("/api/auth/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "User already exists." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed },
    });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, cookieOptions);
    res.json({ success: true, user: { id: user.id, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, cookieOptions);
    res.json({ success: true, user: { id: user.id, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});

app.get("/api/auth/me", authenticate, (req, res) => {
  res.json({ user: req.user });
});

// --- Content CRUD Endpoints ---

// 1. AboutUs
app.get("/api/about-us", async (req, res) => {
  try {
    let records = await prisma.aboutUs.findMany();
    if (records.length === 0) {
      const defaultAbout = await prisma.aboutUs.create({
        data: {
          Heding: "About Us Heading",
          Description: "About Us Description",
          CTA: "",
          experience: 0,
          project: 0,
          satisfaction: 0
        }
      });
      records = [defaultAbout];
    }
    // Return format matching NocoDB { list: [...] }
    res.json({ list: records });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/about-us/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { Heding, Description, CTA, experience, project, satisfaction } = req.body;
  try {
    const updated = await prisma.aboutUs.update({
      where: { id: parseInt(id) },
      data: {
        Heding,
        Description,
        CTA,
        experience: (experience !== undefined && experience !== null && experience !== "") ? parseInt(experience) : undefined,
        project: (project !== undefined && project !== null && project !== "") ? parseInt(project) : undefined,
        satisfaction: (satisfaction !== undefined && satisfaction !== null && satisfaction !== "") ? parseInt(satisfaction) : undefined,
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. ClientsLogo
app.get("/api/clients-logo", async (req, res) => {
  try {
    const records = await prisma.clientsLogo.findMany();
    const formatted = records.map(r => ({
      Id: r.id,
      logoname: r.logoname,
      logoImage: r.logoImage.startsWith("[") ? JSON.parse(r.logoImage) : r.logoImage,
    }));
    res.json({ list: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/clients-logo", authenticate, async (req, res) => {
  const { logoname, logoImage } = req.body;
  try {
    const created = await prisma.clientsLogo.create({
      data: {
        logoname,
        logoImage: typeof logoImage === "object" ? JSON.stringify(logoImage) : logoImage,
      },
    });
    res.json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/clients-logo/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { logoname, logoImage } = req.body;
  try {
    const updated = await prisma.clientsLogo.update({
      where: { id: parseInt(id) },
      data: {
        logoname,
        logoImage: typeof logoImage === "object" ? JSON.stringify(logoImage) : logoImage,
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/clients-logo/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.clientsLogo.delete({ where: { id: parseInt(id) } });
    await resetSequenceIfEmpty("clientsLogo", "ClientsLogo");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. PortfolioTiles
app.get("/api/portfolio-tiles", async (req, res) => {
  try {
    const records = await prisma.portfolioTiles.findMany();
    const formatted = records.map(r => ({
      Id: r.id,
      Title: r.Title,
      description: r.description,
      images: r.images.startsWith("[") ? JSON.parse(r.images) : [{ url: r.images }],
      category: r.category,
      longdescription: r.longdescription,
      date: r.date,
      thumbnail: r.thumbnail,
      videoUrl: r.videoUrl,
    }));
    res.json({ list: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/portfolio-tiles", authenticate, async (req, res) => {
  const { Title, description, images, category, longdescription, date, thumbnail, videoUrl } = req.body;
  try {
    const created = await prisma.portfolioTiles.create({
      data: {
        Title,
        description,
        images: typeof images === "object" ? JSON.stringify(images) : images,
        category,
        longdescription,
        date,
        thumbnail,
        videoUrl,
      },
    });
    res.json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/portfolio-tiles/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { Title, description, images, category, longdescription, date, thumbnail, videoUrl } = req.body;
  try {
    const updated = await prisma.portfolioTiles.update({
      where: { id: parseInt(id) },
      data: {
        Title,
        description,
        images: typeof images === "object" ? JSON.stringify(images) : images,
        category,
        longdescription,
        date,
        thumbnail,
        videoUrl,
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/portfolio-tiles/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.portfolioTiles.delete({ where: { id: parseInt(id) } });
    await resetSequenceIfEmpty("portfolioTiles", "PortfolioTiles");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Services
app.get("/api/services", async (req, res) => {
  try {
    const records = await prisma.services.findMany();
    const formatted = records.map(r => ({
      Id: r.id,
      Number: r.Number,
      title: r.title,
      description: r.description,
      Long_Description: r.Long_Description,
      OneLiner: r.OneLiner,
      Related_services: r.Related_services,
      Attachments: r.Attachments.startsWith("[") ? JSON.parse(r.Attachments) : [{ url: r.Attachments }],
      Date: r.Date,
    }));
    res.json({ list: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/services/:id", async (req, res) => {
  const { id } = req.params;
  try {
    let record;
    if (!isNaN(parseInt(id))) {
      record = await prisma.services.findUnique({ where: { id: parseInt(id) } });
    } else {
      const services = await prisma.services.findMany();
      const toSlug = (text) =>
        text
          .toLowerCase()
          .replace(/&/g, "and")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      record = services.find((s) => toSlug(s.title) === id);
    }
    if (!record) {
      return res.status(404).json({ error: "Service not found." });
    }
    const images = record.Attachments.startsWith("[")
      ? JSON.parse(record.Attachments).map(x => typeof x === "string" ? x : (x?.url || ""))
      : [record.Attachments];
    const formatted = {
      Id: record.id,
      Number: record.Number,
      Title: record.title,
      description: record.description,
      Long_Description: record.Long_Description,
      OneLiner: record.OneLiner,
      Related_services: record.Related_services,
      image: images[0] || "",
      images,
      Date: record.Date,
    };
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/services", authenticate, async (req, res) => {
  const { Number, title, description, Long_Description, OneLiner, Related_services, Attachments, Date: serviceDate } = req.body;
  try {
    const created = await prisma.services.create({
      data: {
        Number,
        title,
        description,
        Long_Description,
        OneLiner,
        Related_services,
        Attachments: typeof Attachments === "object" ? JSON.stringify(Attachments) : Attachments,
        Date: serviceDate,
      },
    });
    res.json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/services/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { Number, title, description, Long_Description, OneLiner, Related_services, Attachments, Date: serviceDate } = req.body;
  try {
    const updated = await prisma.services.update({
      where: { id: parseInt(id) },
      data: {
        Number,
        title,
        description,
        Long_Description,
        OneLiner,
        Related_services,
        Attachments: typeof Attachments === "object" ? JSON.stringify(Attachments) : Attachments,
        Date: serviceDate,
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/services/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.services.delete({ where: { id: parseInt(id) } });
    await resetSequenceIfEmpty("services", "Services");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. CaseStudy
app.get("/api/case-studies", async (req, res) => {
  try {
    const records = await prisma.caseStudy.findMany();
    const formatted = records.map(r => ({
      Id: r.id,
      Title: r.Title,
      description: r.description,
      shortDesc: r.shortDesc,
      LongDescription: r.LongDescription,
      desc1: r.desc1,
      desc2: r.desc2,
      desc3: r.desc3,
      desc4: r.desc4,
      desc5: r.desc5,
      desc6: r.desc6,
      image: r.image && r.image.startsWith("[") ? JSON.parse(r.image) : r.image,
      deliverables: r.deliverables ? (r.deliverables.startsWith("[") ? JSON.parse(r.deliverables) : r.deliverables) : [],
      bulletPoints: r.bulletPoints ? (r.bulletPoints.startsWith("[") ? JSON.parse(r.bulletPoints) : r.bulletPoints) : [],
    }));
    res.json({ list: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/case-studies/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const record = await prisma.caseStudy.findUnique({ where: { id: parseInt(id) } });
    if (!record) {
      return res.status(404).json({ error: "Case study not found." });
    }
    const formatted = {
      Id: record.id,
      Title: record.Title,
      description: record.description,
      shortDesc: record.shortDesc,
      LongDescription: record.LongDescription,
      desc1: record.desc1,
      desc2: record.desc2,
      desc3: record.desc3,
      desc4: record.desc4,
      desc5: record.desc5,
      desc6: record.desc6,
      image: record.image, // Return raw DB string so frontend can parse multiple images if it is an array
      deliverables: record.deliverables ? (record.deliverables.startsWith("[") ? JSON.parse(record.deliverables) : record.deliverables) : [],
      bulletPoints: record.bulletPoints ? (record.bulletPoints.startsWith("[") ? JSON.parse(record.bulletPoints) : record.bulletPoints) : [],
    };
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/case-studies", authenticate, async (req, res) => {
  const { Title, description, shortDesc, LongDescription, desc1, desc2, desc3, desc4, desc5, desc6, image, deliverables, bulletPoints } = req.body;
  try {
    const created = await prisma.caseStudy.create({
      data: {
        Title,
        description,
        shortDesc,
        LongDescription,
        desc1,
        desc2,
        desc3,
        desc4,
        desc5,
        desc6,
        image: typeof image === "object" ? JSON.stringify(image) : image,
        deliverables: typeof deliverables === "object" ? JSON.stringify(deliverables) : deliverables,
        bulletPoints: typeof bulletPoints === "object" ? JSON.stringify(bulletPoints) : bulletPoints,
      },
    });
    res.json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/case-studies/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { Title, description, shortDesc, LongDescription, desc1, desc2, desc3, desc4, desc5, desc6, image, deliverables, bulletPoints } = req.body;
  try {
    const updated = await prisma.caseStudy.update({
      where: { id: parseInt(id) },
      data: {
        Title,
        description,
        shortDesc,
        LongDescription,
        desc1,
        desc2,
        desc3,
        desc4,
        desc5,
        desc6,
        image: typeof image === "object" ? JSON.stringify(image) : image,
        deliverables: typeof deliverables === "object" ? JSON.stringify(deliverables) : deliverables,
        bulletPoints: typeof bulletPoints === "object" ? JSON.stringify(bulletPoints) : bulletPoints,
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/case-studies/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.caseStudy.delete({ where: { id: parseInt(id) } });
    await resetSequenceIfEmpty("caseStudy", "CaseStudy");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. UpcomingEvents
app.get("/api/upcoming-events", async (req, res) => {
  try {
    const records = await prisma.upcomingEvents.findMany();
    const formatted = records.map(r => ({
      Id: r.id,
      Title: r.Title,
      description: r.description,
      Date: r.Date,
      Address: r.Address,
      image: r.image && r.image.startsWith("[") ? JSON.parse(r.image) : r.image,
    }));
    res.json({ list: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/upcoming-events", authenticate, async (req, res) => {
  const { Title, description, Date: eventDate, Address, image } = req.body;
  try {
    const created = await prisma.upcomingEvents.create({
      data: {
        Title,
        description,
        Date: eventDate,
        Address,
        image: typeof image === "object" ? JSON.stringify(image) : image,
      },
    });
    res.json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/upcoming-events/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { Title, description, Date: eventDate, Address, image } = req.body;
  try {
    const updated = await prisma.upcomingEvents.update({
      where: { id: parseInt(id) },
      data: {
        Title,
        description,
        Date: eventDate,
        Address,
        image: typeof image === "object" ? JSON.stringify(image) : image,
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/upcoming-events/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.upcomingEvents.delete({ where: { id: parseInt(id) } });
    await resetSequenceIfEmpty("upcomingEvents", "UpcomingEvents");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Banner
app.get("/api/banner", async (req, res) => {
  try {
    let records = await prisma.banner.findMany();
    if (records.length === 0) {
      const defaultBanner = await prisma.banner.create({
        data: {
          Title: "Hero Title",
          heading_line_2: "Hero Subtitle",
          desc: "Hero Description",
          video_url: ""
        }
      });
      records = [defaultBanner];
    }
    res.json({ list: records });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/banner/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { Title, heading_line_2, desc, video_url } = req.body;
  try {
    const updated = await prisma.banner.update({
      where: { id: parseInt(id) },
      data: {
        Title,
        heading_line_2,
        desc,
        video_url,
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Testimonials
app.get("/api/testimonials", async (req, res) => {
  try {
    const records = await prisma.testimonial.findMany();
    const formatted = records.map(r => ({
      Id: r.id,
      id: r.id,
      quote: r.quote,
      author: r.author,
      position: r.position,
      company: r.company,
      trustBadge: r.trustBadge,
      trustTitle: r.trustTitle,
      trustDescription: r.trustDescription,
      reviewCount: r.reviewCount,
      reviewLabel: r.reviewLabel,
      avatars: r.avatars.startsWith("[") ? JSON.parse(r.avatars) : [r.avatars],
    }));
    res.json({ list: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/testimonials", authenticate, async (req, res) => {
  const { quote, author, position, company, trustBadge, trustTitle, trustDescription, reviewCount, reviewLabel, avatars } = req.body;
  try {
    const created = await prisma.testimonial.create({
      data: {
        quote,
        author,
        position,
        company,
        trustBadge,
        trustTitle,
        trustDescription,
        reviewCount,
        reviewLabel,
        avatars: typeof avatars === "object" ? JSON.stringify(avatars) : avatars,
      },
    });
    res.json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/testimonials/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { quote, author, position, company, trustBadge, trustTitle, trustDescription, reviewCount, reviewLabel, avatars } = req.body;
  try {
    const updated = await prisma.testimonial.update({
      where: { id: parseInt(id) },
      data: {
        quote,
        author,
        position,
        company,
        trustBadge,
        trustTitle,
        trustDescription,
        reviewCount,
        reviewLabel,
        avatars: typeof avatars === "object" ? JSON.stringify(avatars) : avatars,
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/testimonials/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.testimonial.delete({ where: { id: parseInt(id) } });
    await resetSequenceIfEmpty("testimonial", "Testimonial");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. ContactInquiry
app.post("/api/contact-inquiries", async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required." });
  }
  try {
    const created = await prisma.contactInquiry.create({
      data: {
        name,
        email,
        subject: subject || "No Subject",
        message,
      },
    });
    res.json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/contact-inquiries", authenticate, async (req, res) => {
  try {
    const records = await prisma.contactInquiry.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ list: records });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/contact-inquiries/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.contactInquiry.delete({ where: { id: parseInt(id) } });
    await resetSequenceIfEmpty("contactInquiry", "ContactInquiry");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. TeamMember Endpoints
app.get("/api/team-members", async (req, res) => {
  try {
    const records = await prisma.teamMember.findMany({
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "asc" }
      ]
    });
    res.json({ list: records });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/team-members", authenticate, async (req, res) => {
  const { name, designation, image, displayOrder } = req.body;
  if (!name || !designation || !image) {
    return res.status(400).json({ error: "Name, designation, and image are required." });
  }
  try {
    const created = await prisma.teamMember.create({
      data: {
        name,
        designation,
        image,
        displayOrder: displayOrder ? parseInt(displayOrder, 10) : 0,
      },
    });
    res.json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/team-members/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { name, designation, image, displayOrder } = req.body;
  try {
    const updated = await prisma.teamMember.update({
      where: { id: parseInt(id) },
      data: {
        name,
        designation,
        image,
        displayOrder: displayOrder !== undefined ? parseInt(displayOrder, 10) : undefined,
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/team-members/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.teamMember.delete({ where: { id: parseInt(id) } });
    await resetSequenceIfEmpty("teamMember", "TeamMember");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static assets from the Vite frontend build folder (dist)
app.use(express.static(path.join(process.cwd(), "dist")));

// Wildcard route to serve React's index.html for clientside routing fallback
app.get("*any", (req, res) => {
  res.sendFile(path.join(process.cwd(), "dist", "index.html"));
});

// Start Server
if (!process.env.VERCEL) {
  const HOST = process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";
  app.listen(PORT, HOST, () => {
    console.log(`✅ Express backend running on http://${HOST}:${PORT}`);
  });
}

export default app;
