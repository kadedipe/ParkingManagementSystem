# Faculty Submission Manifest

Author: Kolapo Adedipe
Updated: 30 August 2026
Repository: `kadedipe/ParkingManagementSystem`
Repository baseline for this package: `main` after PR #48 (`0a716a16c3bec3eec49b0e9e39fb91c12da67daa`)

## Included in the downloadable faculty package

- `ParkingManagementSystem-Design-Report.docx`
- `ParkingManagementSystem-Design-Report.pdf`
- `ParkingManagementSystem-Design-Report.md`
- `IMPLEMENTATION-UPDATE-2026-08-30.md`
- `REPOSITORY-STATE.txt`
- Six architecture/UML diagrams
- Original Python microservice source evidence snapshot
- Reproducible faculty evidence workflow/test

## Important update note

The design report now includes a dedicated August 2026 implementation section covering persistent inventory and reservations, parking sessions, dashboard metrics, operational payments, dated reports, EV charging persistence, vehicle/profile hardening, gateway/UI fixes, and automatic overage/underage reconciliation.

The source snapshot in the original faculty archive is retained as historical submission evidence. The authoritative implementation is repository `main`; this faculty-submission directory records the later merged implementation state instead of presenting the older snapshot as newly regenerated source.

## Screenshot and deployment distinction

The deterministic faculty evidence workflow remains `.github/workflows/faculty-submission-evidence.yml` with `frontend/cypress/e2e/faculty-running-evidence.cy.js`. Post-PR48 production screenshots were not regenerated as part of this document update, so the report explicitly distinguishes observed production values from merged repository capabilities that still require Railway redeployment/re-observation.

## Verification represented

- Billing-reconciliation PostgreSQL migration workflow passed before merge.
- Parking-service validation for billing reconciliation passed before merge.
- Frontend type-check, production build and tests for the latest session/reconciliation changes passed before merge.
- Production metrics are included only where they were explicitly observed during verification.
