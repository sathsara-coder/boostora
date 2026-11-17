'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, BriefcaseBusiness, Check, ChevronLeft, ChevronRight, ExternalLink, Film, Instagram, Mail, MapPin, Menu, MessageCircle, MoveUpRight, Phone, Play, Send, Sparkles, X, Zap, Palette, Video, Orbit, Megaphone, Pen, Camera } from 'lucide-react';
import type { CSSProperties, FormEvent, ReactNode } from 'react';
import type { Project, Service, SiteContent } from '@/lib/types';
import { CATEGORIES, safeExternalUrl, whatsAppUrl } from '@/lib/types';

export type PageKey = 'home' | 'about' | 'portfolio' | 'services' | 'boostora' | 'contact';
const nav: { label: string; path: string; page: PageKey }[] = [
  { label: 'Home', path: '/', page: 'home' }, { label: 'About', path: '/about', page: 'about' },
  { label: 'Portfolio', path: '/portfolio', page: 'portfolio' }, { label: 'Services', path: '/services', page: 'services' },
  { label: 'Boostora LK', path: '/boostora', page: 'boostora' }
];
const iconMap = { palette: Palette, video: Video, orbit: Orbit, megaphone: Megaphone, instagram: Instagram, sparkles: Sparkles, pen: Pen, camera: Camera };
function ServiceIcon({ name }: { name: string }) { const Icon = iconMap[name as keyof typeof iconMap] || Sparkles; return <Icon size={25} strokeWidth={1.55} />; }
const stagger = (n: number) => ({ '--delay': `${n * 90}ms` } as CSSProperties);

function SectionEyebrow({ number, children }: { number: string; children: ReactNode }) {
  return <span className="section-eyebrow"><span>{number}</span><i />{children}</span>;
}
function SectionHeader({ number, eyebrow, title, summary, action }: { number: string; eyebrow: string; title: string; summary?: string; action?: ReactNode }) {
  return <div className="section-header reveal"><div><SectionEyebrow number={number}>{eyebrow}</SectionEyebrow><h2>{title}</h2>{summary && <p>{summary}</p>}</div>{action}</div>;
}

function ContactForm({ services }: { services: Service[] }) {
  const [state, setState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const form = useRef<HTMLFormElement>(null);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setState('sending');
    const fields = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(fields.entries())) });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Unable to send your message.');
      form.current?.reset(); setState('success');
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : 'Please try again.'); setState('error'); }
  }
  return <form className="contact-form" onSubmit={submit} ref={form}>
    <div className="form-row"><label>Your name<input name="name" required minLength={2} maxLength={100} autoComplete="name" placeholder="Your full name" /></label><label>Email address<input name="email" type="email" required maxLength={200} autoComplete="email" placeholder="you@example.com" /></label></div>
    <label>What do you need?<select name="service" defaultValue=""><option value="">Choose a service (optional)</option>{services.map(s => <option value={s.title} key={s.id}>{s.title}</option>)}</select></label>
    <label>Tell me about your project<textarea name="message" required minLength={10} maxLength={3000} rows={5} placeholder="A few details about your idea, budget, or timeline..." /></label>
    <label className="hidden-honeypot" aria-hidden="true">Website<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
    <button type="submit" className="pill-btn primary submit-btn" disabled={state === 'sending'}><span>{state === 'sending' ? 'Sending...' : 'Send enquiry'}</span><Send size={17} /></button>
    <div className="form-status" aria-live="polite">{state === 'success' && <span className="success"><Check size={16} /> Thanks! Your message has been sent.</span>}{state === 'error' && <span className="error">{errorMessage}</span>}</div>
  </form>;
}

