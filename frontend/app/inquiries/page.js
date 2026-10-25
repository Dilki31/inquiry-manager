'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, tokenStore } from '@/lib/api';
import { signOut } from '@/lib/auth';

const STATUS_LABELS = {
  new: 'New',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

export default function InquiriesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [state, setState] = useState({ phase: 'loading', inquiries: [], total: 0, error: '' });
  const [reloadKey, setReloadKey] = useState(0);

  // Wait a moment after typing stops before calling the API.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(
    async (signal) => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('q', debouncedSearch);
      if (status) params.set('status', status);

      setState((prev) => ({ ...prev, phase: 'loading', error: '' }));
      try {
        const data = await apiFetch(`/inquiries?${params.toString()}`, { signal });
        setState({ phase: 'ready', inquiries: data.inquiries, total: data.total, error: '' });
      } catch (err) {
        if (err.name === 'AbortError') return;
        setState({ phase: 'error', inquiries: [], total: 0, error: err.message });
      }
    },
    [debouncedSearch, status]
  );

  useEffect(() => {
    if (!tokenStore.get()) {
      router.replace('/login');
      return;
    }
    // Cancel the previous request if filters change before it finishes.
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load, reloadKey, router]);

  const hasFilters = Boolean(debouncedSearch || status);

  return (
    <main className="container" style={{ maxWidth: 380, marginTop: '10vh' }}>
      <div className="topbar">
        <h1 style={{ margin: 0 }}>Inquiries</h1>
        <div className="row">
          <Link href="/inquiries/new" className="btn-primary" style={{ padding: '8px 12px', borderRadius: 6 }}>
            New inquiry
          </Link>
          <button type="button" onClick={signOut}>
            Sign out
          </button>
        </div>
      </div>

      <div className="toolbar">
        <input
          type="search"
          placeholder="Search name, contact or subject"
          aria-label="Search inquiries"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {state.phase === 'loading' && <p className="muted">Loading inquiries…</p>}

      {state.phase === 'error' && (
        <div className="banner banner-error" role="alert">
          <p style={{ margin: '0 0 8px' }}>{state.error}</p>
          <button type="button" onClick={() => setReloadKey((k) => k + 1)}>
            Try again
          </button>
        </div>
      )}

      {state.phase === 'ready' && state.inquiries.length === 0 && (
        <div className="banner">
          {hasFilters ? (
            <p style={{ margin: 0 }}>No inquiries match your search or filter.</p>
          ) : (
            <p style={{ margin: 0 }}>
              No inquiries yet. <Link href="/inquiries/new">Record the first one.</Link>
            </p>
          )}
        </div>
      )}

      {state.phase === 'ready' && state.inquiries.length > 0 && (
        <>
          <p className="muted">{state.total} found</p>
          <ul className="card-list">
            {state.inquiries.map((inq) => (
              <li key={inq.id}>
                <Link href={`/inquiries/${inq.id}`} className="card">
                  <div className="row">
                    <span className="card-title">{inq.subject}</span>
                    <span className={`badge badge-${inq.status}`}>{STATUS_LABELS[inq.status]}</span>
                  </div>
                  <div className="muted">
                    {inq.customerName} · {inq.contact}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}