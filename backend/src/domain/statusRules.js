// Allowed status changes. Anything not listed is rejected.
const TRANSITIONS = {
  new: ['in_progress'],
  in_progress: ['resolved'],
  resolved: ['in_progress'], // reopen
};

export function canTransition(from, to) {
  return (TRANSITIONS[from] ?? []).includes(to);
}

export function allowedTransitions(from) {
  return TRANSITIONS[from] ?? [];
}