import { useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useInView } from '../hooks/useInView';
import { Footer } from '../components/Footer';

// ─── ARTICLES DATA ────────────────────────────────────────────────────────────
const ARTICLES_SHEET_ID = '1nyB9M0fDRRTt4yOin93eIBsN-NMccDSfvnHdZF20yEs';
const ARTICLES_SHEET_URL = `https://docs.google.com/spreadsheets/d/${ARTICLES_SHEET_ID}/gviz/tq?tqx=out:json&sheet=Sheet1`;

interface ArticleItem {
  id: string;
  colA: string; // date
  colB: string; // image
  colC: string; // title
  colD: string; // description
  colE: string; // tags
}

function getCellValue(cell: any): string {
  if (!cell) return '';
  if (cell.f !== undefined && cell.f !== null) return String(cell.f);
  if (cell.v !== undefined && cell.v !== null) return String(cell.v);
  return '';
}

function calcRelative(date: Date): string {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  const diffMonths = Math.floor(diffDays / 30);
  if (diffDays === 0) return 'วันนี้';
  if (diffDays === 1) return 'เมื่อวาน';
  if (diffDays < 30) return `${diffDays} วันที่แล้ว`;
  if (diffMonths === 1) return 'เดือนก่อน';
  if (diffMonths < 12) return `${diffMonths} เดือนก่อน`;
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDate(raw: string): string {
  if (!raw) return '';
  const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slashMatch) {
    const day = parseInt(slashMatch[1]);
    const month = parseInt(slashMatch[2]);
    let year = parseInt(slashMatch[3]);
    if (year < 100) year = year < 50 ? 2000 + year : 1900 + year;
    const date = new Date(year, month - 1, day);
    if (!isNaN(date.getTime())) return calcRelative(date);
  }
  const gvizMatch = raw.match(/^Date\((\d+),(\d+),(\d+)\)/);
  if (gvizMatch) {
    const date = new Date(parseInt(gvizMatch[1]), parseInt(gvizMatch[2]), parseInt(gvizMatch[3]));
    if (!isNaN(date.getTime())) return calcRelative(date);
  }
  const date = new Date(raw);
  if (!isNaN(date.getTime())) return calcRelative(date);
  return raw;
}

