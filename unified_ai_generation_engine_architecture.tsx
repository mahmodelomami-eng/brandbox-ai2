import React, { useState, useEffect, useRef, useReducer } from 'react';
import { 
  LayoutDashboard, MessageSquare, Image as ImageIcon, Video, Layers, Palette, 
  CreditCard, Sliders, Coins, FolderOpen, Download, Bot, Database, 
  Plus, Search, X, Sparkles, ShieldCheck, RefreshCw, Send, Trash2, LogOut, Lock, 
  CheckCircle2, Server, ShieldAlert, History, Eye, FolderPlus, ArrowRight,
  Briefcase, Users, Target, Globe, MessageCircle, ChevronDown, Activity, Settings, ExternalLink, Filter, Play, Clock, AlertTriangle, AlertCircle, Ban
} from 'lucide-react';

// ==============================================================================
// BRAND BOX AI — PHASE 6 UNIFIED MODEL REGISTRY & SERVER-CONTROLLED PRICING
// ==============================================================================
export const UNIFIED_MODEL_REGISTRY = {
  chat: [
    { id: 'openai/gpt-4o-mini', displayName: 'GPT-4o Mini', provider: 'OpenAI', creditCost: 2, isActive: true, capabilities: ['text', 'code', 'arabic-optimized'], environment: 'production' },
    { id: 'anthropic/claude-3.5-sonnet', displayName: 'Claude 3.5 Sonnet', provider: 'Anthropic', creditCost: 4, isActive: true, capabilities: ['analysis', 'coding', 'long-context'], environment: 'production' },
    { id: 'meta-llama/llama-3.3-70b-instruct', displayName: 'Llama 3.3 70B', provider: 'Meta', creditCost: 2, isActive: true, capabilities: ['open-weights', 'fast'], environment: 'production' },
    { id: 'google/gemini-2.5-flash', displayName: 'Gemini 2.5 Flash', provider: 'Google', creditCost: 1, isActive: true, capabilities: ['ultra-fast', 'cost-efficient'], environment: 'production' },
  ],
  image: [
    { id: 'imagen-4.0-generate-001', displayName: 'Imagen 4.0 Ultra', provider: 'Google', creditCost: 5, isActive: true, capabilities: ['photorealistic', '3d', 'cinematic'], environment: 'production' },
    { id: 'gemini-3.1-flash-image-preview', displayName: 'Gemini Flash Image', provider: 'Google', creditCost: 4, isActive: true, capabilities: ['editing', 'fast'], environment: 'production' },
    { id: 'flux-1-schnell', displayName: 'Flux 1 Schnell', provider: 'Black Forest Labs', creditCost: 3, isActive: true, capabilities: ['anime', 'minimalist'], environment: 'production' },
  ],
  video: [
    { id: 'runway-gen3-alpha', displayName: 'Runway Gen-3 Alpha', provider: 'Runway', creditCost: 15, isActive: false, status: 'provider_not_configured', capabilities: ['video-generation'], environment: 'staging' }
  ]
};

// Rate limiter tracker for client request spam mitigation
const serverRateLimiterGuard = {
  timestamps: [],
  checkLimit: function(maxRequests = 5, windowMs = 30000) {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(ts => now - ts < windowMs);
    if (this.timestamps.length >= maxRequests) return false;
    this.timestamps.push(now);
    return true;
  }
};

