import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';

const TITLE_TEXT = 'เติบโตไปกับเรา';

// ─── FAQ DATA ─────────────────────────────────────────────────────────────────
const faqs = [
  {
    question: 'เติบโตไปกับเรา คืออะไร?',
    answer: 'เป็นแพ็กเกจบริการที่เราทำงานเป็นพาร์ทเนอร์ระยะยาวกับธุรกิจของคุณ ไม่ใช่แค่ส่งมอบเว็บไซต์แล้วจบ แต่เราจะช่วยดูแล อัปเดต และพัฒนาเว็บไซต์ของคุณให้เติบโตไปพร้อมกับธุรกิจ'
  },
  {
    question: 'บริการดูแลหลังส่งมอบมีอะไรบ้าง?',
    answer: 'ครอบคลุมการแก้ไขบั๊ก อัปเดตเนื้อหา เพิ่มฟีเจอร์ใหม่ ตรวจสอบความปลอดภัย สำรองข้อมูล ให้คำปรึกษาการใช้งาน และวิเคราะห์ผลลัพธ์เพื่อปรับปรุงเว็บไซต์ให้ทำงานได้ดีขึ้นเรื่อยๆ'
  },
  {
    question: 'มีค่าใช้จ่ายเท่าไหร่?',
    answer: 'ขึ้นอยู่กับขอบเขตของบริการที่ต้องการ เรามีแพ็กเกจรายเดือนเริ่มต้นที่ 5,000-15,000 บาท หรือแพ็กเกจรายปีที่ประหยัดกว่า สามารถปรับแต่งตามความต้องการของธุรกิจได้'
  },
  {
    question: 'ต่างจากการทำเว็บไซต์ทั่วไปอย่างไร?',
    answer: 'การทำเว็บไซต์ทั่วไปจบที่การส่งมอบ แต่การเติบโตไปกับเราคือการมีพาร์ทเนอร์ที่คอยดูแลเว็บไซต์อย่างต่อเนื่อง วิเคราะห์ผลลัพธ์ และปรับปรุงให้เว็บไซต์ทำงานได้ดีขึ้นตามเป้าหมายธุรกิจ'
  },
  {
    question: 'เหมาะกับธุรกิจแบบไหน?',
    answer: 'เหมาะกับธุรกิจที่ต้องการใช้เว็บไซต์เป็นเครื่องมือหลักในการเติบโต มีการอัปเดตเนื้อหาบ่อย ต้องการวิเคราะห์ผลลัพธ์ หรือต้องการมีทีมดูแลเว็บไซต์ที่พร้อมให้บริการตลอดเวลา'
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

export function Growth() {
  const { displayed, done } = useTypewriter(TITLE_TEXT, 40);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setContentVisible(true), 800);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="relative min-h-screen text-black">
      {/* Hero Section */}
      <section className="relative z-[1] flex min-h-[90vh] flex-col justify-end px-5 pb-12 sm:px-8 md:justify-center md:px-10 md:pb-0">
        <div className="relative z-10 max-w-4xl mt-32 md:mt-0 pt-16">
          <p className="mb-4 text-lg font-medium tracking-wide uppercase text-black/60">
            Growth (เติบโตไปด้วยกัน)
          </p>
          <h1
            className="mb-8 min-h-[120px] text-black sm:min-h-[80px]"
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
            className="text-black/80 max-w-3xl transition-all duration-700 space-y-6"
            style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
              lineHeight: 1.6,
              opacity: contentVisible ? 1 : 0,
              transform: contentVisible ? 'translateY(0)' : 'translateY(15px)',
            }}
          >
            <p>
              Eskimo Studio พร้อมเป็นพาร์ทเนอร์ในการเติบโตของธุรกิจคุณ
              ด้วยบริการออกแบบและพัฒนาเว็บไซต์ที่ช่วยให้แบรนด์ของคุณโดดเด่น
              และสร้างผลลัพธ์ที่วัดผลได้จริง
            </p>
            <p>
              เราไม่เพียงแค่สร้างเว็บไซต์ แต่เราสร้างเครื่องมือที่ช่วยให้ธุรกิจของคุณเติบโตอย่างยั่งยืน
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="relative z-[2] px-5 py-24 sm:px-8 md:px-10">
        <div className="max-w-5xl mx-auto space-y-20">
          
          <div className="space-y-12">
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
              ทำไมต้องเติบโตกับเรา?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-3xl bg-white/80 border border-white/60 shadow-sm">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-3">มุ่งเน้นผลลัพธ์</h3>
                <p className="text-black/70 leading-relaxed">
                  เราออกแบบเว็บไซต์ที่ไม่ได้สวยแค่ตา แต่สามารถสร้างยอดขาย เพิ่มลูกค้า 
                  และช่วยให้ธุรกิจเติบโตได้จริง
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-white/80 border border-white/60 shadow-sm">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-xl font-semibold mb-3">พาร์ทเนอร์ระยะยาว</h3>
                <p className="text-black/70 leading-relaxed">
                  เราไม่ทิ้งคุณหลังส่งมอบเว็บไซต์ 
                  แต่พร้อมดูแล อัปเดต และพัฒนาเว็บไซต์ของคุณให้ทันสมัยอยู่เสมอ
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-white/80 border border-white/60 shadow-sm">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-3">วิเคราะห์และปรับปรุง</h3>
                <p className="text-black/70 leading-relaxed">
                  เราติดตามผลลัพธ์ วิเคราะห์พฤติกรรมผู้ใช้งาน 
                  และปรับปรุงเว็บไซต์ให้ทำงานได้ดีขึ้นเรื่อยๆ
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-white/80 border border-white/60 shadow-sm">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-semibold mb-3">เทคโนโลยีที่ทันสมัย</h3>
                <p className="text-black/70 leading-relaxed">
                  เราใช้เทคโนโลยีที่ทันสมัยที่สุด เพื่อให้เว็บไซต์ของคุณโหลดเร็ว ปลอดภัย 
                  และพร้อมรองรับการเติบโตในอนาคต
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white/80 p-10 sm:p-14 rounded-[2.5rem] border border-white shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8" style={{ fontFamily: 'var(--font-heading)' }}>
              คำถามที่พบบ่อย (FAQ)
            </h2>
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
                พร้อมเริ่มต้นเติบโตไปด้วยกันแล้วหรือยัง?
              </h2>
              <p className="text-lg text-black/70 mb-10 leading-relaxed">
                มาคุยกันเกี่ยวกับโปรเจกต์ของคุณ และวางแผนการเติบโตไปด้วยกัน
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
