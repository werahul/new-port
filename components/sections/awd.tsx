// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import { motion } from "framer-motion";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import anime from "animejs";
// import { Button } from "@/components/ui/button";
// import { ArrowUpRight, Github, Linkedin, Mail, Sparkles } from "lucide-react";

// export default function AwwwardsStylePortfolioPlus() {
//   const horizontalRef = useRef<HTMLDivElement | null>(null);
//   const sectionsRef = useRef<HTMLDivElement | null>(null);
//   const [isLoaded, setIsLoaded] = useState(false);

//   useEffect(() => {
//     gsap.registerPlugin(ScrollTrigger);
//   }, []);

//   useEffect(() => {
//     const updateProgress = () => {
//       const doc = document.documentElement;
//       const max = doc.scrollHeight - doc.clientHeight || 1;
//       const scrolled = (doc.scrollTop / max) * 100;
//       const bar = document.getElementById("scroll-progress");
//       if (bar) bar.style.width = `${Math.min(100, Math.max(0, scrolled))}%`;
//     };
//     updateProgress();
//     window.addEventListener("scroll", updateProgress, { passive: true });
//     return () => window.removeEventListener("scroll", updateProgress);
//   }, []);

//   useEffect(() => {
//     if (!isLoaded) return;
//     if (!horizontalRef.current || !sectionsRef.current) return;
//     const container = horizontalRef.current;
//     const sections = gsap.utils.toArray<HTMLElement>(container.querySelectorAll(".h-panel"));
//     const totalShift = -100 * (sections.length - 1);
//     const st = ScrollTrigger.create({
//       trigger: sectionsRef.current,
//       pin: true,
//       scrub: 1,
//       start: "top top",
//       end: () => `+=${Math.max(0, container.scrollWidth - window.innerWidth)}`,
//       invalidateOnRefresh: true,
//       onUpdate: self => gsap.to(sections, { xPercent: totalShift * self.progress, ease: "none", overwrite: true })
//     });
//     const floaties = gsap.utils.toArray<HTMLElement>(".floaty").map((el, i) =>
//       gsap.to(el, {
//         y: () => gsap.utils.random(-60, 60),
//         x: () => gsap.utils.random(-40, 40),
//         rotation: () => gsap.utils.random(-10, 10),
//         duration: () => gsap.utils.random(4, 7),
//         repeat: -1,
//         yoyo: true,
//         ease: "sine.inOut",
//         delay: i * 0.2,
//       })
//     );
//     ScrollTrigger.refresh();
//     return () => {
//       st.kill();
//       floaties.forEach(t => t.kill());
//     };
//   }, [isLoaded]);