function ProjectCard({ project, index, open }: { project: Project; index: number; open: (p: Project) => void }) {
  const cover = project.cover || project.assets.find(a => a.type === 'image')?.url;
  return <button className="project-card reveal" style={stagger(index)} onClick={() => open(project)} aria-label={`View ${project.title}`}>
    <div className="project-cover">
      {cover ? <img src={cover} alt={`${project.title} preview`} loading="lazy" /> : <div className="project-cover-fallback"><div className="fallback-orb" /><span>{project.category}</span></div>}
      <span className="project-open"><ArrowUpRight size={23} /></span>
      {project.assets.some(a => a.type === 'video') && <span className="video-indicator"><Play size={12} fill="currentColor" /> VIDEO</span>}
    </div><div className="project-meta"><div><span className="category-text">{project.category}</span><h3>{project.title}</h3></div><span className="project-index">/ {String(index + 1).padStart(2, '0')}</span></div>
  </button>;
}
function ProjectModal({ project, close }: { project: Project; close: () => void }) {
  const [active, setActive] = useState(0);
  useEffect(() => { const prev = document.body.style.overflow; document.body.style.overflow = 'hidden'; const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); }; window.addEventListener('keydown', onKey); return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); }; }, [close]);
  const assets = project.assets.length ? project.assets : project.cover ? [{ url: project.cover, type: 'image' as const }] : [];
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) close(); }} role="presentation"><div className="project-modal" role="dialog" aria-modal="true" aria-label={project.title}>
    <button className="modal-close" onClick={close} aria-label="Close project"><X size={21} /></button>
    <div className="modal-media">{assets.length ? assets[active]?.type === 'video' ? <video key={assets[active].url} src={assets[active].url} controls playsInline preload="metadata" /> : <img src={assets[active].url} alt={assets[active].alt || project.title} /> : <div className="project-cover-fallback">No media uploaded yet</div>}
      {assets.length > 1 && <div className="modal-arrows"><button aria-label="Previous media" onClick={() => setActive((active - 1 + assets.length) % assets.length)}><ChevronLeft /></button><span>{active + 1} / {assets.length}</span><button aria-label="Next media" onClick={() => setActive((active + 1) % assets.length)}><ChevronRight /></button></div>}</div>
    <div className="modal-info"><span className="category-text">{project.category}</span><h2>{project.title}</h2>{project.client && <p><strong>Client</strong> {project.client}</p>}{project.description && <p>{project.description}</p>}</div>
  </div></div>;
}

