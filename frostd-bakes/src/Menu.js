import React, { useRef, useEffect, useState } from 'react';
import './Menu.css';

// Category emoji map — add/edit as needed to match your real categories
const CAT_EMOJI = {
  'All': '🍰',
  'Best Sellers': '⭐',
  'Signature Cakes': '✨',
  'Classic Delights': '🎂',
  'Tin Cakes': '🥫',
  'Brownies': '🍫',
  'Puddings': '🍮',
};

function Menu({
  allCategories,
  categoryCounts,
  isNavVisible,
  navHeight,
  selectedCategory,
  setSelectedCategory,
  searchTerm,
  setSearchTerm,
  setDebouncedSearch,
  debouncedSearch,
  filteredCakes,
  isLoading,
  user,
  orderHistory,
  refillDismissed,
  setRefillDismissed,
  addToCart,
  setSelectedCake,
  logoUrl,
}) {
  const catBarRef = useRef(null);
  const activeBtnRef = useRef(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);

  // Auto-scroll the active category pill into view
  useEffect(() => {
    if (activeBtnRef.current && catBarRef.current) {
      activeBtnRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [selectedCategory]);

  // Show/hide scroll-fade indicators on the category bar
  const handleCatScroll = () => {
    const el = catBarRef.current;
    if (!el) return;
    setShowLeftFade(el.scrollLeft > 10);
    setShowRightFade(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  // Group filteredCakes by category for section rendering
  // When a specific non-All category is selected, no grouping needed
  const shouldGroup = selectedCategory === 'All' && !debouncedSearch;
  const nonBestSellerCategories = allCategories.filter(c => c !== 'All' && c !== 'Best Sellers');

  const grouped = shouldGroup
    ? [
        {
          label: '⭐ Best Sellers',
          key: 'Best Sellers',
          cakes: filteredCakes.filter(c => c.popular),
        },
        ...nonBestSellerCategories.map(cat => ({
          label: `${CAT_EMOJI[cat] || '🍰'} ${cat}`,
          key: cat,
          cakes: filteredCakes.filter(c => c.category === cat),
        })),
      ].filter(g => g.cakes.length > 0)
    : [
        {
          label: selectedCategory === 'All' ? 'All Items' : `${CAT_EMOJI[selectedCategory] || '🍰'} ${selectedCategory}`,
          key: selectedCategory,
          cakes: filteredCakes,
        },
      ];

  return (
    <div className="page-menu">

      {/* ── STICKY CATEGORY BAR ── */}
        <div
          className={`cat-bar-wrapper${isNavVisible ? '' : ' bar-hidden'}`}
          style={{ top: isNavVisible ? `${navHeight}px` : '0px' }}
        >
        {showLeftFade && <div className="cat-fade cat-fade-left" />}
        <div
          className="menu-page-cat-bar"
          ref={catBarRef}
          onScroll={handleCatScroll}
        >
          {allCategories.map(cat => {
            const count = categoryCounts?.[cat] ?? 0;
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                ref={isActive ? activeBtnRef : null}
                className={isActive ? 'active' : ''}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSearchTerm('');
                  setDebouncedSearch('');
                }}
              >
                <span className="cat-btn-emoji">{CAT_EMOJI[cat] || '🍰'}</span>
                <span className="cat-btn-label">{cat}</span>
                {count > 0 && (
                  <span className={`cat-count-badge ${isActive ? 'active' : ''}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {showRightFade && <div className="cat-fade cat-fade-right" />}
      </div>

      {/* ── SEARCH + POPULAR BUTTON ── */}
      <div className="menu-page-toolbar">
        <div className="menu-search-wrap">
          <span className="search-icon-creative">🔍</span>
          <input
            type="text"
            value={searchTerm}
            placeholder="Search cakes, flavours..."
            onChange={(e) => setSearchTerm(e.target.value)}
            className="stylish-input menu-search-input"
          />
          {searchTerm && (
            <button
              className="clear-input-btn"
              onClick={() => { setSearchTerm(''); setDebouncedSearch(''); }}
            >✕</button>
          )}
        </div>
        <button
          className={`menu-popular-btn ${selectedCategory === 'Best Sellers' ? 'active' : ''}`}
          onClick={() => {
            setSelectedCategory(selectedCategory === 'Best Sellers' ? 'All' : 'Best Sellers');
            setSearchTerm('');
            setDebouncedSearch('');
          }}
        >
          ⭐ Popular
        </button>
      </div>

      <main className="product-display">

        {/* ── ORDER AGAIN / REFILL ── */}
        {user && orderHistory.length > 0 && !refillDismissed && (
          <div className="order-again-container">
            <div className="refill-header-row">
              <div className="refill-title-group">
                <span className="refill-icon">🔁</span>
                <div>
                  <h4 className="section-label-micro">WANT A REFILL?</h4>
                  <p className="refill-subtitle">Tap any item to add it back to your tray</p>
                </div>
              </div>
              <button
                className="refill-dismiss-btn"
                onClick={() => setRefillDismissed(true)}
                title="Dismiss"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="order-again-scroll">
              {orderHistory.slice(0, 5).map((item, i) => (
                <div
                  key={i}
                  className="reorder-chip"
                  onClick={() => addToCart(item, item.weightLabel || 'Standard', item.price)}
                >
                  <img src={item.image} alt="" onError={(e) => e.target.src = logoUrl} />
                  <span>{item.name}</span>
                  <span className="reorder-chip-add">+</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SEARCH STATE HEADER ── */}
        {debouncedSearch && filteredCakes.length > 0 && (
          <p className="search-results-count">
            {filteredCakes.length} result{filteredCakes.length !== 1 ? 's' : ''} for "
            <strong>{debouncedSearch}</strong>"
            {selectedCategory !== 'All' && (
              <span className="search-in-cat"> in <em>{selectedCategory}</em></span>
            )}
          </p>
        )}

        {/* ── EMPTY STATE ── */}
        {!isLoading && filteredCakes.length === 0 && (
          <div className="empty-search-state">
            <p className="empty-search-icon">🔍</p>
            <p>No cakes found{searchTerm ? ` for "${searchTerm}"` : ` in "${selectedCategory}"`}</p>
            <button onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setDebouncedSearch(''); }}>
              Clear & show all
            </button>
          </div>
        )}

        {/* ── LOADING SKELETONS ── */}
        {isLoading ? (
          <div className="cake-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="cake-card skeleton-card">
                <div className="skeleton skeleton-img" />
                <div className="card-info">
                  <div className="skeleton skeleton-title" />
                  <div className="skeleton skeleton-price" />
                  <div className="skeleton skeleton-btn" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── GROUPED or FLAT CAKE SECTIONS ── */
          grouped.map(group => (
            <section key={group.key} className="cake-section" id={`section-${group.key.replace(/\s+/g, '-').toLowerCase()}`}>
              {shouldGroup && (
                <div className="cake-section-header">
                  <h2 className="cake-section-title">{group.label}</h2>
                  <span className="cake-section-count">{group.cakes.length} item{group.cakes.length !== 1 ? 's' : ''}</span>
                </div>
              )}
              <div className="cake-grid">
                {group.cakes.map(cake => (
                  <div key={cake.id} className="cake-card" id={`cake-${cake.id}`}>
                    <div className="cake-img-wrapper">
                      <img
                        src={cake.image}
                        alt={cake.name}
                        className="cake-img"
                        onError={(e) => e.target.src = logoUrl}
                      />
                      {cake.popular && <span className="popular-badge">⭐ Popular</span>}
                      <button
                        className="cake-magnify-btn"
                        onClick={() => setSelectedCake(cake)}
                        aria-label="Quick view"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                      </button>
                      <div className="cake-hover-overlay">
                        <h3 className="hover-cake-name">{cake.name}</h3>
                        <p className="hover-price">₹{cake.basePrice}{cake.weights ? ' onwards' : ''}</p>
                        {cake.weights ? (
                          <div className="hover-weight-grid">
                            {Object.entries(cake.weights).map(([wLabel, wPrice]) => (
                              <button
                                key={wLabel}
                                className="hover-weight-btn"
                                onClick={(e) => { e.stopPropagation(); addToCart(cake, wLabel, wPrice); }}
                              >
                                <span>{wLabel}</span><span>₹{wPrice}</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <button
                            className="hover-add-btn"
                            onClick={(e) => { e.stopPropagation(); addToCart(cake, 'Standard', cake.basePrice); }}
                          >
                            Add to Tray
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="card-info">
                      <h3 className="cake-name-link" onClick={() => setSelectedCake(cake)}>{cake.name}</h3>
                      <p className="price-tag">₹{cake.basePrice} {cake.weights && 'onwards'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </div>
  );
}

export default Menu;