import Link from 'next/link';

function HeroIllustration() {
  return (
    <svg viewBox="0 0 480 360" role="img" aria-label="Illustration of an inquiry dashboard" className="hero-art">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7c8cff" />
          <stop offset="1" stopColor="#a56bff" />
        </linearGradient>
      </defs>
      <circle cx="410" cy="70" r="70" fill="#7c8cff" opacity="0.18" />
      <circle cx="60" cy="310" r="55" fill="#17c3b2" opacity="0.18" />
      <rect x="50" y="40" width="360" height="260" rx="18" fill="#141a35" stroke="#2c3560" strokeWidth="2" />
      <rect x="50" y="40" width="360" height="44" rx="18" fill="url(#g1)" />
      <circle cx="76" cy="62" r="6" fill="#fff" opacity=".8" />
      <circle cx="96" cy="62" r="6" fill="#fff" opacity=".6" />
      <circle cx="116" cy="62" r="6" fill="#fff" opacity=".4" />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(74 ${108 + i * 62})`}>
          <rect width="312" height="48" rx="10" fill="#1d2547" />
          <rect x="14" y="12" width="120" height="9" rx="4" fill="#4a5486" />
          <rect x="14" y="28" width="80" height="7" rx="3" fill="#33406e" />
          <rect x="232" y="14" width="66" height="20" rx="10" fill={['#3a4390', '#6b4f1f', '#1f5a40'][i]} />
          <rect x="244" y="21" width="42" height="6" rx="3" fill={['#b9c2ff', '#ffd08a', '#8ee6b8'][i]} />
        </g>
      ))}
      <g transform="translate(340 250)">
        <circle r="34" fill="#4cc38a" />
        <path d="M-14 0 L-4 11 L16 -10" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

const FEATURES = [
  { icon: '📝', title: 'Capture in seconds', text: 'Record the customer, how to reach them and what they need, with clear guidance if anything is missing.' },
  { icon: '🔎', title: 'Find it later', text: 'Search by name, contact or subject and filter by status so nothing gets lost in chats and spreadsheets.' },
  { icon: '🔒', title: 'Secure by design', text: 'Every request is checked on the server. Staff only see the inquiries they are allowed to see.' },
];

const STEPS = [
  { n: '1', title: 'Sign in', text: 'Use your staff account to open the workspace.' },
  { n: '2', title: 'Record', text: 'Add the inquiry with the customer details.' },
  { n: '3', title: 'Resolve', text: 'Move it from New to In Progress to Resolved.' },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div>
            <span className="eyebrow">Customer inquiry management</span>
            <h1 className="hero-title">Never lose track of a customer request again.</h1>
            <p className="hero-text">
              InquiryDesk gives your team one place to record inquiries, see who is handling them
              and follow each one until it is resolved.
            </p>
            <div className="row" style={{ gap: 12 }}>
              <Link href="/login" className="btn-primary btn-lg">Get started</Link>
              <Link href="/inquiries" className="btn-secondary btn-lg">View inquiries</Link>
            </div>
          </div>
          <HeroIllustration />
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <h2 className="section-title">Everything your team needs</h2>
          <p className="section-sub">Simple tools that make follow-ups easy to see and hard to miss.</p>
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <div className="feature" key={f.title}>
                <div className="feature-icon" aria-hidden="true">{f.icon}</div>
                <h3>{f.title}</h3>
                <p className="muted">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="section-inner">
          <h2 className="section-title">How it works</h2>
          <div className="feature-grid">
            {STEPS.map((s) => (
              <div className="step" key={s.n}>
                <div className="step-num">{s.n}</div>
                <h3>{s.title}</h3>
                <p className="muted">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Ready to get organised?</h2>
        <p>Sign in and record your first inquiry.</p>
        <Link href="/login" className="btn-light btn-lg">Sign in</Link>
      </section>

      <footer className="site-footer">
        <div className="section-inner">© {new Date().getFullYear()} InquiryDesk. All rights reserved.</div>
      </footer>
    </>
  );
}