function useArticlesData() {
  const [items, setItems] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(ARTICLES_SHEET_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        const jsonStr = text.replace(/^[^(]+\(/, '').replace(/\);?\s*$/, '');
        const json = JSON.parse(jsonStr);
        const rows: any[] = json?.table?.rows ?? [];

        const parsed: ArticleItem[] = rows
          .map((row: any, i: number) => {
            const c = row.c ?? [];
            return {
              id: String(i + 1),
              colA: getCellValue(c[0]),
              colB: getCellValue(c[1]),
              colC: getCellValue(c[2]),
              colD: getCellValue(c[3]),
              colE: getCellValue(c[4]),
            };
          })
          .filter((a) => a.colC || a.colB);

        setItems(parsed);
      } catch (err: any) {
        console.error('Articles load error:', err);
        setError('ไม่สามารถโหลดบทความได้');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { items, loading, error };
}

// ─── ARTICLES MARQUEE ─────────────────────────────────────────────────────────
function ArticlesMarquee({
  items,
  speed = 60,
  reverse = false,
}: {
  items: ArticleItem[];
  speed?: number;
  reverse?: boolean;
}) {
  const navigate = useNavigate();
  const doubled = [...items, ...items];

  const cardH = 'calc((100vh - 200px) / 2 - 16px)';
  const cardW = 'calc(((100vh - 200px) / 2 - 16px) * 1.6)';

  return (
    <div className="w-full overflow-hidden">
      <div
        className="flex gap-4"
        style={{
          width: 'max-content',
          animation: `portfolio-marquee-${reverse ? 'rev' : 'fwd'} ${speed}s linear infinite`,
        }}
      >
        {doubled.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            onClick={() => navigate(`/articles/${item.id}`)}
            className="group relative flex-shrink-0 cursor-pointer overflow-hidden rounded-[24px] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            style={{ width: cardW, height: cardH }}
          >
            {item.colB ? (
              <img
                src={item.colB}
                alt={item.colC}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-zinc-800 to-zinc-500" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              {item.colA && (
                <p className="mb-1 text-xs text-white/50">{formatDate(item.colA)}</p>
              )}
              <h3
                className="truncate text-lg font-bold text-white leading-tight"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {item.colC}
              </h3>
              {item.colE && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.colE.split('|').map((t) => t.trim()).filter(Boolean).slice(0, 2).map((tag) => (
                    <span key={tag} className="rounded-full bg-white/15 px-2 py-0.5 text-xs text-white/80">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const values = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
      </svg>
    ),
    title: 'คิดจากเป้าหมายธุรกิจ',
    description: 'เราเริ่มจากการเข้าใจลูกค้า กลุ่มเป้าหมาย และผลลัพธ์ที่เว็บไซต์ควรสร้าง ไม่ใช่แค่ออกแบบให้สวย',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
      </svg>
    ),
    title: 'ออกแบบให้ใช้งานง่าย',
    description: 'ทุกหน้า ทุกปุ่ม และทุกข้อความถูกจัดวางให้ผู้ใช้งานเข้าใจเร็ว ตัดสินใจง่าย และเดินต่อได้อย่างเป็นธรรมชาติ',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
      </svg>
    ),
    title: 'สร้างภาพลักษณ์ที่น่าเชื่อถือ',
    description: 'ดีไซน์ของเราช่วยให้แบรนด์ดูเป็นมืออาชีพ สื่อสารตัวตนชัด และพร้อมแข่งขันบนโลกดิจิทัล',
  },
];

const process = [
  'วิเคราะห์ธุรกิจและวางทิศทางเว็บไซต์',
  'ออกแบบโครงสร้าง UX และหน้าจอ UI',
  'พัฒนาเว็บไซต์ให้รองรับทุกอุปกรณ์',
  'ทดสอบ ปรับแต่ง และส่งมอบพร้อมคำแนะนำ',
];

// ─── ANIMATION: CLIP-WIPE (white/black) ───────────────────────────────────────
// Not used currently - kept for future reference
/* eslint-disable */
function ClipWipe({ children, className = '' }: { children: ReactNode; className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 });
  const [clipWidth, setClipWidth] = useState(0);

  useEffect(() => {
    if (!inView) { setClipWidth(0); return; }
    let animationFrame: number;
    const duration = 1200;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setClipWidth(ease * 100);
      if (progress < 1) animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [inView]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <div className="relative z-10">{children}</div>
      <div className="absolute inset-0 z-20 bg-white" style={{ clipPath: `inset(0 ${100 - clipWidth}% 0 0)` }} />
      <div className="absolute inset-0 z-30 bg-white transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ transform: `translateX(${inView ? '100%' : '0'})` }} />
    </div>
  );
}

// ─── ALTERNATIVE: STAGGER SLIDE ───────────────────────────────────────────────
function StaggerSlide({ children, className = '' }: { children: ReactNode; className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 });
  return (
    <div ref={ref} className={`overflow-hidden ${className}`} style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(60px)', transition: 'opacity 0.6s ease, transform 0.8s cubic-bezier(0.16,1,0.3,1)' }}>
      {children}
    </div>
  );
}

// ─── FADE UP ──────────────────────────────────────────────────────────────────
function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 });
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── LINE REVEAL ──────────────────────────────────────────────────────────────
function LineReveal({ delay = 0 }: { delay?: number }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.5 });
  return (
    <div ref={ref} className="h-px overflow-hidden">
      <div
        style={{
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.1)',
          transformOrigin: 'left',
          transform: inView ? 'scaleX(1)' : 'scaleX(0)',
          transition: `transform 1s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        }}
      />
    </div>
  );
}

// ─── COUNTER ──────────────────────────────────────────────────────────────────
function CountUp({ end, duration = 1800, suffix = '', delay = 0 }: { end: number; duration?: number; suffix?: string; delay?: number }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView<HTMLDivElement>();

  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(() => {
      let start: number;
      const step = (ts: number) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        setCount(Math.floor(p * end));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timer);
  }, [inView, end, duration, delay]);

  return <div ref={ref}>{count.toLocaleString('th-TH')}{suffix}</div>;
}

// ─── STAGGER WORDS (each word slides up) ─────────────────────────────────────
function StaggerWords({
  text,
  className = '',
  baseDelay = 0,
  stagger = 35,
}: {
  text: string;
  className?: string;
  baseDelay?: number;
  stagger?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.05, rootMargin: '0px 0px -20px 0px' });
  const words = text.split(' ');

  return (
    <div ref={ref} className={`flex flex-wrap ${className}`} style={{ gap: '0 0.25em' }}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block"
          style={{
            transform: inView ? 'translateY(0)' : 'translateY(80px)',
            opacity: inView ? 1 : 0,
            transition: `transform 0.8s cubic-bezier(0.16,1,0.3,1) ${baseDelay + i * stagger}ms, opacity 0.5s ease ${baseDelay + i * stagger}ms`,
          }}
        >
          {word}
        </span>
      ))}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export function About() {
  const { items: articleItems, loading: articlesLoading, error: articlesError } = useArticlesData();

  return (
    <main className="relative min-h-screen text-black">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen flex-col justify-center px-5 pt-32 pb-20 sm:px-8 md:px-10">
        <div className="max-w-5xl">
          <FadeUp delay={100}>
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.25em] text-black/45">
              About Eskimo Studio
            </p>
          </FadeUp>

          <FadeUp delay={200}>
            <h1
              style={{
                fontSize: '56px',
                lineHeight: 1.2,
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
              }}
              className="mb-10"
            >
              <StaggerWords
                text="เราคือสตูดิโอที่ออกแบบเว็บไซต์ให้ธุรกิจเติบโตอย่างมีตัวตน"
                baseDelay={300}
                stagger={35}
              />
            </h1>
          </FadeUp>

          <FadeUp delay={600}>
            <div className="flex flex-wrap gap-10 text-black/55 text-sm font-medium uppercase tracking-widest">
              <span>Web Design</span>
              <span>UX/UI</span>
              <span>Development</span>
              <span>Strategy</span>
            </div>
          </FadeUp>
        </div>

        {/* Stats */}
        <FadeUp delay={400} className="mt-16 max-w-5xl">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[28px] sm:grid-cols-4" style={{ backgroundColor: 'rgba(0,0,0,0.08)' }}>
            {[
              { value: 100, suffix: '+', label: 'โปรเจกต์' },
              { value: 5, suffix: '+', label: 'ปีประสบการณ์' },
              { value: 100000, suffix: '+', label: 'ผู้ติดตาม', format: true },
              { value: 98, suffix: '%', label: 'ลูกค้าพึงพอใจ' },
            ].map((stat, i) => (
              <div key={i} className="px-6 py-7 backdrop-blur-md" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <div
                  className="mb-1 font-black text-black"
                  style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontFamily: 'var(--font-heading)' }}
                >
                  {stat.format
                    ? <CountUp end={stat.value} suffix={stat.suffix} delay={i * 120} />
                    : <CountUp end={stat.value} suffix={stat.suffix} delay={i * 120} />
                  }
                </div>
                <p className="text-sm text-black/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </FadeUp>
      </section>

      {/* ── Marquee ───────────────────────────────────────────────────────── */}
      <section className="relative z-[2] overflow-hidden py-8 sm:py-10">
        <div className="services-marquee flex w-max whitespace-nowrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={i}
              className="px-6 text-[42px] font-black leading-none text-white sm:px-10 sm:text-[72px] md:text-[96px] lg:text-[120px]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              ABOUT ESKIMO / WEB AGENCY / ESKIMO STUDIO
            </span>
          ))}
        </div>
      </section>

      {/* ── Articles Section ──────────────────────────────────────────────── */}
      {!articlesLoading && !articlesError && articleItems.length > 0 && (
        <section className="relative z-[2] py-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 px-5 sm:px-8 md:px-10 text-center" style={{ fontFamily: 'var(--font-heading)' }}>
            บทความและข่าวสารล่าสุด
          </h2>
          <ArticlesMarquee items={articleItems} speed={70} reverse={false} />
        </section>
      )}

      {/* ── Who We Are ───────────────────────────────────────────────────── */}
      <section className="px-5 py-28 sm:px-8 md:px-10">
        <div className="mx-auto max-w-6xl">
          <LineReveal />

          <div className="mt-16 grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <FadeUp delay={0}>
              <div>
                <img
                  src="https://scontent.fbkk12-2.fna.fbcdn.net/v/t39.30808-1/243165862_4647155171962012_4817391960664139166_n.jpg?stp=dst-jpg_tt6&cstp=mx810x810&ctp=s480x480&_nc_cat=104&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=RQuikpEavHIQ7kNvwHSkFuj&_nc_oc=AdqeXrlIXP72Co9g8WddGa1TFIuRYDqEXLSGUQa-YmpxP8hiDdcyga-yCFG7YWMa1aDNSH2Z-IxDP8c33CNsd0YV&_nc_zt=24&_nc_ht=scontent.fbkk12-2.fna&_nc_gid=4ORSptn0RNQ-AjA8kHYuzQ&_nc_ss=7b2a8&oh=00_AQAeQiHH6KwBs-mLI5EJUQ9rdil-2NR5bRmbVzG7Zypipg&oe=6A6F6E5C"
                  alt="eskimo"
                  className="w-48 h-48 rounded-full object-cover sm:w-56 sm:h-56"
                />
              </div>
            </FadeUp>

            <div className="space-y-6">
              <FadeUp delay={100}>
                <p className="text-xl leading-relaxed text-black/70">
                  เราเป็นทีมออกแบบและพัฒนาเว็บไซต์ที่เชื่อว่าเว็บไซต์ที่ดีควรทำงานได้มากกว่าความสวยงาม
                  เพราะเว็บไซต์คือหน้าร้าน เครื่องมือขาย และภาพลักษณ์ของแบรนด์ในเวลาเดียวกัน
                </p>
              </FadeUp>
              <FadeUp delay={180}>
                <p className="text-xl leading-relaxed text-black/70">
                  ทุกโปรเจกต์จึงถูกออกแบบจากความเข้าใจธุรกิจจริง ผสาน UX/UI, เนื้อหา และเทคโนโลยี
                  เพื่อให้ผู้ใช้งานรู้สึกมั่นใจและตัดสินใจได้ง่ายขึ้น
                </p>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────────────── */}
      <section className="px-5 pb-28 sm:px-8 md:px-10">
        <div className="mx-auto max-w-6xl">
          <LineReveal />
          <div className="mt-16">
            <FadeUp delay={0}>
              <h2
                className="mb-12 text-3xl font-bold sm:text-4xl"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                สิ่งที่เราเชื่อ
              </h2>
            </FadeUp>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {values.map((value, i) => (
                <FadeUp key={value.title} delay={i * 100}>
                  <div className="group h-full rounded-[28px] border border-white/60 bg-white/80 p-7 shadow-sm transition duration-500 hover:-translate-y-2 hover:shadow-xl">
                    <div className="mb-6 flex items-center justify-center w-14 h-14 rounded-2xl bg-black text-white">
                      {value.icon}
                    </div>
                    <h3 className="mb-4 text-xl font-semibold">{value.title}</h3>
                    <p className="leading-relaxed text-black/65">{value.description}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Process ──────────────────────────────────────────────────────── */}
      <section className="px-5 pb-28 sm:px-8 md:px-10">
        <div className="mx-auto max-w-6xl">
          <LineReveal />
          <div className="mt-16 grid gap-16 lg:grid-cols-[1fr_0.9fr] lg:items-start">
            <div>
              <FadeUp delay={0}>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-black/45">How We Work</p>
              </FadeUp>
              <FadeUp delay={80}>
                <h3
                  style={{
                    fontSize: 'clamp(24px, 3.5vw, 40px)',
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading)',
                    lineHeight: 1.2,
                  }}
                  className="mb-8"
                >
                  <StaggerWords
                    text="ทำงานเป็นขั้นตอน ชัดเจน และคุยง่าย"
                    baseDelay={100}
                    stagger={45}
                  />
                </h3>
              </FadeUp>
              <FadeUp delay={300}>
                <p className="text-lg leading-relaxed text-black/65">
                  เราช่วยจัดความคิด กระชับข้อมูล และเปลี่ยนสิ่งที่ธุรกิจต้องการสื่อสาร
                  ให้กลายเป็นเว็บไซต์ที่ใช้งานจริงได้ดีบนทุกอุปกรณ์
                </p>
              </FadeUp>
            </div>

            <div className="space-y-3">
              {process.map((item, i) => (
                <FadeUp key={item} delay={i * 80}>
                  <div className="flex items-center gap-5 rounded-[20px] border border-white/60 bg-white/80 p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="font-medium text-black/78">{item}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="px-5 pb-28 sm:px-8 md:px-10">
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <div className="overflow-hidden rounded-[32px] bg-white/85 border border-white/70 p-8 text-black shadow-lg sm:p-12">
              <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <FadeUp delay={0}>
                    <h1
                      style={{
                        fontSize: '56px',
                        lineHeight: 1.25,
                        fontWeight: 700,
                        fontFamily: 'var(--font-heading)',
                      }}
                      className="mb-5"
                    >
                      <StaggerWords
                        text="อยากสร้างเว็บไซต์ที่ดูดีและช่วยให้ธุรกิจเดินต่อได้ง่ายขึ้น?"
                        baseDelay={100}
                        stagger={30}
                      />
                    </h1>
                  </FadeUp>
                  <FadeUp delay={400}>
                    <p className="max-w-2xl text-lg leading-relaxed text-black/65">
                      เริ่มจากเล่าเป้าหมายของคุณให้เราฟัง แล้วเราจะช่วยวางแนวทางเว็บไซต์
                      ที่เหมาะกับแบรนด์และผู้ใช้งานของคุณ
                    </p>
                  </FadeUp>
                </div>
                <FadeUp delay={500}>
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center rounded-full bg-black px-10 py-5 text-[18px] font-semibold text-white transition-transform duration-300 hover:scale-[1.03]"
                  >
                    เริ่มต้นโปรเจกต์กับเรา
                    <span className="ml-3">→</span>
                  </Link>
                </FadeUp>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      <Footer />
    </main>
  );
}
