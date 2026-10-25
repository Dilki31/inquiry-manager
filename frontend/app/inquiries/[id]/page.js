'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, tokenStore } from '@/lib/api';

const STATUS_LABELS = {
  new: 'New',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

// Button text depends on where we are going, so "reopen" reads naturally.
function actionLabel(from, to) {
  if (from === 'resolved' && to === 'in_progress') return 'Reopen';
  if (to === 'in_progress') return 'Start work';
  if (to === 'resolved') return 'Mark resolved';
  return STATUS_LABELS[to];
}

export default function InquiryDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [state, setState] = useState({ phase: 'loading', inquiry: null, error: '' });
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState('');
  const [actionError, setActionError] = useState('');

  const load = useCallback(
    async (signal) => {
      setState((prev) => ({ ...prev, phase: 'loading' }));
      try {
        const { inquiry } = await apiFetch(`/inquiries/${id}`, { signal });
        setState({ phase: 'ready', inquiry, error: '' });
      } catch (err) {
        if (err.name === 'AbortError') return;
        const phase = err.status === 404 || err.status === 400 ? 'notfound' : 'error';
        setState({ phase, inquiry: null, error: err.message });
      }
    },
    [id]
  );

  useEffect(() => {
    if (!tokenStore.get()) {
      router.replace('/login');
      return;
    }
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load, router]);

  async function changeStatus(nextStatus) {
    setSaving(true);
    setConflict('');
    setActionError('');
    try {
      // Send the version we last saw. The API rejects it if someone else changed the record.
      const { inquiry } = await apiFetch(`/inquiries/${id}/status`, {
        method: 'PATCH',
        body: { status: nextStatus, version: state.inquiry.version },
      });
      setState({ phase: 'ready', inquiry, error: '' });
    } catch (err) {
      if (err.status === 409) {
        setConflict(err.message);
      } else {
        setActionError(err.message);
      }
    } finally {
      setSaving(false);
    }
  }

  async function refresh() {
    setConflict('');
    await load();
  }

  if (state.phase === 'loading') {
    return (
      <main className="container" style={{ maxWidth: 640 }}>
        <p className="muted">Loading inquiry…</p>
      </main>
    );
  }

  if (state.phase === 'notfound') {
    return (
      <main className="container" style={{ maxWidth: 640 }}>
        <h1>Inquiry not found</h1>
        <p className="muted">
          It may have been removed, or you may not have access to it.
        </p>
        <Link href="/inquiries">Back to inquiries</Link>
      </main>
    );
  }

  if (state.phase === 'error') {
    return (
      <main className="container" style={{ maxWidth: 640 }}>
        <div className="banner banner-error" role="alert">
          <p style={{ margin: '0 0 8px' }}>{state.error}</p>
          <button type="button" onClick={() => load()}>
            Try again
          </button>
        </div>
        <Link href="/inquiries">Back to inquiries</Link>
      </main>
    );
  }

  const { inquiry } = state;

  return (
    <main className="container" style={{ maxWidth: 640 }}>
      <div className="topbar">
        <h1 style={{ margin: 0 }}>{inquiry.subject}</h1>
        <Link href="/inquiries">Back to list</Link>
      </div>

      {conflict && (
        <div className="banner banner-error" role="alert">
          <p style={{ margin: '0 0 8px' }}>{conflict}</p>
          <button type="button" onClick={refresh}>
            Refresh inquiry
          </button>
        </div>
      )}

      {actionError && (
        <div className="banner banner-error" role="alert">
          <p style={{ margin: 0 }}>{actionError}</p>
        </div>
      )}

      <div className="banner">
        <div className="row" style={{ marginBottom: 8 }}>
          <span className={`badge badge-${inquiry.status}`}>{STATUS_LABELS[inquiry.status]}</span>
          <span className="muted">Recorded by {inquiry.createdByName}</span>
        </div>
        <p style={{ margin: '0 0 4px' }}>
          <strong>{inquiry.customerName}</strong>
        </p>
        <p className="muted" style={{ margin: '0 0 12px' }}>
          {inquiry.contact}
        </p>
        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{inquiry.description}</p>
        <p className="muted" style={{ margin: '12px 0 0' }}>
          Created {new Date(inquiry.createdAt).toLocaleString()} · Updated{' '}
          {new Date(inquiry.updatedAt).toLocaleString()}
        </p>
      </div>

      <div className="row" style={{ justifyContent: 'flex-start' }}>
        {inquiry.allowedTransitions.length === 0 && <p className="muted">No status changes available.</p>}
        {inquiry.allowedTransitions.map((next) => (
          <button
            key={next}
            type="button"
            className="btn-primary"
            disabled={saving}
            onClick={() => changeStatus(next)}
          >
            {saving ? 'Saving…' : actionLabel(inquiry.status, next)}
          </button>
        ))}
      </div>
    </main>
  );
}