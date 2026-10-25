'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, tokenStore } from '@/lib/api';
import { FIELDS, validate } from '@/lib/validateInquiry';



export default function NewInquiryPage() {
  const router = useRouter();
  const [values, setValues] = useState({ customerName: '', contact: '', subject: '', description: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [existingId, setExistingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!tokenStore.get()) router.replace('/login');
  }, [router]);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');
    setExistingId(null);

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const { inquiry } = await apiFetch('/inquiries', { method: 'POST', body: values });
      router.replace(`/inquiries/${inquiry.id}`);
    } catch (err) {
      if (err.status === 400 && err.details?.fields) {
        setErrors(err.details.fields);
      } else if (err.status === 409) {
        setFormError(err.message);
        setExistingId(err.details?.existingId ?? null);
      } else {
        setFormError(err.message);
      }
      setSubmitting(false);
    }
  }

  return (
    <main className="container" style={{ maxWidth: 560 }}>
      <div className="topbar">
        <h1 style={{ margin: 0 }}>New inquiry</h1>
        <Link href="/inquiries">Back to list</Link>
      </div>

      {formError && (
        <div className="banner banner-error" role="alert">
          <p style={{ margin: 0 }}>{formError}</p>
          {existingId && (
            <p style={{ margin: '8px 0 0' }}>
              <Link href={`/inquiries/${existingId}`}>Open the existing inquiry</Link>
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {FIELDS.map(({ name, label, multiline }) => (
          <div className="field" key={name}>
            <label htmlFor={name}>{label}</label>
            {multiline ? (
              <textarea
                id={name}
                name={name}
                rows={5}
                value={values[name]}
                onChange={handleChange}
                aria-invalid={Boolean(errors[name])}
                aria-describedby={errors[name] ? `${name}-error` : undefined}
              />
            ) : (
              <input
                id={name}
                name={name}
                value={values[name]}
                onChange={handleChange}
                aria-invalid={Boolean(errors[name])}
                aria-describedby={errors[name] ? `${name}-error` : undefined}
              />
            )}
            {errors[name] && (
              <p id={`${name}-error`} className="error-text">
                {errors[name]}
              </p>
            )}
          </div>
        ))}

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save inquiry'}
        </button>
      </form>
    </main>
  );
}