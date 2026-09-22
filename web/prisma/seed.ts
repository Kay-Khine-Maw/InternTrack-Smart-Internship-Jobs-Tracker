import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "nway@interntrack.local" },
    update: {},
    create: {
      id: "demo-user-nway",
      email: "nway@interntrack.local",
      name: "Nway",
    },
  });

  await prisma.$executeRawUnsafe(
    `INSERT INTO "Profile" (id, "userId", "displayName", major, year, bio, university, email, location, "preferredFields", "preferredLocation", skills, tools, "createdAt", "updatedAt")
     VALUES ('demo-profile-nway', $1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11::jsonb, $12::jsonb, NOW(), NOW())
     ON CONFLICT ("userId") DO NOTHING`,
    user.id,
    "Nway Ei Hlaing",
    "Computer Engineering",
    "3rd Year",
    "Computer Engineering student passionate about building impactful technology. Seeking internships in software engineering and product development.",
    "Chulalongkorn University",
    "nway.ei@student.chula.ac.th",
    "Bangkok, Thailand",
    JSON.stringify(["Software Engineering", "Full-Stack Development", "Machine Learning"]),
    "Bangkok, Thailand",
    JSON.stringify(["Java", "Python", "React"]),
    JSON.stringify(["Git", "Figma", "VS Code"])
  );

  await prisma.document.deleteMany();
  await prisma.internship.deleteMany({ where: { userId: user.id } });

  const tag = async (name: string) =>
    prisma.tag.upsert({ where: { name }, create: { name }, update: {} });

  const faang = await tag("FAANG");
  const software = await tag("Software");
  const remote = await tag("Remote");
  const travel = await tag("Travel");
  const backend = await tag("Backend");
  const cloud = await tag("Cloud");
  const interview = await tag("Interview");
  const product = await tag("Product");

  await prisma.internship.create({
    data: {
      companyName: "Google",
      position: "Software Engineering Intern",
      location: "Bangkok / Remote",
      deadline: new Date("2026-09-27"),
      description: "Build products used by billions. Focus on coding interviews and a tailored resume.",
      requirements: ["Data structures", "Algorithms", "Communication"],
      skills: ["Python", "Java", "TypeScript"],
      applicationUrl: "https://careers.google.com/jobs/results/software-engineering-intern",
      sourceUrl: "https://careers.google.com/jobs/results/software-engineering-intern",
      status: "PREPARING",
      priority: "HIGH",
      notes: "Focus on coding interviews and a concise resume tailored to Google.",
      userId: user.id,
      tags: { connect: [{ id: faang.id }, { id: software.id }, { id: remote.id }] },
      documents: {
        create: [
          { name: "Resume", completed: true },
          { name: "Transcript", completed: false },
          { name: "Portfolio", completed: false },
          { name: "Cover Letter", completed: true },
        ],
      },
    },
  });

  await prisma.internship.create({
    data: {
      companyName: "Agoda",
      position: "Software Developer Intern",
      location: "Bangkok, Thailand",
      deadline: new Date("2026-10-04"),
      description: "Work on travel marketplace backend services in Bangkok.",
      requirements: ["REST APIs", "SQL"],
      skills: ["C#", "TypeScript"],
      applicationUrl: "https://careers.agoda.com/jobs/software-developer-intern",
      sourceUrl: "https://careers.agoda.com/jobs/software-developer-intern",
      status: "SAVED",
      priority: "MEDIUM",
      notes: "Review backend case studies and company product notes.",
      userId: user.id,
      tags: { connect: [{ id: travel.id }, { id: backend.id }] },
      documents: {
        create: [
          { name: "Resume", completed: true },
          { name: "Transcript", completed: true },
          { name: "Portfolio", completed: false },
          { name: "Cover Letter", completed: false },
        ],
      },
    },
  });

  await prisma.internship.create({
    data: {
      companyName: "Microsoft",
      position: "Software Engineering Intern",
      location: "Singapore / Hybrid",
      deadline: new Date("2026-10-12"),
      description: "Collaborate on cloud products with an Azure-focused internship.",
      requirements: ["System design basics", "Teamwork"],
      skills: ["C#", "Azure"],
      applicationUrl: "https://careers.microsoft.com/us/en/job/software-engineering-intern",
      sourceUrl: "https://careers.microsoft.com/us/en/job/software-engineering-intern",
      status: "INTERVIEW",
      priority: "HIGH",
      notes: "Prepare system design stories and Azure project talking points.",
      applicationDate: new Date("2026-09-05"),
      followUpDate: new Date("2026-09-12"),
      interviewDate: new Date("2026-09-28"),
      interviewTime: "14:00",
      interviewLink: "https://teams.microsoft.com/l/meetup-join/demo",
      preparationNotes: "Review C#/TypeScript projects and behavioral STAR stories.",
      userId: user.id,
      tags: { connect: [{ id: cloud.id }, { id: interview.id }] },
      documents: {
        create: [
          { name: "Resume", completed: true },
          { name: "Transcript", completed: true },
          { name: "Portfolio", completed: true },
          { name: "Cover Letter", completed: true },
        ],
      },
    },
  });

  await prisma.internship.create({
    data: {
      companyName: "Shopee",
      position: "Product Management Intern",
      location: "Bangkok, Thailand",
      deadline: new Date("2026-10-20"),
      description: "Support product discovery for Shopee Live and related marketplace features.",
      requirements: ["Product sense", "Stakeholder communication"],
      skills: ["SQL", "Figma"],
      applicationUrl: "https://careers.shopee.com/job/product-management-intern",
      sourceUrl: "https://careers.shopee.com/job/product-management-intern",
      status: "APPLIED",
      priority: "MEDIUM",
      notes: "Submitted application with a product teardown of Shopee Live.",
      applicationDate: new Date("2026-09-18"),
      followUpDate: new Date("2026-09-25"),
      userId: user.id,
      tags: { connect: [{ id: product.id }] },
      documents: {
        create: [
          { name: "Resume", completed: true },
          { name: "Transcript", completed: true },
          { name: "Portfolio", completed: true },
          { name: "Cover Letter", completed: false },
        ],
      },
    },
  });

  console.log("Seeded demo user and internships.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
