import { z } from "zod";

// --- Reusable primitives ---

export const ROLES = ["ADMIN", "TEACHER", "STUDENT"] as const;
export const roleSchema = z.enum(ROLES);

export const APPOINTMENT_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
] as const;

/** Strong password: 8+ chars with upper, lower and a digit. */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number");

export const emailSchema = z.string().email().max(254);

const shortText = z.string().max(200);
const longText = z.string().max(20_000);
const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be HH:MM");

/**
 * URL that must be http(s) or a site-relative path (e.g. /uploads/x.jpg).
 * Blocks javascript:, data:, and other dangerous schemes.
 */
const urlOrPath = z
  .string()
  .max(2048)
  .refine(
    (v) =>
      v === "" ||
      v.startsWith("/") ||
      /^https?:\/\//i.test(v),
    "Must be an http(s) URL or a relative path"
  );

const optionalUrlOrPath = urlOrPath.optional().nullable();

// --- Auth / login ---

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});

// --- Users ---

export const createUserSchema = z.object({
  name: z.string().min(1).max(120),
  email: emailSchema,
  password: passwordSchema,
  role: roleSchema,
});

export const updateUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(120).optional(),
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
  role: roleSchema.optional(),
});

export const deleteByIdSchema = z.object({ id: z.string().min(1) });

// --- Profile (self-service) ---

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  image: optionalUrlOrPath,
  currentPassword: z.string().max(128).optional(),
  newPassword: passwordSchema.optional(),
});

// --- Site settings ---

export const updateSettingsSchema = z.object({
  logoUrl: optionalUrlOrPath,
  facebookUrl: urlOrPath.optional(),
  instagramUrl: urlOrPath.optional(),
  whatsappNumber: z.string().max(32).regex(/^[+\d\s()-]*$/, "Invalid phone number").optional(),
});

// --- Gallery ---

export const mediaTypeSchema = z.enum(["IMAGE", "VIDEO"]);

export const createGallerySchema = z.object({
  url: urlOrPath,
  thumbnailUrl: optionalUrlOrPath,
  type: mediaTypeSchema.optional(),
  titleAr: shortText.optional(),
  titleEn: shortText.optional(),
  sortOrder: z.number().int().min(0).max(100000).optional(),
  isPublished: z.boolean().optional(),
});

export const updateGallerySchema = createGallerySchema.partial().extend({
  id: z.string().min(1),
});

// --- Content blocks ---

export const createContentSchema = z.object({
  key: z.string().min(1).max(120),
  valueAr: longText.optional(),
  valueEn: longText.optional(),
  imageUrl: optionalUrlOrPath,
  section: z.string().max(60).optional(),
  sortOrder: z.number().int().min(0).max(100000).optional(),
});

export const updateContentSchema = z.object({
  id: z.string().min(1),
  valueAr: longText.optional(),
  valueEn: longText.optional(),
  imageUrl: optionalUrlOrPath,
  section: z.string().max(60).optional(),
  sortOrder: z.number().int().min(0).max(100000).optional(),
});

// --- Teachers ---

const availabilitySlotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: timeString,
  endTime: timeString,
  slotDuration: z.number().int().min(15).max(480).optional(),
});

export const createTeacherSchema = z.object({
  name: z.string().min(1).max(120),
  email: emailSchema,
  password: passwordSchema,
  bioAr: longText.optional(),
  bioEn: longText.optional(),
  specialties: z.array(z.string().max(120)).max(50).optional(),
  avatarUrl: optionalUrlOrPath,
  hourlyRate: z.number().min(0).max(1_000_000).optional(),
  currency: z.string().length(3).optional(),
  availability: z.array(availabilitySlotSchema).max(50).optional(),
});

export const updateTeacherSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(120).optional(),
  email: emailSchema.optional(),
  bioAr: longText.optional(),
  bioEn: longText.optional(),
  specialties: z.array(z.string().max(120)).max(50).optional(),
  avatarUrl: optionalUrlOrPath,
  hourlyRate: z.number().min(0).max(1_000_000).optional(),
  currency: z.string().length(3).optional(),
  isActive: z.boolean().optional(),
  availability: z.array(availabilitySlotSchema).max(50).optional(),
});

// --- Blog ---

export const createBlogSchema = z.object({
  titleAr: shortText.optional(),
  titleEn: shortText.optional(),
  excerptAr: z.string().max(1000).optional(),
  excerptEn: z.string().max(1000).optional(),
  contentAr: longText.optional(),
  contentEn: longText.optional(),
  coverImage: optionalUrlOrPath,
  authorName: shortText.optional(),
  isPublished: z.boolean().optional(),
});

export const updateBlogSchema = createBlogSchema.extend({
  id: z.string().min(1),
});

// --- Appointments ---

export const updateAppointmentSchema = z.object({
  id: z.string().min(1),
  status: z.enum(APPOINTMENT_STATUSES).optional(),
  notes: z.string().max(5000).optional(),
  meetingLink: urlOrPath.optional(),
});

// --- Payments / booking ---

export const createCheckoutSchema = z.object({
  teacherProfileId: z.string().min(1),
  slotDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/, "slotDate must be YYYY-MM-DD"),
  slotTime: timeString,
  durationMinutes: z.number().int().min(15).max(480).optional(),
});

// --- Availability query ---

export const availabilityQuerySchema = z.object({
  teacherId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
});

// --- Notifications ---

export const notificationPatchSchema = z
  .object({
    markAllAsRead: z.boolean().optional(),
    notificationId: z.string().min(1).optional(),
  })
  .refine((d) => d.markAllAsRead || d.notificationId, {
    message: "Provide markAllAsRead or notificationId",
  });
