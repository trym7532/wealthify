import Layout from "../components/Layout";
import FloatingStoryElements from "@/components/landing/FloatingStoryElements";
import HeroSection from "@/components/landing/HeroSection";
import ScrollStorySection from "@/components/landing/ScrollStorySection";
import FeatureShowcase from "@/components/landing/FeatureShowcase";
import CTASection from "@/components/landing/CTASection";

const Index = () => {
  return (
    <Layout>
      {/* Floating Background Elements with Parallax */}
      <FloatingStoryElements />

      {/* Centered Hero with Title and Demo */}
      <HeroSection />

      {/* Scroll-Driven Before/After Story */}
      <ScrollStorySection />

      {/* Feature Showcase */}
      <FeatureShowcase />

      {/* Final CTA */}
      <CTASection />
    </Layout>
  );
};

export default Index;
