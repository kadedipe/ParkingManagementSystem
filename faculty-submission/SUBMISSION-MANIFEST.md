# Faculty Submission Manifest

Author: Kolapo Adedipe  
Originally updated: 30 August 2026  
Public-domain update: 3 September 2026  
Repository: `kadedipe/ParkingManagementSystem`  
Public production domain: https://parking-management-system.com/

## Included in the downloadable faculty package

- `ParkingManagementSystem-Design-Report.docx`
- `ParkingManagementSystem-Design-Report.pdf`
- `ParkingManagementSystem-Design-Report.md`
- `IMPLEMENTATION-UPDATE-2026-08-30.md`
- `REPOSITORY-STATE.txt`
- Six architecture/UML diagrams
- Original Python microservice source evidence snapshot
- Reproducible faculty evidence workflow/test

## Public application access

The production system is publicly accessible through:

**https://parking-management-system.com/**

This custom domain is the preferred URL for faculty review and browser-based demonstration. The Railway-generated frontend URL remains the underlying hosting/deployment origin.

## Important update note

The design report includes a dedicated August 2026 implementation section covering persistent inventory and reservations, parking sessions, dashboard metrics, operational payments, dated reports, EV charging persistence, vehicle/profile hardening, gateway/UI fixes, and automatic overage/underage reconciliation. The faculty documentation is additionally updated to identify the custom public production domain.

The source snapshot in the original faculty archive is retained as historical submission evidence. The authoritative implementation is repository `main`; this faculty-submission directory records later merged implementation and production-access updates instead of presenting the older snapshot as newly regenerated source.

## Production verification status

The deterministic faculty evidence workflow remains `.github/workflows/faculty-submission-evidence.yml` with `frontend/cypress/e2e/faculty-running-evidence.cy.js`. PR #47 and PR #48 have been redeployed to Railway and verified in production. The parking-session Start/End workflow and automatic billing reconciliation are therefore documented as live production capabilities. The package does not claim that every live production state is represented by a newly regenerated screenshot.

## Verification represented

- Billing-reconciliation PostgreSQL migration workflow passed before merge.
- Parking-service validation for billing reconciliation passed before merge.
- Frontend type-check, production build and tests for the latest session/reconciliation changes passed before merge.
- PR #47 parking-session workflow is deployed and verified on Railway.
- PR #48 automatic billing reconciliation is deployed and verified on Railway.
- Charging-service async test harness was corrected and its charging-service CI test job passed after the fix.
- Production metrics are included only where explicitly observed during verification.
- Public browser access is documented at `https://parking-management-system.com/`.
