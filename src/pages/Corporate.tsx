import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { usePortfolioData, PortfolioMarquee } from './Portfolio';

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
  speed = 40,
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

const TITLE_TEXT = 'ออกแบบเว็บไซต์บริษัท';

// ─── FAQ DATA ─────────────────────────────────────────────────────────────────
const faqs = [
  {
    question: 'ทำเว็บไซต์บริษัทใช้เวลานานแค่ไหน?',
    answer: 'โดยปกติใช้เวลาประมาณ 4-8 สัปดาห์ ขึ้นอยู่กับขนาดและความซับซ้อนของเว็บไซต์ เริ่มตั้งแต่การวางแผน ออกแบบ พัฒนา ทดสอบ จนถึงส่งมอบพร้อมคำแนะนำการใช้งาน'
  },
  {
    question: 'ราคาเว็บไซต์บริษัทเริ่มต้นที่เท่าไหร่?',
    answer: 'ราคาขึ้นอยู่กับฟีเจอร์และความต้องการของธุรกิจ เว็บไซต์บริษัทมาตรฐานเริ่มต้นประมาณ 30,000-80,000 บาท หากต้องการระบบพิเศษ เช่น ระบบหลังบ้าน หลายภาษา หรือ API integration จะมีราคาเพิ่มตามความซับซ้อน สามารถปรึกษาและขอใบเสนอราคาได้ฟรี'
  },
  {
    question: 'หลังส่งมอบเว็บไซต์แล้ว สามารถแก้ไขเนื้อหาเองได้ไหม?',
    answer: 'ได้ครับ เราจะติดตั้งระบบจัดการเนื้อหา (CMS) ที่ใช้งานง่าย พร้อมสอนการใช้งานให้ทีมคุณสามารถอัปเดตข่าวสาร บทความ รูปภาพ หรือข้อมูลบริษัทได้เองโดยไม่ต้องพึ่งโปรแกรมเมอร์'
  },
  {
    question: 'เว็บไซต์รองรับมือถือและแท็บเล็ตไหม?',
    answer: 'รองรับครับ ทุกเว็บไซต์ที่เราออกแบบเป็น Responsive Design คือปรับตัวให้เหมาะกับทุกขนาดหน้าจอโดยอัตโนมัติ ทั้งมือถือ แท็บเล็ต และคอมพิวเตอร์ เพื่อให้ผู้เข้าชมได้ประสบการณ์ที่ดีที่สุดไม่ว่าจะใช้อุปกรณ์ใด'
  },
  {
    question: 'มีบริการดูแลหลังส่งมอบไหม?',
    answer: 'มีครับ เรามีแพ็กเกจดูแลรักษาเว็บไซต์รายเดือนหรือรายปี ครอบคลุมการอัปเดตระบบ แก้ไขบั๊ก สำรองข้อมูล ตรวจสอบความปลอดภัย และให้คำปรึกษาเรื่องการใช้งาน เพื่อให้เว็บไซต์ของคุณทำงานได้อย่างราบรื่นและปลอดภัยตลอดเวลา'
  },
];

function FAQItem({ faq, index }: { faq: typeof faqs[0]; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-black/10 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-start justify-between gap-4 py-6 text-left transition-colors hover:text-black/60"
      >
        <span className="flex-1 text-lg font-semibold leading-tight">
          {index + 1}. {faq.question}
        </span>
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/5 text-black transition-transform duration-300"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{
          maxHeight: isOpen ? '500px' : '0',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <p className="pb-6 text-base leading-relaxed text-black/70">
          {faq.answer}
        </p>
      </div>
    </div>
  );
}

function useTypewriter(text: string, speed = 50, startDelay = 300) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    const delay = window.setTimeout(() => {
      let index = 0;
      const interval = window.setInterval(() => {
        index += 1;
        setDisplayed(text.slice(0, index));
        if (index >= text.length) {
          window.clearInterval(interval);
          setDone(true);
        }
      }, speed);
    }, startDelay);
    return () => window.clearTimeout(delay);
  }, [text, speed, startDelay]);

  return { displayed, done };
}

