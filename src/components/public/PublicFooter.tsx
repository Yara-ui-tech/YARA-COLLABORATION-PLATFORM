import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, GraduationCap, ShieldCheck, Mail, Phone, MapPin, 
  ArrowRight, Heart, Globe, Cpu, Award, BookOpen
} from 'lucide-react';
import { ASSETS } from '../../constants/assets';

export default function PublicFooter() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Column 1: Organization Identity & Motto */}
          <div className="lg:col-span-2 space-y-4">
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

            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              A premier continental youth robotics and digital innovation ecosystem empowering African learners, teachers, and schools through hands-on STEM education, advanced robotics engineering, and transformative competitions.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/70 border border-blue-800/60 text-blue-300 text-xs font-bold">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Motto: "Innovate Local, Build Global"</span>
            </div>

            <div className="pt-2 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Mashonaland West Province & Harare, Zimbabwe</span>
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

          {/* Column 2: Programmes */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4">
              YARA Programmes
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/programs?track=robotics" className="hover:text-white transition-colors">
                  Robotics Engineering
                </Link>
              </li>
              <li>
                <Link to="/programs?track=ai-iot" className="hover:text-white transition-colors">
                  Artificial Intelligence & IoT
                </Link>
              </li>
              <li>
                <Link to="/programs?track=stem" className="hover:text-white transition-colors">
                  STEM Education & Clubs
                </Link>
              </li>
              <li>
                <Link to="/programs?track=coding" className="hover:text-white transition-colors">
                  Embedded Coding & C++
                </Link>
              </li>
              <li>
                <Link to="/programs?track=digital-literacy" className="hover:text-white transition-colors">
                  Digital Literacy
                </Link>
              </li>
              <li>
                <Link to="/programs" className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1">
                  <span>View All 8 Tracks</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Competitions & Training */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4">
              Championships & Training
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/competitions/yara-2026" className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>YARA 2026 Championship</span>
                </Link>
              </li>
              <li>
                <Link to="/competitions" className="hover:text-white transition-colors">
                  All Competitions
                </Link>
              </li>
              <li>
                <Link to="/training" className="hover:text-white transition-colors">
                  YARA Training System
                </Link>
              </li>
              <li>
                <Link to="/training?audience=teachers" className="hover:text-white transition-colors">
                  Teacher & Patron Training
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-white transition-colors">
                  Events & Bootcamps
                </Link>
              </li>
              <li>
                <Link to="/schools" className="hover:text-white transition-colors">
                  School Clubs Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Platform & Verification */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4">
              Platform & Verification
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/verify-certificate" className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verify Digital Certificate</span>
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>LMS Student Login</span>
                </Link>
              </li>
              <li>
                <Link to="/educator-portal" className="hover:text-white transition-colors">
                  Teacher / Patron Hub
                </Link>
              </li>
              <li>
                <Link to="/impact-gallery" className="hover:text-white transition-colors">
                  Mashwest Outreach Gallery
                </Link>
              </li>
              <li>
                <Link to="/chapters" className="hover:text-white transition-colors">
                  Provincial Chapters
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact YARA Directorate
                </Link>
              </li>
            </ul>
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
            <Link to="/verify-certificate" className="hover:text-slate-300">Registry</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-slate-300">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