export default function PublicSite({ content, projects, page, previewMode = false }: { content: SiteContent | null; projects: Project[]; page: PageKey; previewMode?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState<Project | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const appearance = content?.appearance;
  const dynamicStyle = ({ '--primary': appearance?.primary || '#5278ff', '--secondary': appearance?.secondary || '#ae76ff', '--bg': appearance?.background || '#080910', '--site-font': `"${appearance?.font || 'Space Grotesk'}", sans-serif` } as CSSProperties);
  useEffect(() => {
    const onScroll = () => navRef.current?.classList.toggle('scrolled', window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    if (!content || !appearance?.animationEnabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let disposed = false; let ctx: { revert: () => void } | undefined;
    (async () => {
      const gsap = (await import('gsap')).gsap;
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.fromTo('.hero-enter', { opacity: 0, y: 35 }, { opacity: 1, y: 0, duration: 1, stagger: 0.11, ease: 'power3.out' });
        gsap.utils.toArray<HTMLElement>('.reveal').forEach(el => gsap.fromTo(el, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } }));
        gsap.utils.toArray<HTMLElement>('.project-cover img').forEach(el => {
          gsap.fromTo(el, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 } });
        });
        gsap.to('.floating-main', { y: -25 * appearance.intensity / 100, x: 13, rotation: -5, duration: 5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        gsap.to('.floating-small', { y: 18 * appearance.intensity / 100, rotation: 9, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      }, wrapper.current || undefined);
    })();
    return () => { disposed = true; ctx?.revert(); };
  }, [content, appearance?.animationEnabled, appearance?.intensity, page, projects]);
  useEffect(() => {
    if (!appearance?.animationEnabled || typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const buttons = Array.from(wrapper.current?.querySelectorAll<HTMLElement>('.magnetic') || []);
    const handlers = buttons.map(el => {
      const move = (e: PointerEvent) => {
        const bounds = el.getBoundingClientRect();
        const dx = (e.clientX - (bounds.left + bounds.width / 2)) * 0.13;
        const dy = (e.clientY - (bounds.top + bounds.height / 2)) * 0.13;
        el.style.transform = `translate(${dx}px,${dy}px)`;
      };
      const leave = () => { el.style.transform = ''; };
      el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave);
      return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); el.style.transform = ''; };
    });
    return () => handlers.forEach(cleanup => cleanup());
  }, [appearance?.animationEnabled, page]);
  const filtered = useMemo(() => filter === 'All' ? projects : projects.filter(p => p.category === filter), [filter, projects]);
  const href = (key: PageKey) => previewMode ? `/preview?page=${key}` : key === 'home' ? '/' : `/${key}`;
  const whatsapp = whatsAppUrl(content?.boostora.whatsapp || '');
  const phone = content?.boostora.phone?.replace(/[^+\d]/g, '') || '';
  if (!content) return <main className="setup-screen"><span className="eyebrow">BOOSTORA / INITIAL SETUP</span><h1>Ready for your creative universe.</h1><p>The public content database is not connected or has not been seeded yet. Set up Supabase using the included README and SQL scripts; the site will then load its published content automatically.</p><a className="pill-btn primary" href="/admin">Open admin dashboard <ArrowUpRight size={18} /></a></main>;
  const links = [{ label: 'Facebook', url: safeExternalUrl(content!.boostora.facebook), icon: <span>f</span> }, { label: 'Instagram', url: safeExternalUrl(content!.boostora.instagram), icon: <Instagram size={18} /> }].filter(l => l.url);
  const image = content!.hero.profileImage || content!.about.portrait;
  const BrandMark = () => content!.boostora.logo ? <img className="brand-logo" src={content!.boostora.logo} alt="Boostora LK logo" /> : <span className="brand-mark">b<span>.</span></span>;
  function pageHeading(kicker: string, title: string, desc: string) { return <section className="inner-hero container"><SectionEyebrow number="✦">{kicker}</SectionEyebrow><h1 className="hero-enter">{title}</h1><p className="hero-enter">{desc}</p><div className="inner-hero-line" /></section>; }
  function Portfolio({ mini = false }: { mini?: boolean }) {
    const visible = mini ? projects.slice(0, 4) : filtered;
    return <section id="work" className="site-section container">
      <SectionHeader number="01" eyebrow="SELECTED WORK" title={mini ? 'The work speaks.' : 'A curated visual archive.'} summary="Creative projects across design, motion, editing, and digital advertising." action={mini ? <Link href={href('portfolio')} className="text-link">View all projects <ArrowUpRight size={17} /></Link> : undefined} />
      {!mini && <div className="filter-tabs" role="group" aria-label="Project categories">{['All', ...CATEGORIES].map(c => <button key={c} onClick={() => setFilter(c)} className={filter === c ? 'active' : ''}>{c}</button>)}</div>}
      {visible.length ? <div className="projects-grid">{visible.map((p, i) => <ProjectCard key={p.id} project={p} index={i} open={setSelected} />)}</div> : <div className="empty-showcase"><div className="empty-orb"><Sparkles size={30} /></div><h3>Something exciting is taking shape.</h3><p>{projects.length ? 'No projects in this category yet.' : 'New creative projects will appear here soon.'}</p></div>}
    </section>;
  }
  function About({ mini = false }: { mini?: boolean }) { return <section id="about" className="site-section container about-section">
    <div className="about-photo reveal">{content!.about.portrait || image ? <img src={content!.about.portrait || image} alt={`Portrait of ${content!.about.name}`} loading="lazy" /> : <div className="about-placeholder"><div className="orbit-ring" /><span>CREATIVE<br />MINDSET<span className="accent-dot">.</span></span></div>}<div className="photo-label"><span>BASED IN</span><strong>{content!.boostora.location || 'Sri Lanka'}</strong></div></div>
    <div className="about-copy reveal"><SectionEyebrow number="02">THE PERSON BEHIND THE PIXELS</SectionEyebrow><h2>{mini ? 'Creating with intention.' : content!.about.tagline}</h2><p className="about-intro">{content!.about.biography}</p>{!mini && content!.about.experience && <p>{content!.about.experience}</p>}
      <div className="skills-list">{content!.about.skills.map(s => <span key={s}>{s}</span>)}</div>
      {!mini && content!.about.achievements.length > 0 && <div className="achievements"><h3>Highlights & achievements</h3>{content!.about.achievements.map((a, i) => <p key={i}><BadgeCheck size={17} />{a}</p>)}</div>}
      <div className="action-row">{mini ? <Link href={href('about')} className="pill-btn secondary">More about me <ArrowUpRight size={16} /></Link> : content!.about.cvUrl ? <a href={content!.about.cvUrl} target="_blank" rel="noopener noreferrer" className="pill-btn secondary">View / download CV <ArrowUpRight size={16} /></a> : null}<Link href={href('contact')} className="text-link">Let’s connect <ArrowUpRight size={17} /></Link></div>
    </div>
  </section>; }
  function Services({ mini = false }: { mini?: boolean }) { return <section id="services" className="site-section services-section container"><SectionHeader number="03" eyebrow="WHAT I DO" title="A creative toolkit for bold ideas." summary="From first concept to final delivery — thoughtful visuals with purpose." action={mini ? <Link className="text-link" href={href('services')}>All services <ArrowUpRight size={17} /></Link> : undefined} />
    <div className="services-grid">{(mini ? content!.services.slice(0, 6) : content!.services).map((s, i) => <article className="service-card reveal" key={s.id} style={stagger(i)}><span className="service-number">0{i + 1}</span><span className="service-icon"><ServiceIcon name={s.icon} /></span><h3>{s.title}</h3><p>{s.description}</p><ArrowUpRight className="service-arrow" size={18} /></article>)}</div>
  </section>; }
  function Boostora({ mini = false }: { mini?: boolean }) { return <section id="boostora" className="site-section boostora-section"><div className="container boostora-grid">
    <div className="boostora-copy reveal"><SectionEyebrow number="04">THE BUSINESS</SectionEyebrow><span className="boostora-overline">INTRODUCING</span><h2>BOOSTORA<span> LK.</span></h2><p>{content!.boostora.description}</p><div className="boostora-tags"><span>FACEBOOK ADS</span><span>INSTAGRAM ADS</span><span>CREATIVE CAMPAIGNS</span></div><div className="action-row"><a className="pill-btn primary" target="_blank" rel="noopener noreferrer" href={whatsapp}>Get in touch <ArrowUpRight size={17} /></a>{mini && <Link className="text-link" href={href('boostora')}>Explore Boostora <ArrowRight size={17} /></Link>}</div></div>
    <div className="boostora-visual reveal"><div className="boostora-card-glow" /><div className="boostora-main-card"><div className="card-top"><BrandMark /><span>BOOST YOUR PRESENCE <Zap size={13} /></span></div><div className="card-middle"><span>DIGITAL IMPACT</span><strong>YOUR BRAND.<br />AMPLIFIED.</strong></div><div className="card-bottom"><span>META ADVERTISING / CREATIVE SERVICES</span><ArrowUpRight size={24} /></div></div><div className="floating-stats"><Sparkles size={16} /> Made to stand out.</div></div>
  </div></section>; }
  function Testimonials() { if (!content!.testimonials.length) return null; return <section className="site-section container"><SectionHeader number="05" eyebrow="KIND WORDS" title="In their own words." /><div className="reviews-grid">{content!.testimonials.map(t => <blockquote className="review-card reveal" key={t.id}><span className="review-quote">“</span><p>{t.quote}</p><footer><strong>{t.name}</strong><span>{t.position}</span></footer></blockquote>)}</div></section>; }
  function Contact({ mini = false }: { mini?: boolean }) { return <section id="contact" className="site-section contact-section container"><div className="contact-heading reveal"><SectionEyebrow number="06">HAVE SOMETHING IN MIND?</SectionEyebrow><h2>Let’s create<br /><em>something big.</em></h2><p>Whether it’s a design idea, a video project, or a campaign for your business — I’d love to hear about it.</p></div><div className="contact-grid">
    <div className="contact-aside reveal"><div className="info-panel"><span className="small-label">DIRECT LINE TO BOOSTORA LK</span><div className="info-brand"><BrandMark /><strong>{content!.boostora.name}</strong></div><div className="contact-detail"><Phone size={19} /><a href={`tel:${phone}`}>{content!.boostora.phone}</a></div><div className="contact-detail"><MapPin size={19} />{content!.boostora.location}</div>{content!.boostora.email && <div className="contact-detail"><Mail size={19} /><a href={`mailto:${content!.boostora.email}`}>{content!.boostora.email}</a></div>}<a className="pill-btn whatsapp-btn" href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} /> Start WhatsApp conversation <ArrowUpRight size={16} /></a><div className="social-links">{links.map(l => <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" aria-label={l.label}>{l.icon}</a>)}</div></div>{!mini && <p className="contact-tip">Prefer a quick chat? WhatsApp is the fastest way to enquire about Boostora LK services.</p>}</div>
    <div className="form-card reveal"><div className="form-heading"><span>PROJECT ENQUIRY</span><span className="online-dot">OPEN FOR MESSAGES</span></div><ContactForm services={content!.services} /></div>
  </div></section>; }
  return <div ref={wrapper} className={`site-root ${appearance?.animationEnabled ? 'animations-on' : 'animations-off'}`} style={dynamicStyle}>
    <div className="ambient-glow" aria-hidden="true" /><div className="grain" aria-hidden="true" />
    {previewMode && <div className="preview-strip"><span><span className="live-dot" /> DRAFT PREVIEW — not public</span><a href="/admin">Return to editor <ArrowLeft size={14} /></a></div>}
    <header ref={navRef} className={`site-nav ${previewMode ? 'below-preview' : ''}`}><div className="nav-inner container"><Link href={href('home')} className="logo-lockup" aria-label="Homepage"><span className="logo-symbol">SY<span>.</span></span><span className="logo-name">{content!.about.name}<small>CREATIVE STUDIO</small></span></Link>
      <nav className={`nav-links ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">{nav.map(l => <Link onClick={() => setMenuOpen(false)} key={l.page} className={page === l.page ? 'selected' : ''} href={href(l.page)}>{l.label}</Link>)}<Link className="mobile-contact" onClick={() => setMenuOpen(false)} href={href('contact')}>Let’s talk <ArrowUpRight size={16} /></Link></nav>
      <Link href={href('contact')} className="nav-contact">LET'S TALK <ArrowUpRight size={17} /></Link><button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle navigation">{menuOpen ? <X size={25} /> : <Menu size={25} />}</button></div></header>
    <main>
      {page === 'home' && <><section className="hero">{content!.hero.backgroundImage && <div className="hero-uploaded-bg" style={{ backgroundImage: `linear-gradient(90deg, #080910f2, #080910d9),url("${content!.hero.backgroundImage.replace(/"/g, '')}")` }} />}<div className="hero-grid" aria-hidden="true" /><div className="hero-halo" aria-hidden="true" /><div className="container hero-layout"><div className="hero-content"><div className="hero-status hero-enter"><span className="live-dot" />{content!.hero.eyebrow}</div><h1 className="hero-title hero-enter">{content!.hero.title}<br /><span>{content!.hero.accent}</span></h1><p className="hero-description hero-enter">{content!.hero.description}</p><div className="hero-actions hero-enter"><Link className="pill-btn primary magnetic" href={href('portfolio')}>Explore my work <ArrowUpRight size={19} /></Link><Link className="pill-btn secondary magnetic" href={href('contact')}>Let's collaborate <ArrowRight size={18} /></Link></div><div className="hero-subline hero-enter"><span className="line-separator" />DESIGN / MOTION / IMPACT</div></div>
        <div className="hero-art" aria-label="Abstract futuristic capsule artwork"><div className="hero-art-orbit orbit-1" /><div className="hero-art-orbit orbit-2" /><div className="hero-art-card">{image ? <img src={image} alt={`Portrait of ${content!.about.name}`} /> : <div className="hero-art-inner"><span>IDEAS<br />IN<br /><i>MOTION.</i></span><span className="vertical-type">A CREATIVE UNIVERSE</span></div>}</div><div className="floating-capsule floating-main">CREATE <span>↗</span></div><div className="floating-capsule floating-small">IMAGINE <Sparkles size={13} /></div><div className="floating-pill pill-vertical" /><div className="floating-pill pill-mini" /><div className="hero-art-sticker">✳</div></div></div><div className="container hero-footer"><span>SCROLL TO EXPLORE <ArrowDown size={15} /></span><span>BASED IN {content!.boostora.location.toUpperCase()} <span className="circle-bullet">●</span> CREATIVE SERVICES</span></div></section><div className="ticker" aria-hidden="true"><div className="ticker-track">{Array.from({ length: 3 }).map((_, i) => <span key={i}>GRAPHIC DESIGN <span>✳</span> VIDEO EDITING <span>✳</span> MOTION GRAPHICS <span>✳</span> DIGITAL CREATIVE <span>✳</span> META ADS <span>✳</span> </span>)}</div></div><Portfolio mini /><About mini /><Services mini /><Boostora mini /><Testimonials /><Contact mini /></>}
      {page === 'about' && <>{pageHeading('ABOUT ME', 'Behind the creative.', 'A little more about the person shaping every pixel, frame and idea.')}<About /><Services mini /><Contact mini /></>}
      {page === 'portfolio' && <>{pageHeading('PROJECT ARCHIVE', 'Work, in motion.', 'Explore selected design, video, branding and advertising projects.')}<Portfolio /><Contact mini /></>}
      {page === 'services' && <>{pageHeading('THE OFFERING', 'Ideas to execution.', 'A complete toolkit for visuals, storytelling, and digital growth.')}<Services /><Boostora mini /><Contact mini /></>}
      {page === 'boostora' && <>{pageHeading('BOOSTORA LK / META ADVERTISING', 'Creative. Digital. Growth.', 'Bringing strategic creative and advertising into one focused offering.')}<Boostora /><Services mini /><Testimonials /><Contact /></>}
      {page === 'contact' && <>{pageHeading('GET IN TOUCH', 'Make it happen.', 'Have a project or campaign in mind? Start the conversation.')}<Contact /></>}
    </main>
    <footer className="site-footer"><div className="container"><div className="footer-upper"><div><Link href={href('home')} className="footer-logo">{content!.about.name}<span>✳</span></Link><p>Visuals that speak. Ideas that move.</p></div><div className="footer-nav">{nav.slice(1).map(l => <Link key={l.page} href={href(l.page)}>{l.label}</Link>)}<Link href={href('contact')}>Contact</Link></div></div><div className="footer-lower"><span>© {new Date().getFullYear()} {content!.about.name}. Crafted with intention.</span><span>CREATIVE DESIGN × BOOSTORA LK <span className="live-dot" /></span></div></div></footer>
    {whatsapp && <a className="floating-whatsapp" href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Boostora LK"><MessageCircle size={27} /><span>Chat on WhatsApp</span></a>}
    {selected && <ProjectModal project={selected} close={() => setSelected(null)} />}
  </div>;
}