const features = [
  {
    title: 'Corporate Identity',
    description: 'สร้างเว็บไซต์ที่สะท้อนอัตลักษณ์และค่านิยมของบริษัท เพื่อสร้างความน่าเชื่อถือและความประทับใจแรกพบ',
  },
  {
    title: 'Professional Design',
    description: 'ดีไซน์ที่ดูมืออาชีพ ทันสมัย และเหมาะสมกับธุรกิจระดับองค์กร สร้างภาพลักษณ์ที่แข็งแกร่ง',
  },
  {
    title: 'Content Management',
    description: 'ระบบจัดการเนื้อหาที่ใช้งานง่าย สามารถอัปเดตข่าวสาร บทความ และข้อมูลบริษัทได้ด้วยตัวเอง',
  },
  {
    title: 'Multi-language Support',
    description: 'รองรับหลายภาษา เหมาะสำหรับบริษัทที่มีลูกค้าหรือพาร์ทเนอร์ต่างประเทศ',
  },
  {
    title: 'Investor Relations',
    description: 'ส่วนสำหรับนักลงทุน แสดงข้อมูลทางการเงิน รายงานประจำปี และข่าวสารบริษัท',
  },
  {
    title: 'Career Section',
    description: 'หน้ารับสมัครงานที่ดูน่าสนใจ ช่วยดึงดูดคนเก่งมาร่วมงานกับคุณ',
  },
];

