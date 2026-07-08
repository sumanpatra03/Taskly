'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  ArrowRight, CheckCircle2, KanbanSquare, Users, BarChart3, Zap, Clock,
  Target, Layers, Sparkles, GripVertical, MousePointerClick, Plus,
  MessageSquare, Calendar, Tag, ChevronDown, Star, X, Check, Minus,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

/* ═══════════════════ HOOKS ═══════════════════ */

function useTypingEffect(words: string[], typingSpeed = 100, deletingSpeed = 60, pauseTime = 2000) {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  useEffect(() => {
    const currentWord = words[wordIndex];
    let timeout: NodeJS.Timeout;
    if (!isDeleting && text === currentWord) {
      timeout = setTimeout(() => setIsDeleting(true), pauseTime);
    } else if (isDeleting && text === '') {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
    } else {
      timeout = setTimeout(() => {
        setText(isDeleting ? currentWord.substring(0, text.length - 1) : currentWord.substring(0, text.length + 1));
      }, isDeleting ? deletingSpeed : typingSpeed);
    }
    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseTime]);
  return text;
}

function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting && !hasStarted) setHasStarted(true); }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);
  useEffect(() => {
    if (!hasStarted) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => { start += increment; if (start >= target) { setCount(target); clearInterval(timer); } else { setCount(Math.floor(start)); } }, 16);
    return () => clearInterval(timer);
  }, [hasStarted, target, duration]);
  return { count, ref };
}

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } }, { threshold: 0, rootMargin: '50px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, isVisible };
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return progress;
}

/* ═══════════════════ DATA ═══════════════════ */

const features = [
  { icon: KanbanSquare, title: 'Kanban Boards', desc: 'Drag-and-drop boards that adapt to your process.', gradient: 'from-indigo-500 to-purple-500' },
  { icon: Users, title: 'Team Collaboration', desc: 'Invite, assign tasks, and collaborate in real-time.', gradient: 'from-cyan-500 to-blue-500' },
  { icon: BarChart3, title: 'Insights & Analytics', desc: 'Beautiful charts and data-driven project insights.', gradient: 'from-amber-500 to-orange-500' },
  { icon: Zap, title: 'Custom Workflows', desc: 'Statuses, priorities, labels that match your team.', gradient: 'from-emerald-500 to-teal-500' },
  { icon: Clock, title: 'Activity Timeline', desc: 'Complete activity logs and real-time notifications.', gradient: 'from-rose-500 to-pink-500' },
  { icon: Target, title: 'Smart Prioritization', desc: 'Built-in priority levels and intelligent sorting.', gradient: 'from-violet-500 to-indigo-500' },
];

const statsData = [
  { value: 10000, suffix: '+', label: 'Tasks Managed' },
  { value: 500, suffix: '+', label: 'Teams Active' },
  { value: 99, suffix: '%', label: 'Uptime' },
  { value: 4.9, suffix: '/5', label: 'User Rating', isDecimal: true },
];

const marqueeItems = [
  'Kanban Boards', 'Drag & Drop', 'Real-time Sync', 'Team Invites',
  'Custom Labels', 'Priority Levels', 'Activity Logs', 'Task Comments',
  'Project Insights', 'Dark Mode', 'Role Management', 'Due Dates',
];

const testimonials = [
  { quote: 'Taskly transformed how our team manages sprints. The kanban boards are incredibly intuitive.', name: 'Sarah Chen', role: 'Engineering Lead', company: 'TechFlow', rating: 5 },
  { quote: 'We moved from 3 different tools to just Taskly. Everything we need in one place.', name: 'Marcus Rodriguez', role: 'Product Manager', company: 'StartupLab', rating: 5 },
  { quote: 'The real-time collaboration features saved us hours of back-and-forth communication.', name: 'Emily Watson', role: 'Designer', company: 'CreativeHub', rating: 5 },
  { quote: 'Best project management tool we have used. Clean UI, powerful features.', name: 'David Kim', role: 'CTO', company: 'CloudNine', rating: 5 },
  { quote: 'Our team productivity increased by 40% after switching to Taskly.', name: 'Priya Sharma', role: 'Team Lead', company: 'InnovateCo', rating: 5 },
];

