import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  ShoppingBag, 
  BookOpen, 
  Trophy, 
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Star,
  Newspaper
} from 'lucide-react';
import { ASSETS } from '../../constants/assets';
import { SiteRatingModal } from '../common/SiteRatingModal';

export default function PublicFooter() {
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
          {/* Organization Identity & Motto */}
          <div className="lg:col-span-7 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white p-1 flex items-center justify-center shadow-lg border border-slate-800 overflow-hidden">
                <img 
                  src={ASSETS.LOGO} 
                  alt="Young Africans Robotics Association" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight">YARA</span>
                <p className="text-xs text-slate-400 font-semibold">Young Africans Robotics Association</p>
              </div>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
              A premier continental youth robotics and digital innovation ecosystem empowering African learners, teachers, and schools through hands-on STEM education, advanced robotics engineering, and transformative championships.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/70 border border-blue-800/60 text-blue-300 text-xs font-bold">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Motto: &quot;Innovate Local, Build Global&quot;</span>
              </div>

              <button
                type="button"
                onClick={() => setIsRatingModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md transition cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 fill-slate-950" />
                <span>Rate YARA Platform</span>
              </button>
            </div>

            <div className="pt-2 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Mashonaland West Province &amp; Harare, Zimbabwe</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="mailto:inforyaraorg@gmail.com" className="hover:text-white transition-colors">inforyaraorg@gmail.com</a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>+263 78 895 3986 / 0717468236</span>
              </div>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4">
                Quick Navigation
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <Link to="/" className="text-slate-400 hover:text-white transition-colors py-1 flex items-center gap-1.5">
                  <span>Home</span>
                </Link>
                <Link to="/posts" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors py-1 flex items-center gap-1.5">
                  <Newspaper className="w-3.5 h-3.5" />
                  <span>News &amp; Posts</span>
                </Link>
                <Link to="/learn" className="text-slate-400 hover:text-white transition-colors py-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Academy</span>
                </Link>
                <Link to="/shop" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors py-1 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Hardware Shop</span>
                </Link>
                <Link to="/competitions" className="text-amber-400 hover:text-amber-300 font-bold transition-colors py-1 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Competitions</span>
                </Link>
                <Link to="/mentorship" className="text-slate-400 hover:text-white transition-colors py-1 flex items-center gap-1.5">
                  <span>Mentorship &amp; Reviews</span>
                </Link>
                <Link to="/safeguarding" className="text-[#00C6FF] hover:underline font-bold transition-colors py-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00C6FF]" />
                  <span>Safeguarding Portal</span>
                </Link>
                <Link to="/feedback" className="text-amber-400 hover:underline font-semibold transition-colors py-1 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5" />
                  <span>Rate Platform</span>
                </Link>
                <Link to="/contact" className="text-slate-400 hover:text-white transition-colors py-1 flex items-center gap-1.5">
                  <span>Contact</span>
                </Link>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
              <div className="font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span>Hardware Kits &amp; Components</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Order official YARA starter kits, ESP32 boards, sensors, and robotics parts directly for school clubs and labs.
              </p>
              <Link 
                to="/shop" 
                className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold text-[11px]"
              >
                <span>Visit YARA Shop</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Young Africans Robotics Association (YARA). All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 font-semibold">Innovate Local, Build Global</span>
            <span>•</span>
            <Link to="/shop" className="text-emerald-400 hover:underline font-semibold">Hardware Shop</Link>
            <span>•</span>
            <button
              onClick={() => setIsRatingModalOpen(true)}
              className="text-amber-400 hover:underline font-bold cursor-pointer"
            >
              Rate Our Site ★
            </button>
            <span>•</span>
            <Link to="/contact" className="hover:text-slate-300">Direct Support</Link>
          </div>
        </div>
      </div>

      <SiteRatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
      />
    </footer>
  );
}
