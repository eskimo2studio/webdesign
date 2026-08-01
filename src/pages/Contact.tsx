import { useEffect, useState } from 'react';
import { Footer } from '../components/Footer';

function CountUp({
  end,
  duration = 1800,
  suffix = '',
  delay = 0,
}: {
  end: number;
  duration?: number;
  suffix?: string;
  delay?: number;
}) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (started) return;
    const timer = setTimeout(() => {
      setStarted(true);
      let start: number;
      const step = (ts: number) => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timer);
  }, [started, end, duration, delay]);

  return (
    <>
      {count.toLocaleString('th-TH')}
      {suffix}
    </>
  );
}

export function Contact() {
  return (
    <main className="relative min-h-screen text-black">
      {/* Hero Section */}
      <section className="relative z-[1] px-5 pt-32 pb-16 sm:px-8 md:px-10">
        <div className="mx-auto max-w-9xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Column - Heading + Contact Info */}
            <div className="flex flex-col justify-center space-y-10">
              <div>
                <h1
                  className="mb-6 text-black"
                  style={{
                    fontSize: 'clamp(32px, 5vw, 56px)',
                    lineHeight: 1.2,
                    fontWeight: 900,
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  มาคุยกันเรื่อง
                  <br />
                  เว็บไซต์ของคุณ
                </h1>
                <p className="text-lg text-black/70 leading-relaxed">
                  เราพร้อมรับฟังและช่วยคุณสร้างเว็บไซต์ที่ตอบโจทย์ธุรกิจ
                </p>
              </div>

              {/* Facebook Followers */}
              <div className="rounded-[28px] border border-white/60 bg-white/50 backdrop-blur-md p-8 shadow-sm">
                <div className="mb-2 flex items-center gap-3">
                  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="text-sm text-black/60">ผู้ติดตาม Facebook</span>
                </div>
                <div
                  className="text-5xl font-black text-black"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  <CountUp end={100000} suffix="+" delay={400} />
                </div>
              </div>

              {/* Contact Section */}
              <div className="rounded-[28px] border border-white/60 bg-white/50 backdrop-blur-md p-8 shadow-sm">
                <h3 className="text-3xl font-bold mb-8" style={{ fontFamily: 'var(--font-heading)' }}>ติดต่อเรา</h3>
                <div className="flex flex-col items-center justify-center gap-6">
                  {/* QR Code */}
                  <div className="mb-2">
                    <img 
                      src="https://qr-official.line.me/gs/M_949gpyab_BW.png?oat_content=qr" 
                      alt="LINE QR Code" 
                      className="w-48 h-48 object-contain rounded-2xl shadow-sm border border-black/10" 
                    />
                  </div>

                  {/* Facebook / Line ID / Tel in the same line */}
                  <div className="flex flex-col md:flex-row items-center justify-center gap-x-10 gap-y-6 text-xl font-medium mt-4">
                    <a 
                      href="https://www.facebook.com/eskimostudio" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-3 text-black/80 hover:text-black transition-colors"
                    >
                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span>eskimostudio</span>
                    </a>

                    <a 
                      href="https://lin.ee/X3QAmWB" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-3 text-black/80 hover:text-black transition-colors"
                    >
                      <img 
                        src="https://cdn-icons-png.flaticon.com/512/3128/3128218.png" 
                        alt="LINE" 
                        className="w-8 h-8"
                      />
                      <span>@eskimo</span>
                    </a>

                    <a 
                      href="tel:0924949288" 
                      className="flex items-center gap-3 text-black/80 hover:text-black transition-colors"
                    >
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                      </svg>
                      <span>092-494-9288</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Google Form Embed */}
            <div className="flex flex-col justify-center">
              <div className="rounded-[28px] border border-white/60 bg-white/80 p-8 shadow-lg">
               
                
                {/* Embedded Google Form */}
                <div className="relative w-full overflow-hidden rounded-2xl" style={{ height: '800px' }}>
                  <iframe
                    src="https://docs.google.com/forms/d/e/1FAIpQLSfcwCF_06kbkntgQQVKWS8Q10iYQtWXHaqmyhO1iirdDKH_hA/viewform?embedded=true"
                    width="100%"
                    height="800"
                    frameBorder="0"
                    marginHeight={0}
                    marginWidth={0}
                    className="w-full"
                  >
                    กำลังโหลด…
                  </iframe>
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
