import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const directoryPath = "./public/clients/01 color";
  console.log(`📁 Reading logos from: ${directoryPath}`);
  
  if (!fs.existsSync(directoryPath)) {
    console.error(`❌ Directory ${directoryPath} does not exist.`);
    process.exit(1);
  }

  const files = fs.readdirSync(directoryPath);
  const logoFiles = files.filter(f => !f.startsWith("."));
  
  console.log(`🔍 Found ${logoFiles.length} clean logo files.`);
  
  let insertedCount = 0;
  let skippedCount = 0;
  
  for (const filename of logoFiles) {
    const ext = path.extname(filename);
    const logoname = path.basename(filename, ext);
    const relativeUrl = `/clients/01 color/${filename}`;
    
    // Check if duplicate exists
    const existing = await prisma.clientsLogo.findFirst({
      where: {
        logoname: logoname
      }
    });
    
    if (existing) {
      console.log(`⚠️ Logo already exists, skipping: ${logoname}`);
      skippedCount++;
      continue;
    }
    
    // Create new record
    await prisma.clientsLogo.create({
      data: {
        logoname: logoname,
        logoImage: JSON.stringify([{ url: relativeUrl }])
      }
    });
    
    console.log(`✅ Imported: ${logoname} -> ${relativeUrl}`);
    insertedCount++;
  }
  
  console.log(`\n🎉 Import finished. Inserted: ${insertedCount}, Skipped: ${skippedCount}`);
}

main()
  .catch(e => {
    console.error("❌ Import error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
