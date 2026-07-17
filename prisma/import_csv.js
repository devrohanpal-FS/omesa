import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

function parseCSV(text) {
  const result = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(cell.trim());
        cell = "";
      } else if (char === "\n" || char === "\r") {
        if (char === "\r" && nextChar === "\n") {
          i++;
        }
        row.push(cell.trim());
        result.push(row);
        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }
  }
  if (cell || row.length > 0) {
    row.push(cell.trim());
    result.push(row);
  }
  return result;
}

function extractUrl(val) {
  if (!val) return "";
  const match = val.match(/\((http[s]?:\/\/[^)]+)\)/);
  return match ? match[1] : val;
}

async function main() {
  console.log("🚀 Starting database migration from CSV files...");

  // Helper to find a file with pattern matching (to handle slight timestamp changes)
  const findCsvFile = (prefix) => {
    const files = fs.readdirSync("./src/csvFiles");
    const match = files.find((f) => f.startsWith(prefix) && f.endsWith(".csv"));
    return match ? `./src/csvFiles/${match}` : null;
  };

  // 1. About Us
  const aboutPath = findCsvFile("omesa - AboutUs");
  if (aboutPath && fs.existsSync(aboutPath)) {
    const data = parseCSV(fs.readFileSync(aboutPath, "utf8"));
    const headers = data[0];
    const rows = data.slice(1).filter((r) => r.length > 0 && r[0]);

    console.log(`🧹 Clearing existing AboutUs (found ${rows.length} rows to import)...`);
    await prisma.aboutUs.deleteMany();

    for (const r of rows) {
      const Heding = r[headers.indexOf("Heding")] || "";
      const Description = r[headers.indexOf("Description")] || "";
      const CTA = r[headers.indexOf("CTA")] || null;
      const experience = parseInt(r[headers.indexOf("experience")] || "0", 10);
      const project = parseInt(r[headers.indexOf("project")] || "0", 10);
      const satisfaction = parseInt(r[headers.indexOf("satisfaction")] || "0", 10);

      await prisma.aboutUs.create({
        data: {
          Heding,
          Description,
          CTA,
          experience,
          project,
          satisfaction,
        },
      });
    }
    console.log("✅ AboutUs imported successfully!");
  } else {
    console.log("⚠️ AboutUs CSV file not found.");
  }

  // 2. Banner
  const bannerPath = findCsvFile("omesa - banner");
  if (bannerPath && fs.existsSync(bannerPath)) {
    const data = parseCSV(fs.readFileSync(bannerPath, "utf8"));
    const headers = data[0];
    const rows = data.slice(1).filter((r) => r.length > 0 && r[0]);

    console.log(`🧹 Clearing existing Banner (found ${rows.length} rows to import)...`);
    await prisma.banner.deleteMany();

    for (const r of rows) {
      const Title = r[headers.indexOf("Title")] || "";
      const desc = r[headers.indexOf("desc")] || "";

      // Seed required missing fields with defaults
      const heading_line_2 = "WE CREATE UNIQUE ";
      const video_url = "/BannerVideo/BannerVideo.mp4";

      await prisma.banner.create({
        data: {
          Title,
          desc,
          heading_line_2,
          video_url,
        },
      });
    }
    console.log("✅ Banner imported successfully!");
  } else {
    console.log("⚠️ Banner CSV file not found.");
  }

  // 3. Services
  const servicesPath = findCsvFile("omesa - services");
  if (servicesPath && fs.existsSync(servicesPath)) {
    const data = parseCSV(fs.readFileSync(servicesPath, "utf8"));
    const headers = data[0];
    const rows = data.slice(1).filter((r) => r.length > 0 && r[0]);

    console.log(`🧹 Clearing existing Services (found ${rows.length} rows to import)...`);
    await prisma.services.deleteMany();

    for (const r of rows) {
      const Number = r[headers.indexOf("Number")] || "";
      const title = r[headers.indexOf("title")] || "";
      const description = r[headers.indexOf("description")] || "";
      const Long_Description = r[headers.indexOf("Long_Description")] || "";
      const OneLiner = r[headers.indexOf("OneLiner")] || "";
      const Related_services = r[headers.indexOf("Related_services")] || null;
      const Attachments = extractUrl(r[headers.indexOf("Attachments")] || "");
      const DateStr = r[headers.indexOf("Date")] || null;

      await prisma.services.create({
        data: {
          Number,
          title,
          description,
          Long_Description,
          OneLiner,
          Related_services,
          Attachments,
          Date: DateStr,
        },
      });
    }
    console.log("✅ Services imported successfully!");
  } else {
    console.log("⚠️ Services CSV file not found.");
  }

  // 4. Clients Logo
  const clientsLogoPath = findCsvFile("omesa - clientsLogo");
  if (clientsLogoPath && fs.existsSync(clientsLogoPath)) {
    const data = parseCSV(fs.readFileSync(clientsLogoPath, "utf8"));
    const headers = data[0];
    const rows = data.slice(1).filter((r) => r.length > 0 && r[0]);

    console.log(`🧹 Clearing existing ClientsLogo (found ${rows.length} rows to import)...`);
    await prisma.clientsLogo.deleteMany();

    for (const r of rows) {
      const logoname = r[headers.indexOf("logoname")] || "";
      const logoImage = extractUrl(r[headers.indexOf("logoImage")] || "");
      await prisma.clientsLogo.create({
        data: {
          logoname,
          logoImage,
        },
      });
    }
    console.log("✅ ClientsLogo imported successfully!");
  } else {
    console.log("⚠️ ClientsLogo CSV file not found.");
  }

  // 5. Portfolio Tiles
  const portfolioPath = findCsvFile("omesa - portfolioTiles");
  if (portfolioPath && fs.existsSync(portfolioPath)) {
    const data = parseCSV(fs.readFileSync(portfolioPath, "utf8"));
    const headers = data[0];
    const rows = data.slice(1).filter((r) => r.length > 0 && r[0]);

    console.log(`🧹 Clearing existing PortfolioTiles (found ${rows.length} rows to import)...`);
    await prisma.portfolioTiles.deleteMany();

    for (const r of rows) {
      const Title = r[headers.indexOf("Title")] || "";
      const description = r[headers.indexOf("description")] || "";
      const images = extractUrl(r[headers.indexOf("images")] || "");
      const category = r[headers.indexOf("category")] || "";
      const longdescription = r[headers.indexOf("longdescription")] || "";
      const date = r[headers.indexOf("date")] || null;

      await prisma.portfolioTiles.create({
        data: {
          Title,
          description,
          images,
          category,
          longdescription,
          date,
        },
      });
    }
    console.log("✅ PortfolioTiles imported successfully!");
  } else {
    console.log("⚠️ PortfolioTiles CSV file not found.");
  }

  // 6. Case Studies
  const casePath = findCsvFile("omesa - caseStudy");
  if (casePath && fs.existsSync(casePath)) {
    const data = parseCSV(fs.readFileSync(casePath, "utf8"));
    const headers = data[0];
    const rows = data.slice(1).filter((r) => r.length > 0 && r[0]);

    console.log(`🧹 Clearing existing CaseStudy (found ${rows.length} rows to import)...`);
    await prisma.caseStudy.deleteMany();

    for (const r of rows) {
      const Title = r[headers.indexOf("Title")] || "";
      const description = r[headers.indexOf("description")] || "";
      const shortDesc = r[headers.indexOf("shortDesc")] || "";
      const desc1 = r[headers.indexOf("desc1")] || null;
      const desc2 = r[headers.indexOf("desc2")] || null;
      const desc3 = r[headers.indexOf("desc3")] || null;
      const desc4 = r[headers.indexOf("desc4")] || null;
      const desc5 = r[headers.indexOf("desc5")] || null;
      const desc6 = r[headers.indexOf("desc6")] || null;
      const image = extractUrl(r[headers.indexOf("image")] || "");

      const nonNullDescs = [desc1, desc2, desc3, desc4, desc5, desc6].filter(Boolean);
      const LongDescription = nonNullDescs.join("\n\n") || description;

      await prisma.caseStudy.create({
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
          image,
        },
      });
    }
    console.log("✅ CaseStudy imported successfully!");
  } else {
    console.log("⚠️ CaseStudy CSV file not found.");
  }

  // 7. Upcoming Events
  const eventsPath = findCsvFile("omesa - UpcomingEvents");
  if (eventsPath && fs.existsSync(eventsPath)) {
    const data = parseCSV(fs.readFileSync(eventsPath, "utf8"));
    const headers = data[0];
    const rows = data.slice(1).filter((r) => r.length > 0 && r[0]);

    console.log(`🧹 Clearing existing UpcomingEvents (found ${rows.length} rows to import)...`);
    await prisma.upcomingEvents.deleteMany();

    for (const r of rows) {
      const Title = r[headers.indexOf("Title")] || "";
      const description = r[headers.indexOf("description")] || "";
      const DateStr = r[headers.indexOf("Date")] || null;
      const Address = r[headers.indexOf("Address")] || "";
      const image = extractUrl(r[headers.indexOf("Image")] || "");

      await prisma.upcomingEvents.create({
        data: {
          Title,
          description,
          Date: DateStr,
          Address,
          image,
        },
      });
    }
    console.log("✅ UpcomingEvents imported successfully!");
  } else {
    console.log("⚠️ UpcomingEvents CSV file not found.");
  }

  console.log("🎉 All data CSV records successfully migrated into the local SQLite database!");
}

main()
  .catch((e) => {
    console.error("❌ Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
