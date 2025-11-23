"use client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TextShimmer } from "../../components/motion-primitives/text-shimmer";
import { TextScramble } from '../../components/motion-primitives/text-scramble';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Menu,
  Mountain,
  Stethoscope,
  Users,
  Calendar,
  DollarSign,
  FileText,
  Briefcase,
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground py-4 px-6 flex items-center justify-between">
        <Link href="#" className="flex items-center gap-2" prefetch={false}>
          <Mountain className="w-6 h-6" />
          <span className="text-lg font-semibold">HMS</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#features" className="hover:underline" prefetch={false}>
            Features
          </Link>
          <Link href="#about" className="hover:underline" prefetch={false}>
            About
          </Link>
          <Link
            href="#testimonials"
            className="hover:underline"
            prefetch={false}
          >
            Testimonials
          </Link>
          <Link href="#contact" className="hover:underline" prefetch={false}>
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" prefetch={false} className="hidden md:block">
            <Button className="px-8 py-2 rounded-md bg-black text-white font-bold transition duration-200 hover:bg-white hover:text-black border-2 border-transparent hover:border-black">
              Login
            </Button>
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-6 h-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription>
                  Choose an option to proceed or cancel.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 p-6">
                <Link
                  href="#features"
                  className="hover:underline"
                  prefetch={false}
                >
                  Features
                </Link>
                <Link
                  href="#about"
                  className="hover:underline"
                  prefetch={false}
                >
                  About
                </Link>
                <Link
                  href="#testimonials"
                  className="hover:underline"
                  prefetch={false}
                >
                  Testimonials
                </Link>
                <Link
                  href="#contact"
                  className="hover:underline"
                  prefetch={false}
                >
                  Contact
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <section className="bg-primary text-primary-foreground py-20 md:py-32">
        <div className="container mx-auto px-6 md:px-8 grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              Modernizing Hospital Management
            </h1>
            <TextShimmer className="font-mono text-xl" duration={1}>
              Our Hospital Management System provides a comprehensive solution
              to streamline your hospital's operations, from patient management
              to billing and everything in between.
            </TextShimmer>
            <div>
              <Button
                size="lg"
                asChild
                className="bg-black text-white font-bold px-8 py-3 rounded-md transition duration-200 hover:bg-white hover:text-black border-2 border-transparent hover:border-black"
              >
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
          <div className="hidden md:block">
            <Stethoscope className="w-full h-auto text-secondary" />
          </div>
        </div>
      </section>
      <section id="features" className="py-16 md:py-24">
        <div className="container mx-auto px-6 md:px-8">
          <div className="text-center space-y-4 mb-12 flex flex-col items-center">
            <TextShimmer className="text-3xl md:text-4xl font-bold">
              Features
              </TextShimmer>
            <TextShimmer className="text-muted-foreground text-lg">
              Our HMS is packed with features to make your hospital run
              smoothly.
            </TextShimmer>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-4 mb-4">
                <Users className="w-8 h-8 text-primary" />
                <h3 className="text-xl font-semibold">Patient Management</h3>
              </div>
              <p className="text-muted-foreground">
                Keep track of patient records, appointments, and medical history
                with ease.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-4 mb-4">
                <Calendar className="w-8 h-8 text-primary" />
                <h3 className="text-xl font-semibold">
                  Appointment Scheduling
                </h3>
              </div>
              <p className="text-muted-foreground">
                A simple and intuitive interface for scheduling and managing
                appointments.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-4 mb-4">
                <DollarSign className="w-8 h-8 text-primary" />
                <h3 className="text-xl font-semibold">Billing & Invoicing</h3>
              </div>
              <p className="text-muted-foreground">
                Generate invoices, track payments, and manage your hospital's
                finances.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-4 mb-4">
                <FileText className="w-8 h-8 text-primary" />
                <h3 className="text-xl font-semibold">
                  Prescription Management
                </h3>
              </div>
              <p className="text-muted-foreground">
                Manage prescriptions and medication history for each patient.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-4 mb-4">
                <Briefcase className="w-8 h-8 text-primary" />
                <h3 className="text-xl font-semibold">Doctor Management</h3>
              </div>
              <p className="text-muted-foreground">
                Keep track of doctor schedules, and patient assignments.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section id="about" className="py-16 md:py-24 bg-muted">
        <div className="container mx-auto px-6 md:px-8 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <TextScramble className="text-3xl md:text-4xl font-bold mb-4">About Us</TextScramble>
            <p className="text-muted-foreground text-lg">
              We are a team of passionate developers and healthcare
              professionals dedicated to improving hospital management through
              technology. Our mission is to provide an easy-to-use, affordable,
              and comprehensive solution for hospitals of all sizes.
            </p>
          </div>
          <div className="hidden md:block">
            <img src="/images.JFIF" alt="About us" className="rounded-lg" />
          </div>
        </div>
      </section>
      <section id="testimonials" className="py-16 md:py-24">
        <div className="container mx-auto px-6 md:px-8">
          <div className="text-center space-y-4 mb-12 flex flex-col items-center">
            <TextShimmer className="text-3xl md:text-4xl font-bold">Testimonials</TextShimmer>
            <TextShimmer className=" text-lg">
              See what our happy customers have to say about our HMS.
            </TextShimmer>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-4 mb-4">
                <Avatar>
                  <AvatarImage src="/avatar-01.svg" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">John Doe</h3>
                  <p className="text-muted-foreground">CEO, General Hospital</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "This HMS has transformed our hospital's operations. It's easy
                to use, and the support team is always responsive. I highly
                recommend it!"
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-4 mb-4">
                <Avatar>
                  <AvatarImage src="/avatar-02.svg" />
                  <AvatarFallback>JS</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">Jane Smith</h3>
                  <p className="text-muted-foreground">
                    IT Manager, City Clinic
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "We were looking for an affordable and comprehensive HMS, and
                this product exceeded our expectations. It has all the features
                we need, and it's very user-friendly."
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer id="contact" className="bg-muted text-muted-foreground py-8">
        <div className="container mx-auto px-6 md:px-8 grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Hospital management system
            </h3>
            <p>A modern solution for hospital management.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#features" prefetch={false}>
                  Features
                </Link>
              </li>
              <li>
                <Link href="#about" prefetch={false}>
                  About
                </Link>
              </li>
              <li>
                <Link href="#testimonials" prefetch={false}>
                  Testimonials
                </Link>
              </li>
              <li>
                <Link href="/login" prefetch={false}>
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register" prefetch={false}>
                  Register
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Contact</h3>
            <p>Email: indushospital@hms.com</p>
            <p>Phone: +92 4567 4499</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
