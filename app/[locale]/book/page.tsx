"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  UserCircle,
  CalendarDots,
  CreditCard,
  CheckCircle,
  Clock,
  CaretRight,
  CaretLeft,
  SpinnerGap,
  ArrowRight,
  ArrowLeft,
  WhatsappLogo,
} from "@phosphor-icons/react";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { ar, enUS } from "date-fns/locale";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { whatsappUrl } from "@/lib/whatsapp";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

interface Teacher {
  id: string;
  bioAr: string;
  bioEn?: string | null;
  hourlyRate: number;
  currency: string;
  user: { name: string; email: string };
  availability: { dayOfWeek: number }[];
}

type Step = "select-teacher" | "select-slot" | "confirm";

const steps: { key: Step; labelKey: string; icon: PhosphorIcon }[] = [
  { key: "select-teacher", labelKey: "select_teacher", icon: UserCircle },
  { key: "select-slot", labelKey: "select_date", icon: CalendarDots },
  { key: "confirm", labelKey: "confirm", icon: CreditCard },
];

export default function BookPage() {
  const t = useTranslations("booking");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const settings = useSiteSettings();
  const Forward = isRtl ? CaretLeft : CaretRight;
  const Backward = isRtl ? CaretRight : CaretLeft;
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const [step, setStep] = useState<Step>("select-teacher");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(true);

  useEffect(() => {
    fetch("/api/teachers")
      .then((r) => r.json())
      .then((data) => {
        setTeachers(Array.isArray(data) ? data : data.teachers ?? []);
        setLoadingTeachers(false);
      })
      .catch(() => {
        toast.error(t("err_load_teachers"));
        setLoadingTeachers(false);
      });
  }, [t]);

  const handleDateSelect = async (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    if (!date || !selectedTeacher) return;
    setLoadingSlots(true);
    try {
      const res = await fetch(
        `/api/availability?teacherId=${selectedTeacher.id}&date=${date.toISOString().split("T")[0]}`
      );
      const data = await res.json();
      setSlots(data);
    } catch {
      toast.error(t("err_load_slots"));
    } finally {
      setLoadingSlots(false);
    }
  };

  // Payments are not enabled yet — for now the booking is completed by
  // contacting the center over WhatsApp with the chosen details pre-filled.
  const handleWhatsApp = () => {
    if (!selectedTeacher || !selectedDate || !selectedSlot) return;
    const dateStr = selectedDate.toLocaleDateString(isRtl ? "ar-SY" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const msg = isRtl
      ? `مرحباً، أرغب بحجز استشارة:\n• المدرّب: ${selectedTeacher.user.name}\n• التاريخ: ${dateStr}\n• الوقت: ${selectedSlot}\n• المبلغ: ${selectedTeacher.hourlyRate} ${selectedTeacher.currency}`
      : `Hello, I'd like to book a consultation:\n• Coach: ${selectedTeacher.user.name}\n• Date: ${dateStr}\n• Time: ${selectedSlot}\n• Amount: ${selectedTeacher.hourlyRate} ${selectedTeacher.currency}`;
    const url = whatsappUrl(settings.whatsappNumber, msg);
    if (!url) {
      toast.error(
        isRtl
          ? "رقم واتساب غير متاح حالياً، يرجى التواصل عبر البريد الإلكتروني"
          : "WhatsApp is unavailable right now, please contact us by email"
      );
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const availableDays = selectedTeacher?.availability.map((a) => a.dayOfWeek) ?? [];
  const currentStepIndex = steps.findIndex((s) => s.key === step);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-28 pb-16 section-x">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="text-center mb-10 flex flex-col gap-3">
            <span className="eyebrow mx-auto">{t("label")}</span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium text-foreground leading-[1.05]">
              {t("title")}
            </h1>
            <p className="text-base text-muted-foreground">{t("subtitle")}</p>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-center mb-12">
            {steps.map((s, i) => {
              const isActive = i === currentStepIndex;
              const isDone = i < currentStepIndex;
              const Icon = s.icon;
              return (
                <div key={s.key} className="flex items-center">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 border ${
                        isDone
                          ? "bg-primary text-primary-foreground border-primary"
                          : isActive
                            ? "bg-primary text-primary-foreground border-primary scale-110 shadow-lg shadow-primary/20"
                            : "bg-background text-muted-foreground border-border"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle weight="fill" className="h-5 w-5" />
                      ) : (
                        <Icon weight="duotone" className="h-5 w-5" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium hidden sm:block ${
                        isActive ? "text-foreground font-semibold" : "text-muted-foreground"
                      }`}
                    >
                      {t(s.labelKey)}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`w-12 sm:w-20 h-px mx-2 mt-[-1.25rem] sm:mt-[-1.5rem] transition-colors ${
                        isDone ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step 1 */}
          {step === "select-teacher" && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl font-medium text-foreground">
                  {t("step1_title")}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">{t("step1_subtitle")}</p>
              </div>

              {loadingTeachers ? (
                <div className="flex items-center justify-center py-16">
                  <SpinnerGap className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-5">
                  {teachers.map((teacher) => {
                    const isSelected = selectedTeacher?.id === teacher.id;
                    return (
                      <button
                        type="button"
                        key={teacher.id}
                        onClick={() => setSelectedTeacher(teacher)}
                        className={`text-start rounded-3xl p-6 border transition-all duration-300 hover:-translate-y-0.5 ${
                          isSelected
                            ? "bg-card border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/20"
                            : "bg-card border-border hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-14 w-14">
                            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                              {teacher.user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-display text-xl font-medium text-foreground truncate">
                              {teacher.user.name}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                                {teacher.hourlyRate} {teacher.currency} · {t("per_hour")}
                              </span>
                              {isSelected && (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                                  <CheckCircle weight="fill" className="h-3 w-3" />
                                  {t("selected")}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {(() => {
                          const bio = (isRtl ? teacher.bioAr : teacher.bioEn) || teacher.bioAr || teacher.bioEn;
                          return bio ? (
                            <p className="text-sm text-muted-foreground leading-relaxed mt-4 line-clamp-3">
                              {bio}
                            </p>
                          ) : null;
                        })()}
                      </button>
                    );
                  })}
                  {teachers.length === 0 && (
                    <p className="text-muted-foreground sm:col-span-2 text-center py-12">
                      {t("no_teachers_available")}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-center mt-10">
                <button
                  type="button"
                  className="btn-pill btn-pill-primary disabled:opacity-50 disabled:pointer-events-none"
                  disabled={!selectedTeacher}
                  onClick={() => setStep("select-slot")}
                >
                  {t("next")} · {t("select_date")}
                  <Arrow size={16} weight="bold" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === "select-slot" && selectedTeacher && (
            <div className="animate-in fade-in duration-300">
              <div className="flex items-center gap-3 rounded-2xl p-4 mb-8 bg-card border border-border">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {selectedTeacher.user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">
                    {selectedTeacher.user.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedTeacher.hourlyRate} {selectedTeacher.currency} · {t("per_hour")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep("select-teacher")}
                  className="text-xs text-primary hover:underline"
                >
                  {t("change")}
                </button>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-display text-lg font-medium mb-4 flex items-center gap-2 text-foreground">
                    <CalendarDots weight="duotone" className="h-5 w-5 text-primary" />
                    {t("select_date_label")}
                  </h3>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    locale={isRtl ? ar : enUS}
                    dir={isRtl ? "rtl" : "ltr"}
                    disabled={(date: Date) => {
                      const day = date.getDay();
                      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                      return isPast || !availableDays.includes(day);
                    }}
                    className="rounded-3xl border border-border bg-card p-4 sm:p-5 mx-auto text-foreground shadow-sm shadow-primary/5 [--cell-size:--spacing(10)] sm:[--cell-size:--spacing(11)]"
                  />
                </div>
                <div>
                  <h3 className="font-display text-lg font-medium mb-4 flex items-center gap-2 text-foreground">
                    <Clock weight="duotone" className="h-5 w-5 text-primary" />
                    {t("available_times")}
                  </h3>
                  {loadingSlots ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <SpinnerGap className="h-6 w-6 animate-spin mb-2" />
                      <span>{t("loading_slots")}</span>
                    </div>
                  ) : !selectedDate ? (
                    <div className="rounded-2xl bg-card border border-border p-8 text-center">
                      <CalendarDots weight="duotone" className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-muted-foreground">{t("pick_date")}</p>
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="rounded-2xl bg-card border border-border p-8 text-center">
                      <Clock weight="duotone" className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-foreground font-medium">{t("no_slots")}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t("no_slots_hint")}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {slots.map((slot) => (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-3 px-3 rounded-2xl text-sm font-medium border transition-all ${
                            selectedSlot === slot
                              ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                              : "bg-card border-border text-foreground hover:border-primary/40"
                          }`}
                        >
                          <Clock weight="bold" className="h-4 w-4 mx-auto mb-1 opacity-70" />
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-10 justify-center">
                <button
                  type="button"
                  onClick={() => setStep("select-teacher")}
                  className="btn-pill btn-pill-ghost"
                >
                  <Backward size={16} weight="bold" />
                  {t("back")}
                </button>
                <button
                  type="button"
                  className="btn-pill btn-pill-primary disabled:opacity-50 disabled:pointer-events-none"
                  disabled={!selectedDate || !selectedSlot}
                  onClick={() => setStep("confirm")}
                >
                  {t("next")} · {t("confirm")}
                  <Forward size={16} weight="bold" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === "confirm" && selectedTeacher && selectedDate && selectedSlot && (
            <div className="animate-in fade-in duration-300 max-w-lg mx-auto">
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl font-medium text-foreground">
                  {t("review_title")}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">{t("review_subtitle")}</p>
              </div>

              <div className="rounded-3xl overflow-hidden bg-card border border-border shadow-lg shadow-primary/5">
                <div className="bg-primary p-6 text-primary-foreground text-center">
                  <Avatar className="h-16 w-16 mx-auto mb-3 ring-4 ring-white/20">
                    <AvatarFallback className="bg-white/20 text-white text-xl font-semibold">
                      {selectedTeacher.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-display text-xl font-medium">{selectedTeacher.user.name}</p>
                </div>

                <div className="p-6 space-y-1">
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="flex items-center gap-2 text-muted-foreground text-sm">
                      <CalendarDots weight="duotone" className="h-4 w-4" />
                      {t("date")}
                    </span>
                    <span className="font-medium text-foreground text-sm">
                      {selectedDate.toLocaleDateString(isRtl ? "ar-SY" : "en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <span className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Clock weight="duotone" className="h-4 w-4" />
                      {t("time")}
                    </span>
                    <span className="font-medium text-foreground">{selectedSlot}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 py-4 bg-secondary/40 rounded-2xl px-4">
                    <span className="flex items-center gap-2 font-medium text-foreground">
                      <CreditCard weight="duotone" className="h-5 w-5 text-primary" />
                      {t("total")}
                    </span>
                    <span className="font-display font-medium text-primary text-2xl">
                      {selectedTeacher.hourlyRate} {selectedTeacher.currency}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-8 justify-center">
                <button
                  type="button"
                  onClick={() => setStep("select-slot")}
                  className="btn-pill btn-pill-ghost"
                >
                  <Backward size={16} weight="bold" />
                  {t("back")}
                </button>
                <button
                  type="button"
                  className="btn-pill btn-pill-primary"
                  onClick={handleWhatsApp}
                >
                  <WhatsappLogo weight="fill" className="h-5 w-5" />
                  {isRtl ? "أكمل الحجز عبر واتساب" : "Complete booking on WhatsApp"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