//   return (
//     <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
//       <div className="fixed top-0 left-0 right-0 z-[70] h-1 bg-white/10">
//         <div id="scroll-progress" className="h-full bg-white transition-[width] duration-75 ease-linear" style={{ width: 0 }} />
//       </div>
//       <SignatureLoader onDone={() => setIsLoaded(true)} />
//       <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-black/40 border-b border-white/10">
//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
//           <a href="#home" className="font-black tracking-tight text-xl flex items-center gap-2">
//             <Sparkles className="size-5" /> RAHUL<span className="text-white/50">.DEV</span>
//           </a>
//           <nav className="hidden md:flex gap-8 text-sm uppercase tracking-widest">
//             <a href="#work" className="hover:opacity-70">Work</a>
//             <a href="#about" className="hover:opacity-70">About</a>
//             <a href="#contact" className="hover:opacity-70">Contact</a>
//           </nav>
//           <div className="flex gap-2">
//             <Button className="rounded-2xl px-5 py-2 text-sm font-semibold">Let’s Talk</Button>
//           </div>
//         </div>
//       </header>
//       <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
//         <video className="absolute inset-0 w-full h-full object-cover opacity-60" autoPlay muted loop playsInline>
//           <source src="/media/hero-showreel.mp4" type="video/mp4" />
//         </video>
//         <GlitterCanvas />
//         <div className="relative z-10 text-center px-6">
//           <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }} className="text-[10vw] leading-none font-black tracking-tight">
//             BUILDING <span className="italic">BOLD</span>
//             <br /> DIGITAL EXPERIENCES
//           </motion.h1>
//           <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }} className="mt-6 text-lg md:text-2xl text-white/80 max-w-3xl mx-auto">
//             UI Developer • React • Next.js • Animation (GSAP/Framer/Anime.js) • API Integrations
//           </motion.p>
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.8 }} className="mt-10 flex flex-wrap items-center justify-center gap-4">
//             <Button asChild className="rounded-2xl">
//               <a href="#work" className="flex items-center gap-2">See Work <ArrowUpRight className="size-4" /></a>
//             </Button>
//             <a href="https://github.com/" target="_blank" className="p-3 rounded-2xl border border-white/20 hover:bg-white/10"><Github className="size-5" /></a>
//             <a href="https://www.linkedin.com/" target="_blank" className="p-3 rounded-2xl border border-white/20 hover:bg-white/10"><Linkedin className="size-5" /></a>
//             <a href="mailto:hello@example.com" className="p-3 rounded-2xl border border-white/20 hover:bg-white/10"><Mail className="size-5" /></a>
//           </motion.div>
//         </div>
//         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs tracking-widest uppercase text-white/60">Scroll</div>
//         <div className="floaty absolute top-24 left-10 size-10 rounded-full ring-1 ring-white/20 bg-white/10 blur-[2px]" />
//         <div className="floaty absolute bottom-24 right-12 size-14 rounded-full ring-1 ring-white/20 bg-white/10 blur-[1px]" />
//       </section>
//       <section id="work" ref={sectionsRef} className="relative w-full">
//         <div ref={horizontalRef} className="h-screen flex w-[600vw]">
//           {workItems.map((item, i) => (
//             <WorkPanel key={i} item={item} />
//           ))}
//         </div>
//       </section>
//       <section id="about" className="relative py-32 md:py-48 overflow-hidden">
//         <ParallaxBackdrop />
//         <div className="mx-auto max-w-7xl px-6 relative">
//           <h3 className="text-[9vw] leading-none font-black tracking-tight will-change-transform">
//             <SplitReveal text="DESIGN. CODE. ANIMATE." />
//           </h3>
//           <p className="mt-8 text-xl md:text-2xl text-white/80 max-w-4xl">
//             I craft premium, award-aiming web experiences with Next.js, React, GSAP, Framer Motion & Anime.js. From concept to launch: cinematic inside-scrolling narratives, luxury typography, and crisp microinteractions.
//           </p>
//           <div className="mt-12 grid md:grid-cols-3 gap-6">
//             {[{ k: "Expertise", v: "Next.js, React, GSAP, Framer, Anime.js, Tailwind, Shadcn UI" }, { k: "Services", v: "Portfolio Sites, Campaigns, Product Landers, Dashboards" }, { k: "Highlights", v: "Smooth scroll, pinned chapters, parallax, API integrations" }].map((it, i) => (
//               <div key={i} className="rounded-2xl p-6 ring-1 ring-white/10 bg-white/5">
//                 <div className="text-xs uppercase tracking-widest text-white/60">{it.k}</div>
//                 <div className="mt-2 text-lg">{it.v}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//       <section id="contact" className="relative py-24 md:py-40 bg-white text-black overflow-hidden">
//         <div className="mx-auto max-w-7xl px-6 text-center relative">
//           <h4 className="text-[8vw] leading-none font-black tracking-tight">LET’S BUILD SOMETHING ICONIC</h4>
//           <p className="mt-6 text-xl text-black/70 max-w-2xl mx-auto">
//             Bring your brand to life with cinematic scroll, big type, glittering details, and buttery-smooth interactions.
//           </p>
//           <div className="mt-10 flex items-center justify-center gap-4">
//             <Button asChild className="rounded-2xl">
//               <a href="mailto:hello@example.com" className="flex items-center gap-2">Start a project <ArrowUpRight className="size-4" /></a>
//             </Button>
//             <Button asChild variant="secondary" className="rounded-2xl">
//               <a href="#work">Browse Work</a>
//             </Button>
//           </div>
//           <div className="absolute -inset-x-10 bottom-0 h-24 blur-3xl bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
//         </div>
//       </section>
//       <footer className="py-10 text-center text-white/50 text-sm">© {new Date().getFullYear()} Rahul. Built with Next.js, GSAP, Framer Motion & Anime.js.</footer>
//     </main>
//   );
// }

