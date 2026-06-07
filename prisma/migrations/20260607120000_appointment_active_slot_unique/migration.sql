-- Prevent double-booking at the database level (race-safe), while still
-- allowing a CANCELLED/COMPLETED slot to be re-booked. Prisma's schema cannot
-- express a *partial* unique index, so this is a hand-authored migration.
-- The application also performs a conflict check; this index is the final guard.
CREATE UNIQUE INDEX "Appointment_active_slot_unique"
  ON "Appointment" ("teacherProfileId", "slotDate", "slotTime")
  WHERE "status" IN ('PENDING', 'CONFIRMED');
