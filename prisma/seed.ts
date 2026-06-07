import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const isProd = process.env.NODE_ENV === "production";
const generated: Record<string, string> = {};

/**
 * Resolve a seed password. Prefer an env-provided value. Otherwise generate a
 * strong random one (and remember it to print once). In production, never fall
 * back to a weak/default password — require it to be set explicitly.
 */
function seedPassword(envVar: string, label: string): string {
  const fromEnv = process.env[envVar];
  if (fromEnv && fromEnv.length >= 8) return fromEnv;
  if (isProd) {
    throw new Error(`${envVar} must be set (min 8 chars) when seeding in production`);
  }
  const pwd = crypto.randomBytes(12).toString("base64url");
  generated[label] = pwd;
  return pwd;
}

async function main() {
  console.log("🌱 Seeding database...");

  // Admin user
  const adminHash = await bcrypt.hash(seedPassword("SEED_ADMIN_PASSWORD", "Admin"), 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@zahrat-alhayat.com" },
    update: {},
    create: {
      name: "مدير النظام",
      email: "admin@zahrat-alhayat.com",
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
  });
  console.log("✅ Admin created:", admin.email);

  // Teacher user
  const teacherHash = await bcrypt.hash(seedPassword("SEED_TEACHER_PASSWORD", "Teacher"), 12);
  const teacher = await prisma.user.upsert({
    where: { email: "reem@zahrat-alhayat.com" },
    update: {},
    create: {
      name: "د. ريم الحايك",
      email: "reem@zahrat-alhayat.com",
      passwordHash: teacherHash,
      role: Role.TEACHER,
    },
  });

  const teacherProfile = await prisma.teacherProfile.upsert({
    where: { userId: teacher.id },
    update: {},
    create: {
      userId: teacher.id,
      bioAr: "أخصائية في التنمية البشرية ومالكة مركز زهرة الحياة في السويداء. حاصلة على الدكتوراه من جامعة إنتل في بريطانيا.",
      bioEn: "Human development specialist and owner of Zahrat Al Hayat Center. PhD from Intel University in the UK.",
      specialties: ["التنمية البشرية", "الوعي الذاتي", "اليوغا العلاجية"],
      hourlyRate: 50,
      currency: "USD",
    },
  });

  // Set availability: Sun-Thu 9am-5pm, 60-min slots
  const workDays = [0, 1, 2, 3, 4]; // Sun-Thu
  for (const day of workDays) {
    await prisma.availability.upsert({
      where: { id: `avail-${teacherProfile.id}-${day}` },
      update: {},
      create: {
        id: `avail-${teacherProfile.id}-${day}`,
        teacherId: teacherProfile.id,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "17:00",
        slotDuration: 60,
      },
    });
  }
  console.log("✅ Teacher + availability created:", teacher.email);

  // Student user
  const studentHash = await bcrypt.hash(seedPassword("SEED_STUDENT_PASSWORD", "Student"), 12);
  const student = await prisma.user.upsert({
    where: { email: "student@example.com" },
    update: {},
    create: {
      name: "طالب تجريبي",
      email: "student@example.com",
      passwordHash: studentHash,
      role: Role.STUDENT,
    },
  });
  console.log("✅ Student created:", student.email);

  // Content blocks (landing page sections)
  const contentBlocks = [
    // Hero
    { key: "hero_title", section: "hero", valueAr: "مركز زهرة الحياة", valueEn: "Zahrat Al Hayat Center", sortOrder: 1 },
    { key: "hero_subtitle", section: "hero", valueAr: "رحلة نحو التوازن والشفاء الداخلي", valueEn: "A Journey Towards Balance and Inner Healing", sortOrder: 2 },
    { key: "hero_description", section: "hero", valueAr: "نقدم لك بيئة آمنة وداعمة لاستكشاف أعماق ذاتك وتحقيق توازن حقيقي على جميع المستويات", valueEn: "We provide a safe and supportive environment to explore your inner self and achieve true balance", sortOrder: 3 },
    { key: "hero_bg_image", section: "hero", valueAr: "", valueEn: "", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_vGlgUhOWEboPG5KW4yf-TPSubaIb0Dd33XcXIAOvonJ51JmO9xleDubPFJD-usEfazdBq6ccKxhyNznWsc-Gh1KwGoN-Ted2J68-_dycG8U6PKAxdhnLOnIC7E-5VGLQWKlnfc_aFF-skgKu_IpwmPPazlgVUIwoZSTcpazVZxl8HduDcQnGb2O6EiZ9DCefMjeo96vYjJBdtL7GCAq0B3PsnjfaAz-080El7B6evqv_4kLIjUrdt0wOzSheFcVG62onq1A3Krk", sortOrder: 4 },
    // About
    { key: "about_title", section: "about", valueAr: "مكان للشفاء والتحول", valueEn: "A Place for Healing and Transformation", sortOrder: 1 },
    { key: "about_description", section: "about", valueAr: "مركز زهرة الحياة هو مساحة مقدسة مخصصة لرحلة الشفاء الداخلي والتطور الشخصي.", valueEn: "Zahrat Al Hayat Center is a sacred space dedicated to inner healing and personal growth.", sortOrder: 2 },
    // Services
    { key: "service_1_title", section: "services", valueAr: "دورات تدريبية تخصصية", valueEn: "Specialized Training Courses", sortOrder: 1 },
    { key: "service_1_desc", section: "services", valueAr: "برامج تعليمية مكثفة في مجالات التنمية البشرية والوعي الطاقي.", valueEn: "Intensive educational programs in human development and energy awareness.", sortOrder: 2 },
    { key: "service_2_title", section: "services", valueAr: "ورش عمل تطبيقية", valueEn: "Applied Workshops", sortOrder: 3 },
    { key: "service_2_desc", section: "services", valueAr: "تطبيقات عملية لتقنيات التنفس، الاسترخاء والتأمل العميق.", valueEn: "Practical applications of breathing, relaxation, and deep meditation techniques.", sortOrder: 4 },
    { key: "service_3_title", section: "services", valueAr: "جلسات فردية وجماعية", valueEn: "Individual & Group Sessions", sortOrder: 5 },
    { key: "service_3_desc", section: "services", valueAr: "تأمل، تنفس، وتنويم إيحائي في بيئة هادئة وداعمة.", valueEn: "Meditation, breathing, and hypnotherapy in a calm and supportive environment.", sortOrder: 6 },
    { key: "service_4_title", section: "services", valueAr: "اليوغا العلاجية", valueEn: "Therapeutic Yoga", sortOrder: 7 },
    { key: "service_4_desc", section: "services", valueAr: "مستويات اليوغا كاملة بالإضافة لليوغا العلاجية للجسد والروح.", valueEn: "Complete yoga levels plus therapeutic yoga for body and soul.", sortOrder: 8 },
    // Founder
    { key: "founder_name", section: "founder", valueAr: "د. ريم الحايك", valueEn: "Dr. Reem Al Hayek", sortOrder: 1 },
    { key: "founder_credential_1", section: "founder", valueAr: "أخصائية في التنمية البشرية ومالكة مركز زهرة الحياة في السويداء.", valueEn: "Human development specialist and owner of Zahrat Al Hayat Center in Sweida.", sortOrder: 2 },
    { key: "founder_credential_2", section: "founder", valueAr: "حاصلة على الدكتوراه من جامعة إنتل (Intel University) في بريطانيا.", valueEn: "PhD from Intel University in the United Kingdom.", sortOrder: 3 },
    // Footer
    { key: "footer_description", section: "footer", valueAr: "مركز تدريبي متخصص في التنمية البشرية والوعي الذاتي.", valueEn: "A specialized training center for human development and self-awareness.", sortOrder: 1 },
    { key: "footer_email", section: "footer", valueAr: "contact@zahrat-alhayat.com", valueEn: "contact@zahrat-alhayat.com", sortOrder: 2 },
    { key: "footer_location", section: "footer", valueAr: "السويداء، سوريا", valueEn: "Sweida, Syria", sortOrder: 3 },
  ];

  for (const block of contentBlocks) {
    await prisma.contentBlock.upsert({
      where: { key: block.key },
      update: { valueAr: block.valueAr, valueEn: block.valueEn },
      create: block,
    });
  }
  console.log("✅ Content blocks seeded");

  console.log("\n🎉 Seed complete!\n");
  if (Object.keys(generated).length > 0) {
    console.log("Generated passwords (shown once — store them securely):");
    if (generated.Admin) console.log(`  Admin:   admin@zahrat-alhayat.com / ${generated.Admin}`);
    if (generated.Teacher) console.log(`  Teacher: reem@zahrat-alhayat.com / ${generated.Teacher}`);
    if (generated.Student) console.log(`  Student: student@example.com / ${generated.Student}`);
    console.log("\nSet SEED_ADMIN_PASSWORD / SEED_TEACHER_PASSWORD / SEED_STUDENT_PASSWORD to choose your own.");
  } else {
    console.log("Seeded with passwords from SEED_*_PASSWORD environment variables.");
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
