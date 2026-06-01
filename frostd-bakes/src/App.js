import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import AdminPage from './AdminPage';
import OurStory from './OurStory';
import RefundPolicy from './RefundPolicy';
import Menu from './Menu';          
import data from './siteData.json';
import { auth, googleProvider, db } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, arrayUnion, collection, onSnapshot } from 'firebase/firestore';

// ─── PAGE CONSTANTS ────────────────────────────────────────────
const PAGES = { HOME: 'home', MENU: 'menu', STORY: 'our-story', ADMIN: 'admin', REFUND: 'refund' };

// ══════════════════════════════════════════════
//  PAGE: HOME (UPGRADED & BULLETPROOF VERSION)
// ══════════════════════════════════════════════
const HomePage = ({ 
  navigate = () => {}, 
  logoUrl = "", 
  windowWidth = 1000, 
  setSelectedCake = () => {}, 
  displayGallery = [], 
  currentIndex = 3, 
  isTransitioning = false, 
  slide = () => {}, 
  handleTransitionEnd = () => {}, 
  SharedFooter 
}) => {
  // Local state for the interactive sections
  const [activeWhy, setActiveWhy] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  // Expanded Data for "Why Frost'd"
  const whyData = [
    { 
      icon: '🎂', title: 'Fully Custom', short: 'Tailored to your exact vision', 
      desc: 'We don’t believe in one-size-fits-all. From the exact shade of frosting to the specific flavor profiles of the sponges and fillings, every single element is designed around your celebration. We consult with you to ensure your dream cake becomes reality.',
    },
    { 
      icon: '🌿', title: 'Premium Ingredients', short: 'No shortcuts, just quality', 
      desc: 'Our secret ingredient is actually just using the best real ingredients. We strictly use pure Belgian chocolate, organic seasonal fruits, and farm-fresh dairy. Absolutely no artificial preservatives or synthetic flavor enhancers make it into our kitchen.',
    },
    { 
      icon: '❄️', title: "Frost'd Finish", short: 'Our signature smooth texture', 
      desc: 'A cake should look as flawless as it tastes. Our signature temperature-controlled frosting technique creates sharp edges and a silky-smooth finish that serves as the perfect canvas for your personalized themes and decorations.',
    },
    { 
      icon: '📦', title: 'Safe Delivery', short: 'Chilled transit to your door', 
      desc: 'Moving a custom cake is stressful, so we handle it for you. Every order is meticulously packed in custom climate-controlled boxes to ensure it arrives at your venue in Peroorkada perfectly intact and ready for the spotlight.',
    }
  ];

  // Expanded Data for "How to Order"
  const stepData = [
    { 
      num: '01', icon: '📖', title: 'Curate Your Tray', 
      desc: 'Explore our full interactive menu. Mix and match cake sizes, brownie boxes, and premium puddings. Read up on our allergen details and flavor notes to build the perfect tray for your event.' 
    },
    { 
      num: '02', icon: '🛒', title: 'Review & Customize', 
      desc: 'Open your tray to review your selections. Here, you can adjust quantities or remove items. Once you are happy with the grand total, hit the checkout button to initialize your custom order ticket.' 
    },
    { 
      num: '03', icon: '💬', title: 'Confirm via WhatsApp', 
      desc: 'With one tap, your entire order summary is instantly formatted and sent to our WhatsApp. We will reply swiftly to confirm delivery dates, discuss any custom theme requests, and share secure payment details.' 
    }
  ];

  return (
    <div className="page-home-snapper">
      
      {/* 1. HERO SECTION */}
      <section className={`snap-section hero-banner${data.heroImage ? ' has-bg-image' : ''}`}>
        {data.heroImage && <img src={data.heroImage} alt="" className="hero-bg-image" />}
        {data.heroImage && <div className="hero-bg-overlay" />}
        <div className="hero-content">
          <p className="hero-eyebrow">Handcrafted in Trivandrum</p>
          <h1 className="hero-title">Baked with love,<br/>frost'd to perfection.</h1>
          <p className="hero-sub">Custom cakes, brownies &amp; puddings — made fresh for every occasion.</p>
          <div className="hero-cta-row">
            <button className="hero-cta" onClick={() => navigate(PAGES.MENU)}>Explore Our Menu</button>
            <a href={data.socials.whatsapp} target="_blank" rel="noreferrer" className="hero-cta hero-cta-secondary">Order on WhatsApp</a>
          </div>
        </div>
        <div className="hero-bg-frost">❄</div>
      </section>

      {/* 2. WHY FROST'D - INTERACTIVE SPLIT SHOWCASE */}
      <section className="snap-section home-why-section">
        <div className="home-section-inner interactive-split-layout">
          <div className="split-left">
            <p className="home-section-eyebrow">The Details</p>
            <h2 className="home-section-title">Why choose <em>Frost'd?</em></h2>
            <div className="why-tabs-container">
              {whyData.map((item, index) => (
                <button 
                  key={index} 
                  className={`why-tab-btn ${activeWhy === index ? 'active' : ''}`}
                  onClick={() => setActiveWhy(index)}
                >
                  <span className="why-tab-icon">{item.icon}</span>
                  <div className="why-tab-text">
                    <h4>{item.title}</h4>
                    <p>{item.short}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="split-right">
            <div className="why-dynamic-display">
              <div className="why-display-bg" style={{ backgroundImage: `url(${logoUrl})` }}></div>
              <div className="why-display-content">
                <span className="display-huge-icon">{whyData[activeWhy].icon}</span>
                <h3>{whyData[activeWhy].title}</h3>
                <p>{whyData[activeWhy].desc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FAN FAVOURITES / GALLERY SECTION */}
      <section className="snap-section gallery-section home-popular-section">
        <div className="home-section-inner" style={{ maxWidth: '100%' }}>
          <p className="home-section-eyebrow">Fan Favourites</p>
          <h2 className="home-section-title">⭐ Most Loved Picks</h2>
          <div className="slider-outer-wrapper">
            <button className="gallery-nav-btn left" onClick={() => slide('left')}><span className="arrow"></span></button>
            <div className="slider-view-window">
              <div className="slider-track" onTransitionEnd={handleTransitionEnd}
                style={{ transform: `translateX(-${currentIndex * (windowWidth <= 900 ? 100 : 33.3333)}%)`, transition: isTransitioning ? 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)' : 'none' }}>
                {displayGallery.map((item, idx) => (
                  <div key={`${item?.id || idx}-${idx}`} className="slider-item">
                    <div className="gallery-img-wrapper" onClick={() => setSelectedCake(item)} style={{ cursor: 'pointer', position: 'relative' }}>
                      <img src={item?.image || logoUrl} alt={item?.name || 'Cake'} onError={(e) => e.target.src = logoUrl} />
                      <div className="cake-hover-overlay" style={{ opacity: 1, pointerEvents: 'auto', background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)', top: 'auto', bottom: 0, padding: '20px 10px' }}>
                        <h3 className="hover-cake-name" style={{ margin: 0 }}>{item?.name || ''}</h3>
                        <p className="hover-price" style={{ margin: 0 }}>₹{item?.basePrice || ''}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button className="gallery-nav-btn right" onClick={() => slide('right')}><span className="arrow"></span></button>
          </div>
          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <button className="hero-cta" onClick={() => navigate(PAGES.MENU)}>View Full Menu →</button>
          </div>
        </div>
      </section>

      {/* 4. SIMPLE AS 1-2-3 - ANIMATED STEPPER */}
      <section className="snap-section home-howitworks-section">
        <div className="home-section-inner interactive-stepper-layout">
          <div className="stepper-header">
            <p className="home-section-eyebrow">The Process</p>
            <h2 className="home-section-title">Simple as <em>1-2-3</em></h2>
          </div>

          <div className="stepper-interactive-box">
            <div className="stepper-nav-bar">
              <div className="stepper-progress-bg">
                <div className="stepper-progress-fill" style={{ width: `${(activeStep / (stepData.length - 1)) * 100}%` }}></div>
              </div>
              <div className="stepper-dots">
                {stepData.map((step, idx) => (
                  <button 
                    key={idx} 
                    className={`stepper-dot-btn ${activeStep === idx ? 'active' : ''} ${idx < activeStep ? 'completed' : ''}`}
                    onClick={() => setActiveStep(idx)}
                  >
                    <span className="dot-number">{step.num}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="stepper-content-window">
              <div className="stepper-visual-icon">{stepData[activeStep].icon}</div>
              <div className="stepper-text-content">
                <h3>{stepData[activeStep].title}</h3>
                <p>{stepData[activeStep].desc}</p>
                <div className="stepper-actions">
                  {activeStep < 2 ? (
                    <button className="stepper-next-btn" onClick={() => setActiveStep(activeStep + 1)}>Next Step →</button>
                  ) : (
                    <button className="stepper-finish-btn" onClick={() => navigate(PAGES.MENU)}>Start Order Now</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <div className="snap-section footer-snap">
        {SharedFooter && <SharedFooter />}
      </div>
    </div>
  );
};

function App() {
  // --- ROUTING ---
  const [currentPage, setCurrentPage] = useState(PAGES.HOME);

  // --- AUTH & USER STATE ---
  const [user, setUser] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [guestPhone, setGuestPhone] = useState("");
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- UI STATE ---
  const [alertConfig, setAlertConfig] = useState({ isVisible: false, title: "", message: "", type: "info", onConfirm: null });
  const [isCartWiggling, setIsCartWiggling] = useState(false);
  const [toast, setToast] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // --- SHOPPING STATE ---
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImg, setSelectedImg] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [selectedCake, setSelectedCake] = useState(null);
  const [refillDismissed, setRefillDismissed] = useState(false);
  const [liveMenuData, setLiveMenuData] = useState(null);

  // --- MENU & GALLERY STATE ---
  const activeCakes = liveMenuData ?? (data.cakes || []);
  const popularCakes = activeCakes.filter(c => c.popular);
  // Use popular cakes for the gallery, fallback to data.gallery if empty
  const originalGallery = popularCakes.length > 0 ? popularCakes : (data.gallery || []);
  const displayGallery = [...originalGallery.slice(-3), ...originalGallery, ...originalGallery.slice(0, 3)];
  const [currentIndex, setCurrentIndex] = useState(3);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const logoUrl = "/images/logo.jpg";
  const totalItems = cart.reduce((a, b) => a + b.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const lastScrollRef = useRef(0);
  const navRef = useRef(null);
  const [navHeight, setNavHeight] = useState(116);

  useEffect(() => {
    const updateNavHeight = () => {
      if (navRef.current) {
        setNavHeight(navRef.current.offsetHeight);
      }
    };
    updateNavHeight();
    window.addEventListener('resize', updateNavHeight);
    return () => window.removeEventListener('resize', updateNavHeight);
  }, []);

  // navigate helper — always scrolls to top
  const navigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0 });
    if (page !== PAGES.MENU) {
      setSearchTerm('');
      setDebouncedSearch('');
      setSelectedCategory('All');
    }
  };

  // --- LIVE MENU ---
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'menu'),
      (snapshot) => {
        if (!snapshot.empty) setLiveMenuData(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      },
      (e) => console.warn('Live menu listener error, using static data.', e)
    );
    return () => unsubscribe();
  }, []);

  // --- PERSISTENT GUEST SESSION ---
  useEffect(() => {
    const savedGuest = localStorage.getItem('frost_guest');
    if (savedGuest) { setGuestPhone(savedGuest); setIsGuestMode(true); }
    setTimeout(() => setIsLoading(false), 600);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- AUTH ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsGuestMode(false);
        localStorage.removeItem('frost_guest');
        const docSnap = await getDoc(doc(db, "users", currentUser.uid));
        if (docSnap.exists()) setOrderHistory(docSnap.data().orders || []);
      } else { setOrderHistory([]); }
    });
    return () => unsubscribe();
  }, []);

  // --- SCROLL BEHAVIOUR ---
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const prev = lastScrollRef.current;
      lastScrollRef.current = y;
      setShowScrollTop(y > 400);
      if (y > prev + 8 && y > 150) setIsNavVisible(false);
      else if (y < prev - 8 || y <= 150) setIsNavVisible(true);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- DEBOUNCED SEARCH ---
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // --- KEYBOARD / OUTSIDE CLICK ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (alertConfig.isVisible) setAlertConfig(a => ({ ...a, isVisible: false }));
      else if (selectedCake) setSelectedCake(null);
      else if (selectedImg) setSelectedImg(null);
      else if (isCartOpen) setIsCartOpen(false);
      else if (isLoginModalOpen) setIsLoginModalOpen(false);
      else if (isProfileMenuOpen) setIsProfileMenuOpen(false);
    };
    const handleOutsideClick = (e) => {
      if (isProfileMenuOpen && !e.target.closest('.profile-menu-wrapper')) setIsProfileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleOutsideClick);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('mousedown', handleOutsideClick); };
  }, [alertConfig, selectedCake, selectedImg, isCartOpen, isLoginModalOpen, isProfileMenuOpen]);

  // --- GALLERY ---
  const slide = (direction) => {
    if (!isTransitioning) return;
    direction === 'left' ? setCurrentIndex(p => p - 1) : setCurrentIndex(p => p + 1);
  };
  const handleTransitionEnd = () => {
    if (currentIndex >= originalGallery.length + 3) { setIsTransitioning(false); setCurrentIndex(3); }
    else if (currentIndex <= 0) { setIsTransitioning(false); setCurrentIndex(originalGallery.length); }
  };
  useEffect(() => {
    if (!isTransitioning) { const t = setTimeout(() => setIsTransitioning(true), 50); return () => clearTimeout(t); }
  }, [isTransitioning]);

  // --- UTILS ---
  const triggerAlert = (title, message, type = "info") => setAlertConfig({ isVisible: true, title, message, type, onConfirm: null });
  const validateIndianPhone = (phone) => /^[6-9]\d{9}$/.test(phone);
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
    setIsCartWiggling(true);
    setTimeout(() => setIsCartWiggling(false), 600);
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setIsLoginModalOpen(false);
      triggerAlert("Welcome!", "You're now a member of the Frost'd Club. ❄️", "success");
    } catch (err) {
      const ignored = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/internal-error'];
      if (ignored.some(c => err.code === c || err.message?.includes('INTERNAL ASSERTION'))) return;
      triggerAlert("Login Failed", "Could not connect to Google.", "error");
    }
  };
  const handleGuestLogin = () => {
    if (validateIndianPhone(guestPhone)) {
      localStorage.setItem('frost_guest', guestPhone);
      setIsGuestMode(true);
      setIsLoginModalOpen(false);
      triggerAlert("Guest Mode Active", `Welcome! Ordering as ${guestPhone}.`, "success");
    } else {
      triggerAlert("Invalid Number", "Please enter a valid 10-digit Indian phone number.", "error");
    }
  };
  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    setAlertConfig({
      isVisible: true, title: "Logging out?",
      message: "You'll need to sign in again to view your order history.",
      type: "warning",
      onConfirm: () => {
        signOut(auth);
        localStorage.removeItem('frost_guest');
        setIsGuestMode(false); setGuestPhone("");
        setAlertConfig({ isVisible: false, title: "", message: "", type: "info", onConfirm: null });
        setTimeout(() => triggerAlert("Logged Out", "Hope to see you again soon! ❄️", "info"), 200);
      }
    });
  };
  const handleSwitchAccount = () => {
    setIsProfileMenuOpen(false);
    setAlertConfig({
      isVisible: true, title: "Switch Account?",
      message: "You'll be signed out of your current session so you can log in with a different account.",
      type: "warning",
      onConfirm: () => {
        signOut(auth);
        localStorage.removeItem('frost_guest');
        setIsGuestMode(false); setGuestPhone("");
        setAlertConfig({ isVisible: false, title: "", message: "", type: "info", onConfirm: null });
        setTimeout(() => setIsLoginModalOpen(true), 300);
      }
    });
  };

  const addToCart = (product, weightLabel, finalPrice) => {
    const uniqueId = `${product.id}-${weightLabel}`;
    setCart(prev => {
      const existing = prev.find(i => i.id === uniqueId);
      if (existing) return prev.map(i => i.id === uniqueId ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, id: uniqueId, name: `${product.name} (${weightLabel})`, weightLabel, price: finalPrice, quantity: 1 }];
    });
    showToast(`${product.name} added! ❄️`);
  };
  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: i.quantity + delta } : i).filter(i => i.quantity > 0));
  };
  const handleRequestOrder = () => {
    if (!user && !isGuestMode) { setIsLoginModalOpen(true); return; }
    const itemList = cart.map(i => `• ${i.name} x ${i.quantity} = ₹${i.price * i.quantity}`).join('\n');
    const customer = user ? `Member: ${user.displayName}` : `Guest: ${guestPhone}`;
    const cleanPhone = data.contact.phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Hi Preetha! ❄️ I'd like to place an order:\n\n${itemList}\n\n` +
      `━━━━━━━━━━━━━━\nTotal Amount: ₹${totalPrice}\nCustomer: ${customer}\n━━━━━━━━━━━━━━\n\n` +
      `Please confirm the order and share payment details.`
    );
    if (user) setDoc(doc(db, "users", user.uid), { orders: arrayUnion(...cart) }, { merge: true });
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  // AFTER — removes 'Best Sellers' from the dynamic list to avoid duplication,
  // and adds item counts per category for the category bar
  const rawCategories = [...new Set(activeCakes.map(c => c.category))].filter(c => c !== 'Best Sellers');
  const allCategories = ['All', 'Best Sellers', ...rawCategories];

  // Category counts — used in Menu.js for badges
  const categoryCounts = allCategories.reduce((acc, cat) => {
    if (cat === 'All') acc[cat] = activeCakes.length;
    else if (cat === 'Best Sellers') acc[cat] = activeCakes.filter(c => c.popular === true).length;
    else acc[cat] = activeCakes.filter(c => c.category === cat).length;
    return acc;
  }, {});
  const filteredCakes = activeCakes.filter(cake => {
    const matchesCategory =
      selectedCategory === 'All' ||
      (selectedCategory === 'Best Sellers' ? cake.popular === true : cake.category === selectedCategory);
    return matchesCategory && cake.name.toLowerCase().includes(debouncedSearch.toLowerCase());
  });

  const isAnyModalOpen = selectedImg || isCartOpen || isLoginModalOpen || alertConfig.isVisible || selectedCake;


  // ══════════════════════════════════════════════
  //  SHARED HEADER
  // ══════════════════════════════════════════════
  const SharedHeader = () => (
    <div className={`navigation-system ${isNavVisible ? 'nav-down' : 'nav-up'}`} ref={navRef}>
      <header className="main-header">
        <div className="top-utility-bar">
          <div className="delivery-info-wrapper">
            <span className="delivery-trigger">📍 Trivandrum Delivery ⓘ</span>
            <div className="delivery-tooltip">
              <strong>🕐 Order Time:</strong> 2–3 days advance order<br/>
              <strong>📦 Area:</strong> Peroorkada &amp; nearby<br/>
              <strong>📞 Queries:</strong> {data.contact.phone}
            </div>
          </div>
          <div className="auth-status-container">
            {user ? (
              <div className="profile-menu-wrapper">
                <button className="profile-trigger" onClick={() => setIsProfileMenuOpen(o => !o)}>
                  <img src={user.photoURL || logoUrl} alt={user.displayName} className="profile-avatar" onError={(e) => e.target.src = logoUrl} />
                  <span className="profile-greeting">Hi, {user.displayName.split(' ')[0]}</span>
                  <svg className={`profile-chevron ${isProfileMenuOpen ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {isProfileMenuOpen && (
                  <div className="profile-dropdown">
                    <div className="profile-dropdown-header">
                      <img src={user.photoURL || logoUrl} alt="" className="profile-dropdown-avatar" onError={(e) => e.target.src = logoUrl} />
                      <div><p className="profile-dropdown-name">{user.displayName}</p><p className="profile-dropdown-email">{user.email}</p></div>
                    </div>
                    <div className="profile-dropdown-divider" />
                    <button className="profile-menu-item" onClick={handleSwitchAccount}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
                      Switch Account
                    </button>
                    <button className="profile-menu-item logout-item" onClick={handleLogout}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : isGuestMode ? (
              <div className="profile-menu-wrapper">
                <button className="profile-trigger guest-trigger" onClick={() => setIsProfileMenuOpen(o => !o)}>
                  <div className="profile-avatar-guest">👤</div>
                  <span className="profile-greeting">Hi, Guest</span>
                  <svg className={`profile-chevron ${isProfileMenuOpen ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {isProfileMenuOpen && (
                  <div className="profile-dropdown">
                    <div className="profile-dropdown-header">
                      <div className="profile-dropdown-avatar-guest">👤</div>
                      <div><p className="profile-dropdown-name">Guest User</p><p className="profile-dropdown-email">{guestPhone}</p></div>
                    </div>
                    <div className="profile-dropdown-divider" />
                    <button className="profile-menu-item" onClick={() => { setIsProfileMenuOpen(false); setIsLoginModalOpen(true); }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                      Sign In with Google
                    </button>
                    <button className="profile-menu-item logout-item" onClick={() => { setIsProfileMenuOpen(false); localStorage.removeItem('frost_guest'); setIsGuestMode(false); setGuestPhone(""); showToast("Guest session ended."); }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      End Session
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="login-link-top" onClick={() => setIsLoginModalOpen(true)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Login / Join Club
              </button>
            )}
          </div>
        </div>

        <div className="navbar">
          <div className="navbar-left">
            <img src={logoUrl} alt="Logo" className="site-logo" onClick={() => navigate(PAGES.HOME)} style={{ cursor: 'pointer' }} />
            {currentPage !== PAGES.HOME && (
              <button className="nav-home-btn" onClick={() => navigate(PAGES.HOME)} aria-label="Go to Home">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </button>
            )}
          </div>
          
          <div className="nav-spacer" />
          <div className="navbar-right">
            <a href={data.socials.instagram} target="_blank" rel="noreferrer" className="nav-social-link" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
              </svg>
            </a>
            <div className="nav-divider" />
            <div className={`cart-display ${isCartWiggling ? 'cart-wiggle-animation' : ''}`} onClick={() => setIsCartOpen(true)} aria-label="Open cart">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {cart.length > 0 && <span className="cart-badge">{totalItems}</span>}
            </div>
          </div>
        </div>
      </header>
    </div>
  );


  // ══════════════════════════════════════════════
  //  SHARED FOOTER
  // ══════════════════════════════════════════════
  const SharedFooter = () => (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-col brand-col">
          <img src={logoUrl} alt="Logo" className="footer-logo-img" />
          <p className="footer-about">Artisanal bakes and themed creations, handcrafted in the heart of Trivandrum. Every bite tells a story.</p>
          <div className="footer-social-icons">
            <a href={data.socials.instagram} target="_blank" rel="noreferrer">Instagram</a>
            <a href={data.socials.whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>
          </div>
        </div>
        <div className="footer-col links-col">
          <h4>Quick Links</h4>
          <ul>
            <li><button onClick={() => navigate(PAGES.HOME)}>Home</button></li>
            <li><button onClick={() => navigate(PAGES.MENU)}>Our Menu</button></li>
            <li><button onClick={() => navigate(PAGES.STORY)}>Our Story</button></li>
            <li><button onClick={() => navigate(PAGES.REFUND)}>Refund Policy</button></li>
            <li><button onClick={() => navigate(PAGES.ADMIN)} style={{ color: '#333' }}>Admin</button></li>
          </ul>
        </div>
        <div className="footer-col contact-col">
          <h4>Contact Us</h4>
          <p>📍 {data.contact.address}</p>
          <p>📞 {data.contact.phone}</p>
          <p>✉️ {data.contact.email}</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 Frost'd Bakes. All rights reserved.</p>
      </div>
    </footer>
  );

  // ══════════════════════════════════════════════
  //  PAGE: HOME (UPGRADED INTERACTIVE VERSION)
  // ══════════════════════════════════════════════
  

  // ══════════════════════════════════════════════
  //  PAGE: OUR STORY
  // ══════════════════════════════════════════════
  const OurStoryPage = () => <OurStory onClose={() => navigate(PAGES.HOME)} />;

// ══════════════════════════════════════════════
  //  PAGE: REFUND POLICY
  // ══════════════════════════════════════════════
  const RefundPage = () => <RefundPolicy onClose={() => navigate(PAGES.HOME)} />;


  // ══════════════════════════════════════════════
  //  ADMIN PAGE (full-screen takeover, no shared header)
  // ══════════════════════════════════════════════
  if (currentPage === PAGES.ADMIN) {
    return (
      <AdminPage
        onClose={() => navigate(PAGES.HOME)}
        onMenuUpdate={(updatedItems) => setLiveMenuData(updatedItems)}
      />
    );
  }

  // 1. Ensure your pageMap is passing all props
  const pageMap = {
    [PAGES.HOME]:   <HomePage 
                      navigate={navigate}
                      logoUrl={logoUrl}
                      windowWidth={windowWidth}
                      setSelectedCake={setSelectedCake}
                      displayGallery={displayGallery}
                      currentIndex={currentIndex}
                      isTransitioning={isTransitioning}
                      slide={slide}
                      handleTransitionEnd={handleTransitionEnd}
                      SharedFooter={SharedFooter}
                    />,
    [PAGES.MENU]:   <Menu
                      allCategories={allCategories}
                      categoryCounts={categoryCounts}
                      isNavVisible={isNavVisible} 
                      navHeight={navHeight}  
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      setDebouncedSearch={setDebouncedSearch}
                      debouncedSearch={debouncedSearch}
                      filteredCakes={filteredCakes}
                      isLoading={isLoading}
                      user={user}
                      orderHistory={orderHistory}
                      refillDismissed={refillDismissed}
                      setRefillDismissed={setRefillDismissed}
                      addToCart={addToCart}
                      setSelectedCake={setSelectedCake}
                      logoUrl={logoUrl}
                    />,
    [PAGES.STORY]:  <OurStoryPage />,
    [PAGES.REFUND]: <RefundPage />,
  };
  return (
    <>
      {isLoading && (
        <div className="splash-screen">
          <div className="splash-inner">
            <img src={logoUrl} alt="Logo" className="splash-logo" />
            <p className="splash-name">FROST'D BAKES</p>
            <div className="splash-loader"><div className="splash-loader-bar" /></div>
          </div>
        </div>
      )}

      <div className={`App ${isAnyModalOpen ? 'modal-active' : ''}`}>
        <div className="content-wrapper">
          <SharedHeader />

          {/* MODIFIED CODE: Remove the fallback! */}
          <div className="page-content-offset">
            {pageMap[currentPage]}
          </div>

          {currentPage !== PAGES.HOME && <SharedFooter />}
        </div>

        {/* ── QUICK-VIEW MODAL ── */}
        {selectedCake && (
          <div className="modal-overlay quickview-overlay" onClick={() => setSelectedCake(null)}>
            <div className="quickview-modal" onClick={e => e.stopPropagation()}>
              <button className="quickview-close-btn" onClick={() => setSelectedCake(null)}>✕</button>
              <div className="quickview-left">
                <img src={selectedCake.image} alt={selectedCake.name} className="quickview-img" onError={(e) => e.target.src = logoUrl} />
                <div className="quickview-img-label">{selectedCake.name}</div>
              </div>
              <div className="quickview-right">
                <div className="detail-tags-row">
                  {selectedCake.popular && <span className="detail-tag popular">⭐ Popular</span>}
                  <span className="detail-tag">{selectedCake.category}</span>
                </div>
                <h2 className="quickview-title">{selectedCake.name}</h2>
                <p className="quickview-description">{selectedCake.description || "A signature Frost'd creation made with the finest ingredients."}</p>
                <p className="quickview-price">Starting from ₹{selectedCake.basePrice}</p>
                <div className="quickview-warnings">
                  <p className="warning-label">⚠ Allergen &amp; Dietary Info</p>
                  <p className="warning-text">{selectedCake.allergens || "Contains: Gluten, Dairy, Eggs. May contain traces of Nuts."}</p>
                  {selectedCake.dairy !== false && <span className="warning-badge dairy">🥛 Contains Dairy</span>}
                </div>
                {selectedCake.weights ? (
                  <>
                    <p className="select-label" style={{ marginTop: '20px' }}>Select Size to Add</p>
                    <div className="weight-grid-premium">
                      {Object.entries(selectedCake.weights).map(([wLabel, wPrice]) => (
                        <button key={wLabel} className="weight-chip-btn" onClick={() => { addToCart(selectedCake, wLabel, wPrice); setSelectedCake(null); }}>
                          <div className="w-info"><span className="w-name">{wLabel}</span><span className="w-price">₹{wPrice}</span></div>
                          <span className="w-add-icon">+</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <button className="add-btn detail-add-btn" style={{ marginTop: '20px' }} onClick={() => { addToCart(selectedCake, 'Standard', selectedCake.basePrice); setSelectedCake(null); }}>Add to Tray</button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── CART DRAWER ── */}
        {isCartOpen && (
          <div className="modal-overlay" onClick={() => setIsCartOpen(false)}>
            <div className="cart-popup-content pro-cart" onClick={e => e.stopPropagation()}>
              <div className="cart-drawer-header">
                <div>
                  <h2 className="premium-title">Your Tray</h2>
                  {cart.length > 0 && <button className="clear-cart-btn" onClick={() => setCart([])}>Clear all</button>}
                </div>
                <button className="close-drawer-btn" onClick={() => setIsCartOpen(false)}>✕</button>
              </div>
              <div className="cart-items-scroll-area">
                {cart.length === 0 ? (
                  <div className="empty-tray-state">
                    <div className="empty-icon-container"><span className="floating-snow">❄️</span><span className="main-empty-icon">🛒</span></div>
                    <h3>Your tray is empty</h3>
                    <p>Let's find something delicious!</p>
                    <button className="start-shopping-btn" onClick={() => setIsCartOpen(false)}>Start Browsing</button>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="cart-item-card">
                      <div className="cart-item-image-mini"><img src={item.image} alt={item.name} onError={(e) => e.target.src = logoUrl} /></div>
                      <div className="cart-item-details">
                        <span className="cart-item-name">{item.name}</span>
                        <div className="details-actions">
                          <div className="qty-control-modern">
                            <button onClick={() => updateQuantity(item.id, -1)}>—</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                          </div>
                          <span className="cart-item-total-price">₹{item.price * item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div className="cart-drawer-footer">
                  <div className="grand-total"><span>Total</span><span>₹{totalPrice}</span></div>
                  <button className="checkout-whatsapp-btn" onClick={handleRequestOrder}>
                    <span className="wa-btn-inner">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      PLACE ORDER VIA WHATSAPP
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── LOGIN MODAL ── */}
        {isLoginModalOpen && (
          <div className="modal-overlay" onClick={() => setIsLoginModalOpen(false)}>
            <div className="cart-popup-content auth-box" onClick={e => e.stopPropagation()}>
              <div className="auth-hero"><h2 className="premium-title">Frost'd Club</h2><p>Login or use Guest Mode.</p></div>
              <div className="auth-options">
                <button className="google-sign-in-btn" onClick={handleGoogleLogin}>Sign in with Google</button>
                <div className="auth-separator"><span>OR</span></div>
                <div className="guest-entry">
                  <input type="tel" placeholder="10-digit Phone" className="auth-input" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} />
                  <button className="guest-btn" onClick={handleGuestLogin}>Enter as Guest</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── IMAGE LIGHTBOX ── */}
        {selectedImg && (
          <div className="modal-overlay" onClick={() => setSelectedImg(null)}>
            <div className="lightbox-container"><img src={selectedImg} alt="Preview" className="lightbox-image-focused" onError={(e) => e.target.src = logoUrl} /></div>
          </div>
        )}

        {/* ── ALERT MODAL ── */}
        {alertConfig.isVisible && (
          <div className="modal-overlay alert-z" onClick={() => setAlertConfig({ ...alertConfig, isVisible: false })}>
            <div className={`alert-modal-box ${alertConfig.type}`} onClick={e => e.stopPropagation()}>
              <h3>{alertConfig.title}</h3><p>{alertConfig.message}</p>
              {alertConfig.onConfirm ? (
                <div className="alert-btn-row">
                  <button className="alert-cancel-btn" onClick={() => setAlertConfig({ ...alertConfig, isVisible: false })}>Cancel</button>
                  <button className="alert-close-btn" onClick={alertConfig.onConfirm}>Yes, log out</button>
                </div>
              ) : (
                <button className="alert-close-btn" onClick={() => setAlertConfig({ ...alertConfig, isVisible: false })}>Got it</button>
              )}
            </div>
          </div>
        )}

        {toast && <div className="toast-notification">{toast}</div>}
        <button className={`scroll-top-btn ${showScrollTop ? 'visible' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>
      </div>
    </>
  );
}

export default App;