const comparisonFeatures = [
  { feature: 'Kanban Boards', taskly: true, others: true },
  { feature: 'Real-time Collaboration', taskly: true, others: 'partial' as const },
  { feature: 'Custom Workflows', taskly: true, others: false },
  { feature: 'Activity Timeline', taskly: true, others: false },
  { feature: 'Project Insights', taskly: true, others: 'partial' as const },
  { feature: 'Unlimited Team Invites', taskly: true, others: false },
  { feature: 'Dark Mode', taskly: true, others: 'partial' as const },
];

const faqData = [
  { q: 'What is Taskly?', a: 'Taskly is a modern project management tool with kanban boards, real-time collaboration, custom workflows, and powerful analytics to help teams deliver projects on time.' },
  { q: 'How many team members can I add?', a: 'There is no limit. Invite as many team members as you need and assign roles to control access levels.' },
  { q: 'Is my data secure?', a: 'Absolutely. We use enterprise-grade encryption, secure authentication via Supabase, and regular backups to keep your data safe.' },
  { q: 'Does Taskly support integrations?', a: 'We are actively building integrations. Email notifications and webhooks are available, with Slack, GitHub, and more coming soon.' },
  { q: 'Can I use Taskly on mobile?', a: 'Yes! Taskly is fully responsive and works great on phones and tablets through your browser.' },
  { q: 'How do I get started?', a: 'Simply create a free account, set up your first project, invite your team, and start organizing tasks on your kanban board.' },
];

/* ═══════════════════ LANDING PAGE ═══════════════════ */

const LandingPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const scrollProgress = useScrollProgress();
  const typedText = useTypingEffect(['One task at a time', 'Seamless collaboration', 'Beautiful workflows', 'Powerful insights'], 90, 50, 2200);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setUser(session?.user ?? null); setIsLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user ?? null); });
    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* ── SCROLL PROGRESS BAR ── */}
      <div className="landing-scroll-progress" style={{ width: `${scrollProgress}%` }} />

      {/* ── HERO ── */}
      <section className="relative pt-24 pb-8 lg:pt-32 lg:pb-10">
        <div className="landing-orb landing-orb-1" />
        <div className="landing-orb landing-orb-2" />
        <div className="landing-orb landing-orb-3" />
        <div className="absolute inset-0 landing-grid-pattern opacity-[0.02] dark:opacity-[0.04]" />
        <div className="container relative z-10">
          <div className="max-w-[1200px] mx-auto text-center space-y-5">
            <div className="landing-fade-in inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 bg-secondary/50 backdrop-blur-sm text-sm text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /><span>Project management, reimagined</span>
            </div>
            <div className="space-y-3 landing-fade-in landing-fade-in-delay-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                Organize your work,<br />
                <span className="landing-gradient-text">{typedText}<span className="landing-cursor">|</span></span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-[800px] mx-auto leading-relaxed">
                Intuitive kanban boards, real-time collaboration, and powerful insights to manage projects with ease.
              </p>
            </div>
            <div className="landing-fade-in landing-fade-in-delay-2 flex flex-col sm:flex-row gap-3 justify-center">
              {user ? (
                <Button size="lg" className="landing-btn-glow h-11 px-7" asChild><Link href="/projects" className="gap-2">View Projects <ArrowRight className="h-4 w-4" /></Link></Button>
              ) : (<>
                <Button size="lg" className="landing-btn-glow h-11 px-7" asChild><Link href="/create-account" className="gap-2">Get Started Free <ArrowRight className="h-4 w-4" /></Link></Button>
                <Button size="lg" variant="outline" className="h-11 px-7" asChild><Link href="/login">Sign in</Link></Button>
              </>)}
            </div>
            <div className="landing-fade-in landing-fade-in-delay-3 flex flex-wrap gap-2 justify-center">
              {['Kanban Boards', 'Real-time Collab', 'Custom Workflows', 'Analytics'].map((f) => (
                <div key={f} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/70 border border-border/40 text-xs text-muted-foreground backdrop-blur-sm transition-all hover:bg-secondary hover:text-foreground hover:scale-105 cursor-default">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />{f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── DRAGGABLE BOARD ── */}
      <DraggableBoard />

      {/* ── MARQUEE ── */}
      <div className="py-4 overflow-hidden">
        <div className="landing-marquee"><div className="landing-marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="landing-marquee-item"><Sparkles className="h-3 w-3 text-primary/40" />{item}</span>
          ))}
        </div></div>
      </div>

      {/* ── FEATURES ── */}
      <RevealSection className="py-10">
        <div className="container">
          <div className="text-center max-w-[500px] mx-auto mb-8">
            <p className="text-xs font-medium text-primary/80 mb-2 tracking-widest uppercase">Features</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Everything you need to <span className="landing-gradient-text">ship faster</span></h2>
            <p className="text-sm text-muted-foreground">Powerful tools to stay organized and deliver on time.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-[1200px] mx-auto">
            {features.map((f) => (
              <div key={f.title} className="landing-feature-card group">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-3 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <f.icon className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ── STATS ── */}
      <RevealSection className="py-8">
        <div className="container"><div className="max-w-[1200px] mx-auto"><div className="landing-stats-card">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statsData.map((stat) => <StatItem key={stat.label} {...stat} />)}
          </div>
        </div></div></div>
      </RevealSection>

      {/* ── HOW IT WORKS ── */}
      <RevealSection className="py-12">
        <div className="container">
          <div className="text-center max-w-[600px] mx-auto mb-10">
            <p className="text-xs font-medium text-primary/80 mb-2 tracking-widest uppercase">How It Works</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Get started in <span className="landing-gradient-text">3 simple steps</span></h2>
            <p className="text-sm text-muted-foreground mt-2">Taskly is designed to get your team up and running in minutes.</p>
          </div>
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: '01', title: 'Create a project', desc: 'Set up with custom statuses, priorities, and labels.', gradient: 'from-indigo-500 to-purple-500', icon: Plus },
                { step: '02', title: 'Invite your team', desc: 'Add members, assign roles, collaborate in real-time.', gradient: 'from-cyan-500 to-blue-500', icon: Users },
                { step: '03', title: 'Track & deliver', desc: 'Use boards, insights, and activity logs to ship on time.', gradient: 'from-emerald-500 to-teal-500', icon: Target },
              ].map((item) => (
                <div key={item.step} className="landing-step-card group">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-3xl font-extrabold text-muted-foreground/15 group-hover:text-primary/15 transition-colors">{item.step}</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </RevealSection>

      {/* ── INTERACTIVE DEMO ── */}
      <InteractiveDemo />

      {/* ── TESTIMONIALS ── */}
      <TestimonialsCarousel />

      {/* ── COMPARISON TABLE ── */}
      <RevealSection className="py-10">
        <div className="container">
          <div className="text-center max-w-[500px] mx-auto mb-8">
            <p className="text-xs font-medium text-primary/80 mb-2 tracking-widest uppercase">Comparison</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Taskly vs <span className="landing-gradient-text">Others</span></h2>
            <p className="text-sm text-muted-foreground">See why teams choose Taskly over other tools.</p>
          </div>
          <div className="max-w-[960px] mx-auto">
            <div className="landing-browser-frame">
              <table className="landing-comparison-table">
                <thead><tr><th>Feature</th><th>Taskly</th><th>Others</th></tr></thead>
                <tbody>
                  {comparisonFeatures.map((row) => (
                    <tr key={row.feature}>
                      <td className="font-medium">{row.feature}</td>
                      <td><Check className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                      <td>
                        {row.others === true && <Check className="h-5 w-5 text-emerald-500 mx-auto" />}
                        {row.others === 'partial' && <Minus className="h-5 w-5 text-amber-500 mx-auto" />}
                        {row.others === false && <X className="h-5 w-5 text-rose-500 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* ── FAQ ── */}
      <FAQAccordion />

      {/* ── CTA ── */}
      <RevealSection className="py-10">
        <div className="container"><div className="landing-cta-card text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Ready to streamline your workflow?</h2>
          <p className="text-sm text-muted-foreground max-w-[600px] mx-auto mb-5">Join hundreds of teams already using Taskly to deliver projects faster.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {user ? (
              <Button size="lg" className="landing-btn-glow h-11 px-7" asChild><Link href="/projects" className="gap-2">Go to Projects <ArrowRight className="h-4 w-4" /></Link></Button>
            ) : (<>
              <Button size="lg" className="landing-btn-glow h-11 px-7" asChild><Link href="/create-account" className="gap-2">Start for Free <ArrowRight className="h-4 w-4" /></Link></Button>
              <Button size="lg" variant="outline" className="h-11 px-7" asChild><Link href="/login">Sign in</Link></Button>
            </>)}
          </div>
        </div></div>
      </RevealSection>

      <footer className="py-5 border-t border-border/40">
        <div className="container text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Taskly. Built with ❤️ for productive teams.</div>
      </footer>
    </div>
  );
};

/* ═══════════════════ SUB-COMPONENTS ═══════════════════ */

function RevealSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, isVisible } = useScrollReveal();
  return <section ref={ref} className={`landing-reveal ${isVisible ? 'landing-revealed' : ''} ${className}`}>{children}</section>;
}

function StatItem({ value, suffix, label, isDecimal }: { value: number; suffix: string; label: string; isDecimal?: boolean }) {
  const { count, ref } = useCounter(isDecimal ? Math.floor(value) : value, 2000);
  return (
    <div ref={ref} className="text-center">
      <div className="text-2xl sm:text-3xl font-bold landing-gradient-text mb-0.5">{isDecimal ? `${count > 0 ? value : '0'}` : count}{suffix}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

/* ── DRAGGABLE BOARD ── */
type ColumnId = 'todo' | 'progress' | 'done';
type BoardState = Record<ColumnId, string[]>;

function DraggableBoard() {
  const [board, setBoard] = useState<BoardState>({
    todo: ['Setup CI/CD pipeline', 'Write API docs'],
    progress: ['Design system update', 'Database optimization'],
    done: ['User testing session'],
  });
  const [newTask, setNewTask] = useState('');
  const [dragItem, setDragItem] = useState<{ task: string; from: ColumnId } | null>(null);
  const [dragOver, setDragOver] = useState<ColumnId | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const handleDragStart = (task: string, from: ColumnId) => { setDragItem({ task, from }); };
  const handleDragOver = (e: React.DragEvent, col: ColumnId) => { e.preventDefault(); setDragOver(col); };
  const handleDragLeave = () => { setDragOver(null); };
  const handleDrop = (e: React.DragEvent, to: ColumnId) => {
    e.preventDefault();
    setDragOver(null);
    if (!dragItem || dragItem.from === to) { setDragItem(null); return; }
    setBoard((prev) => ({
      ...prev,
      [dragItem.from]: prev[dragItem.from].filter((t) => t !== dragItem.task),
      [to]: [...prev[to], dragItem.task],
    }));
    setDragItem(null);
  };
  const handleAddTask = () => {
    const trimmed = newTask.trim();
    if (!trimmed) return;
    setBoard((prev) => ({ ...prev, todo: [trimmed, ...prev.todo] }));
    setJustAdded(trimmed);
    setNewTask('');
    setTimeout(() => setJustAdded(null), 500);
  };

  const columns: { id: ColumnId; label: string; color: string }[] = [
    { id: 'todo', label: 'Todo', color: 'bg-slate-400' },
    { id: 'progress', label: 'In Progress', color: 'bg-blue-400' },
    { id: 'done', label: 'Done', color: 'bg-emerald-400' },
  ];

  return (
    <RevealSection className="py-6">
      <div className="container">
        <div className="max-w-[1000px] mx-auto">
          <div className="landing-browser-frame">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50 bg-secondary/30">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
              </div>
              <div className="flex-1 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-md bg-background/50 text-[11px] text-muted-foreground border border-border/30">🔒 taskly.app/projects/sprint-board</div>
              </div>
            </div>
            <div className="p-4 bg-background/50">
              {/* Task creator */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-2 flex-1">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-sm">Sprint Board</span>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleAddTask(); }} className="flex items-center gap-2">
                  <input
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add a task and press Enter..."
                    className="h-8 px-3 text-xs rounded-md border border-border/50 bg-background focus:outline-none focus:ring-1 focus:ring-primary/40 w-48 sm:w-56 placeholder:text-muted-foreground/50"
                  />
                  <button type="submit" className="h-8 w-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
              {/* Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {columns.map((col) => (
                  <div
                    key={col.id}
                    onDragOver={(e) => handleDragOver(e, col.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, col.id)}
                    className={`space-y-2 landing-drop-zone p-2 rounded-lg ${dragOver === col.id ? 'drag-over' : ''}`}
                  >
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground pb-1.5 border-b border-border/30">
                      <div className={`w-2 h-2 rounded-full ${col.color}`} />
                      {col.label}
                      <span className="ml-auto opacity-60">{board[col.id].length}</span>
                    </div>
                    {board[col.id].map((task) => (
                      <div
                        key={task}
                        draggable
                        onDragStart={() => handleDragStart(task, col.id)}
                        onDragEnd={() => setDragItem(null)}
                        className={`landing-drag-card flex items-center gap-1.5 ${dragItem?.task === task ? 'dragging' : ''} ${justAdded === task ? 'landing-new-task' : ''}`}
                      >
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30 flex-shrink-0" />
                        <span className={`flex-1 ${col.id === 'done' ? 'line-through text-muted-foreground/50' : ''}`}>{task}</span>
                        {col.id === 'done' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground/40 text-center mt-3">💡 Try dragging tasks between columns!</p>
            </div>
          </div>
        </div>
      </div>
    </RevealSection>
  );
}

/* ── TESTIMONIALS CAROUSEL ── */
function TestimonialsCarousel() {
  return (
    <RevealSection className="py-12">
      <div className="container">
        <div className="text-center max-w-[600px] mx-auto mb-10">
          <p className="text-xs font-medium text-primary/80 mb-2 tracking-widest uppercase">Testimonials</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Loved by <span className="landing-gradient-text">teams everywhere</span></h2>
          <p className="text-sm text-muted-foreground">Hear from engineering leads, designers, and managers who use Taskly daily.</p>
        </div>
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.slice(0, 3).map((t, idx) => (
              <div key={idx} className="landing-testimonial-card flex flex-col justify-between hover:border-border transition-all duration-300 hover:shadow-md">
                <div>
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-sm md:text-base leading-relaxed text-muted-foreground italic mb-6 relative z-10">&ldquo;{t.quote}&rdquo;</p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-border/20">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                    {t.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-[11px] text-muted-foreground">{t.role}, {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RevealSection>
  );
}

/* ── FAQ ACCORDION ── */
function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <RevealSection className="py-10">
      <div className="container">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
          <div className="md:col-span-2 space-y-3 text-left">
            <p className="text-xs font-medium text-primary/80 tracking-widest uppercase">FAQ</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Frequently asked <span className="landing-gradient-text">questions</span></h2>
            <p className="text-sm text-muted-foreground leading-relaxed">Have questions about how Taskly works? Find answers here, or reach out to our support team.</p>
          </div>
          <div className="md:col-span-3 space-y-3">
            {faqData.map((item, i) => (
              <div key={i} className={`landing-faq-item ${openIndex === i ? 'open' : ''}`}>
                <button className="landing-faq-trigger" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
                  {item.q}
                  <ChevronDown className="landing-faq-chevron" />
                </button>
                <div className="landing-faq-content">
                  <div className="landing-faq-answer">{item.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RevealSection>
  );
}

/* ── INTERACTIVE DEMO ── */
function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [
    { label: 'Board View', icon: KanbanSquare, content: (
      <div className="grid grid-cols-3 gap-4">
        {[{ col: 'Todo', color: 'bg-slate-400', cards: 3 }, { col: 'In Progress', color: 'bg-blue-400', cards: 2 }, { col: 'Done', color: 'bg-emerald-400', cards: 2 }].map((column, ci) => (
          <div key={column.col} className="space-y-2.5">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-2 border-b border-border/30 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${column.color}`} />{column.col}<span className="ml-auto text-[10px] opacity-50">{column.cards}</span>
            </div>
            {Array.from({ length: column.cards }).map((_, j) => (
              <div key={j} className="p-3 rounded-lg bg-background/80 border border-border/30 landing-demo-card hover:border-border hover:shadow-md transition-all cursor-default group" style={{ animationDelay: `${(ci * 3 + j) * 0.07}s` }}>
                <div className="h-2 w-4/5 rounded bg-foreground/10 mb-2.5 group-hover:bg-foreground/15 transition-colors" /><div className="h-2 w-3/5 rounded bg-foreground/5 mb-3" />
                <div className="flex items-center gap-2"><div className={`h-1.5 w-10 rounded-full ${ci === 0 ? 'bg-amber-400/40' : ci === 1 ? 'bg-indigo-400/40' : 'bg-emerald-400/40'}`} /><div className="ml-auto w-5 h-5 rounded-full bg-primary/8 border border-border/20" /></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    )},
    { label: 'Task Detail', icon: MousePointerClick, content: (
      <div className="space-y-4">
        <div className="flex items-center gap-3"><div className="w-6 h-6 rounded-md border-2 border-emerald-500 flex items-center justify-center"><CheckCircle2 className="h-4 w-4 text-emerald-500" /></div><span className="text-lg font-semibold">Design system update</span></div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-indigo-500 text-white font-medium">High Priority</span>
          <span className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground flex items-center gap-1.5"><Tag className="h-3 w-3" />Frontend</span>
          <span className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground flex items-center gap-1.5"><Calendar className="h-3 w-3" />Jul 12, 2026</span>
          <span className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground flex items-center gap-1.5"><Layers className="h-3 w-3" />Sprint 4</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">Update the component library to match the new brand guidelines. Include new color tokens, typography scale, spacing system, and updated iconography.</p>
        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="p-3 rounded-lg bg-secondary/50 border border-border/30"><div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1">Assignees</div><div className="flex items-center gap-2"><div className="landing-avatar-stack"><div className="landing-mini-avatar bg-indigo-500 !w-6 !h-6 !text-[10px]">S</div><div className="landing-mini-avatar bg-emerald-500 !w-6 !h-6 !text-[10px]">A</div><div className="landing-mini-avatar bg-amber-500 !w-6 !h-6 !text-[10px]">K</div></div><span className="text-xs text-muted-foreground">3 people</span></div></div>
          <div className="p-3 rounded-lg bg-secondary/50 border border-border/30"><div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1">Activity</div><div className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-muted-foreground/60" /><span className="text-xs text-muted-foreground">6 comments · 12 updates</span></div></div>
        </div>
      </div>
    )},
    { label: 'Analytics', icon: BarChart3, content: (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-1"><span className="text-sm font-medium">Task Completion</span><span className="text-xs text-muted-foreground">Last 2 weeks</span></div>
        <div className="flex items-end gap-1.5 h-32">
          {[35, 55, 40, 70, 50, 85, 65, 90, 55, 80, 60, 95, 70, 88].map((h, i) => (
            <div key={i} className="flex-1 rounded-t landing-bar" style={{ height: `${h}%`, background: `linear-gradient(to top, hsl(${240 + i * 8}, 70%, 55%), hsl(${240 + i * 8}, 55%, 72%))`, animationDelay: `${i * 0.05}s` }} />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground/50 px-1">{['M','T','W','T','F','M','T','W','T','F','M','T','W','T'].map((d, i) => <span key={i}>{d}</span>)}</div>
        <div className="grid grid-cols-4 gap-3 pt-2 border-t border-border/30">
          {[{ label: 'Completed', val: '48', c: 'text-emerald-500' }, { label: 'In Progress', val: '12', c: 'text-blue-500' }, { label: 'Overdue', val: '3', c: 'text-rose-500' }, { label: 'Created', val: '63', c: 'text-violet-500' }].map((s) => (
            <div key={s.label} className="text-center"><div className={`text-xl font-bold ${s.c}`}>{s.val}</div><div className="text-[10px] text-muted-foreground">{s.label}</div></div>
          ))}
        </div>
      </div>
    )},
  ];
  return (
    <RevealSection className="py-10">
      <div className="container">
        <div className="text-center max-w-[600px] mx-auto mb-8">
          <p className="text-xs font-medium text-primary/80 mb-2 tracking-widest uppercase">Interactive Preview</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">See it in <span className="landing-gradient-text">action</span></h2>
          <p className="text-sm text-muted-foreground">Click the tabs below to explore Taskly&apos;s core features.</p>
        </div>
        <div className="max-w-[900px] mx-auto"><div className="landing-browser-frame">
          <div className="flex border-b border-border/40">
            {tabs.map((tab, i) => (
              <button key={tab.label} onClick={() => setActiveTab(i)} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all ${activeTab === i ? 'text-foreground border-b-2 border-primary bg-secondary/30' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/20'}`}>
                <tab.icon className="h-4 w-4" />{tab.label}
              </button>
            ))}
          </div>
          <div key={activeTab} className="p-5 sm:p-6 landing-demo-content">{tabs[activeTab].content}</div>
        </div></div>
      </div>
    </RevealSection>
  );
}

export default LandingPage;
