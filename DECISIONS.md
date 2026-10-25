# Design Decisions

## Assumptions

- Staff are internal employees with seeded accounts. There is no registration.
- One inquiry belongs to the staff member who recorded it.
- Contact is free text (phone or email), so it is only checked for presence and length.

## Key decisions

**1. Ownership and access.** Staff can only see inquiries they created. An admin can see all.
The rule lives in the API (`findVisibleInquiry` and the list query), not in the UI. When a user
asks for an inquiry they cannot see, the API returns 404, not 403, so a user cannot learn
which ids exist.

**2. Status rules.** Allowed changes: New to In Progress, In Progress to Resolved, and
Resolved back to In Progress (reopen). Everything else (for example New straight to Resolved)
is rejected with 409 and the list of allowed next statuses. The rules sit in one small file
(`domain/statusRules.js`) so they are easy to test and change.

**3. Stale data.** Each inquiry has a `version` number. The client sends the version it saw;
the update only succeeds if it still matches (`WHERE version = $n`), which also keeps it safe
when two requests race. On a mismatch the API returns 409 and the UI shows a banner with a
"Refresh inquiry" button.

**4. Duplicates and missing data.** The API rejects an inquiry when the same user already has
an open one with the same contact and subject (case-insensitive), and links to the existing
one. Missing or invalid fields are rejected by the API (zod) and by database CHECK
constraints. The form checks the same rules first to give instant feedback.

## Trade-off accepted

The JWT is stored in `localStorage` for simplicity. Script injection (XSS) could read it.
An httpOnly cookie would be safer, but it needs CSRF protection and more setup than this
assessment needs.

## What I would improve next

- Move the token to an httpOnly cookie.
- Add an audit trail table of status changes (who, when, from, to).
- Add API integration tests against a test database (the current backend tests do not touch
  the database).
- Add a database unique index for open duplicates to close the small race in the duplicate check.

## Testing gaps

- No end-to-end test of the full workflow.
- Ownership and the version check were verified manually (shown in the recording), not by
  automated tests.

## Use of AI

I used Claude as a guide while building this. It suggested the project structure, the version
column for stale data, and returning 404 for unauthorised access. I can explain every part of the code. I understood how to buld this system using Claude and It helped me to develop and complete this task.