import { useEffect, useState, type ReactNode } from 'react';
import { useInView } from '../hooks/useInView';
import { Footer } from '../components/Footer';

const CONTACT_TITLE_TEXT = 'คุยกับเราเรื่องเว็บไซต์ที่อยากสร้างให้ธุรกิจของคุณ';

function useTypewriter(text: string, speed = 50, startDelay = 300) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    const delay = window.setTimeout(() => {
      let idx = 0;
      const interval = window.setInterval(() => {
        idx += 1;
        setDisplayed(text.slice(0, idx));
        if (idx >= text.length) {
          window.clearInterval(interval);
          setDone(true);
        }
      }, speed);
    }, startDelay);
    return () => window.clearTimeout(delay);
  }, [text, speed, startDelay]);

  return { displayed, done };
}

function SlideUp({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
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

function CountUpNumber({ end, duration, className, style }: { end: number; duration: number; className?: string; style?: React.CSSProperties }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView<HTMLDivElement>();

  useEffect(() => {
    if (!inView) return;

    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [inView, end, duration]);

  return (
    <div ref={ref} className={className} style={style}>
      {count.toLocaleString('th-TH')}+
    </div>
  );
}

function ProjectTypeDropdown({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (value: string) => void 
}) {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { value: 'ออกแบบเว็บไซต์', label: 'ออกแบบเว็บไซต์' },
    { value: 'ออกแบบแอป', label: 'ออกแบบแอป' },
    { value: 'ปรึกษาโปรเจ็ค', label: 'ปรึกษาโปรเจ็ค' },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-full appearance-none rounded-2xl border border-black/10 bg-white px-5 pr-5 text-base text-left text-black outline-none transition focus:border-black/40 cursor-pointer flex items-center justify-between"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        <span>{value || 'เลือกประเภทงาน'}</span>
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          className={`flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      
      <input type="hidden" name="project_type" value={value} />
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-black/10 bg-white shadow-xl overflow-hidden z-50">
            {options.map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="w-full px-5 py-4 text-left text-base text-black transition-colors duration-200 hover:bg-black/5 first:rounded-t-2xl last:rounded-b-2xl"
                style={{ 
                  fontFamily: 'var(--font-body)',
                  backgroundColor: value === option.value ? 'rgba(0,0,0,0.05)' : 'transparent'
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function Contact() {
  const [showModal, setShowModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [projectType, setProjectType] = useState('');

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
    return cleaned;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    
    formData.append('access_key', import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '');
    formData.append('subject', 'ส่งรายละเอียดโปรเจกต์จากเว็บไซต์');
    formData.append('to', 'eskimosendfile@gmail.com');
    formData.set('project_type', projectType);

    try {
      setIsSending(true);
      
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData)),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('ส่งอีเมลสำเร็จ');
        setShowModal(true);
        form.reset();
      } else {
        console.error('ส่งอีเมลไม่สำเร็จ:', result.message);
      }
    } catch (error: any) {
      console.error('Error sending email:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="relative min-h-screen text-black flex flex-col">
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="rounded-[32px] bg-white p-10 shadow-2xl text-center max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-green-100 p-4">
                <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="mb-4 text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>ส่งข้อมูลสำเร็จ!</h3>
            <p className="mb-8 text-black/70">ขอบคุณที่ติดต่อเรา เราจะติดต่อกลับภายใน 1-2 วันทำการ</p>
            <button
              onClick={() => setShowModal(false)}
              className="rounded-full bg-black px-8 py-3 text-white font-medium transition hover:bg-black/90"
            >
              ปิด
            </button>
          </div>
        </div>
      )}

      <section className="relative z-[1] flex flex-1 flex-col justify-center px-5 py-24 sm:px-8 md:px-10 mt-20">
        <div className="relative z-10 max-w-9xl mx-auto w-full">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-6">
              <SlideUp>
                <div>
                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-black/45">Let's Talk</p>
                  <h2 className="mb-6 text-4xl font-bold sm:text-5xl" style={{ fontFamily: 'var(--font-heading)' }}>
                    เล่าโปรเจกต์ของคุณให้เราฟัง
                  </h2>
                  <p className="text-xl leading-relaxed text-black/68 mb-10">
                    ไม่ว่าจะเริ่มทำเว็บไซต์ใหม่ รีดีไซน์เว็บเดิม หรืออยากปรึกษา UX/UI เราพร้อมช่วยวางทิศทางให้ชัดก่อนเริ่มลงมือ
                  </p>
                </div>
              </SlideUp>

              <SlideUp delay={60}>
                <a
                  href="https://www.facebook.com/eskimostudio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="text-center">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-black/45">ติดตามเรา</p>
                    <div className="mb-4 flex items-center justify-center gap-3">
                      <svg className="w-8 h-8 text-black/70" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <h3 className="text-2xl font-bold text-black/82" style={{ fontFamily: 'var(--font-heading)' }}>
                        Facebook
                      </h3>
                    </div>
                    <div className="mb-2">
                      <CountUpNumber end={100000} duration={2000} className="text-5xl font-black text-black" style={{ fontFamily: 'var(--font-heading)' }} />
                    </div>
                    <p className="text-lg font-medium text-black/70">ผู้ติดตาม</p>
                    <div className="mt-4 inline-flex items-center gap-2 text-black/60 text-sm font-medium">
                      <span>เยี่ยมชมเพจของเรา</span>
                      <span className="transition-transform duration-300">→</span>
                    </div>
                  </div>
                </a>
              </SlideUp>

              <SlideUp delay={90}>
                <div className="block rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-sm transition duration-300 hover:shadow-lg">
                  <div className="text-center flex flex-col items-center justify-center">
                    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-black/45">ติดต่อเรา</p>
                    
                    {/* QR Code */}
                    <div className="mb-6">
                      <img src="https://qr-official.line.me/gs/M_949gpyab_BW.png?oat_content=qr" alt="LINE QR Code" className="w-48 h-48 object-contain rounded-2xl shadow-sm border border-black/10" />
                    </div>

                    {/* Facebook / Line ID / Tel in the same line */}
                    <div className="flex flex-col xl:flex-row items-center justify-center gap-x-6 gap-y-4 text-base font-medium w-full">
                      <a href="https://www.facebook.com/eskimostudio" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-black/80 hover:text-black transition-colors">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        <span>eskimostudio</span>
                      </a>

                      <a href="https://lin.ee/X3QAmWB" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-black/80 hover:text-black transition-colors">
                        <img 
                          src="https://cdn-icons-png.flaticon.com/512/3128/3128218.png" 
                          alt="LINE" 
                          className="w-6 h-6"
                        />
                        <span>@eskimo</span>
                      </a>

                      <a href="tel:0924949288" className="flex items-center gap-2 text-black/80 hover:text-black transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                        <span>092-494-9288</span>
                      </a>
                    </div>
                  </div>
                </div>
              </SlideUp>
            </div>

            <SlideUp delay={180}>
              <form
                className="rounded-[32px] border border-white/70 bg-white/85 p-8 shadow-lg sm:p-10 h-full"
                onSubmit={handleSubmit}
              >
                <div className="mb-8">
                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-black/45">Project Brief</p>
                  <h2 className="text-3xl font-bold sm:text-4xl" style={{ fontFamily: 'var(--font-heading)' }}>
                    ส่งรายละเอียดเบื้องต้น
                  </h2>
                </div>

                <div className="grid gap-6">
                  <label className="block">
                    <span className="mb-2 block text-base font-medium text-black/60">ชื่อของคุณ</span>
                    <input
                      id="inputName"
                      name="from_name"
                      className="h-14 w-full rounded-2xl border border-black/10 bg-white px-5 text-base text-black outline-none transition focus:border-black/40"
                      placeholder="ชื่อ / บริษัท"
                      type="text"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-base font-medium text-black/60">อีเมล</span>
                    <input
                      id="inputEmail"
                      name="from_email"
                      className="h-14 w-full rounded-2xl border border-black/10 bg-white px-5 text-base text-black outline-none transition focus:border-black/40"
                      placeholder="your@email.com"
                      type="email"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-base font-medium text-black/60">เบอร์มือถือ (ติดต่อกลับ)</span>
                    <input
                      id="inputPhone"
                      name="phone"
                      className="h-14 w-full rounded-2xl border border-black/10 bg-white px-5 text-base text-black outline-none transition focus:border-black/40"
                      placeholder="08x-xxx-xxxx"
                      type="tel"
                      maxLength={12}
                      onChange={(e) => {
                        e.target.value = formatPhoneNumber(e.target.value);
                      }}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-base font-medium text-black/60">ประเภทงานที่สนใจ</span>
                    <ProjectTypeDropdown value={projectType} onChange={setProjectType} />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-base font-medium text-black/60">รายละเอียดโปรเจกต์</span>
                    <textarea
                      id="inputDetails"
                      name="message"
                      className="min-h-40 w-full resize-none rounded-2xl border border-black/10 bg-white px-5 py-4 text-base text-black outline-none transition focus:border-black/40"
                      placeholder="เล่าเป้าหมาย เว็บไซต์ที่อยากทำ งบประมาณ หรือ timeline คร่าวๆ"
                      required
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-black px-8 py-4 text-[17px] font-semibold text-white transition-transform duration-300 hover:scale-[1.02] hover:bg-black/90 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      กำลังส่ง...
                    </>
                  ) : (
                    <>
                      ส่งรายละเอียด
                      <span className="ml-3">→</span>
                    </>
                  )}
                </button>
              </form>
            </SlideUp>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}