// const workItems = [
//   { title: "Metamask-esque Onboarding", tag: "Web App / Animation", media: "/media/work-1.mp4", desc: "Smooth wallet connect flows with microinteractions and GSAP-driven states." },
//   { title: "Cartier-level Storytelling", tag: "Campaign Site", media: "/media/work-2.mp4", desc: "Cinematic scroll, parallax layers, and luxury-grade typography." },
//   { title: "Realtime Dashboard", tag: "Next.js / API", media: "/media/work-3.mp4", desc: "Streaming data, framer-motion transitions, and shadcn UI composition." },
//   { title: "Animated Case Study", tag: "Case Study", media: "/media/work-4.mp4", desc: "Rich narrative with pinned chapters and narrative scroll." },
//   { title: "3D + WebGL Teaser", tag: "R&D", media: "/media/work-5.mp4", desc: "Interactive teaser blending GSAP timelines with WebGL scenes." },
//   { title: "Awards Page with Inside Scroll", tag: "Awwwards Energy", media: "/media/work-6.mp4", desc: "Inside-scroll grid with kinetic type, hover trails, and sparkles." },
// ];

// function WorkPanel({ item }: { item: any }) {
//   const ref = useRef<HTMLDivElement | null>(null);
//   useEffect(() => {
//     if (!ref.current) return;
//     const mm = gsap.matchMedia();
//     mm.add("(min-width: 768px)", () => {
//       const tl = gsap.timeline({
//         scrollTrigger: { trigger: ref.current, start: "center center", end: "+=100%", scrub: 1 },
//       });
//       tl.fromTo(ref.current.querySelector(".panel-media"), { scale: 0.92, opacity: 0.5 }, { scale: 1, opacity: 1, ease: "power2.out" })
//         .from(ref.current.querySelector(".panel-title"), { y: 40, opacity: 0, duration: 0.6 }, "<")
//         .from(ref.current.querySelector(".panel-desc"), { y: 20, opacity: 0, duration: 0.6 }, "-0.2");
//     });
//     return () => mm.revert();
//   }, []);
//   return (
//     <article ref={ref} className="h-panel relative h-screen w-screen flex items-center justify-center p-6 md:p-12">
//       <div className="max-w-6xl w-full grid md:grid-cols-5 gap-8 items-center">
//         <div className="md:col-span-3">
//           <div className="panel-media aspect-video w-full overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-2xl">
//             <video className="w-full h-full object-cover" autoPlay muted loop playsInline>
//               <source src={item.media} type="video/mp4" />
//             </video>
//           </div>
//         </div>
//         <div className="md:col-span-2">
//           <h2 className="panel-title text-5xl md:text-6xl font-black tracking-tight leading-tight">{item.title}</h2>
//           <p className="mt-3 text-white/70">{item.tag}</p>
//           <p className="panel-desc mt-6 text-lg leading-relaxed text-white/80">{item.desc}</p>
//           <div className="mt-8 flex gap-3">
//             <Button variant="secondary" className="rounded-2xl">View Case</Button>
//             <Button className="rounded-2xl" variant="default">Live Demo</Button>
//           </div>
//         </div>
//       </div>
//     </article>
//   );
// }

// function GlitterCanvas() {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const rafRef = useRef<number | null>(null);
//   const particles = useRef<{ x: number; y: number; vx: number; vy: number; r: number; a: number }[]>([]);
//   const mouse = useRef({ x: 0, y: 0 });
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;
//     const resize = () => {
//       canvas.width = window.innerWidth;
//       canvas.height = window.innerHeight;
//     };
//     resize();
//     window.addEventListener("resize", resize);
//     const count = Math.min(120, Math.floor((window.innerWidth * window.innerHeight) / 20000));
//     particles.current = new Array(count).fill(0).map(() => ({
//       x: Math.random() * canvas.width,
//       y: Math.random() * canvas.height,
//       vx: (Math.random() - 0.5) * 0.3,
//       vy: (Math.random() - 0.5) * 0.3,
//       r: Math.random() * 1.8 + 0.4,
//       a: Math.random() * 0.6 + 0.2,
//     }));
//     const draw = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       particles.current.forEach(p => {
//         const dx = mouse.current.x - p.x;
//         const dy = mouse.current.y - p.y;
//         const dist = Math.hypot(dx, dy) + 0.001;
//         p.vx += (dx / dist) * 0.0005;
//         p.vy += (dy / dist) * 0.0005;
//         p.x += p.vx;
//         p.y += p.vy;
//         if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
//         if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
//         p.a += (Math.random() - 0.5) * 0.02;
//         const alpha = 0.2 + Math.abs(Math.sin(p.a)) * 0.6;
//         ctx.beginPath();
//         ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
//         ctx.fillStyle = `rgba(255,255,255,${alpha})`;
//         ctx.fill();
//       });
//       rafRef.current = requestAnimationFrame(draw);
//     };
//     draw();
//     const move = (e: MouseEvent) => {
//       mouse.current.x = e.clientX;
//       mouse.current.y = e.clientY;
//     };
//     window.addEventListener("mousemove", move);
//     return () => {
//       window.removeEventListener("resize", resize);
//       window.removeEventListener("mousemove", move);
//       if (rafRef.current) cancelAnimationFrame(rafRef.current);
//     };
//   }, []);
//   return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-[1]" />;
// }