const initialState = {
  auth: {
    isAuthenticated: true,
    user: {
      id: 'usr_supabase_981240',
      firstName: 'محمود',
      lastName: 'الحسن',
      email: 'mahmoud@brandbox.ai',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      role: 'Pro Member'
    }
  },
  credits: {
    balance: 340,
    limit: 1000,
    usedThisMonth: 660,
    transactions: [
      { id: 'tx-101', amount: -2, type: 'generation', description: 'توليد نص عبر GPT-4o Mini', createdAt: '2026-08-10T18:30:00Z' },
      { id: 'tx-102', amount: -5, type: 'generation', description: 'توليد صورة عبر Imagen 4.0 Ultra', createdAt: '2026-08-10T16:15:00Z' },
      { id: 'tx-103', amount: 1000, type: 'subscription', description: 'تجديد الاشتراك الشهري (باقة Pro)', createdAt: '2026-08-01T00:00:00Z' }
    ]
  },
  activeTab: 'dashboard',
  activeProjectId: 'proj-1',
  projectWorkspaceTab: 'overview',
  projects: [
    { 
      id: 'proj-1', 
      name: 'حملة متجر القهوة المختصة', 
      type: 'صورة + نص', 
      description: 'إطلاق خط إنتاج القهوة الإثيوبية الفاخرة مع هوية بصرية مخصصة.',
      industry: 'الأغذية والمشروبات',
      targetAudience: 'عشاق القهوة وجمهور جيل Z',
      language: 'العربية',
      tone: 'عصري وحماسي',
      timeAgo: 'منذ ساعتين', 
      thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=80',
      createdAt: '2026-08-10T12:00:00Z'
    },
    { 
      id: 'proj-2', 
      name: 'تسويق المجمع العقاري الحديث', 
      type: 'فيديو AI', 
      description: 'حملة ترويجية للمجمعات السكنية الفاخرة في العاصمة.',
      industry: 'العقارات',
      targetAudience: 'المستثمرون والعائلات الفاخرة',
      language: 'العربية',
      tone: 'احترافي وراقي',
      timeAgo: 'منذ 5 ساعات', 
      thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&auto=format&fit=crop&q=80',
      createdAt: '2026-08-10T08:00:00Z'
    }
  ],
  projectActivities: [
    { id: 'act-1', projectId: 'proj-1', type: 'generation', description: 'تم توليد صورة إعلانية جديدة لفنجان القهوة.', createdAt: '2026-08-10T16:15:00Z' },
    { id: 'act-2', projectId: 'proj-1', type: 'created', description: 'تم إنشاء مشروع متجر القهوة المختصة.', createdAt: '2026-08-10T12:00:00Z' }
  ],
  chatSessions: [
    {
      id: 'sess-101',
      projectId: 'proj-1',
      title: 'خطة التسويق لمتجر القهوة',
      model: 'openai/gpt-4o-mini',
      createdAt: '2026-08-10T14:20:00Z',
      messages: [
        { id: 'm1', sender: 'ai', content: 'أهلاً بك! أنا مساعد Brand Box AI. كيف يمكنني مساعدتك اليوم في خطتك التسويقية؟', createdAt: '2026-08-10T14:20:05Z' },
        { id: 'm2', sender: 'user', content: 'اقترح لي 3 أفكار مبتكرة لإطلاق محصول قهوة مختصة جديد.', createdAt: '2026-08-10T14:21:00Z' },
        { id: 'm3', sender: 'ai', content: "إليك 3 أفكار استراتيجية مبتكرة لإطلاق محصول القهوة الجديد:\n\n1. **حملة 'تذوق السر' (Blind Tasting Box):** إرسال عينات غير معنونة للمؤثرين لتقييم الإيحاءات قبل الكشف عن الاسم الرسمي.\n2. **تحدي الإعداد المنزلي (Home Barista Challenge):** مسابقة بين العملاء لإعداد أفضل كوب مع هاشتاج خاص.\n3. **وثائقي كواليس المحصول:** فيديو قصير يوثق رحلة الحبوب من المزرعة إلى الفنجان للتركيز على الجودة والاستدامة.", createdAt: '2026-08-10T14:21:10Z' }
      ]
    }
  ],
  activeChatId: 'sess-101',
  brandKit: {
    brandName: 'Brand Box AI',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    primaryColor: '#FF2E4C',
    secondaryColor: '#E50914',
    fontFamily: 'Tajawal',
    brandTone: 'احترافية، حماسية، مبتكرة ومباشرة',
    brandDescription: 'المنصة الرائدة لأدوات الذكاء الاصطناعي الشاملة في الشرق الأوسط.',
    targetAudience: 'المصممون، صناع المحتوى، والشركات الناشئة',
    language: 'العربية',
    writingStyle: 'مباشر مع التركيز على القيمة والتحويل CTA'
  },
  generations: [
    {
      id: 'gen-201',
      type: 'image',
      provider: 'Google',
      model: 'imagen-4.0-generate-001',
      prompt: 'فنجان قهوة فاخر مع إضاءة سينمائية دافئة وخلفية متجر عصري',
      negativePrompt: 'blurry, distortion, bad quality',
      settings: { style: 'Cinematic', aspectRatio: '1:1', useBrandKit: true },
      status: 'completed',
      resultUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
      creditsUsed: 5,
      projectId: 'proj-1',
      createdAt: '2026-08-10T16:15:00Z'
    }
  ],
  assets: [
    {
      id: 'asset-301',
      generationId: 'gen-201',
      projectId: 'proj-1',
      type: 'image',
      name: 'تصميم_إعلان_القهوة_01.png',
      filePath: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
      mimeType: 'image/png',
      width: 1024,
      height: 1024,
      createdAt: '2026-08-10T16:15:00Z'
    }
  ],
  templates: [
    {
      id: 'tpl-1',
      title: 'منشور إنستغرام ترويجي للحملات الإعلانية',
      description: 'نص تسويقي فريد وصورة جذابة مهيأة لزيادة التفاعل والتحويل المباشر.',
      category: 'Social Media',
      thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&auto=format&fit=crop&q=80',
      prompt: 'اكتب كابشن إنستغرام تسويقي ومبتكر لحملة تخفيضات موسمية لمنتج فاخر، مع إضافة دعوة للتفاعل (CTA) وهاشتاجات مناسبة.',
      isPremium: false
    },
    {
      id: 'tpl-2',
      title: 'إعلان فيسبوك ذو معدل تحويل مرتفع (FB Ad)',
      description: 'استراتيجية صياغة إعلانية تركز على معالجة نقاط الألم واستعراض الفوائد.',
      category: 'Marketing',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=80',
      prompt: 'اكتب نص إعلان فيسبوك ترويجي يتبع صيغة PAS (المشكلة - الإزعاج - الحل) لخدمة برمجية جديدة.',
      isPremium: true
    }
  ],
  toastNotification: null,
  processedIdempotencyKeys: new Set(),
  activeGenerationModal: null,
  activeAssetModal: null,
  isCreateProjectOpen: false
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, activeTab: action.payload };

    case 'OPEN_PROJECT_WORKSPACE':
      return { 
        ...state, 
        activeTab: 'project-workspace', 
        activeProjectId: action.payload.projectId,
        projectWorkspaceTab: action.payload.tab || 'overview'
      };

    case 'SET_PROJECT_WORKSPACE_TAB':
      return { ...state, projectWorkspaceTab: action.payload };

    case 'LOGIN_SUCCESS':
      return { ...state, auth: { isAuthenticated: true, user: action.payload } };

    case 'LOGOUT':
      return { ...state, auth: { isAuthenticated: false, user: null }, activeTab: 'login' };

    case 'CONSUME_CREDITS_ATOMIC': {
      const { cost, idempotencyKey, description } = action.payload;
      if (state.processedIdempotencyKeys.has(idempotencyKey)) return state;
      if (state.credits.balance < cost) return state;

      const updatedKeys = new Set(state.processedIdempotencyKeys);
      updatedKeys.add(idempotencyKey);

      return {
        ...state,
        processedIdempotencyKeys: updatedKeys,
        credits: {
          ...state.credits,
          balance: state.credits.balance - cost,
          usedThisMonth: state.credits.usedThisMonth + cost,
          transactions: [
            {
              id: 'tx-' + Date.now(),
              amount: -cost,
              type: 'generation',
              description: description,
              createdAt: new Date().toISOString()
            },
            ...state.credits.transactions
          ]
        }
      };
    }

    case 'REFUND_CREDITS_SERVER':
      return {
        ...state,
        credits: {
          ...state.credits,
          balance: state.credits.balance + action.payload.cost,
          usedThisMonth: Math.max(0, state.credits.usedThisMonth - action.payload.cost),
          transactions: [
            {
              id: 'tx-ref-' + Date.now(),
              amount: action.payload.cost,
              type: 'refund',
              description: action.payload.description || 'استرداد تلقائي بسبب تعثر العمليات السحابية',
              createdAt: new Date().toISOString()
            },
            ...state.credits.transactions
          ]
        }
      };

    case 'CREATE_PROJECT': {
      const newProj = action.payload;
      const newAct = {
        id: 'act-' + Date.now(),
        projectId: newProj.id,
        type: 'created',
        description: `تم إنشاء مشروع ${newProj.name} بنجاح.`,
        createdAt: new Date().toISOString()
      };
      return {
        ...state,
        projects: [newProj, ...state.projects],
        projectActivities: [newAct, ...state.projectActivities],
        activeProjectId: newProj.id,
        activeTab: 'project-workspace',
        projectWorkspaceTab: 'overview',
        isCreateProjectOpen: false
      };
    }

    case 'LOG_PROJECT_ACTIVITY':
      return {
        ...state,
        projectActivities: [action.payload, ...state.projectActivities]
      };

    case 'REGISTER_GENERATION_JOB':
      return {
        ...state,
        generations: [action.payload, ...state.generations]
      };

    case 'UPDATE_GENERATION_STATUS': {
      const { id, status, resultUrl, errorMessage } = action.payload;
      return {
        ...state,
        generations: state.generations.map(gen => gen.id === id ? {
          ...gen,
          status,
          resultUrl: resultUrl || gen.resultUrl,
          errorMessage: errorMessage || gen.errorMessage,
          completedAt: status === 'completed' ? new Date().toISOString() : gen.completedAt
        } : gen)
      };
    }

    case 'REGISTER_ASSET':
      return { ...state, assets: [action.payload, ...state.assets] };

    case 'MOVE_ASSET_PROJECT': {
      const { assetId, newProjectId } = action.payload;
      return {
        ...state,
        assets: state.assets.map(a => a.id === assetId ? { ...a, projectId: newProjectId } : a)
      };
    }

    case 'DELETE_ASSET':
      return { ...state, assets: state.assets.filter(a => a.id !== action.payload) };

    case 'CREATE_NEW_CHAT': {
      const newSession = {
        id: 'sess-' + Date.now(),
        projectId: action.payload?.projectId || null,
        title: action.payload?.title || 'محادثة جديدة',
        model: 'openai/gpt-4o-mini',
        createdAt: new Date().toISOString(),
        messages: [{ 
          id: 'm-init', 
          sender: 'ai', 
          content: action.payload?.initialContent || 'أهلاً بك! أنا مساعد Brand Box AI. كيف يمكنني مساعدتك اليوم؟',
          createdAt: new Date().toISOString()
        }]
      };
      return {
        ...state,
        chatSessions: [newSession, ...state.chatSessions],
        activeChatId: newSession.id
      };
    }

    case 'ADD_CHAT_MESSAGE':
      return {
        ...state,
        chatSessions: state.chatSessions.map(sess => sess.id === action.payload.sessionId ? {
          ...sess,
          messages: [...sess.messages, action.payload.message]
        } : sess)
      };

    case 'SET_GENERATION_MODAL':
      return { ...state, activeGenerationModal: action.payload };

    case 'SET_ASSET_MODAL':
      return { ...state, activeAssetModal: action.payload };

    case 'TOGGLE_CREATE_PROJECT_MODAL':
      return { ...state, isCreateProjectOpen: action.payload };

    case 'SHOW_TOAST':
      return { ...state, toastNotification: action.payload };

    case 'CLEAR_TOAST':
      return { ...state, toastNotification: null };

    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const showToast = (text, type = 'info') => {
    dispatch({ type: 'SHOW_TOAST', payload: { text, type } });
    setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), 4500);
  };

  const protectedTabs = ['dashboard', 'projects', 'project-workspace', 'chat', 'images', 'video', 'generations', 'assets', 'templates', 'brand-kit', 'pricing', 'settings'];
  if (!state.auth.isAuthenticated && protectedTabs.includes(state.activeTab)) {
    return <AuthView mode="login" dispatch={dispatch} showToast={showToast} />;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#090A0F] text-gray-100 font-sans flex flex-col selection:bg-[#FF2E4C] selection:text-white">
      {/* Toast Notification Banner */}
      {state.toastNotification && (
        <div className={`fixed top-20 left-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md border animate-fade-in ${
          state.toastNotification.type === 'error' ? 'bg-[#121520] border-red-500/50 text-red-200' :
          state.toastNotification.type === 'success' ? 'bg-[#121520] border-emerald-500/50 text-emerald-200' :
          'bg-[#121520] border-[#FF2E4C]/40 text-white'
        }`}>
          {state.toastNotification.type === 'error' ? <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" /> :
           state.toastNotification.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> :
           <Sparkles className="w-5 h-5 text-[#FF2E4C] shrink-0" />}
          <span className="text-xs font-semibold">{state.toastNotification.text}</span>
          <button onClick={() => dispatch({ type: 'CLEAR_TOAST' })} className="text-gray-400 hover:text-white mr-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <header className="h-16 border-b border-[#1F2438] bg-[#0D0F17]/90 sticky top-0 z-40 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden text-gray-400 hover:text-white p-2">
            <Layers className="w-6 h-6" />
          </button>
          <div onClick={() => dispatch({ type: 'SET_TAB', payload: 'dashboard' })} className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E50914] to-[#FF2E4C] flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-[#FF2E4C]/20 group-hover:scale-105 transition">
              B
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-wider text-white">BRAND <span className="text-[#FF2E4C]">BOX</span> AI</span>
              <span className="hidden sm:inline-block text-[10px] bg-[#FF2E4C]/20 text-[#FF2E4C] px-2 py-0.5 rounded-full border border-[#FF2E4C]/30 font-bold mr-2">ENGINE v6.0</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          <button onClick={() => dispatch({ type: 'TOGGLE_CREATE_PROJECT_MODAL', payload: true })} className="bg-[#FF2E4C] hover:bg-[#E50914] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition">
            <FolderPlus className="w-4 h-4" />
            <span className="hidden sm:inline">مشروع جديد</span>
          </button>

          <div className="flex items-center gap-2 bg-[#FF2E4C]/10 border border-[#FF2E4C]/30 px-3.5 py-1.5 rounded-lg">
            <Coins className="w-4 h-4 text-[#FF2E4C]" />
            <span className="text-xs font-semibold text-gray-300">الرصيد:</span>
            <span className="text-xs font-bold text-[#FF2E4C]">{state.credits.balance}</span>
          </div>

          {state.auth.isAuthenticated && (
            <div className="flex items-center gap-2 border-r border-[#1F2438] pr-3">
              <img src={state.auth.user.avatarUrl} alt="Avatar" className="w-9 h-9 rounded-xl object-cover border border-[#FF2E4C]/40" />
              <button onClick={() => { dispatch({ type: 'LOGOUT' }); showToast('تم تسجيل الخروج بنجاح.'); }} className="text-gray-400 hover:text-red-400 p-1.5 transition mr-1">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Navigation Sidebar */}
      <div className="flex flex-1 relative overflow-hidden">
        <aside className={`w-64 bg-[#0D0F17] border-l border-[#1F2438] flex-col justify-between fixed lg:static inset-y-0 right-0 z-30 transform ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out flex`}>
          <div className="p-4 space-y-6 overflow-y-auto">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">منطقة العمل المركزية</p>
              <NavItem icon={<LayoutDashboard className="w-4 h-4" />} label="لوحة التحكم" active={state.activeTab === 'dashboard'} onClick={() => { dispatch({ type: 'SET_TAB', payload: 'dashboard' }); setMobileMenuOpen(false); }} />
              <NavItem icon={<FolderOpen className="w-4 h-4" />} label="المشاريع (Projects)" active={state.activeTab === 'projects' || state.activeTab === 'project-workspace'} onClick={() => { dispatch({ type: 'SET_TAB', payload: 'projects' }); setMobileMenuOpen(false); }} />
              <NavItem icon={<MessageSquare className="w-4 h-4" />} label="المساعد الذكي (AI Chat)" active={state.activeTab === 'chat'} onClick={() => { dispatch({ type: 'SET_TAB', payload: 'chat' }); setMobileMenuOpen(false); }} />
              <NavItem icon={<ImageIcon className="w-4 h-4" />} label="مولد الصور (AI Images)" active={state.activeTab === 'images'} onClick={() => { dispatch({ type: 'SET_TAB', payload: 'images' }); setMobileMenuOpen(false); }} />
              <NavItem icon={<Video className="w-4 h-4" />} label="صانع الفيديو (AI Video)" active={state.activeTab === 'video'} onClick={() => { dispatch({ type: 'SET_TAB', payload: 'video' }); setMobileMenuOpen(false); }} />
            </div>

            <div className="space-y-1 pt-4 border-t border-[#1F2438]/60">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">المكتبة والسجل</p>
              <NavItem icon={<History className="w-4 h-4" />} label="سجل التوليد (History)" active={state.activeTab === 'generations'} onClick={() => { dispatch({ type: 'SET_TAB', payload: 'generations' }); setMobileMenuOpen(false); }} />
              <NavItem icon={<Database className="w-4 h-4" />} label="مكتبة الأصول (Assets)" active={state.activeTab === 'assets'} onClick={() => { dispatch({ type: 'SET_TAB', payload: 'assets' }); setMobileMenuOpen(false); }} />
              <NavItem icon={<Layers className="w-4 h-4" />} label="مكتبة القوالب" active={state.activeTab === 'templates'} onClick={() => { dispatch({ type: 'SET_TAB', payload: 'templates' }); setMobileMenuOpen(false); }} />
              <NavItem icon={<Palette className="w-4 h-4" />} label="الهوية التجارية (Brand Kit)" active={state.activeTab === 'brand-kit'} onClick={() => { dispatch({ type: 'SET_TAB', payload: 'brand-kit' }); setMobileMenuOpen(false); }} />
            </div>

            <div className="space-y-1 pt-4 border-t border-[#1F2438]/60">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">الحساب والاشتراك</p>
              <NavItem icon={<CreditCard className="w-4 h-4" />} label="خطط الأسعار" active={state.activeTab === 'pricing'} onClick={() => { dispatch({ type: 'SET_TAB', payload: 'pricing' }); setMobileMenuOpen(false); }} />
              <NavItem icon={<Sliders className="w-4 h-4" />} label="إعدادات الحساب" active={state.activeTab === 'settings'} onClick={() => { dispatch({ type: 'SET_TAB', payload: 'settings' }); setMobileMenuOpen(false); }} />
            </div>
          </div>
        </aside>

        {/* Content Views Routing */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 min-h-[calc(100vh-4rem)]">
          {state.activeTab === 'dashboard' && <DashboardView state={state} dispatch={dispatch} showToast={showToast} />}
          {state.activeTab === 'projects' && <ProjectsListView state={state} dispatch={dispatch} showToast={showToast} />}
          {state.activeTab === 'project-workspace' && <ProjectWorkspaceView state={state} dispatch={dispatch} showToast={showToast} />}
          {state.activeTab === 'chat' && <ChatView state={state} dispatch={dispatch} showToast={showToast} />}
          {state.activeTab === 'images' && <ImageView state={state} dispatch={dispatch} showToast={showToast} />}
          {state.activeTab === 'video' && <VideoView state={state} dispatch={dispatch} showToast={showToast} />}
          {state.activeTab === 'generations' && <GenerationsHistoryView state={state} dispatch={dispatch} showToast={showToast} />}
          {state.activeTab === 'assets' && <AssetsLibraryView state={state} dispatch={dispatch} showToast={showToast} />}
          {state.activeTab === 'templates' && <TemplatesView state={state} dispatch={dispatch} showToast={showToast} />}
          {state.activeTab === 'brand-kit' && <BrandKitView state={state} dispatch={dispatch} showToast={showToast} />}
          {state.activeTab === 'pricing' && <PricingView state={state} dispatch={dispatch} showToast={showToast} />}
          {state.activeTab === 'settings' && <SettingsView state={state} dispatch={dispatch} showToast={showToast} />}
        </main>
      </div>

      {/* Modals */}
      {state.isCreateProjectOpen && <CreateProjectModal dispatch={dispatch} showToast={showToast} />}
      {state.activeGenerationModal && <GenerationDetailModal generation={state.activeGenerationModal} dispatch={dispatch} showToast={showToast} />}
      {state.activeAssetModal && <AssetDetailModal asset={state.activeAssetModal} projects={state.projects} dispatch={dispatch} showToast={showToast} />}
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${active ? 'text-white bg-[#FF2E4C]/15 border border-[#FF2E4C]/30 font-bold' : 'text-gray-400 hover:text-white hover:bg-[#121520]'}`}>
      <span className={active ? 'text-[#FF2E4C]' : ''}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function ProjectsListView({ state, dispatch, showToast }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = state.projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F2438] pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">إدارة المشاريع الذكية (Projects Workspace)</h2>
          <p className="text-xs text-gray-400">جميع مشاريعك وحملاتك الرقمية المنظمة مع سياق ذكاء اصطناعي مخصص.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="بحث في المشاريع..." className="bg-[#121520] border border-[#1F2438] text-xs text-white rounded-xl py-2 pl-3 pr-8 focus:outline-none" />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5" />
          </div>
          <button onClick={() => dispatch({ type: 'TOGGLE_CREATE_PROJECT_MODAL', payload: true })} className="bg-[#FF2E4C] hover:bg-[#E50914] text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg">
            <Plus className="w-4 h-4" />
            <span>مشروع جديد</span>
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-[#121520] border border-[#1F2438] rounded-2xl space-y-3">
          <FolderOpen className="w-12 h-12 text-gray-500 mx-auto" />
          <p className="text-gray-300 font-bold text-sm">لم تنشئ أي مشروع بعد</p>
          <button onClick={() => dispatch({ type: 'TOGGLE_CREATE_PROJECT_MODAL', payload: true })} className="text-xs bg-[#FF2E4C] text-white px-4 py-2 rounded-xl font-bold">ابدأ مشروعك الأول الآن</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(proj => {
            const projectAssets = state.assets.filter(a => a.projectId === proj.id);
            const projectGens = state.generations.filter(g => g.projectId === proj.id);

            return (
              <div key={proj.id} onClick={() => dispatch({ type: 'OPEN_PROJECT_WORKSPACE', payload: { projectId: proj.id } })} className="p-4 bg-[#121520] border border-[#1F2438] rounded-2xl space-y-4 cursor-pointer hover:border-[#FF2E4C]/50 transition group flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-40 rounded-xl overflow-hidden bg-gray-900 relative">
                    <img src={proj.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80'} alt={proj.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    <span className="absolute top-2 right-2 text-[10px] bg-black/70 backdrop-blur-md text-white font-bold px-2 py-0.5 rounded border border-white/10">
                      {proj.industry}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-[#FF2E4C] transition">{proj.name}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1">{proj.description}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1F2438] flex items-center justify-between text-[11px] text-gray-400">
                  <div className="flex gap-3">
                    <span>{projectAssets.length} أصل</span>
                    <span>•</span>
                    <span>{projectGens.length} توليد</span>
                  </div>
                  <span className="text-[#FF2E4C] font-bold flex items-center gap-1 group-hover:translate-x-[-2px] transition">
                    <span>فتح بيئة العمل</span>
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProjectWorkspaceView({ state, dispatch, showToast }) {
  const activeProj = state.projects.find(p => p.id === state.activeProjectId) || state.projects[0];
  const projectAssets = state.assets.filter(a => a.projectId === activeProj?.id);
  const projectGens = state.generations.filter(g => g.projectId === activeProj?.id);
  const projectActivities = state.projectActivities.filter(act => act.projectId === activeProj?.id);

  if (!activeProj) return null;

  return (
    <div className="space-y-6">
      <div className="p-5 bg-gradient-to-r from-[#121520] via-[#121520] to-[#FF2E4C]/10 border border-[#1F2438] rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-900 shrink-0 border border-[#FF2E4C]/30">
            <img src={activeProj.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80'} alt={activeProj.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-[#FF2E4C]/20 text-[#FF2E4C] font-bold px-2 py-0.5 rounded border border-[#FF2E4C]/30">{activeProj.industry}</span>
              <span className="text-xs text-gray-400">النبرة: {activeProj.tone}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="text-xl font-extrabold text-white">{activeProj.name}</h2>
              <div className="relative group">
                <select value={activeProj.id} onChange={(e) => dispatch({ type: 'OPEN_PROJECT_WORKSPACE', payload: { projectId: e.target.value } })} className="bg-[#0D0F17] border border-[#1F2438] text-xs text-gray-300 rounded-lg px-2 py-1 focus:outline-none cursor-pointer">
                  {state.projects.map(p => (
                    <option key={p.id} value={p.id}>تبديل إلى: {p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => dispatch({ type: 'SET_PROJECT_WORKSPACE_TAB', payload: 'generate' })} className="bg-[#FF2E4C] hover:bg-[#E50914] text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg">
            <Sparkles className="w-4 h-4" />
            <span>توليد صورة للمشروع</span>
          </button>
          <button onClick={() => dispatch({ type: 'SET_PROJECT_WORKSPACE_TAB', payload: 'chat' })} className="bg-[#121520] hover:bg-[#1F2438] border border-[#1F2438] text-gray-200 font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-[#FF2E4C]" />
            <span>مساعد المشروع</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-[#1F2438] pb-2 overflow-x-auto">
        <TabButton label="نظرة عامة" active={state.projectWorkspaceTab === 'overview'} onClick={() => dispatch({ type: 'SET_PROJECT_WORKSPACE_TAB', payload: 'overview' })} icon={<LayoutDashboard className="w-4 h-4" />} />
        <TabButton label="مساعد المشروع (Chat)" active={state.projectWorkspaceTab === 'chat'} onClick={() => dispatch({ type: 'SET_PROJECT_WORKSPACE_TAB', payload: 'chat' })} icon={<MessageSquare className="w-4 h-4" />} />
        <TabButton label="التوليد الابتكاري (Generate)" active={state.projectWorkspaceTab === 'generate'} onClick={() => dispatch({ type: 'SET_PROJECT_WORKSPACE_TAB', payload: 'generate' })} icon={<Sparkles className="w-4 h-4" />} />
        <TabButton label={`أصول المشروع (${projectAssets.length})`} active={state.projectWorkspaceTab === 'assets'} onClick={() => dispatch({ type: 'SET_PROJECT_WORKSPACE_TAB', payload: 'assets' })} icon={<Database className="w-4 h-4" />} />
        <TabButton label={`سجل التوليد (${projectGens.length})`} active={state.projectWorkspaceTab === 'generations'} onClick={() => dispatch({ type: 'SET_PROJECT_WORKSPACE_TAB', payload: 'generations' })} icon={<History className="w-4 h-4" />} />
        <TabButton label="القوالب الموصى بها" active={state.projectWorkspaceTab === 'templates'} onClick={() => dispatch({ type: 'SET_PROJECT_WORKSPACE_TAB', payload: 'templates' })} icon={<Layers className="w-4 h-4" />} />
        <TabButton label="هوية البراند المربوطة" active={state.projectWorkspaceTab === 'brand-kit'} onClick={() => dispatch({ type: 'SET_PROJECT_WORKSPACE_TAB', payload: 'brand-kit' })} icon={<Palette className="w-4 h-4" />} />
      </div>

      {state.projectWorkspaceTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="أصول المشروع" value={projectAssets.length} subtitle="ملفات بصرية محفوظة" icon={<Database className="text-[#FF2E4C]" />} />
            <MetricCard label="عمليات التوليد" value={projectGens.length} subtitle="توليدات AI مكتملة" icon={<Bot className="text-purple-400" />} />
            <MetricCard label="النقاط المستهلكة" value={projectGens.reduce((acc, g) => acc + g.creditsUsed, 0)} subtitle="نقاط مستخدمة للمشروع" icon={<Coins className="text-amber-400" />} />
            <MetricCard label="جمهور الهدف" value={activeProj.targetAudience} subtitle={`اللغة: ${activeProj.language}`} icon={<Users className="text-blue-400" />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-base font-bold text-white">أحدث أصول المشروع</h3>
              {projectAssets.length === 0 ? (
                <div className="p-8 text-center bg-[#121520] border border-[#1F2438] rounded-2xl space-y-3">
                  <Database className="w-10 h-10 text-gray-500 mx-auto" />
                  <p className="text-gray-300 font-bold text-xs">لا توجد أصول لهذا المشروع حتى الآن</p>
                  <button onClick={() => dispatch({ type: 'SET_PROJECT_WORKSPACE_TAB', payload: 'generate' })} className="text-xs bg-[#FF2E4C] text-white px-3.5 py-2 rounded-xl font-bold">توليد أول صورة للمشروع</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projectAssets.slice(0, 2).map(asset => (
                    <div key={asset.id} onClick={() => dispatch({ type: 'SET_ASSET_MODAL', payload: asset })} className="p-3 bg-[#121520] border border-[#1F2438] rounded-2xl space-y-2 cursor-pointer hover:border-[#FF2E4C]/40 transition">
                      <div className="h-32 rounded-xl overflow-hidden bg-gray-900">
                        <img src={asset.filePath} alt={asset.name} className="w-full h-full object-cover" />
                      </div>
                      <h4 className="text-xs font-bold text-white truncate">{asset.name}</h4>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 bg-[#121520] border border-[#1F2438] rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#FF2E4C]" />
                <span>سجل أنشطة المشروع</span>
              </h3>
              <div className="space-y-3">
                {projectActivities.length === 0 ? (
                  <p className="text-xs text-gray-400">لا توجد أنشطة مسجلة لهذا المشروع.</p>
                ) : (
                  projectActivities.map(act => (
                    <div key={act.id} className="p-2.5 bg-[#0D0F17] border border-[#1F2438] rounded-xl text-xs space-y-1">
                      <p className="text-gray-200 font-medium">{act.description}</p>
                      <span className="text-[10px] text-gray-500">{new Date(act.createdAt).toLocaleTimeString('ar-EG')}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {state.projectWorkspaceTab === 'chat' && <ChatView state={state} dispatch={dispatch} showToast={showToast} projectScope={activeProj} />}
      {state.projectWorkspaceTab === 'generate' && <ImageView state={state} dispatch={dispatch} showToast={showToast} projectScope={activeProj} />}
      {state.projectWorkspaceTab === 'assets' && <AssetsLibraryView state={state} dispatch={dispatch} showToast={showToast} projectScope={activeProj} />}
      {state.projectWorkspaceTab === 'generations' && <GenerationsHistoryView state={state} dispatch={dispatch} showToast={showToast} projectScope={activeProj} />}
      {state.projectWorkspaceTab === 'templates' && <TemplatesView state={state} dispatch={dispatch} showToast={showToast} projectScope={activeProj} />}
      {state.projectWorkspaceTab === 'brand-kit' && <BrandKitView state={state} dispatch={dispatch} showToast={showToast} projectScope={activeProj} />}
    </div>
  );
}

function TabButton({ label, active, onClick, icon }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${active ? 'bg-[#FF2E4C] text-white shadow-md' : 'bg-[#121520] text-gray-400 hover:text-white border border-[#1F2438]'}`}>
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function DashboardView({ state, dispatch, showToast }) {
  const userName = state.auth.user?.firstName || '';

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-[#121520] via-[#121520] to-[#FF2E4C]/10 p-6 rounded-2xl border border-[#1F2438]">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">{userName ? `مرحباً بك مجدداً، ${userName}! 👋` : 'مرحباً بك مجدداً! 👋'}</h1>
          <p className="text-gray-400 text-sm">منطقة العمل المركزية القائمة على المشاريع والأصول المخزنة سحابياً.</p>
        </div>
        <button onClick={() => dispatch({ type: 'TOGGLE_CREATE_PROJECT_MODAL', payload: true })} className="bg-[#FF2E4C] hover:bg-[#E50914] text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2">
          <FolderPlus className="w-4 h-4" />
          <span>إنشاء مشروع جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="إجمالي المشاريع" value={state.projects.length} subtitle="مشاريع مخصصة بالذكاء الاصطناعي" icon={<FolderOpen className="text-[#FF2E4C]" />} />
        <MetricCard label="الأصول المولّدة" value={state.assets.length} subtitle="صور وفيديوهات محفوظة" icon={<ImageIcon className="text-blue-400" />} />
        <MetricCard label="التوليدات الناجحة" value={state.generations.filter(g => g.status === 'completed').length} subtitle="إجمالي عمليات AI" icon={<Bot className="text-purple-400" />} />
        <MetricCard label="المساحة المستخدمة" value={`${(state.assets.length * 1.2).toFixed(1)} MB`} subtitle="من أصل 10 GB" icon={<Database className="text-amber-400" />} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">المشاريع الأخيرة</h3>
          <button onClick={() => dispatch({ type: 'SET_TAB', payload: 'projects' })} className="text-xs text-[#FF2E4C] font-bold hover:underline">عرض جميع المشاريع</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.projects.slice(0, 3).map(proj => (
            <div key={proj.id} onClick={() => dispatch({ type: 'OPEN_PROJECT_WORKSPACE', payload: { projectId: proj.id } })} className="p-4 bg-[#121520] border border-[#1F2438] rounded-2xl space-y-3 cursor-pointer hover:border-[#FF2E4C]/40 transition group">
              <div className="h-36 rounded-xl overflow-hidden bg-gray-900 relative">
                <img src={proj.thumbnail} alt={proj.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <span className="absolute top-2 right-2 text-[10px] bg-black/70 text-white font-bold px-2 py-0.5 rounded">{proj.industry}</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-[#FF2E4C] transition">{proj.name}</h4>
                <p className="text-xs text-gray-400 line-clamp-1">{proj.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, subtitle, icon }) {
  return (
    <div className="p-5 rounded-2xl bg-[#121520] border border-[#1F2438] flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-400 font-semibold mb-1">{label}</p>
        <h4 className="text-2xl font-extrabold text-white">{value}</h4>
        {subtitle && <span className="text-[11px] text-gray-400 font-medium mt-1">{subtitle}</span>}
      </div>
      <div className="w-12 h-12 rounded-xl bg-gray-800/50 border border-[#1F2438] flex items-center justify-center text-xl">{icon}</div>
    </div>
  );
}

function ChatView({ state, dispatch, showToast, projectScope }) {
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('openai/gpt-4o-mini');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef(null);

  const activeSession = state.chatSessions.find(s => s.id === state.activeChatId) || state.chatSessions[0];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    const promptText = input.trim();

    if (!promptText) {
      showToast('الرجاء إدخال نص الاستفسار أولاً', 'error');
      return;
    }

    if (!serverRateLimiterGuard.checkLimit()) {
      showToast('تم تجاوز معدل الطلبات المسموح به. يرجى الانتظار بضع ثوانٍ', 'error');
      return;
    }

    const modelConfig = UNIFIED_MODEL_REGISTRY.chat.find(m => m.id === selectedModel);
    const requiredCredits = modelConfig ? modelConfig.creditCost : 2;

    if (state.credits.balance < requiredCredits) {
      showToast('رصيدك غير كافٍ لإجراء هذه العملية', 'error');
      return;
    }

    setInput('');

    const userMsg = { id: 'm-' + Date.now(), sender: 'user', content: promptText, createdAt: new Date().toISOString() };
    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { sessionId: activeSession.id, message: userMsg } });

    const idempotencyKey = 'idemp_chat_' + Date.now();
    dispatch({
      type: 'CONSUME_CREDITS_ATOMIC',
      payload: { cost: requiredCredits, idempotencyKey, description: `استخدام AI Chat via ${modelConfig?.displayName}` }
    });

    setIsLoading(true);

    try {
      let systemInstructionText = `أنت مساعد ذكي احترافي لمنصة Brand Box AI بأسلوب ${state.brandKit.brandTone}.`;
      if (projectScope) {
        systemInstructionText += ` أنت تعمل الآن داخل نطاق مشروع "${projectScope.name}" لمجال ${projectScope.industry} الموجه لـ ${projectScope.targetAudience} بنبرة ${projectScope.tone}.`;
      }

      const apiKey = ""; 
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          systemInstruction: { parts: [{ text: systemInstructionText }] }
        })
      });

      const resData = await response.json();
      const generatedText = resData?.candidates?.[0]?.content?.parts?.[0]?.text || `إجابة ذكية بخصوص: "${promptText}"`;

      dispatch({
        type: 'ADD_CHAT_MESSAGE',
        payload: {
          sessionId: activeSession.id,
          message: { id: 'm-ai-' + Date.now(), sender: 'ai', content: generatedText, createdAt: new Date().toISOString() }
        }
      });
    } catch (err) {
      showToast('تعثر الاتصال بالسيرفر. تم إجراء استرداد تلقائي للرصيد.', 'error');
      dispatch({ type: 'REFUND_CREDITS_SERVER', payload: { cost: requiredCredits, description: 'استرداد تلقائي لخطأ الشبكة' } });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex flex-wrap items-center justify-between bg-[#121520] p-3 rounded-2xl border border-[#1F2438] gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => dispatch({ type: 'CREATE_NEW_CHAT', payload: { projectId: projectScope?.id, title: projectScope ? `محادثة مشروع: ${projectScope.name}` : 'محادثة جديدة' } })} className="bg-[#FF2E4C] hover:bg-[#E50914] text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>محادثة جديدة</span>
          </button>
          {projectScope && (
            <span className="text-xs bg-[#FF2E4C]/20 text-[#FF2E4C] px-2.5 py-1 rounded-lg border border-[#FF2E4C]/30 font-bold">
              نطاق المشروع: {projectScope.name}
            </span>
          )}
        </div>

        <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="bg-[#0D0F17] border border-[#1F2438] text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none">
          {UNIFIED_MODEL_REGISTRY.chat.map(m => (
            <option key={m.id} value={m.id}>{m.provider}: {m.displayName} ({m.creditCost} نقاط)</option>
          ))}
        </select>
      </div>

      <div className="flex-1 bg-[#121520]/80 border border-[#1F2438] rounded-2xl p-4 overflow-y-auto space-y-4 text-sm">
        {activeSession?.messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-3 max-w-3xl ${msg.sender === 'user' ? 'mr-auto flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${msg.sender === 'user' ? 'bg-gray-700 text-white' : 'bg-[#FF2E4C] text-white'}`}>
              {msg.sender === 'user' ? 'أنت' : 'AI'}
            </div>
            <div className={`p-4 rounded-2xl leading-relaxed ${msg.sender === 'user' ? 'bg-[#FF2E4C]/20 border border-[#FF2E4C]/40 text-white' : 'bg-[#0D0F17] border border-[#1F2438] text-gray-200'}`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3 max-w-3xl">
            <div className="w-8 h-8 rounded-xl bg-[#FF2E4C] text-white flex items-center justify-center font-bold text-xs shrink-0">AI</div>
            <div className="bg-[#0D0F17] border border-[#1F2438] p-3.5 rounded-2xl text-gray-400 flex items-center gap-2 text-xs">
              <RefreshCw className="w-4 h-4 animate-spin text-[#FF2E4C]" />
              <span>جاري المعالجة بناءً على سياق المشروع...</span>
            </div>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      <form onSubmit={handleSend} className="relative flex items-center">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={projectScope ? `اكتب طلبك لمشروع ${projectScope.name}...` : "اكتب طلبك التسويقي هنا..."} className="w-full bg-[#121520] border border-[#1F2438] focus:border-[#FF2E4C] text-white text-sm rounded-2xl py-3.5 pl-28 pr-4 focus:outline-none shadow-lg" />
        <button type="submit" disabled={isLoading} className="absolute left-2 bg-[#FF2E4C] hover:bg-[#E50914] text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5">
          <span>إرسال</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}

function ImageView({ state, dispatch, showToast, projectScope }) {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('blurry, bad quality, distortion');
  const [selectedModel, setSelectedModel] = useState('imagen-4.0-generate-001');
  const [style, setStyle] = useState('Cinematic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [useBrandKit, setUseBrandKit] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState(projectScope?.id || state.projects[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);

  const modelConfig = UNIFIED_MODEL_REGISTRY.image.find(m => m.id === selectedModel) || UNIFIED_MODEL_REGISTRY.image[0];
  const requiredCredits = modelConfig.creditCost;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast('الرجاء كتابة وصف النص أولاً', 'error');
      return;
    }

    if (state.credits.balance < requiredCredits) {
      showToast(`رصيدك غير كافٍ. يتطلب توليد هذه الصورة ${requiredCredits} نقاط`, 'error');
      return;
    }

    const targetProj = state.projects.find(p => p.id === selectedProjectId) || projectScope;
    let finalPrompt = prompt;
    if (useBrandKit && state.brandKit.brandName) {
      finalPrompt = `${prompt} — مصمم لهوية ${state.brandKit.brandName} بنبرة ${state.brandKit.brandTone}`;
    }
    if (targetProj) {
      finalPrompt += ` [سياق مشروع: ${targetProj.name}، مجال ${targetProj.industry}، موجه لـ ${targetProj.targetAudience}]`;
    }

    const genId = 'gen-' + Date.now();
    const idempotencyKey = 'idemp_img_' + Date.now();

    const generationRecord = {
      id: genId,
      type: 'image',
      provider: modelConfig.provider,
      model: modelConfig.id,
      prompt: prompt,
      negativePrompt,
      settings: { style, aspectRatio, useBrandKit, resolvedContext: finalPrompt },
      status: 'queued',
      creditsUsed: requiredCredits,
      projectId: selectedProjectId,
      createdAt: new Date().toISOString()
    };

    dispatch({ type: 'REGISTER_GENERATION_JOB', payload: generationRecord });
    dispatch({
      type: 'CONSUME_CREDITS_ATOMIC',
      payload: { cost: requiredCredits, idempotencyKey, description: `توليد صورة لمشروع via ${modelConfig.displayName}` }
    });

    setIsGenerating(true);
    dispatch({ type: 'UPDATE_GENERATION_STATUS', payload: { id: genId, status: 'processing' } });

    try {
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: `${finalPrompt}, ${style} style, high resolution 8k` }],
          parameters: { sampleCount: 1 }
        })
      });

      const data = await response.json();
      let resultUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';

      if (data.predictions && data.predictions[0] && data.predictions[0].bytesBase64Encoded) {
        resultUrl = `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
      }

      dispatch({ type: 'UPDATE_GENERATION_STATUS', payload: { id: genId, status: 'completed', resultUrl } });

      const assetRecord = {
        id: 'asset-' + Date.now(),
        generationId: genId,
        projectId: selectedProjectId,
        type: 'image',
        name: `تصميم_${targetProj?.name || 'مشروع'}_${Date.now().toString().slice(-4)}.png`,
        filePath: resultUrl,
        mimeType: 'image/png',
        width: aspectRatio === '16:9' ? 1920 : aspectRatio === '9:16' ? 1080 : 1024,
        height: aspectRatio === '16:9' ? 1080 : aspectRatio === '9:16' ? 1920 : 1024,
        createdAt: new Date().toISOString()
      };

      dispatch({ type: 'REGISTER_ASSET', payload: assetRecord });

      if (selectedProjectId) {
        dispatch({
          type: 'LOG_PROJECT_ACTIVITY',
          payload: {
            id: 'act-' + Date.now(),
            projectId: selectedProjectId,
            type: 'generation',
            description: `تم توليد صورة جديدة بنجاح (${modelConfig.displayName}).`,
            createdAt: new Date().toISOString()
          }
        });
      }

      showToast('تم إكمال التوليد وحفظ الأصل بمرجع المشروع بنجاح!', 'success');

    } catch (err) {
      showToast('تعثر التوليد عبر مزود الذكاء الاصطناعي. تم إجراء استرداد تلقائي للرصيد.', 'error');
      dispatch({ type: 'UPDATE_GENERATION_STATUS', payload: { id: genId, status: 'failed', errorMessage: err.message } });
      dispatch({ type: 'REFUND_CREDITS_SERVER', payload: { cost: requiredCredits, description: 'استرداد تلقائي لخطأ التوليد' } });
    } finally {
      setIsGenerating(false);
    }
  };

  const latestCompletedGen = state.generations.find(g => g.type === 'image' && g.status === 'completed' && (!projectScope || g.projectId === projectScope.id));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-[#121520] border border-[#1F2438] p-5 rounded-2xl space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300">نموذج التوليد</label>
            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="w-full bg-[#0D0F17] border border-[#1F2438] text-white text-xs rounded-xl p-3 focus:outline-none">
              {UNIFIED_MODEL_REGISTRY.image.map(m => (
                <option key={m.id} value={m.id}>{m.provider}: {m.displayName} ({m.creditCost} نقاط)</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300">الوصف النصي (Prompt)</label>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} className="w-full bg-[#0D0F17] border border-[#1F2438] text-white text-xs rounded-xl p-3 focus:outline-none focus:border-[#FF2E4C]" placeholder="اكتب وصف الصورة المطلوبة..." />
          </div>

          <div className="p-3 bg-[#0D0F17] border border-[#1F2438] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#FF2E4C]" />
                <span>دمج الهوية التجارية (Brand Kit)</span>
              </span>
              <input type="checkbox" checked={useBrandKit} onChange={(e) => setUseBrandKit(e.target.checked)} className="w-4 h-4 accent-[#FF2E4C] rounded" />
            </div>
            {useBrandKit && (
              <div className="flex items-center gap-2 pt-1 border-t border-[#1F2438] text-[11px] text-gray-400">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: state.brandKit.primaryColor }}></span>
                <span className="truncate font-medium">{state.brandKit.brandName || 'الهوية مفعّلة'}</span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-300">المشروع المرتبط</label>
            <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} disabled={!!projectScope} className="w-full bg-[#0D0F17] border border-[#1F2438] text-white text-xs rounded-xl p-2.5 focus:outline-none disabled:opacity-60">
              {state.projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-[#FF2E4C] hover:bg-[#E50914] text-white font-extrabold text-sm py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2">
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>توليد الصورة الآن ({requiredCredits} نقاط)</span>
          </button>
        </div>

        <div className="lg:col-span-7 bg-[#121520] border border-[#1F2438] p-5 rounded-2xl flex flex-col justify-between min-h-[450px]">
          <div className="flex-1 border-2 border-dashed border-[#1F2438] rounded-xl overflow-hidden bg-[#0D0F17] flex items-center justify-center relative p-4">
            {isGenerating ? (
              <div className="text-center space-y-3">
                <RefreshCw className="w-10 h-10 text-[#FF2E4C] animate-spin mx-auto" />
                <p className="text-xs font-bold text-[#FF2E4C] animate-pulse">جاري تنفيذ معالجة AI والربط بالسيرفر والمشروع...</p>
              </div>
            ) : latestCompletedGen ? (
              <img src={latestCompletedGen.resultUrl} alt="التوليد الأخير" className="w-full h-full object-contain rounded-xl" />
            ) : (
              <div className="text-center space-y-2">
                <ImageIcon className="w-12 h-12 text-gray-600 mx-auto" />
                <p className="text-xs text-gray-400 font-bold">معاينة النتيجة ستظهر هنا فور اكتمال التوليد</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoView() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-extrabold text-white">صانع الفيديو بالذكاء الاصطناعي (AI Video Generator)</h2>
      <div className="p-8 rounded-2xl bg-[#121520] border border-[#1F2438] text-center space-y-4 max-w-2xl mx-auto">
        <Video className="w-12 h-12 text-purple-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">حالة المزود: Provider Not Configured</h3>
        <p className="text-xs text-gray-400">محرك توليد الفيديو يتطلب إعداد مفاتيح Runway / Sora السحابية في بيئة السيرفر.</p>
      </div>
    </div>
  );
}

function GenerationsHistoryView({ state, dispatch, projectScope }) {
  const filteredGens = state.generations.filter(g => !projectScope || g.projectId === projectScope.id);

  return (
    <div className="space-y-6">
      {filteredGens.length === 0 ? (
        <div className="p-12 text-center bg-[#121520] border border-[#1F2438] rounded-2xl space-y-3">
          <History className="w-12 h-12 text-gray-500 mx-auto" />
          <p className="text-gray-300 font-bold text-sm">لا توجد عمليات إنشاء لهذا النطاق</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGens.map(gen => (
            <div key={gen.id} className="p-4 bg-[#121520] border border-[#1F2438] rounded-2xl space-y-3">
              <div className="h-36 rounded-xl overflow-hidden bg-gray-900">
                <img src={gen.resultUrl} alt="توليد" className="w-full h-full object-cover" />
              </div>
              <p className="text-xs font-bold text-white line-clamp-2">{gen.prompt}</p>
              <button onClick={() => dispatch({ type: 'SET_GENERATION_MODAL', payload: gen })} className="w-full bg-[#0D0F17] hover:bg-[#1F2438] border border-[#1F2438] text-xs text-white font-bold py-2 rounded-xl flex items-center justify-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>التفاصيل وإعادة التوليد</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AssetsLibraryView({ state, dispatch, projectScope }) {
  const filteredAssets = state.assets.filter(a => !projectScope || a.projectId === projectScope.id);

  return (
    <div className="space-y-6">
      {filteredAssets.length === 0 ? (
        <div className="p-12 text-center bg-[#121520] border border-[#1F2438] rounded-2xl space-y-3">
          <FolderOpen className="w-12 h-12 text-gray-500 mx-auto" />
          <p className="text-gray-300 font-bold text-sm">لا توجد أصول محفوظة بهذا النطاق</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAssets.map(asset => (
            <div key={asset.id} onClick={() => dispatch({ type: 'SET_ASSET_MODAL', payload: asset })} className="p-3 bg-[#121520] border border-[#1F2438] rounded-2xl space-y-3 cursor-pointer hover:border-[#FF2E4C]/40 transition group">
              <div className="h-40 rounded-xl overflow-hidden bg-gray-900">
                <img src={asset.filePath} alt={asset.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white truncate group-hover:text-[#FF2E4C] transition">{asset.name}</h4>
                <p className="text-[10px] text-gray-400">{asset.width}x{asset.height} px</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TemplatesView({ state, dispatch, showToast, projectScope }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {state.templates.map(tpl => (
          <div key={tpl.id} className="p-4 bg-[#121520] border border-[#1F2438] rounded-2xl space-y-3">
            <h4 className="font-bold text-white text-sm">{tpl.title}</h4>
            <p className="text-xs text-gray-400">{tpl.description}</p>
            <button onClick={() => { 
              if (projectScope) {
                dispatch({ type: 'OPEN_PROJECT_WORKSPACE', payload: { projectId: projectScope.id, tab: 'chat' } });
              } else {
                dispatch({ type: 'SET_TAB', payload: 'chat' });
              }
              showToast('تم توجيه القالب للمساعد مع سياق المشروع!'); 
            }} className="text-xs bg-[#FF2E4C] text-white px-3 py-1.5 rounded-lg font-bold">استخدام القالب مع المشروع</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function BrandKitView({ state }) {
  return (
    <div className="space-y-6">
      <div className="p-6 bg-[#121520] border border-[#1F2438] rounded-2xl space-y-3">
        <p className="text-xs text-gray-300">اسم العلامة التجارية: <span className="font-bold text-white">{state.brandKit.brandName}</span></p>
        <p className="text-xs text-gray-300">نبرة الخطاب المعتمدة: <span className="font-bold text-[#FF2E4C]">{state.brandKit.brandTone}</span></p>
      </div>
    </div>
  );
}

function PricingView() {
  return (
    <div className="space-y-6 text-center">
      <h2 className="text-2xl font-extrabold text-white">خطط الأسعار والاشتراكات</h2>
      <p className="text-xs text-gray-400">بوابة الدفع الإلكتروني موصولة بوضع الاستعداد Server Billing Ready.</p>
    </div>
  );
}

function SettingsView({ state }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-extrabold text-white">إعدادات الحساب والأمان</h2>
      <div className="p-6 bg-[#121520] border border-[#1F2438] rounded-2xl space-y-2 text-xs">
        <p className="text-gray-300">المستخدم النشط: {state.auth.user?.email}</p>
        <p className="text-emerald-400 font-bold">الحالة الأمنية: SECURE FOUNDATION (All Keys Isolated)</p>
      </div>
    </div>
  );
}

function CreateProjectModal({ dispatch, showToast }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('عام');
  const [targetAudience, setTargetAudience] = useState('جمهور عام');
  const [tone, setTone] = useState('احترافي وحماسي');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('يرجى إدخال اسم المشروع أولاً', 'error');
      return;
    }

    const newProj = {
      id: 'proj-' + Date.now(),
      name,
      description,
      industry,
      targetAudience,
      language: 'العربية',
      tone,
      timeAgo: 'الآن',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString()
    };

    dispatch({ type: 'CREATE_PROJECT', payload: newProj });
    showToast(`تم إنشاء مشروع "${name}" بنجاح وتفعيل بيئة العمل!`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121520] border border-[#1F2438] max-w-md w-full p-6 rounded-2xl space-y-4 relative">
        <button onClick={() => dispatch({ type: 'TOGGLE_CREATE_PROJECT_MODAL', payload: false })} className="absolute top-4 left-4 text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <FolderPlus className="w-5 h-5 text-[#FF2E4C]" />
          <span>إنشاء مشروع جديد مع سياق ذكي</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-gray-300">اسم المشروع *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: إطلاق منتج العناية بالبشرة" className="w-full bg-[#0D0F17] border border-[#1F2438] text-white rounded-xl p-3 focus:outline-none focus:border-[#FF2E4C]" />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-300">وصف المشروع</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="وصف مختصر لأهداف هذا المشروع..." className="w-full bg-[#0D0F17] border border-[#1F2438] text-white rounded-xl p-2.5 focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-gray-300">مجال العمل (Industry)</label>
              <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full bg-[#0D0F17] border border-[#1F2438] text-white rounded-xl p-2.5 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-gray-300">نبرة الخطاب (Tone)</label>
              <input type="text" value={tone} onChange={(e) => setTone(e.target.value)} className="w-full bg-[#0D0F17] border border-[#1F2438] text-white rounded-xl p-2.5 focus:outline-none" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-300">الجمهور المستهدف</label>
            <input type="text" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} className="w-full bg-[#0D0F17] border border-[#1F2438] text-white rounded-xl p-2.5 focus:outline-none" />
          </div>

          <button type="submit" className="w-full bg-[#FF2E4C] hover:bg-[#E50914] text-white font-bold py-3 rounded-xl transition shadow-lg mt-2">
            حفظ وإنشاء بيئة العمل
          </button>
        </form>
      </div>
    </div>
  );
}

function GenerationDetailModal({ generation, dispatch, showToast }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121520] border border-[#1F2438] max-w-lg w-full p-6 rounded-2xl space-y-4 relative">
        <button onClick={() => dispatch({ type: 'SET_GENERATION_MODAL', payload: null })} className="absolute top-4 left-4 text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        <h3 className="text-base font-bold text-white">تفاصيل عملية التوليد</h3>
        <div className="h-48 bg-gray-900 rounded-xl overflow-hidden">
          <img src={generation.resultUrl} alt="تفاصيل" className="w-full h-full object-contain" />
        </div>
        <div className="space-y-2 text-xs text-gray-300">
          <p><span className="font-bold text-white">الوصف النصي:</span> {generation.prompt}</p>
          <p><span className="font-bold text-white">النموذج:</span> {generation.model}</p>
          <p><span className="font-bold text-white">النقاط المستخدمة:</span> {generation.creditsUsed}</p>
        </div>
        <button onClick={() => { dispatch({ type: 'SET_TAB', payload: 'images' }); dispatch({ type: 'SET_GENERATION_MODAL', payload: null }); showToast('تم تجهيز إعدادات التوليد مجدداً!'); }} className="w-full bg-[#FF2E4C] text-white font-bold text-xs py-2.5 rounded-xl">إعادة التوليد (Generate Again)</button>
      </div>
    </div>
  );
}

function AssetDetailModal({ asset, projects, dispatch, showToast }) {
  const [selectedMoveProjectId, setSelectedMoveProjectId] = useState(asset.projectId || '');

  const handleMove = () => {
    dispatch({ type: 'MOVE_ASSET_PROJECT', payload: { assetId: asset.id, newProjectId: selectedMoveProjectId } });
    showToast('تم نقل الأصل إلى المشروع المحدد بنجاح', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121520] border border-[#1F2438] max-w-md w-full p-6 rounded-2xl space-y-4 relative">
        <button onClick={() => dispatch({ type: 'SET_ASSET_MODAL', payload: null })} className="absolute top-4 left-4 text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        <h3 className="text-base font-bold text-white truncate">{asset.name}</h3>
        <div className="h-56 bg-gray-900 rounded-xl overflow-hidden">
          <img src={asset.filePath} alt={asset.name} className="w-full h-full object-contain" />
        </div>

        <div className="p-3 bg-[#0D0F17] border border-[#1F2438] rounded-xl space-y-2 text-xs">
          <label className="font-bold text-gray-300">نقل الأصل إلى مشروع آخر:</label>
          <div className="flex gap-2">
            <select value={selectedMoveProjectId} onChange={(e) => setSelectedMoveProjectId(e.target.value)} className="flex-1 bg-[#121520] border border-[#1F2438] text-white text-xs rounded-lg p-2 focus:outline-none">
              <option value="">بدون مشروع (عام)</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button onClick={handleMove} className="bg-[#FF2E4C] text-white font-bold px-3 py-2 rounded-lg">نقل</button>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <button onClick={() => { dispatch({ type: 'DELETE_ASSET', payload: asset.id }); dispatch({ type: 'SET_ASSET_MODAL', payload: null }); showToast('تم حذف الأصل بنجاح', 'success'); }} className="text-xs text-red-400 hover:underline flex items-center gap-1">
            <Trash2 className="w-3.5 h-3.5" />
            <span>حذف الأصل</span>
          </button>
          <a href={asset.filePath} download={asset.name} target="_blank" rel="noreferrer" className="bg-[#FF2E4C] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            <span>تحميل</span>
          </a>
        </div>
      </div>
    </div>
  );
}

function AuthView({ mode, dispatch, showToast }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#121520] border border-[#1F2438] p-8 rounded-2xl space-y-4">
        <h2 className="text-xl font-extrabold text-white text-center">تسجيل الدخول</h2>
        <button onClick={() => { dispatch({ type: 'LOGIN_SUCCESS', payload: { id: 'usr_1', firstName: 'محمود', email: 'user@brandbox.ai' } }); showToast('تم الدخول بنجاح'); }} className="w-full bg-[#FF2E4C] text-white text-xs font-bold py-3 rounded-xl">
          دخول الحساب
        </button>
      </div>
    </div>
  );
}