# Feature 11 — Employee Roles and Permissions

**Status: DONE**

## Feature brief (from project overview)

Platform dashboard: add users, roles, assign permissions to roles; a catalog of categories, services, and job types that branches choose from and customize. Salon dashboard: admin picks which branch to display; adds employees (cashier, barber, ...) from the catalog or manually with custom permissions and assigns them to a branch; employees see only their branch on login.

## Confirmed decisions (with reasons)

### One permission engine, two level-scoped configs (Q2)
- **Platform level**: the platform admin adds users, roles, and assigns permissions to roles — controlling the platform dashboard.
- **Salon level**: the salon admin creates employees, assigns **job types** (salon's "roles") that carry permission sets.
- Same machinery behind both; two admin surfaces.

### Platform catalog = reference palette (Q1)
- The platform dashboard holds a catalog of **categories, services, and job types**.
- A branch **chooses from the catalog** and gets **its own copy** — copy-on-take, **no propagation** of platform edits to branches that took an entry.
- A branch may **add its own services** beyond the catalog, and customize what it took (price, duration per feature 6).
- **Reason**: the catalog saves retyping; branches still fully own their entries (feature 6 stays intact).

### Job-type catalog presets (Q3)
- **Salon admin** — full salon scope, all branches.
- **Cashier** — single branch: queue control, check-in, finish, QR-verification.
- **Reception** — single branch: walk-in registration + finish-only (no money/queue control).
- **Barber** — catalog entry **only**: **no credentials, no permissions, no login** (Q3 clarification, Q4=a). Chair/roster handled by features 2/3.
- **Custom** — the salon defines its own job type with an arbitrary permission subset.

### Permission-gated actions (Q7)
- **Every dashboard action is gated by a permission; a role = a set of permissions.** Any role holding a permission can perform the action — nothing is hardcoded to a named role.
- Catalog job types ship with **default permission sets** (cashier and reception get theirs automatically).
- Reference partition of already-locked features:
  - **Salon admin**: daily roster/chair assignment, open/close switch (feature 3), invoice & payment page (feature 8), employee management, branch catalog changes.
  - **Cashier**: barber check-in/out (feature 2), chair toggles (feature 3), emergency chair disabling (feature 4), cashier-authored alerts (feature 5).
  - **Reception**: walk-in registration + "finish" on in-progress customers only (feature 8 suspension drain).
- **Feature 2 unchanged**: cashier presses barber check-in/out; barbers have no account.

### Branch scoping (Q5)
- **Every employee is assigned to exactly one branch** and sees only that branch after login (cashier manages one branch).
- The **salon admin** is salon-scoped and picks which branch's data to display.

### Employee authentication (Q6)
- The salon admin adds an employee from the dashboard with **email + password**; the employee logs in with those credentials.
- No self-registration; branch scope derives from the assignment.

### Platform roles (Q8)
- The platform admin **creates roles and assigns permissions freely** — no preset ceiling (admin, finance, and anything else are the operator's call).

## Open questions (pending)

None.

## Cross-feature dependencies (flagged, not decided)

- Feature 2: barber check-in/out permission sits on the cashier job type.
- Feature 3: open/close + roster permissions sit on the salon admin set.
- Feature 4: emergency chair disabling permission sits on the cashier set.
- Feature 8: invoice & payment page permission (salon admin); reception's finish-only drain.
- Feature 5: cashier-authored alerts ride the cashier permissions.
- Feature 6: catalog copy-on-take interplays with branch-owned services.

## Decision log (resolved during grilling)

| # | Question | Decision |
|---|----------|----------|
| Q1 | Catalog relationship | Copy-on-take, no propagation; branches also add own services |
| Q2 | RBAC shape | One engine, two level-scoped configs (platform roles / salon job types) |
| Q3 | Job-type presets | Salon admin, cashier, reception, barber (no-login), + custom |
| Q4 | Barber login | No — no credentials/permissions (feature 2 unchanged) |
| Q5 | Branch scoping | Exactly one branch per employee; salon admin salon-scoped |
| Q6 | Credentials | Email + password, created by salon admin from dashboard |
| Q7 | Action partition | Permission-gated; presets carry defaults; listed split |
| Q8 | Platform roles | Admin creates roles + permissions freely; no ceilings |

## Nice-to-haves logged so far

- None yet.