// function SplitReveal({ text }: { text: string }) {
//   const ref = useRef<HTMLSpanElement | null>(null);
//   useEffect(() => {
//     if (!ref.current) return;
//     const spans = Array.from(ref.current.querySelectorAll("span"));
//     gsap.fromTo(spans, { yPercent: 110, rotateX: 20, opacity: 0 }, {
//       yPercent: 0,
//       rotateX: 0,
//       opacity: 1,
//       duration: 0.8,
//       ease: "power4.out",
//       stagger: 0.06,
//       scrollTrigger: { trigger: ref.current, start: "top 80%" },
//     });
//   }, []);
//   return (
//     <span ref={ref} className="inline-block will-change-transform">
//       {text.split("").map((c, i) => (
//         <span key={i} className="inline-block origin-bottom [transform-style:preserve-3d]">{c === " " ? "\u00A0" : c}</span>
//       ))}
//     </span>
//   );
// }

// function ParallaxBackdrop() {
//   const ref = useRef<HTMLDivElement | null>(null);
//   useEffect(() => {
//     if (!ref.current) return;
//     gsap.to(ref.current, { yPercent: -10, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", scrub: true } });
//   }, []);
//   return <div ref={ref} className="absolute inset-0 -z-10 opacity-40 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2)_0%,transparent_50%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.2)_0%,transparent_50%)]" />;
// }

// function SignatureLoader({ onDone }: { onDone: () => void }) {
//   const overlayRef = useRef<HTMLDivElement | null>(null);
//   const barRef = useRef<HTMLDivElement | null>(null);
//   const pathRef = useRef<SVGPathElement | null>(null);
//   const rafRef = useRef<number | null>(null);
//   useEffect(() => {
//     const overlay = overlayRef.current;
//     const bar = barRef.current;
//     const path = pathRef.current;
//     if (!overlay || !bar || !path) return;
//     const length = path.getTotalLength();
//     path.style.strokeDasharray = `${length}`;
//     path.style.strokeDashoffset = `${length}`;
//     const duration = 2000 + Math.random() * 1200;
//     const start = performance.now();
//     const tick = (now: number) => {
//       const t = Math.min(1, (now - start) / duration);
//       const pct = Math.floor(t * 100);
//       bar.style.width = pct + "%";
//       anime.set(path, { strokeDashoffset: length * (1 - t) });
//       if (t < 1) {
//         rafRef.current = requestAnimationFrame(tick);
//       } else {
//         const tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });
//         tl.to("#signature-svg", { scale: 1.2, duration: 0.5 })
//           .to("#signature-svg", { scale: 12, opacity: 0, duration: 0.7 })
//           .to(overlay, { opacity: 0, duration: 0.6, onComplete: () => onDone() }, "<")
//           .set(overlay, { display: "none" });
//         gsap.fromTo("main", { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out", delay: 0.1 });
//       }
//     };
//     rafRef.current = requestAnimationFrame(tick);
//     return () => {
//       if (rafRef.current) cancelAnimationFrame(rafRef.current);
//     };
//   }, [onDone]);
//   return (
//     <div ref={overlayRef} className="fixed inset-0 z-[80] bg-black flex flex-col items-center justify-center">
//       <div className="w-[min(640px,90vw)] mx-auto flex flex-col items-center">
//         <svg id="signature-svg" width="480" height="160" viewBox="0 0 480 160" className="mb-8 will-change-transform">
//           <path ref={pathRef} d="M40,100 C80,20 140,20 160,90 S260,160 320,70 420,0 440,100" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
//         </svg>
//         <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
//           <div ref={barRef} className="h-full w-0 bg-white transition-[width] duration-100" />
//         </div>
//         <div className="mt-4 text-white/60 tracking-widest text-xs uppercase">Loading Experience</div>
//       </div>
//     </div>
//   );
// }
