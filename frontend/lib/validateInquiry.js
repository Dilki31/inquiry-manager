export const LIMITS = { customerName: 120, contact: 200, subject: 200, description: 2000 };

export const FIELDS = [
  { name: 'customerName', label: 'Customer name' },
  { name: 'contact', label: 'Contact (phone or email)' },
  { name: 'subject', label: 'Subject' },
  { name: 'description', label: 'Description', multiline: true },
];

// Mirrors the API rules so users get instant feedback.
// The API validates again on its own; this is only for guidance.
export function validate(values) {
  const errors = {};
  for (const { name, label } of FIELDS) {
    const value = values[name].trim();
    if (!value) errors[name] = `${label} is required`;
    else if (value.length > LIMITS[name]) errors[name] = `${label} must be at most ${LIMITS[name]} characters`;
  }
  if (!errors.contact && values.contact.trim().length < 3) {
    errors.contact = 'Contact must be at least 3 characters';
  }
  return errors;
}