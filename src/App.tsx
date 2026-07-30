import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Home } from './pages/Home';
import { Services } from './pages/Services';
import { Portfolio, PortfolioDetail } from './pages/Portfolio';
import { About } from './pages/About';
import { Articles } from './pages/Articles';
import { ArticleDetail } from './pages/ArticleDetail';
import { Contact } from './pages/Contact';
import { Growth } from './pages/Growth';
import { Corporate } from './pages/Corporate';
import { Ecommerce } from './pages/Ecommerce';
import { Process } from './pages/Process';
import { Navbar } from './components/Navbar';
import { VideoBackground } from './components/VideoBackground';

function AppContent() {
  const location = useLocation();
  const hideVideo = location.pathname.startsWith('/articles/') || location.pathname.startsWith('/portfolio/');

  return (
    <>
      {!hideVideo && <VideoBackground />}
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/portfolio/:slug" element={<PortfolioDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/articles/:id" element={<ArticleDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/growth" element={<Growth />} />
        <Route path="/corporate" element={<Corporate />} />
        <Route path="/ecommerce" element={<Ecommerce />} />
        <Route path="/process" element={<Process />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter basename="/webdesign">
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
