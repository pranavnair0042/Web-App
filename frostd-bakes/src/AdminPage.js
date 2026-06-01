import React, { useState, useEffect } from 'react';
import { auth, googleProvider, db } from './firebase';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import data from './siteData.json';

// ⚠️ Set this to the bakery owner's Gmail address
const ADMIN_EMAIL = 'pranavnair0042@gmail.com';

const CATEGORIES = ['Signature Cakes', 'Classic Delights', 'Tin Cakes', 'Brownies', 'Puddings'];

const blankForm = {
  name: '', category: 'Signature Cakes', basePrice: '',
  image: '', description: '', allergens: '',
  popular: false, dairy: true,
  w1label: '', w1price: '',
  w2label: '', w2price: '',
  w3label: '', w3price: '',
};

export default function AdminPage({ onClose, onMenuUpdate }) {
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check current user immediately on open
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.email === ADMIN_EMAIL) {
      setAuthorized(true);
      return;
    }
    // Also listen in case auth state resolves slightly after mount
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === ADMIN_EMAIL) {
        setAuthorized(true);
      } else {
        setAuthorized(false);
      }
    });
    return () => unsubscribe();
  }, []);
  const [items, setItems] = useState([]);
  const [view, setView] = useState('list');       // 'list' | 'form'
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const showStatus = (type, text) => {
    setStatus({ type, text });
    if (type === 'success') setTimeout(() => setStatus(null), 3500);
  };

  const seedFirestore = async () => {
    if (!window.confirm(`This will write all ${data.cakes.length} items from siteData.json into Firestore. Continue?`)) return;
    try {
      for (const cake of data.cakes) {
        await setDoc(doc(db, 'menu', String(cake.id)), cake);
      }
      showStatus('success', `Seeded ${data.cakes.length} items into Firestore successfully!`);
      await loadItems();
    } catch (e) {
      showStatus('error', 'Seed failed: ' + e.message);
    }
  };

  /* ── Load menu ── */
  const loadItems = async () => {
    try {
      const snap = await getDocs(collection(db, 'menu'));
      if (snap.empty) {
        setItems(data.cakes || []);
      } else {
        // Store firestoreId separately so edits always target the right document
        setItems(snap.docs.map(d => ({ ...d.data(), firestoreId: d.id })));
      }
    } catch (e) {
      showStatus('error', 'Could not load menu: ' + e.message);
    }
  };

  useEffect(() => { if (authorized) loadItems(); }, [authorized]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Login ── */
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email === ADMIN_EMAIL) {
        setAuthorized(true);
      } else {
        showStatus('error', `Access denied for ${result.user.email}`);
        await auth.signOut();
      }
    } catch (e) {
      // Ignore the internal Firebase popup-closed/cancelled errors
      const ignored = [
        'auth/popup-closed-by-user',
        'auth/cancelled-popup-request',
        'auth/internal-error',
      ];
      if (ignored.some(code => e.code === code || e.message?.includes('INTERNAL ASSERTION'))) {
        return;
      }
      showStatus('error', 'Login failed: ' + (e.message || 'Unknown error'));
    }
  };

  /* ── Form helpers ── */
  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));
  const toggle = (field) => setForm(p => ({ ...p, [field]: !p[field] }));

  const openAdd = () => {
    setEditTarget(null);
    setForm(blankForm);
    setView('form');
  };

  const openEdit = (item) => {
    setEditTarget(item);
    const w = item.weights || {};
    const keys = Object.keys(w);
    setForm({
      name: item.name || '',
      category: item.category || 'Signature Cakes',
      basePrice: item.basePrice || '',
      image: item.image || '',
      description: item.description || '',
      allergens: item.allergens || '',
      popular: !!item.popular,
      dairy: item.dairy !== false,
      w1label: keys[0] || '', w1price: keys[0] ? String(w[keys[0]]) : '',
      w2label: keys[1] || '', w2price: keys[1] ? String(w[keys[1]]) : '',
      w3label: keys[2] || '', w3price: keys[2] ? String(w[keys[2]]) : '',
    });
    setView('form');
  };

  const cancelForm = () => {
    setEditTarget(null);
    setForm(blankForm);
    setView('list');
  };

  /* ── Parse split weight fields → { label, price } ── */
  const parseWeight = (label, price) => {
    if (!label || !label.trim()) return null;
    const p = Number(price);
    if (isNaN(p) || p <= 0) return null;
    return { label: label.trim(), price: p };
  };

  const handleSave = async () => {
    if (!form.name.trim()) { showStatus('error', 'Item name is required.'); return; }
    if (!form.basePrice)   { showStatus('error', 'Base price is required.'); return; }
    setSaving(true);
    try {
      const weights = {};
      [
        [form.w1label, form.w1price],
        [form.w2label, form.w2price],
        [form.w3label, form.w3price],
      ].forEach(([label, price]) => {
        const parsed = parseWeight(label, price);
        if (parsed) weights[parsed.label] = parsed.price;
      });

      // For edits, use the existing Firestore doc ID stored in editTarget.firestoreId
      // For new items, generate a timestamp-based ID
      const docId = editTarget
        ? (editTarget.firestoreId || String(editTarget.id))
        : String(Date.now());

      const payload = {
        id: editTarget ? editTarget.id : Number(docId),
        firestoreId: docId,
        name: form.name.trim(),
        category: form.category,
        basePrice: Number(form.basePrice),
        image: form.image.trim() || `https://placehold.co/600x400/111/a5d8ff?text=${encodeURIComponent(form.name.trim())}`,
        description: form.description.trim(),
        allergens: form.allergens.trim(),
        popular: form.popular,
        dairy: form.dairy,
        ...(Object.keys(weights).length > 0 ? { weights } : {}),
      };

      await setDoc(doc(db, 'menu', docId), payload);
      showStatus('success', editTarget ? `"${payload.name}" updated!` : `"${payload.name}" added to menu!`);
      await loadItems();
      const snap = await getDocs(collection(db, 'menu'));
      onMenuUpdate(snap.docs.map(d => ({ ...d.data(), id: d.id })));
      cancelForm();
    } catch (e) {
      showStatus('error', 'Save failed: ' + e.message);
    }
    setSaving(false);
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDoc(doc(db, 'menu', String(deleteTarget.firestoreId || deleteTarget.id)));
      setDeleteTarget(null);
      showStatus('success', `"${deleteTarget.name}" removed.`);
      await loadItems();
      const snap = await getDocs(collection(db, 'menu'));
      onMenuUpdate(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    } catch (e) {
      setDeleteTarget(null);
      showStatus('error', 'Delete failed: ' + e.message);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !activeCategory || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const group = filteredItems.filter(i => i.category === cat);
    if (group.length) acc[cat] = group;
    return acc;
  }, {});

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <div className="admin-page">

      {/* ── DELETE CONFIRM POPUP ── */}
      {deleteTarget && (
        <div className="admin-popup-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="admin-popup" onClick={e => e.stopPropagation()}>
            <div className="admin-popup-icon admin-popup-icon-danger">🗑️</div>
            <h3 className="admin-popup-title">Delete Item?</h3>
            <p className="admin-popup-msg">
              This will permanently remove <strong>"{deleteTarget.name}"</strong> from the menu. This cannot be undone.
            </p>
            <div className="admin-popup-actions">
              <button className="admin-cancel-btn" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="admin-popup-confirm-btn danger" onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── STATUS POPUP ── */}
      {status && (
        <div className="admin-popup-overlay" onClick={() => setStatus(null)}>
          <div className="admin-popup" onClick={e => e.stopPropagation()}>
            <div className={`admin-popup-icon ${status.type === 'success' ? 'admin-popup-icon-success' : 'admin-popup-icon-danger'}`}>
              {status.type === 'success' ? '✅' : '⚠️'}
            </div>
            <h3 className="admin-popup-title">
              {status.type === 'success' ? 'Success' : 'Oops!'}
            </h3>
            <p className="admin-popup-msg">{status.text}</p>
            <div className="admin-popup-actions">
              <button className="admin-popup-confirm-btn" onClick={() => setStatus(null)}>Got it</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOP NAV ── */}
      <div className="admin-page-nav">
        <div className="admin-page-nav-left">
          <button className="admin-back-btn" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back to Store
          </button>
        </div>
        <div className="admin-page-nav-center">
          <span className="admin-page-nav-title">Admin Dashboard</span>
          <span className="admin-page-nav-sub">Frost'd Bakes</span>
        </div>
        <div className="admin-page-nav-right">
          {authorized && (
            <span className="admin-page-nav-badge">● Live</span>
          )}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="admin-page-content">

        {/* Status banner */}
        {status && (
          <div className={`admin-status ${status.type}`}>
            <span>{status.text}</span>
            <button className="admin-status-close" onClick={() => setStatus(null)}>✕</button>
          </div>
        )}

        {/* ── LOGIN GATE ── */}
        {!authorized ? (
          <div className="admin-login-page-gate">
            <div className="admin-login-card">
              <div className="admin-login-icon">🔐</div>
              <h2 className="admin-login-title">Admin Access</h2>
              <p className="admin-login-sub">Sign in with the authorised Google account to manage the Frost'd Bakes menu.</p>
              <button className="google-sign-in-btn" onClick={handleLogin}>
                Sign in with Google
              </button>
            </div>
          </div>

        ) : (
          <div className="admin-page-inner">

            {/* ── SIDEBAR ── */}
            <aside className="admin-sidebar">
              <div className="admin-sidebar-section">
                <div className="admin-sidebar-label">Menu</div>
                <button
                  className={`admin-sidebar-item ${view === 'list' ? 'active' : ''}`}
                  onClick={cancelForm}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                  All Items
                  <span className="admin-sidebar-count">{items.length}</span>
                </button>
                <button
                  className={`admin-sidebar-item ${view === 'form' && !editTarget ? 'active' : ''}`}
                  onClick={openAdd}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add New Item
                </button>
                <button className="admin-sidebar-item" onClick={seedFirestore}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.45"/></svg>
                  Seed from JSON
                </button>
              </div>
              <div className="admin-sidebar-section">
                <div className="admin-sidebar-label">Categories</div>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    className={`admin-sidebar-item admin-sidebar-item-cat ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => {
                      setActiveCategory(prev => prev === cat ? null : cat);
                      setView('list');
                      // Scroll to category block
                      setTimeout(() => {
                        const el = document.getElementById(`admin-cat-${cat.replace(/\s+/g, '-')}`);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 80);
                    }}>
                    <span className={`admin-sidebar-cat-dot ${activeCategory === cat ? 'active' : ''}`} />
                    {cat}
                    <span className="admin-sidebar-count">
                      {items.filter(i => i.category === cat).length}
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            {/* ── MAIN AREA ── */}
            <main className="admin-main">

              {/* LIST VIEW */}
              {view === 'list' && (
                <div>
                  <div className="admin-main-header">
                    <div>
                      <h1 className="admin-main-title">
                        {activeCategory || 'Menu Items'}
                      </h1>
                      <p className="admin-main-sub">
                        {filteredItems.length} of {items.length} items
                        {activeCategory && <button className="admin-clear-filter" onClick={() => setActiveCategory(null)}>✕ Clear filter</button>}
                      </p>
                    </div>
                    <button className="admin-add-btn" onClick={openAdd}>+ Add New Item</button>
                  </div>
                  <div className="admin-search-bar">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input
                      className="admin-search-input"
                      type="text"
                      placeholder="Search menu items..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button className="admin-search-clear" onClick={() => setSearchQuery('')}>✕</button>
                    )}
                  </div>

                  {items.length === 0 ? (
                    <div className="admin-empty">
                      <p>No items yet. Click "Seed from JSON" in the sidebar to populate from your existing data, or add items manually.</p>
                    </div>
                  ) : (
                    Object.entries(grouped).map(([cat, catItems]) => (
                      <div key={cat} className="admin-category-block" id={`admin-cat-${cat.replace(/\s+/g, '-')}`}>
                        <div className="admin-category-label">{cat} <span>({catItems.length})</span></div>
                        {catItems.map(item => (
                          <div key={item.id} className="admin-item">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="admin-item-thumb"
                              onError={e => e.target.src = 'https://placehold.co/52x52/111/333?text=?'}
                            />
                            <div className="admin-item-info">
                              <div className="admin-item-name">{item.name}</div>
                              <div className="admin-item-details">
                                <span className="admin-item-price">₹{item.basePrice}</span>
                                <span className="admin-item-cat">{item.category}</span>
                                {item.popular && <span className="admin-item-popular">⭐ Popular</span>}
                                {item.weights && (
                                  <span className="admin-item-cat">{Object.keys(item.weights).join(' · ')}</span>
                                )}
                              </div>
                            </div>
                            <div className="admin-item-actions">
                              <button className="admin-btn-edit" onClick={() => openEdit(item)}>Edit</button>
                              <button className="admin-btn-delete" onClick={() => setDeleteTarget(item)}>Delete</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* FORM VIEW */}
              {view === 'form' && (
                <div>
                  <div className="admin-main-header">
                    <div>
                      <h1 className="admin-main-title">{editTarget ? 'Edit Item' : 'Add New Item'}</h1>
                      <p className="admin-main-sub">{editTarget ? `Editing: ${editTarget.name}` : 'Fill in the details below to add a new item to the menu.'}</p>
                    </div>
                    <button className="admin-cancel-btn" onClick={cancelForm}>← Back to List</button>
                  </div>

                  <div className="admin-form-wrap">
                    <div className="admin-form-grid">

                      <div className="admin-form-group">
                        <label className="admin-form-label">Item Name <span className="admin-form-label-req">*</span></label>
                        <input className="admin-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Lotus Biscoff" />
                      </div>

                      <div className="admin-form-group">
                        <label className="admin-form-label">Category</label>
                        <select className="admin-select" value={form.category} onChange={e => set('category', e.target.value)}>
                          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>

                      <div className="admin-form-group">
                        <label className="admin-form-label">Base Price (₹) <span className="admin-form-label-req">*</span></label>
                        <input className="admin-input" type="number" value={form.basePrice} onChange={e => set('basePrice', e.target.value)} placeholder="1400" />
                      </div>

                      <div className="admin-form-group">
                        <label className="admin-form-label">Image URL</label>
                        <input className="admin-input" value={form.image} onChange={e => set('image', e.target.value)} placeholder="https://... or /images/cake.jpg" />
                      </div>

                      <div className="admin-form-group span2">
                        <label className="admin-form-label">Description</label>
                        <textarea className="admin-textarea" value={form.description} onChange={e => set('description', e.target.value)} placeholder="A short, appetising description..." />
                      </div>

                      <div className="admin-form-group span2">
                        <label className="admin-form-label">Allergen Info</label>
                        <input className="admin-input" value={form.allergens} onChange={e => set('allergens', e.target.value)} placeholder="Contains: Gluten, Dairy, Eggs..." />
                      </div>

                      <div className="admin-form-group span2">
                        <label className="admin-form-label">
                          Pricing / Size Options
                          <span style={{ color: '#555', fontWeight: 600, textTransform: 'none', letterSpacing: 0, marginLeft: 6 }}>
                            — e.g. "1kg", "12 pieces", "Half tin"
                          </span>
                        </label>

                        {/* Quick-pick label chips */}
                        <div className="admin-weight-chips">
                          {['0.5kg','1kg','1.5kg','2kg','6 pieces','12 pieces','Half tin','Full tin','1 slice','Per box'].map(chip => (
                            <button
                              key={chip}
                              type="button"
                              className="admin-weight-chip"
                              onClick={() => {
                                // Fill the first empty label slot
                                if (!form.w1label) { set('w1label', chip); }
                                else if (!form.w2label) { set('w2label', chip); }
                                else if (!form.w3label) { set('w3label', chip); }
                              }}
                            >{chip}</button>
                          ))}
                        </div>

                        {/* Three option rows */}
                        <div className="admin-weights-rows">
                          {[
                            ['w1label','w1price','Option 1'],
                            ['w2label','w2price','Option 2'],
                            ['w3label','w3price','Option 3'],
                          ].map(([lKey, pKey, rowLabel]) => (
                            <div className="admin-weight-row" key={lKey}>
                              <span className="admin-weight-row-num">{rowLabel}</span>
                              <input
                                className="admin-input admin-weight-label-input"
                                value={form[lKey]}
                                onChange={e => set(lKey, e.target.value)}
                                placeholder='e.g. 1kg / 12 pieces / Half tin'
                              />
                              <span className="admin-weight-row-sep">₹</span>
                              <input
                                className="admin-input admin-weight-price-input"
                                type="number"
                                value={form[pKey]}
                                onChange={e => set(pKey, e.target.value)}
                                placeholder="Price"
                              />
                              {(form[lKey] || form[pKey]) && (
                                <button
                                  type="button"
                                  className="admin-weight-clear"
                                  onClick={() => { set(lKey, ''); set(pKey, ''); }}
                                  title="Clear this option"
                                >✕</button>
                              )}
                            </div>
                          ))}
                        </div>

                        <div style={{ fontSize: '0.68rem', color: '#333', marginTop: 6 }}>
                          Leave all blank if this item has no size/weight variants (e.g. single-serve brownies, puddings)
                        </div>
                      </div>

                      <div className="admin-form-group span2">
                        <label className="admin-form-label">Flags</label>
                        <div className="admin-toggles-row">
                          <div className={`admin-toggle-chip ${form.popular ? 'on' : ''}`} onClick={() => toggle('popular')}>
                            <input type="checkbox" readOnly checked={form.popular} />
                            <div className="admin-toggle-dot" />
                            <span className="admin-toggle-text">⭐ Mark as Popular</span>
                          </div>
                          <div className={`admin-toggle-chip ${form.dairy ? 'on' : ''}`} onClick={() => toggle('dairy')}>
                            <input type="checkbox" readOnly checked={form.dairy} />
                            <div className="admin-toggle-dot" />
                            <span className="admin-toggle-text">🥛 Contains Dairy</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    <div className="admin-form-actions">
                      <button className="admin-save-btn" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : editTarget ? 'Save Changes' : 'Add to Menu'}
                      </button>
                      <button className="admin-cancel-btn" onClick={cancelForm}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}

            </main>
          </div>
        )}
      </div>
    </div>
  );
}