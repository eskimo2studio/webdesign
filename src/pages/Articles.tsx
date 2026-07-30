import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInView } from '../hooks/useInView';
import { Footer } from '../components/Footer';

// ─── SHEET CONFIG ─────────────────────────────────────────────────────────────
// Sheet ID จาก URL: /spreadsheets/d/<SHEET_ID>/edit
const SHEET_ID = '1nyB9M0fDRRTt4yOin93eIBsN-NMccDSfvnHdZF20yEs';
// ดึงข้อมูลผ่าน Google Visualization Query API (ไม่ต้อง publish, ไม่ต้อง API key)
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Sheet1`;

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Article {
  id: string;
  rowIndex: number;
  colA: string; // A = วันที่
  colB: string; // B = รูปภาพ (URL)
  colC: string; // C = หัวข้อ
  colD: string; // D = คำอธิบาย
  colE: string; // E = tag
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
  // Google gviz returns { v: value, f: formatted }
  if (cell.f !== undefined && cell.f !== null) return String(cell.f);
  if (cell.v !== undefined && cell.v !== null) return String(cell.v);
  return '';
}

function formatDate(raw: string): string {
  if (!raw) return '';

  // Try DD/MM/YY or DD/MM/YYYY
  const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slashMatch) {
    const day = parseInt(slashMatch[1]);
    const month = parseInt(slashMatch[2]);
    let year = parseInt(slashMatch[3]);
    if (year < 100) year = year < 50 ? 2000 + year : 1900 + year;
    const date = new Date(year, month - 1, day);
    if (!isNaN(date.getTime())) return calcRelative(date);
  }

  // Google gviz date format: "Date(2026,6,29)" = year, month(0-based), day
  const gvizMatch = raw.match(/^Date\((\d+),(\d+),(\d+)\)/);
  if (gvizMatch) {
    const date = new Date(parseInt(gvizMatch[1]), parseInt(gvizMatch[2]), parseInt(gvizMatch[3]));
    if (!isNaN(date.getTime())) return calcRelative(date);
  }

  const date = new Date(raw);
  if (!isNaN(date.getTime())) return calcRelative(date);

  return raw;
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

// ─── SUB COMPONENTS ───────────────────────────────────────────────────────────
function SlideUp({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function ArticleCard({ article, idx, onClick }: { article: Article; idx: number; onClick: () => void }) {  const tags = article.colE ? article.colE.split('|').map((t) => t.trim()).filter(Boolean) : [];

  return (
    <SlideUp delay={Math.min(idx * 40, 300)}>
      <article
        onClick={onClick}
        className="group flex h-full cursor-pointer flex-col rounded-[28px] border border-white/60 bg-white/80 p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:bg-white/95 hover:shadow-lg"
      >
        {/* รูปภาพ (Col B) */}
        {article.colB && (
          <div className="mb-5 overflow-hidden rounded-2xl aspect-[16/9] relative">
            <img
              src={article.colB}
              alt={article.colC || 'article'}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}

        {/* Tag (Col E) */}
        {tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag) => (
              <span key={tag} className="rounded-full bg-black/5 px-3 py-1 text-xs text-black/70">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* หัวข้อ (Col C) */}
        {article.colC && (
          <h3 className="mb-3 text-xl font-bold leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            {article.colC}
          </h3>
        )}

        {/* คำอธิบาย (Col D) */}
        {article.colD && (
          <p className="mb-4 flex-1 text-sm leading-relaxed text-black/60 line-clamp-3">
            {article.colD}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-black/5 pt-4">
          <span className="text-xs text-black/40">{formatDate(article.colA)}</span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-black transition-transform duration-200 group-hover:translate-x-1">
            อ่านบทความ →
          </span>
        </div>
      </article>
    </SlideUp>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export function Articles() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(SHEET_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const text = await res.text();

        // Google gviz wraps JSON in: google.visualization.Query.setResponse({...})
        const jsonStr = text.replace(/^[^(]+\(/, '').replace(/\);?\s*$/, '');
        const json = JSON.parse(jsonStr);

        const rows: any[] = json?.table?.rows ?? [];

        const parsed: Article[] = rows
          .map((row: any, i: number) => {
            const c = row.c ?? [];
            return {
              id: String(i + 1),
              rowIndex: i + 1,
              colA: getCellValue(c[0]),
              colB: getCellValue(c[1]),
              colC: getCellValue(c[2]),
              colD: getCellValue(c[3]),
              colE: getCellValue(c[4]),
              colF: getCellValue(c[5]),
              colG: getCellValue(c[6]),
              colH: getCellValue(c[7]),
              colI: getCellValue(c[8]),
              colJ: getCellValue(c[9]),
              colK: getCellValue(c[10]),
              colL: getCellValue(c[11]),
            };
          })
          .filter((a) => a.colC || a.colB); // แสดงเฉพาะแถวที่มี title หรือ รูป

        setArticles(parsed);
      } catch (err: any) {
        console.error('Articles load error:', err);
        setError('ไม่สามารถโหลดบทความได้ — กรุณาตรวจสอบว่า Google Sheet เป็น "สาธารณะ" (Anyone with the link can view)');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <main className="relative min-h-screen text-black">

      <section className="relative z-[1] px-5 pb-24 pt-32 sm:px-8 md:px-10">
        <div className="mx-auto max-w-9xl">

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-[28px] bg-white/80 p-7">
                  <div className="mb-5 aspect-[16/9] rounded-2xl bg-black/8" />
                  <div className="mb-2 h-4 w-1/3 rounded bg-black/8" />
                  <div className="mb-3 h-5 w-3/4 rounded bg-black/8" />
                  <div className="h-4 w-full rounded bg-black/8" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-8 text-center">
              <p className="mb-2 font-medium text-red-600">โหลดบทความไม่สำเร็จ</p>
              <p className="text-sm text-red-400">{error}</p>
              <p className="mt-4 text-sm text-black/50">
                วิธีแก้: เปิด Google Sheet → Share → เปลี่ยนเป็น "Anyone with the link"
              </p>
            </div>
          )}

          {/* Articles grid */}
          {!loading && !error && (
            <>
              {articles.length === 0 ? (
                <div className="py-16 text-center text-black/40">ยังไม่มีบทความ</div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {articles.map((article, idx) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      idx={idx}
                      onClick={() => navigate(`/articles/${article.id}`)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </section>

      <Footer />
    </main>
  );
}