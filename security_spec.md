# Security Specification: Wanky Academy Portal

## 1. Data Invariants
- A student cannot exist without a valid Kurs selection.
- Student codes are unique and course-prefixed (WA-INFO-2026-0001).
- PII (Phone, Address, DOB) is strictly isolated to the student owner.
- Student capacity is capped at 1000 per course.
- `studentCode` and `createdAt` are immutable after creation.

## 2. The "Dirty Dozen" Payloads (Denial Tests)

| # | Attack Type | Payload / Action | Expected Result |
|---|---|---|---|
| 1 | Identity Spoofing | Create student with `uid: "victim_id"` while auth is `attacker_id` | PERMISSION_DENIED |
| 2 | Privilege Escalation | Update `isAdmin: true` on user profile | PERMISSION_DENIED |
| 3 | Value Poisoning | Set `course: "Hacker Course"` (not in enum) | PERMISSION_DENIED|
| 4 | Data Poisoning | Set `fullName` to a 2MB string | PERMISSION_DENIED |
| 5 | ID Poisoning | Inject document ID with 500 special chars | PERMISSION_DENIED |
| 6 | Relational Leak | Read `/students/victim_id` as `attacker_id` | PERMISSION_DENIED |
| 7 | Immutable Breach | Update `studentCode` on existing profile | PERMISSION_DENIED |
| 8 | Timestamp Spoofing | Set `createdAt` to a future date manually | PERMISSION_DENIED |
| 9 | Unauthenticated Write | Attempt to create `students` doc without auth | PERMISSION_DENIED |
| 10| System Field Attack | Update `updatedAt` without using `request.time` | PERMISSION_DENIED |
| 11| Sequence Attack | Update `counters` directly with a huge number | PERMISSION_DENIED |
| 12| List Scraping | `getDocs(collection(db, 'students'))` as a student | PERMISSION_DENIED (Query Enforcer) |

## 3. Conflict Report
- **Identity Spoofing**: Blocked via `isOwner(userId)` checks.
- **State Shortcutting**: Not applicable (no status workflow yet).
- **Resource Poisoning**: Blocked by `.size()` checks on all strings.
- **PII Breach**: Read access restricted to `isOwner`.
