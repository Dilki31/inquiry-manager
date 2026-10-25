import Link from 'next/link';

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">I</span>
          InquiryDesk
        </Link>
        <nav className="site-nav" aria-label="Main">
          <Link href="/">Home</Link>
          <Link href="/inquiries">Inquiries</Link>
          <Link href="/login" className="btn-primary nav-cta">Sign in</Link>
        </nav>
      </div>
    </header>
  );
}