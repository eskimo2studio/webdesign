import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { useInView } from '../hooks/useInView';
import { Footer } from '../components/Footer';

function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
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
        transform: inView ? 'translateY(0px)' : 'translateY(40px)',
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

type ServiceType = {
  image: string;
  title: string;
  description: string;
};

const isVideoUrl = (url: string) => {
  if (!url) return false;
  const cleanUrl = url.split('?')[0].toLowerCase();
  return cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.mov') || cleanUrl.endsWith('.ogg');
};

// ─── FAQ DATA ─────────────────────────────────────────────────────────────────
const faqs = [
  {
    question: 'มีบริการอะไรบ้าง?',
    answer: 'เรามีบริการครบวงจร ตั้งแต่การออกแบบเว็บไซต์ (Web Design) ออกแบบประสบการณ์ผู้ใช้ (UX/UI Design) พัฒนาเว็บไซต์ (Web Development) การทำ SEO และ Digital Marketing เพื่อช่วยให้ธุรกิจของคุณเติบโตอย่างครบวงจร'
  },
  {
    question: 'ราคาบริการเริ่มต้นเท่าไหร่?',
    answer: 'ราคาขึ้นอยู่กับประเภทและความซับซ้อนของเว็บไซต์ Landing Page เริ่มต้น 15,000-30,000 บาท, เว็บไซต์บริษัท 30,000-80,000 บาท, ร้านค้าออนไลน์ 50,000-150,000 บาท สามารถปรึกษาและขอใบเสนอราคาฟรีได้'
  },
  {
    question: 'ใช้เวลาทำนานแค่ไหน?',
    answer: 'ขึ้นอยู่กับประเภทของเว็บไซต์ เว็บไซต์ทั่วไป 2-3 สัปดาห์, เว็บไซต์บริษัท 3-4 สัปดาห์, ร้านค้าออนไลน์ 4-6 สัปดาห์ หรือระบบพิเศษ 6-12 สัปดาห์ ขึ้นอยู่กับขอบเขตและความซับซ้อนของโปรเจกต์'
  },
  {
    question: 'มีบริการหลังการขายไหม?',
    answer: 'มีครับ เรามีบริการดูแลหลังส่งมอบ (Maintenance) ครอบคลุมการแก้ไขบั๊ก อัปเดตเนื้อหา สำรองข้อมูล ตรวจสอบความปลอดภัย และให้คำปรึกษา มีทั้งแบบรายเดือนและรายปี'
  },
  {
    question: 'ต่างจากที่อื่นอย่างไร?',
    answer: 'เราไม่ใช้เทมเพลตสำเร็จรูป แต่ออกแบบเฉพาะให้เหมาะกับแบรนด์และธุรกิจของคุณ มีทีมที่เชี่ยวชาญทั้ง UX/UI และ Development ทำงานเป็นระบบ โปร่งใส พร้อมดูแลหลังส่งมอบ และให้คำปรึกษาอย่างต่อเนื่อง'
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

const whyChooseUs = [
  { num: '1', title: 'ออกแบบโดยผู้เชี่ยวชาญด้าน UX/UI', description: 'เราใช้หลักการออกแบบที่เน้นผู้ใช้งานเป็นศูนย์กลาง (User-Centered Design) เพื่อให้เว็บไซต์ใช้งานง่าย สวยงาม และช่วยเพิ่มอัตราการติดต่อหรือการสั่งซื้อ' },
  { num: '2', title: 'ดีไซน์เฉพาะสำหรับธุรกิจของคุณ', description: 'เราไม่ใช้เทมเพลตสำเร็จรูป ทุกเว็บไซต์ถูกออกแบบใหม่ให้เหมาะกับแบรนด์ กลุ่มเป้าหมาย และเป้าหมายทางธุรกิจของคุณ' },
  { num: '3', title: 'รองรับ SEO ตั้งแต่เริ่มต้น', description: 'เว็บไซต์ถูกพัฒนาโดยคำนึงถึงโครงสร้างที่เป็นมิตรกับ Google ช่วยเพิ่มโอกาสในการค้นหาและสร้างทราฟฟิกแบบธรรมชาติ' },
  { num: '4', title: 'รองรับทุกอุปกรณ์', description: 'ไม่ว่าลูกค้าจะเข้าชมผ่านมือถือ แท็บเล็ต หรือคอมพิวเตอร์ เว็บไซต์ของคุณจะแสดงผลได้อย่างสวยงามและใช้งานได้เต็มประสิทธิภาพ' },
  { num: '5', title: 'โหลดเร็ว ปลอดภัย และทันสมัย', description: 'เราเลือกใช้เทคโนโลยีที่ช่วยให้เว็บไซต์โหลดเร็ว มีมาตรฐานด้านความปลอดภัย และพร้อมรองรับการเติบโตของธุรกิจในอนาคต' },
  { num: '6', title: 'คิดเพื่อธุรกิจ ไม่ใช่แค่เพื่อความสวยงาม', description: 'ทุกองค์ประกอบของเว็บไซต์ ตั้งแต่โครงสร้าง เมนู ปุ่ม ไปจนถึงข้อความ ถูกออกแบบเพื่อช่วยให้ผู้เข้าชมเข้าใจธุรกิจของคุณและตัดสินใจได้ง่ายขึ้น' },
  { num: '7', title: 'ดูแลหลังส่งมอบ', description: 'เราไม่ได้หยุดแค่วันที่เว็บไซต์ออนไลน์ แต่พร้อมให้คำแนะนำ ดูแล และช่วยพัฒนาเว็บไซต์ของคุณให้ทันสมัยอยู่เสมอ' },
];

const benefits = [
  'เว็บไซต์ที่สะท้อนภาพลักษณ์ของแบรนด์อย่างมืออาชีพ',
  'ประสบการณ์ใช้งานที่ดีสำหรับลูกค้าทุกอุปกรณ์',
  'โครงสร้างเว็บไซต์ที่รองรับ SEO',
  'เว็บไซต์โหลดเร็วและปลอดภัย',
  'ดีไซน์ที่ช่วยเพิ่มความน่าเชื่อถือและโอกาสในการสร้างยอดขาย',
  'ทีมงานที่ให้คำปรึกษาและดูแลหลังการส่งมอบ',
];

export function Services() {
  const [services, setServices] = useState<ServiceType[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('https://docs.google.com/spreadsheets/d/1Il7eQaTtmF2EbRjFFfGbBciKaEfxXzdCPP3huKLvuDA/export?format=csv');
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: false,
          complete: (results: any) => {
            const parsedServices = results.data
              .map((row: any) => ({
                image: row[0] || '',
                title: row[1] || '',
                description: row[2] || '',
              }))
              .filter((s: ServiceType) => s.title);
            
            setServices(parsedServices);
          }
        });
      } catch (error) {
        console.error('Failed to fetch services:', error);
      }
    };
    
    fetchServices();
  }, []);

  return (
    <main className="relative min-h-screen text-black">
      {/* Hero Section */}
      <section className="relative z-[1] pt-32 pb-12 overflow-hidden flex flex-col justify-center min-h-[60vh]">
        <div className="px-5 sm:px-8 md:px-10 mb-10 max-w-7xl mx-auto w-full">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
            เราให้บริการ อะไร
          </h1>
        </div>
        
        {/* Scrolling Cards Marquee */}
        <div className="relative w-full overflow-hidden flex items-center">
          <div className="services-marquee flex w-max hover:[animation-play-state:paused]">
            {Array.from({ length: 2 }).map((_, arrIndex) => (
              <div key={arrIndex} className="flex gap-6 pr-6">
                {services.map((service, i) => (
                  <div 
                    key={`${arrIndex}-${i}`} 
                    className="w-[300px] sm:w-[350px] h-full min-h-[250px] p-6 sm:p-8 rounded-3xl bg-white/80 border border-white/60 shadow-sm shrink-0 whitespace-normal flex flex-col hover:shadow-md transition-shadow duration-300"
                  >
                    {service.image && (
                      <div className="mb-6 w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-2xl overflow-hidden bg-black/5">
                        {isVideoUrl(service.image) ? (
                          <video src={service.image} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                        ) : (
                          <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                    )}
                    <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                    <p className="text-black/70 leading-relaxed flex-grow">{service.description}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Slow Marquee Section */}
      <section className="relative z-[2] overflow-hidden py-8 sm:py-10">
        <div className="services-marquee flex w-max whitespace-nowrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={i}
              className="px-6 text-[42px] font-black leading-none text-white sm:px-10 sm:text-[72px] md:text-[96px] lg:text-[120px]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              WEB DESIGN / UXUI DESIGN / PRODUCT DESIGN / DIGITAL MARKETING
            </span>
          ))}
        </div>
      </section>

      {/* Scrollable Content Section */}
      <section className="relative z-[2] px-5 py-24 sm:px-8 md:px-10">
        <div className="max-w-5xl mx-auto space-y-32">



          {/* Why Choose Us */}
          <div>
            <FadeUp>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
                ทำไมต้องเลือก Eskimo Studio?
              </h2>
              <div className="mb-12 max-w-3xl space-y-4">
                <p className="text-xl font-medium text-black/80">เพราะเว็บไซต์ที่ดี ควรสร้างผลลัพธ์ให้กับธุรกิจ</p>
                <p className="text-lg text-black/70 leading-relaxed">
                  เราเชื่อว่าเว็บไซต์คือเครื่องมือสำคัญในการสร้างความน่าเชื่อถือ สื่อสารตัวตนของแบรนด์
                  และสร้างโอกาสทางธุรกิจ เว็บไซต์ที่ออกแบบอย่างมีกลยุทธ์จะช่วยให้ลูกค้าตัดสินใจได้ง่ายขึ้น
                  และสร้างความได้เปรียบเหนือคู่แข่ง
                </p>
              </div>
            </FadeUp>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {whyChooseUs.map((item, i) => (
                <FadeUp key={i} delay={i * 80}>
                  <div className="flex gap-6">
                    <div
                      className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-black text-white text-xl font-bold"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {item.num}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                      <p className="text-black/70 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>

          {/* Benefits & CTA */}
          <FadeUp>
            <div className="bg-white/80 p-10 sm:p-14 rounded-[2.5rem] border border-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl font-bold mb-8" style={{ fontFamily: 'var(--font-heading)' }}>
                  สิ่งที่คุณจะได้รับ
                </h2>
                <ul className="space-y-4 mb-12">
                  {benefits.map((benefit, i) => (
                    <FadeUp key={i} delay={i * 60}>
                      <li className="flex items-start gap-4 text-lg text-black/80">
                        <span className="text-black mt-1 shrink-0">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        {benefit}
                      </li>
                    </FadeUp>
                  ))}
                </ul>

                {/* FAQ Section */}
                <div className="border-t border-black/10 pt-10 mb-10">
                  <h3 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
                    คำถามที่พบบ่อย (FAQ)
                  </h3>
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <FAQItem key={index} faq={faq} index={index} />
                    ))}
                  </div>
                </div>

                <div className="border-t border-black/10 pt-10">
                  <FadeUp>
                    <h3 className="text-2xl font-semibold mb-4">
                      พร้อมเปลี่ยนเว็บไซต์ของคุณให้เป็นเครื่องมือสร้างการเติบโต
                    </h3>
                    <p className="text-lg text-black/70 mb-10 max-w-3xl leading-relaxed">
                      ไม่ว่าคุณจะเป็นธุรกิจขนาดเล็ก บริษัทขนาดใหญ่ หรือกำลังเริ่มต้นแบรนด์ใหม่
                      Eskimo Studio พร้อมช่วยออกแบบเว็บไซต์ที่ตอบโจทย์ทั้งด้านภาพลักษณ์
                      ประสบการณ์ผู้ใช้งาน และผลลัพธ์ทางธุรกิจ
                      เพื่อให้เว็บไซต์ของคุณทำงานได้อย่างเต็มศักยภาพตลอด 24 ชั่วโมง
                    </p>
                    <a
                      href="mailto:hello@eskimo.co"
                      className="inline-flex items-center justify-center rounded-full bg-black px-8 py-4 text-[17px] font-medium text-white transition-transform duration-300 hover:scale-105 hover:bg-black/90"
                    >
                      เริ่มต้นโปรเจกต์กับเรา
                      <svg className="ml-3" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  </FadeUp>
                </div>
              </div>
            </div>
          </FadeUp>

        </div>
      </section>

      <Footer />
    </main>
  );
}
