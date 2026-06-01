import React from 'react';
import './OurStory.css';

function OurStory({ onClose }) {
  return (
    <div className="story-page">

      {/* Top nav bar */}
      <header className="story-header">
        <button className="story-back-btn" onClick={onClose}>
          ← Back
        </button>
        <span className="story-header-brand">FROST'D BAKES</span>
        <div style={{ width: '80px' }} />
      </header>

      {/* Hero */}
      <section className="story-hero">
        <p className="story-eyebrow">Est. in Trivandrum</p>
        <h1 className="story-hero-title">Made with love.<br />Frosted to perfection.</h1>
        <p className="story-hero-sub">The story behind every layer, every crumb, every celebration.</p>
      </section>

      {/* Content sections */}
      <div className="story-content">

        <section className="story-section">
          <div className="story-section-number">01</div>
          <div className="story-section-body">
            <h2>Where It All Began</h2>
            <p>
              Frost'd Bakes started in a small home kitchen in Peroorkada, Trivandrum — not with a business plan,
              but with a genuine obsession for getting flavours exactly right. What began as weekend bakes
              for friends and family quickly turned into something much bigger when word spread about the
              Lotus Biscoff cake that "tasted like it came from a patisserie in Paris."
            </p>
          </div>
        </section>

        <section className="story-section story-section-alt">
          <div className="story-section-number">02</div>
          <div className="story-section-body">
            <h2>Our Philosophy</h2>
            <p>
              We believe a cake should never be an afterthought. Every celebration — a birthday, an anniversary,
              a quiet Tuesday that just needs something sweet — deserves a centrepiece that is as
              beautiful as it is delicious. We use no artificial shortcuts. Belgian chocolate, organic berries,
              real Lotus Biscoff, and cream from trusted local suppliers go into every single order.
            </p>
          </div>
        </section>

        <section className="story-section">
          <div className="story-section-number">03</div>
          <div className="story-section-body">
            <h2>Handcrafted, Always</h2>
            <p>
              Every cake at Frost'd is made to order. We don't keep a stockroom of pre-baked sponges.
              When you place an order, the process starts from scratch — measuring, mixing, baking,
              cooling, filling, and frosting — all by hand, the way it should be. That's why we ask for
              2–3 days advance notice. Great things take time.
            </p>
          </div>
        </section>

        <section className="story-section story-section-alt">
          <div className="story-section-number">04</div>
          <div className="story-section-body">
            <h2>Themed Creations</h2>
            <p>
              Beyond our signature range, we take on custom themed cakes for weddings, corporate events,
              baby showers and more. If you can imagine it, we'll figure out how to frost it. Our themed
              creations have been the highlight of everything from intimate family gatherings to large
              celebration halls across Trivandrum.
            </p>
          </div>
        </section>

        {/* Values grid */}
        <section className="story-values">
          <h2 className="story-values-title">What We Stand For</h2>
          <div className="story-values-grid">
            <div className="story-value-card">
              <span className="value-icon">🌿</span>
              <h4>Real Ingredients</h4>
              <p>No artificial flavours, colours or preservatives. Ever.</p>
            </div>
            <div className="story-value-card">
              <span className="value-icon">🤝</span>
              <h4>Made to Order</h4>
              <p>Every cake is baked fresh specifically for you.</p>
            </div>
            <div className="story-value-card">
              <span className="value-icon">📍</span>
              <h4>Local & Proud</h4>
              <p>Born in Trivandrum, baked for Trivandrum.</p>
            </div>
            <div className="story-value-card">
              <span className="value-icon">❄️</span>
              <h4>Frosted to Perfection</h4>
              <p>Presentation matters as much as flavour to us.</p>
            </div>
          </div>
        </section>

      </div>

      {/* Footer CTA */}
      <section className="story-cta-section">
        <h2>Ready to order?</h2>
        <p>Browse our full menu and find your perfect cake.</p>
        <button className="story-cta-btn" onClick={onClose}>Explore Our Menu →</button>
      </section>

    </div>
  );
}

export default OurStory;