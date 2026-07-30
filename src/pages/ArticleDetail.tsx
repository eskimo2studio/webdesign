import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Footer } from '../components/Footer';

const SHEET_ID = '1nyB9M0fDRRTt4yOin93eIBsN-NMccDSfvnHdZF20yEs';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Sheet1`;

interface Article {
  id: string;
  colA: string;
  colB: string;
  colC: string;
  colD: string;
  colE: string;
  colF: string;
  colG: string;
  colH: string;
  colI: string;
  colJ: string;
  colK: string;
  colL: string;
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

function RenderContent({ text }: { text: string }) {
  const lines = text.split('\n').filter((l) => l.trim());
  return (
    <>
      {lines.map((line, i) => {
        const t = line.trim();
        // Any http URL → try as image first
        if (t.startsWith('http')) {
          return (
            <img
              key={i}
              src={t}
              alt=""
              className="my-4 w-full rounded-2xl object-cover"
              onError={(e) => {
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

function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const url = window.location.href;

  const shareOptions = [
    {
      label: 'Facebook',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      action: () => window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        '_blank', 'width=600,height=400'
      ),
    },
    {
      label: 'LINE',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
        </svg>
      ),
      action: () => window.open(
        `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`,
        '_blank', 'width=600,height=400'
      ),
    },
    {
      label: copied ? 'คัดลอกแล้ว!' : 'Copy URL',
      icon: copied ? (
        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      action: () => {
        navigator.clipboard.writeText(url).then(() => {
          setCopied(true);
          setTimeout(() => { setCopied(false); setOpen(false); }, 2000);
        });
      },
    },
  ];

  // suppress unused warning
  void title;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-medium text-black/70 transition hover:bg-black/5 hover:text-black"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        แชร์
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-2 min-w-[160px] overflow-hidden rounded-2xl border border-black/8 bg-white shadow-xl">
            {shareOptions.map((opt) => (
              <button
                key={opt.label}
                onClick={() => {
                  opt.action();
                  if (!opt.label.startsWith('Copy') && !copied) setOpen(false);
                }}
                className="flex w-full items-center gap-3 px-5 py-3.5 text-sm text-black/70 transition hover:bg-black/5 hover:text-black"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {opt.icon}
                <span className={copied && opt.label.includes('คัดลอก') ? 'text-green-600' : ''}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
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

        const rowIndex = parseInt(id || '1') - 1;
        const row = rows[rowIndex];
        if (!row) throw new Error('not found');

        const c = row.c ?? [];
        setArticle({
          id: id || '1',
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
        });
      } catch (err) {
        console.error(err);
        setError('ไม่พบบทความนี้');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

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

  if (error || !article) {
    return (
      <main className="relative min-h-screen bg-[#FDFEFF] text-black">
        <section className="flex flex-col items-center justify-center px-5 pb-24 pt-40 sm:px-8">
          <p className="mb-6 text-xl text-black/50">{error || 'ไม่พบบทความ'}</p>
          <button
            onClick={() => navigate('/articles')}
            className="rounded-full bg-black px-8 py-3 text-white transition hover:bg-black/80"
          >
            ← กลับหน้าบทความ
          </button>
        </section>
        <Footer />
      </main>
    );
  }

  const tags = article.colE ? article.colE.split('|').map((t) => t.trim()).filter(Boolean) : [];
  const extraCols = [
    article.colF, article.colG, article.colH,
    article.colI, article.colJ, article.colK, article.colL,
  ].filter(Boolean);

  return (
    <main className="relative min-h-screen bg-[#FDFEFF] text-black">
      <section className="px-5 pb-24 pt-28 sm:px-8 md:px-10">
        <div className="mx-auto max-w-3xl">

          {/* Back button */}
          <button
            onClick={() => navigate('/articles')}
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-black/50 transition hover:text-black"
          >
            ← กลับหน้าบทความ
          </button>

          {/* Col B: รูปภาพหลัก */}
          {article.colB && (
            <div className="mb-8 overflow-hidden rounded-[28px]">
              <img
                src={article.colB}
                alt={article.colC || 'article'}
                className="w-full object-cover max-h-[480px]"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}

          {/* Col A: วันที่ + Col E: Tag + Share */}
          <div className="mb-5 flex flex-wrap items-center gap-3">
            {article.colA && (
              <span className="text-sm text-black/45">{formatDate(article.colA)}</span>
            )}
            {article.colA && tags.length > 0 && <span className="text-black/20">•</span>}
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/55"
              >
                #{tag}
              </span>
            ))}
            <div className="ml-auto">
              <ShareButton title={article.colC} />
            </div>
          </div>

          {/* Col C: หัวข้อ */}
          {article.colC && (
            <h1
              className="mb-6 text-3xl font-bold leading-snug sm:text-4xl"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {article.colC}
            </h1>
          )}

          {/* Col D: คำอธิบาย */}
          {article.colD && (
            <div className="mb-8 leading-relaxed text-black/65 text-[17px]">
              <RenderContent text={article.colD} />
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
