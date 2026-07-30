import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useInView } from '../hooks/useInView';
import { Footer } from '../components/Footer';

// ─── SHEET CONFIG ─────────────────────────────────────────────────────────────
// Sheet ID จาก URL
const SHEET_ID = '1WZ3fy77FFyoBUL2c634BzZsDWtAdtYlJzEQtz7ywZF4';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Sheet1`;

// ─── TYPES ────────────────────────────────────────────────────────────────────
// Row 1 = ผลงานที่ 1, Row 2 = ผลงานที่ 2, ...
// Columns:
// A = วันที่ (date) — แสดงเหมือนบทความ
// B = รูปภาพหลัก (image URL)
// C = ชื่อผลงาน (title) — แสดงในการ์ด 1 บรรทัด
// D = คำอธิบายสั้น (summary)
// E = tag — แสดงเหมือนบทความ (แยกด้วย |)
// F-L = เนื้อหาเพิ่มเติม / รูปเพิ่มเติม
export interface PortfolioItem {
  id: string;
  colA: string; // date
  colB: string; // image URL
  colC: string; // title
  colD: string; // summary
  colE: string; // tag
  colF: string;
  colG: string;
  colH: string;
  colI: string;
  colJ: string;
  colK: string;
  colL: string;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
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

function isImageUrl(str: string): boolean {
  const t = str.trim();
  if (!t.startsWith('http')) return false;
  // Has image extension
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)(\?.*)?$/i.test(t)) return true;
  // Known image CDN domains
  if (/fbcdn\.net|googleusercontent\.com|imgur\.com|cloudinary\.com|unsplash\.com|scontent\.|twimg\.com|pbs\.twimg|ibb\.co|postimg\.cc|i\.imgur|storage\.googleapis|amazonaws\.com|cloudfront\.net/.test(t)) return true;
  return false;
}

// Any http URL that looks like an image → render as img, else as text
function isUrl(str: string): boolean {
  return str.trim().startsWith('http');
}

function RenderContent({ text }: { text: string }) {
  const lines = text.split('\n').filter((l) => l.trim());
  return (
    <>
      {lines.map((line, i) => {
        const t = line.trim();
        // Any http URL → try as image
        if (isUrl(t)) {
          return (
            <img
              key={i}
              src={t}
              alt=""
              className="my-4 w-full rounded-2xl object-cover"
              onError={(e) => {
                // If image fails, show as link
                const el = e.target as HTMLImageElement;
                const parent = el.parentElement;
                if (parent) {
                  const a = document.createElement('a');
                  a.href = t;
                  a.target = '_blank';
                  a.rel = 'noopener noreferrer';
                  a.textContent = t;
                  a.className = 'text-blue-600 underline break-all';
                  parent.replaceChild(a, el);
                }
              }}
            />
          );
        }
        return <p key={i} className="mb-3">{line}</p>;
      })}
    </>
  );
}

// ─── MARQUEE ROW ──────────────────────────────────────────────────────────────
export function PortfolioMarquee({
  items,
  speed = 40,
  reverse = false,
}: {
  items: PortfolioItem[];
  speed?: number;
  reverse?: boolean;
}) {
  const navigate = useNavigate();
  const doubled = [...items, ...items];

  // Card size: ใช้ vh เพื่อให้พอดีจอ — 2 แถว ใน ~60vh (หลัง navbar+footer)
  // แต่ละแถว ~28vh สูง, กว้าง aspect 16:10
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
            onClick={() => navigate(`/portfolio/${item.id}`)}
            className="group relative flex-shrink-0 cursor-pointer overflow-hidden rounded-[24px] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            style={{ width: cardW, height: cardH }}
          >
            {/* Col B: รูปหลัก */}
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
              {/* Col A: วันที่ */}
              {item.colA && (
                <p className="mb-1 text-xs text-white/50">{formatDate(item.colA)}</p>
              )}
              {/* Col C: Title — 1 บรรทัด truncate */}
              <h3
                className="truncate text-lg font-bold text-white leading-tight"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {item.colC}
              </h3>
              {/* Col E: Tags */}
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

// ─── SLIDE UP ─────────────────────────────────────────────────────────────────
function SlideUp({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(44px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── SHARED FETCH HOOK ────────────────────────────────────────────────────────
export function usePortfolioData() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(SHEET_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        const jsonStr = text.replace(/^[^(]+\(/, '').replace(/\);?\s*$/, '');
        const json = JSON.parse(jsonStr);
        const rows: any[] = json?.table?.rows ?? [];

        const parsed: PortfolioItem[] = rows
          .map((row: any, i: number) => {
            const c = row.c ?? [];
            return {
              id: String(i + 1),
              colA: getCellValue(c[0]),  // title
              colB: getCellValue(c[1]),  // category
              colC: getCellValue(c[2]),  // image
              colD: getCellValue(c[3]),  // summary
              colE: getCellValue(c[4]),  // description
              colF: getCellValue(c[5]),
              colG: getCellValue(c[6]),
              colH: getCellValue(c[7]),
              colI: getCellValue(c[8]),
              colJ: getCellValue(c[9]),
              colK: getCellValue(c[10]),
              colL: getCellValue(c[11]),
            };
          })
          .filter((a) => a.colA || a.colC); // keep rows that have title or image

        setItems(parsed);
      } catch (err: any) {
        console.error('Portfolio load error:', err);
        setError('ไม่สามารถโหลดผลงานได้ — กรุณาตรวจสอบว่า Google Sheet เป็นสาธารณะ');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { items, loading, error };
}

// ─── PORTFOLIO LIST PAGE ──────────────────────────────────────────────────────
export function Portfolio() {
  const { items, loading, error } = usePortfolioData();

  return (
    <main className="relative flex min-h-screen flex-col text-black">

      <div className="pt-28" />

      {/* Loading */}
      {loading && (
        <section className="flex flex-1 items-center justify-center py-20">
          <div className="flex items-center gap-3 text-black/40">
            <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            กำลังโหลดผลงาน...
          </div>
        </section>
      )}

      {/* Error */}
      {!loading && error && (
        <section className="flex flex-1 items-center justify-center px-5 py-20 text-center">
          <div>
            <p className="mb-2 font-medium text-red-500">โหลดผลงานไม่สำเร็จ</p>
            <p className="text-sm text-black/40">เปิด Google Sheet → Share → "Anyone with the link"</p>
          </div>
        </section>
      )}

      {/* Marquee rows — กึ่งกลางแนวนอน ไม่ scroll */}
      {!loading && !error && items.length > 0 && (
        <section className="flex flex-1 flex-col items-center justify-center gap-4 overflow-hidden py-4">
          <PortfolioMarquee items={items} speed={55} reverse={false} />
          {items.length > 1 && (
            <PortfolioMarquee items={[...items].reverse()} speed={70} reverse={true} />
          )}
        </section>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="flex flex-1 items-center justify-center py-20 text-black/40">
          ยังไม่มีผลงาน
        </div>
      )}

      <Footer />
    </main>
  );
}

// ─── PORTFOLIO DETAIL PAGE ────────────────────────────────────────────────────
export function PortfolioDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { items, loading, error } = usePortfolioData();

  if (loading) {
    return (
      <main className="relative min-h-screen bg-[#FDFEFF] text-black">
        <section className="px-5 pb-24 pt-32 sm:px-8 md:px-10">
          <div className="mx-auto max-w-3xl animate-pulse">
            <div className="mb-6 h-64 rounded-[28px] bg-black/8" />
            <div className="mb-4 h-4 w-1/4 rounded bg-black/8" />
            <div className="mb-6 h-8 w-3/4 rounded bg-black/8" />
            <div className="space-y-3">
              <div className="h-4 w-full rounded bg-black/8" />
              <div className="h-4 w-full rounded bg-black/8" />
              <div className="h-4 w-2/3 rounded bg-black/8" />
            </div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  if (error) {
    return (
      <main className="relative min-h-screen bg-[#FDFEFF] text-black">
        <section className="flex flex-col items-center justify-center px-5 pb-24 pt-40">
          <p className="mb-6 text-black/50">{error}</p>
          <button onClick={() => navigate('/portfolio')} className="rounded-full bg-black px-8 py-3 text-white hover:bg-black/80">
            ← กลับหน้าผลงาน
          </button>
        </section>
        <Footer />
      </main>
    );
  }

  const item = items.find((p) => p.id === slug);
  if (!loading && !item) return <Navigate to="/portfolio" replace />;
  if (!item) return null;

  const extraCols = [
    item.colF, item.colG, item.colH,
    item.colI, item.colJ, item.colK, item.colL,
  ].filter(Boolean);

  return (
    <main className="relative min-h-screen bg-[#FDFEFF] text-black">
      <section className="px-5 pb-24 pt-28 sm:px-8 md:px-10">
        <div className="mx-auto max-w-3xl">

          {/* Back */}
          <button
            onClick={() => navigate('/portfolio')}
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-black/50 transition hover:text-black"
          >
            ← กลับหน้าผลงาน
          </button>

          {/* Col B: รูปภาพหลัก */}
          {item.colB && (
            <div className="mb-8 overflow-hidden rounded-[28px]">
              <img
                src={item.colB}
                alt={item.colC}
                className="w-full object-cover max-h-[480px]"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}

          {/* Col C: Title */}
          {item.colC && (
            <h1
              className="mb-6 text-3xl font-bold leading-snug sm:text-4xl"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {item.colC}
            </h1>
          )}

          {/* Col D: Summary */}
          {item.colD && (
            <p className="mb-8 text-[17px] leading-relaxed text-black/65">{item.colD}</p>
          )}

          {/* Col E: Description */}
          {item.colE && (
            <div className="mb-8 border-t border-black/8 pt-8 leading-relaxed text-black/65 text-[17px]">
              <RenderContent text={item.colE} />
            </div>
          )}

          {/* Cols F–L: เนื้อหาเพิ่มเติม */}
          {extraCols.length > 0 && (
            <div className="space-y-5 border-t border-black/8 pt-8">
              {extraCols.map((col, i) => (
                <div key={i} className="leading-relaxed text-black/65 text-[17px]">
                  <RenderContent text={col} />
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 border-t border-black/8 pt-10 text-center">
            <p className="mb-6 text-base text-black/50">พร้อมเริ่มต้นสร้างเว็บไซต์ของคุณแล้วหรือยัง?</p>
            <button
              onClick={() => navigate('/contact')}
              className="inline-flex items-center gap-3 rounded-full bg-black px-10 py-5 text-[18px] font-semibold text-white transition-transform duration-300 hover:scale-[1.03] hover:bg-black/85"
            >
              เริ่มต้นโปรเจกต์กับเรา
              <span>→</span>
            </button>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
