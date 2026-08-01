import React, { useEffect, useState } from 'react';
import { Layers } from 'lucide-react';

interface MenuItem {
  id: string;
  labelShort: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface CategoryPageTemplateProps {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accentColor: 'blue' | 'amber' | 'emerald' | 'rose' | 'purple' | 'cyan'; 
  menuItems: MenuItem[];
  children: React.ReactNode;
}

export default function CategoryPageTemplate({
  title,
  subtitle,
  icon: TitleIcon,
  accentColor,
  menuItems,
  children
}: CategoryPageTemplateProps) {
  const [activeSection, setActiveSection] = useState<string>(menuItems[0]?.id || '');

  // Tailwind doesn't support dynamic string interpolation for class names out of the box unless whitelisted.
  // We can use a map to get the exact Tailwind classes.
  const colorMap = {
    blue: {
      text: 'text-blue-400',
      activeBtn: 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.15)]',
    },
    amber: {
      text: 'text-amber-400',
      activeBtn: 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.15)]',
    },
    emerald: {
      text: 'text-emerald-400',
      activeBtn: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.15)]',
    },
    rose: {
      text: 'text-rose-400',
      activeBtn: 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.15)]',
    },
    purple: {
      text: 'text-purple-400',
      activeBtn: 'bg-purple-500/10 border-purple-500/30 text-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.15)]',
    },
    cyan: {
      text: 'text-cyan-400',
      activeBtn: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.15)]',
    }
  };

  const currentTheme = colorMap[accentColor] || colorMap.blue;

  // Dynamic Scroll Highlighting via IntersectionObserver
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-15% 0px -75% 0px',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    menuItems.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => {
      menuItems.forEach(item => {
        const el = document.getElementById(item.id);
        if (el) observer.unobserve(el);
      });
    };
  }, [menuItems]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto px-4 md:px-0 pb-16 xl:pb-0">
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

      {/* Page Title */}
      <div className="text-center py-4">
        <h1 className="text-3xl font-serif font-bold text-zen-text flex items-center justify-center gap-2">
          <TitleIcon className={`${currentTheme.text} animate-pulse`} size={28} />
          {title}
        </h1>
        <p className="text-xs text-zen-muted mt-2 tracking-widest uppercase">
          {subtitle}
        </p>
        <div className="gold-divider mt-4 mx-auto max-w-[150px]"></div>
      </div>

      {/* Grid Layout containing Desktop Sidebar Menu and Main Content */}
      <div className="xl:grid xl:grid-cols-12 xl:gap-8 items-start">
        {/* Desktop Sidebar Dock (Option 3) */}
        <div className="xl:col-span-3 sticky top-24 z-30 hidden xl:block">
          <div className="bg-zinc-950/60 backdrop-blur-md border border-white/5 p-4.5 rounded-2xl space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest pb-3 border-b border-white/5 ${currentTheme.text}`}>
              <Layers size={14} className="animate-pulse" />
              <span>本篇目錄導覽</span>
            </div>
            <nav className="space-y-1.5">
              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 border text-left focus:outline-none group
                      ${isActive 
                        ? currentTheme.activeBtn + ' translate-x-1.5'
                        : 'bg-transparent border-transparent text-zen-muted hover:bg-white/5 hover:text-white'
                      }
                    `}
                  >
                    <Icon size={14} className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'animate-pulse' : 'opacity-70'}`} />
                    <span className="truncate">{item.labelShort}</span>
                    {isActive && (
                      <span className={`ml-auto w-1.5 h-1.5 rounded-full bg-current ${currentTheme.text}`} />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="xl:col-span-9 space-y-6">
          {children}
        </div>
      </div>

      {/* Mobile/Tablet Floating Bottom Pill Dock (Option 3) */}
      <div className="xl:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-zinc-950/90 border border-white/10 px-3.5 py-2.5 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl flex items-center gap-1.5 max-w-[92vw] overflow-x-auto scrollbar-none">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 border focus:outline-none
                ${isActive 
                  ? currentTheme.activeBtn
                  : 'bg-transparent border-transparent text-zen-muted hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <Icon size={12} className={isActive ? 'animate-pulse' : 'opacity-80'} />
              <span>{item.labelShort}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
