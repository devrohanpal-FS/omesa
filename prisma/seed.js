import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create Admin User
  const adminEmail = "admin@omesa.in";
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash("AdminPassword123", 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
      },
    });
    console.log("✅ Admin user created: admin@omesa.in / AdminPassword123");
  }

  // 2. Seed AboutUs
  const aboutCount = await prisma.aboutUs.count();
  if (aboutCount === 0) {
    await prisma.aboutUs.create({
      data: {
        Heding: "Omesa Marketing is where strategy meets experience.",
        Description: "We're a boutique experiential marketing and design consultancy specializing in creating immersive brand ecosystems. From concept to execution, we translate complex visions into memorable three-dimensional physical and digital experiences that engage audiences, trigger emotions, and drive business impact.",
        CTA: "https://airtable.com/account",
        experience: 30,
        project: 400,
        satisfaction: 100,
      },
    });
    console.log("✅ AboutUs seeded");
  }

  // 3. Seed ClientsLogo
  const clientsCount = await prisma.clientsLogo.count();
  if (clientsCount === 0) {
    const logos = [
      { logoname: "logo14", logoImage: JSON.stringify([{ url: "https://kit.wof-pack.com/sirion/wp-content/uploads/sites/6/2025/02/developers-searching-for-bugs-1024x682.jpg" }]) },
      { logoname: "logo15", logoImage: JSON.stringify([{ url: "https://kit.wof-pack.com/sirion/wp-content/uploads/sites/6/2025/02/developers-searching-for-bugs-1024x682.jpg" }]) },
      { logoname: "logo16", logoImage: JSON.stringify([{ url: "https://kit.wof-pack.com/sirion/wp-content/uploads/sites/6/2025/02/developers-searching-for-bugs-1024x682.jpg" }]) },
      { logoname: "logo17", logoImage: JSON.stringify([{ url: "https://kit.wof-pack.com/sirion/wp-content/uploads/sites/6/2025/02/developers-searching-for-bugs-1024x682.jpg" }]) },
      { logoname: "logo18", logoImage: JSON.stringify([{ url: "https://kit.wof-pack.com/sirion/wp-content/uploads/sites/6/2025/02/developers-searching-for-bugs-1024x682.jpg" }]) },
    ];
    for (const l of logos) {
      await prisma.clientsLogo.create({ data: l });
    }
    console.log("✅ ClientsLogo seeded");
  }

  // 4. Seed PortfolioTiles
  const portfolioCount = await prisma.portfolioTiles.count();
  if (portfolioCount === 0) {
    const portfolios = [
      {
        Title: "GAIL",
        description: "Designing presence with a green message.",
        images: JSON.stringify([{ signedUrl: "https://kit.wof-pack.com/sirion/wp-content/uploads/sites/6/2025/02/developers-searching-for-bugs-1024x682.jpg" }]),
        category: "Exhibition Design & Turnkey Solutions",
        longdescription: "Designing presence with a green message at major energy summits.",
        date: "2025-07-16",
      },
      {
        Title: "GAIL METRO",
        description: "At India Energy Week 2026.",
        images: JSON.stringify([{ signedUrl: "https://kit.wof-pack.com/sirion/wp-content/uploads/sites/6/2025/02/developers-searching-for-bugs-1024x682.jpg" }]),
        category: "Exhibition Design & Turnkey Solutions",
        longdescription: "Ever paused at a metro station to admire its architecture? We brought that scale to IEW 2026.",
        date: "2026-07-16",
      },
      {
        Title: "GREENKO",
        description: "What does green innovation look like?",
        images: JSON.stringify([{ signedUrl: "https://kit.wof-pack.com/sirion/wp-content/uploads/sites/6/2025/02/developers-searching-for-bugs-1024x682.jpg" }]),
        category: "Events, Conferences & Hospitality",
        longdescription: "What does green innovation look like? Immersive, educational, and clean energy focused.",
        date: "2025-09-02",
      },
      {
        Title: "LT FOODS",
        description: "The rebranding of LT Foods.",
        images: JSON.stringify([{ signedUrl: "https://kit.wof-pack.com/sirion/wp-content/uploads/sites/6/2025/02/developers-searching-for-bugs-1024x682.jpg" }]),
        category: "Murals & Installations",
        longdescription: "The rebranding of LT Foods exhibition booth.",
        date: "2025-09-01",
      },
    ];
    for (const p of portfolios) {
      await prisma.portfolioTiles.create({ data: p });
    }
    console.log("✅ PortfolioTiles seeded");
  }

  // 5. Seed Services
  const servicesCount = await prisma.services.count();
  if (servicesCount === 0) {
    const services = [
      {
        Number: "1",
        title: "Advertising & Brand Consulting",
        description: "We craft compelling advertising campaigns and consult on brand strategy to build strong market positioning.",
        Long_Description: "Great brands don't shout; they connect. Our strategic consultants help define your brand narrative, design your corporate identity, and structure communication plans that align with your long-term vision.",
        OneLiner: "Shaping Perception, One Strategy at a Time",
        Related_services: "Brand Identity Design\nMarket Analysis\nPositioning Strategy",
        Attachments: JSON.stringify([{ url: "https://kit.wof-pack.com/sirion/wp-content/uploads/sites/6/2025/02/developers-searching-for-bugs-1024x682.jpg" }]),
        Date: "08/09/2025",
      },
      {
        Number: "2",
        title: "Exhibition Design & Turnkey Solutions",
        description: "From creative concepts to turnkey implementation, we create stunning exhibition spaces.",
        Long_Description: "In an environment where attention is the ultimate currency, we build pavilions and display booths that command attention. We offer 3D conceptualization, structural engineering, and end-to-end site execution.",
        OneLiner: "Where Design Meets Experiential Execution",
        Related_services: "Custom Booth Fabrications\n3D Pavilions\nTurnkey Project Management",
        Attachments: JSON.stringify([{ url: "https://kit.wof-pack.com/sirion/wp-content/uploads/sites/6/2025/02/developers-searching-for-bugs-1024x682.jpg" }]),
        Date: "07/09/2025",
      },
      {
        Number: "3",
        title: "Events, Conferences & Hospitality",
        description: "We plan and manage corporate events, high-profile conferences, and hospitality experiences.",
        Long_Description: "Every event tells a story. We ensure yours is unforgettable. We manage delegate hosting, tech infrastructure, stage set-ups, and post-event analysis.",
        OneLiner: "More Than Just a Gathering. An Event.",
        Related_services: "Corporate Conferences\nLive Concerts\nHospitality Management",
        Attachments: JSON.stringify([{ url: "https://kit.wof-pack.com/sirion/wp-content/uploads/sites/6/2025/02/developers-searching-for-bugs-1024x682.jpg" }]),
        Date: "06/09/2025",
      },
      {
        Number: "4",
        title: "Murals & Installations",
        description: "We design and execute visual murals and physical installations that activate public and private spaces.",
        Long_Description: "Some messages don't belong on screens; they belong on walls and structural frameworks. Our artists and designers map spatial visuals that trigger curiosity and frame identity.",
        OneLiner: "Spaces That Speak Without Words",
        Related_services: "Custom Mural Painting\nKinetic Sculptures\nPublic Space Installations",
        Attachments: JSON.stringify([{ url: "https://kit.wof-pack.com/sirion/wp-content/uploads/sites/6/2025/02/developers-searching-for-bugs-1024x682.jpg" }]),
        Date: "05/09/2025",
      },
      {
        Number: "5",
        title: "Digital & Media Production",
        description: "From videos to digital assets, we produce high-impact media production.",
        Long_Description: "Digital content is more than just bytes; it's visual poetry. We film, animate, compose, and deliver high-definition showreels, social cuts, and branding films.",
        OneLiner: "Designed to Engage. Built to Resonate.",
        Related_services: "Brand Films & Corporate Video\n3D Motion Graphics\nShowreel Development",
        Attachments: JSON.stringify([{ url: "https://kit.wof-pack.com/sirion/wp-content/uploads/sites/6/2025/02/developers-searching-for-bugs-1024x682.jpg" }]),
        Date: "04/09/2025",
      },
      {
        Number: "6",
        title: "Interactive Exhibits & Displays",
        description: "We create innovative, tech-enabled interactive exhibits and custom display modules.",
        Long_Description: "In today's fast-moving world, simple displays are not enough. We merge AR, VR, sensors, and projection mapping with tactile physical materials to create engaging interfaces.",
        OneLiner: "Designed to Be Touched, Recalled, and Shared",
        Related_services: "Touchscreen Displays & Interfaces\nProjection Mapping\nAR & VR Activations",
        Attachments: JSON.stringify([{ url: "https://kit.wof-pack.com/sirion/wp-content/uploads/sites/6/2025/02/developers-searching-for-bugs-1024x682.jpg" }]),
        Date: "03/09/2025",
      },
      {
        Number: "7",
        title: "Omesa Arts",
        description: "We bring art to life in all its dimensions, providing unique art curation and artistic installations.",
        Long_Description: "Some ideas are too profound to fit standard definitions. Under Omesa Arts, we collaborate with fine artists, painters, and sculptors to craft bespoke, non-commercial pieces.",
        OneLiner: "Where Art Meets Space, and Space Meets Soul",
        Related_services: "Fine Art Curation\nBespoke Paintings\nArt Consultation",
        Attachments: JSON.stringify([{ url: "https://kit.wof-pack.com/sirion/wp-content/uploads/sites/6/2025/02/developers-searching-for-bugs-1024x682.jpg" }]),
        Date: "02/09/2025",
      },
    ];
    for (const s of services) {
      await prisma.services.create({ data: s });
    }
    console.log("✅ Services seeded");
  }

  // 6. Seed CaseStudy
  const caseCount = await prisma.caseStudy.count();
  if (caseCount === 0) {
    await prisma.caseStudy.create({
      data: {
        Title: "Immersive Retail Design for Omesa Labs",
        description: "A showcase of branding, architectural setup, and visual mapping that transformed retail engagement.",
        shortDesc: "Transforming brand strategy into an immersive sensory-rich store setup.",
        LongDescription: "Immersive Retail Design for Omesa Labs focused on creating physical touchpoints that bridge digital platforms with brick-and-mortar storefronts.",
        desc1: "Designed layout and customer journey to increase dwell times.",
        desc2: "Integrated physical kiosks with digital inventories.",
        image: "https://kit.wof-pack.com/sirion/wp-content/uploads/sites/6/2025/02/developers-searching-for-bugs-1024x682.jpg",
      },
    });
    console.log("✅ CaseStudy seeded");
  }

  // 7. Seed UpcomingEvents
  const eventsCount = await prisma.upcomingEvents.count();
  if (eventsCount === 0) {
    await prisma.upcomingEvents.create({
      data: {
        Title: "National Branding Expo 2026",
        description: "A massive event showcasing the future of design and marketing strategies across South Asia.",
        Date: "2026-09-15",
        Address: "Pragati Maidan, New Delhi",
        image: "https://kit.wof-pack.com/sirion/wp-content/uploads/sites/6/2025/02/developers-searching-for-bugs-1024x682.jpg",
      },
    });
    console.log("✅ UpcomingEvents seeded");
  }

  // 8. Seed Banner
  const bannerCount = await prisma.banner.count();
  if (bannerCount === 0) {
    await prisma.banner.create({
      data: {
        Title: "OMESA",
        heading_line_2: "WE CREATE UNIQUE ",
        desc: "We design and execute immersive experiences, exhibition pavilions, and brand activations that translate complex visions into memorable engagements.",
        video_url: "/BannerVideo/BannerVideo.mp4",
      },
    });
    console.log("✅ Banner seeded");
  }

  // 9. Seed Testimonials
  const testimonialsCount = await prisma.testimonial.count();
  if (testimonialsCount === 0) {
    const testimonials = [
      {
        quote: "Omesa transformed our pavilion at India Energy Week into a vibrant, interactive space that truly reflected GAIL’s commitment to innovation and sustainability. Visitors were impressed, and so were we.",
        author: "S. R. Gupta",
        position: "General Manager – Marketing",
        company: "GAIL (India) Ltd",
        trustBadge: "TRUSTED AGENCY",
        trustTitle: "Trusted by the industry leaders.",
        trustDescription: "We create immersive spaces that leave lasting impressions for brands across industries.",
        reviewCount: "12K+",
        reviewLabel: "Reviews",
        avatars: JSON.stringify(["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]),
      },
      {
        quote: "The LT Foods booth at World Food India felt less like an exhibit and more like a living brand experience. Omesa’s attention to detail and storytelling approach set a new benchmark for us.",
        author: "Rohit Anand",
        position: "Head of Branding",
        company: "LT Foods",
        trustBadge: "AWARD WINNING",
        trustTitle: "Recognized for excellence worldwide.",
        trustDescription: "Our design and branding solutions consistently set new benchmarks at global events.",
        reviewCount: "95 K+",
        reviewLabel: "Happy Clients",
        avatars: JSON.stringify(["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]),
      },
      {
        quote: "At Gastech, Omesa gave Greenko a global-ready presence. The design was bold yet minimal, creating a perfect backdrop for engaging conversations with international delegates.",
        author: "Arjun Reddy",
        position: "Director – Corporate Communications",
        company: "Greenko Group",
        trustBadge: "INDUSTRY LEADER",
        trustTitle: "Setting new standards in design.",
        trustDescription: "We deliver bold yet minimal design solutions that stand out in competitive spaces.",
        reviewCount: "200 K+",
        reviewLabel: "Projects",
        avatars: JSON.stringify(["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]),
      },
    ];
    for (const t of testimonials) {
      await prisma.testimonial.create({ data: t });
    }
    console.log("✅ Testimonials seeded");
  }

  console.log("🌱 Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