export function Corporate() {
  const { displayed, done } = useTypewriter(TITLE_TEXT, 40);
  const [contentVisible, setContentVisible] = useState(false);
  const { items: portfolioItems, loading: portfolioLoading, error: portfolioError } = usePortfolioData();
  const { items: articleItems, loading: articlesLoading, error: articlesError } = useArticlesData();

  useEffect(() => {
    const timer = window.setTimeout(() => setContentVisible(true), 800);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="relative min-h-screen text-black">
      {/* Hero Section - reduced height */}
      <section className="relative z-[1] flex min-h-[45vh] flex-col justify-end px-5 pb-6 sm:px-8 md:px-10 pt-28">
        <div className="relative z-10 max-w-4xl">
          <p className="mb-3 text-base font-medium tracking-wide uppercase text-black/60">
            Corporate Website (เว็บไซต์บริษัท)
          </p>
          <h1
            className="mb-6 text-black"
            style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              lineHeight: 1.2,
              fontWeight: 600,
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.02em',
            }}
          >
            {displayed}
            {!done && (
              <span
                className="ml-[4px] inline-block h-[1em] w-[3px] align-middle"
                style={{ background: '#000', animation: 'blink 1s step-end infinite' }}
              />
            )}
          </h1>

          <div
            className="text-black/80 max-w-2xl transition-all duration-700 space-y-4"
            style={{
              fontSize: 'clamp(15px, 1.8vw, 18px)',
              lineHeight: 1.6,
              opacity: contentVisible ? 1 : 0,
              transform: contentVisible ? 'translateY(0)' : 'translateY(15px)',
            }}
          >
            <p>
              เว็บไซต์บริษัทคือหน้าตาออนไลน์ของธุรกิจคุณ 
              ที่จะสร้างความประทับใจแรกพบให้กับลูกค้า พาร์ทเนอร์ และนักลงทุน
            </p>
            <p>
              เราออกแบบเว็บไซต์บริษัทที่ไม่เพียงแค่สวยงาม 
              แต่ยังสะท้อนความเป็นมืออาชีพ สร้างความน่าเชื่อถือ 
              และช่วยให้ธุรกิจของคุณดูโดดเด่นกว่าคู่แข่ง
            </p>
          </div>
        </div>
      </section>

      {/* Portfolio Marquee Section - shows immediately */}
      {!portfolioLoading && !portfolioError && portfolioItems.length > 0 && (
        <section className="relative z-[2] py-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 px-5 sm:px-8 md:px-10" style={{ fontFamily: 'var(--font-heading)' }}>
            ผลงานของเรา
          </h2>
          <PortfolioMarquee items={portfolioItems} speed={55} reverse={false} />
        </section>
      )}

      {/* Content Section */}
      <section className="relative z-[2] px-5 py-24 sm:px-8 md:px-10">
        <div className="max-w-5xl mx-auto space-y-20">
          
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-12" style={{ fontFamily: 'var(--font-heading)' }}>
              ฟีเจอร์สำหรับเว็บไซต์บริษัท
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, i) => (
                <div key={i} className="h-full p-8 rounded-3xl bg-white/80 border border-white/60 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-black/70 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Articles Section */}
          <section className="py-20">
            <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center" style={{ fontFamily: 'var(--font-heading)' }}>
              บทความและข่าวสารล่าสุด
            </h2>
            {articlesLoading && <p className="text-center text-lg text-black/70">กำลังโหลดบทความ...</p>}
            {articlesError && <p className="text-center text-lg text-red-500">{articlesError}</p>}
            {!articlesLoading && !articlesError && articleItems.length > 0 && (
              <ArticlesMarquee items={articleItems} speed={80} reverse={false} />
            )}
          </section>

          {/* Why Corporate Website */}
          <div className="bg-white/80 p-10 sm:p-14 rounded-[2.5rem] border border-white shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8" style={{ fontFamily: 'var(--font-heading)' }}>
              ทำไมต้องมีเว็บไซต์บริษัท?
            </h2>
            <div className="space-y-6 text-lg text-black/80 leading-relaxed mb-10">
              <p>
                📈 <strong>สร้างความน่าเชื่อถือ:</strong> บริษัทที่มีเว็บไซต์ดูมืออาชีพและน่าเชื่อถือมากกว่า
              </p>
              <p>
                🎯 <strong>เข้าถึงลูกค้าได้ตลอด 24 ชั่วโมง:</strong> ลูกค้าสามารถหาข้อมูลบริษัทและบริการของคุณได้ทุกเมื่อ
              </p>
              <p>
                💼 <strong>ดึงดูดพาร์ทเนอร์และนักลงทุน:</strong> แสดงวิสัยทัศน์ ผลงาน และศักยภาพของบริษัท
              </p>
              <p>
                👥 <strong>ดึงดูดคนเก่ง:</strong> หน้ารับสมัครงานที่ดีช่วยให้คุณหาพนักงานที่ใช่ได้ง่ายขึ้น
              </p>
            </div>

            {/* FAQ Section */}
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <FAQItem key={index} faq={faq} index={index} />
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-white/80 p-10 sm:p-14 rounded-[2.5rem] border border-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
                พร้อมสร้างเว็บไซต์บริษัทที่โดดเด่น?
              </h2>
              <p className="text-lg text-black/70 mb-10 leading-relaxed">
                ปรึกษาฟรี! มาคุยกันเกี่ยวกับความต้องการของบริษัทคุณ
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-full bg-black px-8 py-4 text-[17px] font-medium text-white transition-transform duration-300 hover:scale-105 hover:bg-black/90"
              >
                เริ่มต้นโปรเจกต์กับเรา
                <svg className="ml-3" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              
              {/* Contact Info */}
              <div className="pt-8 border-t border-black/10 mt-10">
                <h3 className="text-3xl font-bold mb-8" style={{ fontFamily: 'var(--font-heading)' }}>ติดต่อเรา</h3>
                <div className="flex flex-col items-center justify-center gap-6">
                  {/* QR Code */}
                  <div className="mb-2">
                    <img src="https://qr-official.line.me/gs/M_949gpyab_BW.png?oat_content=qr" alt="LINE QR Code" className="w-48 h-48 object-contain rounded-2xl shadow-sm border border-black/10" />
                  </div>

                  {/* Facebook / Line ID / Tel in the same line */}
                  <div className="flex flex-col md:flex-row items-center justify-center gap-x-10 gap-y-6 text-xl font-medium mt-4">
                    <a href="https://www.facebook.com/eskimostudio" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-black/80 hover:text-black transition-colors">
                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span>eskimostudio</span>
                    </a>

                    <a href="https://lin.ee/X3QAmWB" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-black/80 hover:text-black transition-colors">
                      <img 
                        src="https://cdn-icons-png.flaticon.com/512/3128/3128218.png" 
                        alt="LINE" 
                        className="w-8 h-8"
                      />
                      <span>@eskimo</span>
                    </a>

                    <a href="tel:0924949288" className="flex items-center gap-3 text-black/80 hover:text-black transition-colors">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                      <span>092-494-9288</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
