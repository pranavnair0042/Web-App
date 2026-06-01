import React from 'react';
import './RefundPolicy.css';
import data from './siteData.json';

function RefundPolicy({ onClose }) {
  return (
    <div className="refund-page">

      {/* Top nav bar */}
      <header className="refund-header">
        <button className="refund-back-btn" onClick={onClose}>
          ← Back
        </button>
        <span className="refund-header-brand">FROST'D BAKES</span>
        <div style={{ width: '80px' }} />
      </header>

      {/* Hero */}
      <section className="refund-hero">
        <p className="refund-eyebrow">Policies</p>
        <h1 className="refund-hero-title">Refund &amp; Cancellations</h1>
        <p className="refund-hero-sub">We stand behind every bake. Here's how we handle changes and refunds.</p>
      </section>

      {/* Content */}
      <div className="refund-content">

        <section className="refund-section">
          <div className="refund-section-number">01</div>
          <div className="refund-section-body">
            <h2>Cancellations</h2>
            <p>
              Made 48 hours prior to the delivery date are eligible for a 100% refund.
              We understand plans change — just let us know as early as possible so we
              can accommodate you without waste.
            </p>
          </div>
        </section>

        <section className="refund-section refund-section-alt">
          <div className="refund-section-number">02</div>
          <div className="refund-section-body">
            <h2>Last-Minute Changes</h2>
            <p>
              Cancellations within 24 hours of delivery are non-refundable as the baking
              process has already begun. At this stage, ingredients have been sourced and
              your cake is actively being prepared just for you.
            </p>
          </div>
        </section>

        <section className="refund-section">
          <div className="refund-section-number">03</div>
          <div className="refund-section-body">
            <h2>Quality Issues</h2>
            <p>
              If you are unsatisfied with the quality, please contact us within 2 hours
              of delivery with photos so we can assist you. We take every concern seriously
              and will do our best to make it right.
            </p>
          </div>
        </section>

        <section className="refund-section refund-section-alt">
          <div className="refund-section-number">04</div>
          <div className="refund-section-body">
            <h2>How to Request a Refund</h2>
            <p>
              Contact us directly via WhatsApp at <strong>{data.contact.phone}</strong> or
              email us at <strong>{data.contact.email}</strong>. Please include your order
              details and photos where applicable. We aim to respond within a few hours.
            </p>
          </div>
        </section>

        {/* Policy cards */}
        <section className="refund-values">
          <h2 className="refund-values-title">Quick Reference</h2>
          <div className="refund-values-grid">
            <div className="refund-value-card">
              <span className="refund-value-icon">✅</span>
              <h4>48+ Hours Notice</h4>
              <p>Full 100% refund, no questions asked.</p>
            </div>
            <div className="refund-value-card">
              <span className="refund-value-icon">⚠️</span>
              <h4>Under 24 Hours</h4>
              <p>Non-refundable — baking is already underway.</p>
            </div>
            <div className="refund-value-card">
              <span className="refund-value-icon">📸</span>
              <h4>Quality Concern</h4>
              <p>Contact us within 2 hours with photos.</p>
            </div>
            <div className="refund-value-card">
              <span className="refund-value-icon">💬</span>
              <h4>Get in Touch</h4>
              <p>WhatsApp or email — we're always here.</p>
            </div>
          </div>
        </section>

      </div>

      {/* Footer CTA */}
      <section className="refund-cta-section">
        <h2>Have a question?</h2>
        <p>We're just a message away — reach out any time.</p>
        <button className="refund-cta-btn" onClick={onClose}>Back to Menu →</button>
      </section>

    </div>
  );
}

export default RefundPolicy;