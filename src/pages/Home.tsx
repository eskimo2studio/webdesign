import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';

const TYPEWRITER_TEXT =
  'พร้อมสร้างภาพลักษณ์ดิจิทัลให้ดูดี ใช้งานง่าย และพร้อมเติบโต';

const ROTATING_WORDS = ['เว็บไซต์บริษัท', 'เว็บไซต์ร้านค้า', 'เว็บไซต์องค์กร', 'เว็บไซต์หน่วยงาน', 'เว็บไซต์ขายของ'];

const actions = [
  'เติบโตไปกับเรา',
  'ออกแบบเว็บไซต์บริษัท',
  'ทำเว็บไซต์ร้านค้า',
  'ดูวิธีทำงานของเรา',
];

function useTypewriter(text: string, speed = 38, startDelay = 600) {
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

function useRotatingWord(words: string[], intervalMs = 2500, startDelay = 800) {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const initialDelay = window.setTimeout(() => {
      setIsVisible(true);
    }, startDelay);

    return () => window.clearTimeout(initialDelay);
  }, [startDelay]);

  useEffect(() => {
    if (!isVisible) return;

    const interval = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [words.length, intervalMs, isVisible]);

  return { currentWord: words[index], isVisible };
}

export function Home() {
  const [actionsVisible, setActionsVisible] = useState(false);
  const { displayed, done } = useTypewriter(TYPEWRITER_TEXT);
  const { currentWord, isVisible } = useRotatingWord(ROTATING_WORDS);

  useEffect(() => {
    const timer = window.setTimeout(() => setActionsVisible(true), 400);
    return () => window.clearTimeout(timer);
  }, []);

  const copyEmail = () => {
    void navigator.clipboard?.writeText('hello@eskimo.co');
  };

  return (
    <main className="relative h-screen overflow-hidden text-black flex flex-col">
      <section className="relative z-[1] flex flex-1 flex-col justify-end overflow-hidden px-5 pb-20 sm:px-8 md:justify-center md:px-10 md:pb-0">
        <div className="relative z-10 max-w-9xl mx-auto w-full">
          <div className="mb-6">
            <p
              className="text-black mb-2"
              style={{
                fontSize: '24px',
                lineHeight: 1.1,
                fontWeight: 400,
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.02em',
              }}
            >
              รับออกแบบและพัฒนา
            </p>
            <h1
              className="text-black"
              style={{
                fontSize: '56px',
                lineHeight: 1.1,
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.02em',
              }}
            >
              <span className="inline-block relative align-baseline overflow-visible" style={{ minWidth: '250px', height: '1.3em', verticalAlign: 'baseline' }}>
                <span
                  key={currentWord}
                  className="absolute left-0 top-0 inline-block whitespace-nowrap"
                  style={{
                    animation: isVisible ? 'slideUpWord 0.5s cubic-bezier(0.16,1,0.3,1)' : 'none',
                    opacity: isVisible ? 1 : 0,
                  }}
                >
                  {currentWord}
                </span>
              </span>
            </h1>
          </div>

          <p
            className="mb-6 text-black/80"
            style={{
              fontSize: '16px',
              lineHeight: 1.5,
              fontWeight: 400,
            }}
          >
            {displayed}
            {!done && (
              <span
                className="ml-[2px] inline-block h-[1.1em] w-[2px] align-middle"
                style={{
                  background: '#000',
                  animation: 'blink 1s step-end infinite',
                }}
              />
            )}
          </p>

          <div
            className="transition-[opacity,transform] duration-500 ease-out"
            style={{
              opacity: actionsVisible ? 1 : 0,
              transform: actionsVisible ? 'translateY(0)' : 'translateY(8px)',
            }}
          >
            <div className="flex flex-wrap gap-2 mb-4">
              <Link
                to="/growth"
                className="inline-flex items-center justify-center px-4 py-3 rounded-full border border-black/10 bg-white text-sm text-black transition-colors duration-200 hover:bg-black hover:text-white"
              >
                เติบโตไปกับเรา
              </Link>
              <Link
                to="/corporate"
                className="inline-flex items-center justify-center px-4 py-3 rounded-full border border-black/10 bg-white text-sm text-black transition-colors duration-200 hover:bg-black hover:text-white"
              >
                ออกแบบเว็บไซต์บริษัท
              </Link>
              <Link
                to="/ecommerce"
                className="inline-flex items-center justify-center px-4 py-3 rounded-full border border-black/10 bg-white text-sm text-black transition-colors duration-200 hover:bg-black hover:text-white"
              >
                ทำเว็บไซต์ร้านค้า
              </Link>
              <Link
                to="/process"
                className="inline-flex items-center justify-center px-4 py-3 rounded-full border border-black/10 bg-white text-sm text-black transition-colors duration-200 hover:bg-black hover:text-white"
              >
                ดูวิธีทำงานของเรา
              </Link>
            </div>

            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-full bg-black px-10 py-5 text-[18px] font-medium text-white transition-transform duration-300 hover:scale-105 hover:bg-black/90 w-full sm:w-auto"
            >
              เริ่มต้นโปรเจกต์กับเรา
              <svg className="ml-2" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
