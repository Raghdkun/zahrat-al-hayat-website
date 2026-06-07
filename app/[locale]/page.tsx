"use client";

import Navbar from "@/components/public/Navbar";
import Hero from "@/components/public/Hero";
import About from "@/components/public/About";
import Services from "@/components/public/Services";
import Stats from "@/components/public/Stats";
import Gallery from "@/components/public/Gallery";
import Founder from "@/components/public/Founder";
import Teachers from "@/components/public/Teachers";
import CTASection from "@/components/public/CTASection";
import Footer from "@/components/public/Footer";
import LoadingScreen from "@/components/public/LoadingScreen";

export default function HomePage() {
  return (
    <>
      <LoadingScreen />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Stats />
        <Founder />
        <Gallery />
        <Teachers />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
