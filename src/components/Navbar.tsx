import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const navLinks = [
  { name: 'หน้าหลัก', path: '/' },
  { name: 'บริการของเรา', path: '/services' },
  { name: 'ผลงานเว็บไซต์', path: '/portfolio' },
  { name: 'เกี่ยวกับเรา', path: '/about' },
  { name: 'บทความ', path: '/articles' },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-[100] flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5 transition-all duration-500 ${
          scrolled
            ? 'bg-white/20 backdrop-blur-xl border-b border-white/20 shadow-sm'
            : 'bg-transparent backdrop-blur-none'
        }`}
      >
        <Link to="/" className="flex items-center gap-3 text-black" aria-label="eskimo home" onClick={() => setMenuOpen(false)}>
          <span
            className="text-[21px] font-bold tracking-tight sm:text-[26px]"
            style={{ fontFamily: 'var(--font-heading)', fontWeight: 900 }}
          >
            eskimo®
          </span>
          <span
            className="select-none text-[25px] sm:text-[30px]"
            style={{ letterSpacing: '-0.02em' }}
            aria-hidden="true"
          >
            ✳︎
          </span>
        </Link>

        <div className="hidden items-center gap-7 text-[18px] lg:gap-9 lg:text-[20px] md:flex">
          {navLinks.map((link) => (
            <span key={link.name}>
              <Link to={link.path} className="transition-opacity hover:opacity-60">
                {link.name}
              </Link>
            </span>
          ))}
        </div>

        <Link
          to="/contact"
          className="hidden text-[18px] underline underline-offset-2 transition-opacity hover:opacity-60 lg:text-[20px] md:block"
          onClick={() => setMenuOpen(false)}
        >
          ติดต่อเรา
        </Link>

        <button
          className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden relative z-[101]"
          type="button"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span
            className={`h-[2px] w-6 bg-black transition-all duration-300 ${menuOpen ? 'translate-y-[7px] rotate-45' : ''
              }`}
          />
          <span
            className={`h-[2px] w-6 bg-black transition-opacity duration-300 ${menuOpen ? 'opacity-0' : 'opacity-100'
              }`}
          />
          <span
            className={`h-[2px] w-6 bg-black transition-all duration-300 ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''
              }`}
          />
        </button>
      </nav>

      <div
        className="fixed inset-0 z-[99] flex flex-col justify-center gap-8 bg-white/95 px-8 text-left backdrop-blur-sm transition-opacity duration-300 md:hidden"
        style={{
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
        }}
      >
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className="text-[32px] font-medium transition-opacity hover:opacity-60"
            onClick={() => setMenuOpen(false)}
          >
            {link.name}
          </Link>
        ))}
        <Link
          to="/contact"
          className="text-[32px] font-medium underline underline-offset-2 transition-opacity hover:opacity-60"
          onClick={() => setMenuOpen(false)}
        >
          ติดต่อเรา
        </Link>
      </div>
    </>
  );
}
