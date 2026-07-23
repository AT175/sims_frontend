# SIMS — School Information Management System

A multitenant, offline-first cross-platform application for managing a Ghanaian Senior High School, built with React Native + TypeScript.

## Getting Started

```bash
# Install dependencies
npm install

# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Type check
npm run typecheck
```

## Project Structure

```
app/
├── App.tsx                      # Entry point — auth router + dashboard selection
├── index.js                     # React Native registration
├── package.json
├── tsconfig.json                # strict: true, no .js/.jsx files
├── babel.config.js              # Module path aliases
├── metro.config.js
└── src/
    ├── shared/
    │   ├── types/               # SyncEnvelope, RoleId, Term, etc.
    │   ├── models/              # Entity interfaces (teaching, bursary, registry, boarding)
    │   ├── store/               # Zustand stores (auth, sync)
    │   ├── components/          # DashboardLayout, StatCard, DataTable, SyncStatusIndicator
    │   ├── theme/               # Colors, spacing, typography
    │   └── navigation/          # Role-to-dashboard mapping
    ├── screens/
    │   └── LoginScreen.tsx      # Login + public admission application panel
    └── dashboards/
        ├── headmaster/          # Executive overview, approvals, discipline, reports
        ├── academic/            # Timetable, exams, HOD approvals, report cards
        ├── bursary/             # Fees, payroll, expenditure, budget
        ├── registry/            # Students, admissions, certificates, staff
        ├── domestic/            # Boarding overview, compliance, approvals
        ├── boarding/            # Individual house dashboard (roster, roll call, discipline)
        └── student/             # Student portal (12 pages)
```

## Architecture

- **Multitenant**: Every record carries a `tenantId`; data is scoped at API + DB level
- **Offline-first**: All writes go to local DB first; sync queue pushes when online
- **PC-first, mobile-second**: Responsive `DashboardLayout` re-flows between sidebar (desktop) and tab bar (mobile)
- **Role-based**: Auth router selects dashboard based on `activeRole` from JWT claims
- **TypeScript strict**: No `.js`/`.jsx` files, `strict: true` in tsconfig

## Implemented Dashboards

| Dashboard | Status |
|---|---|
| Login + Admission Application | ✅ |
| Governing Board | ✅ |
| PTA | ✅ |
| Headmaster | ✅ |
| Staff | ✅ |
| Welfare Committee | ✅ |
| SRC | ✅ |
| Electoral Commission | ✅ |
| Academic (Asst. Headmaster) | ✅ |
| Subject HOD | ✅ |
| Counselling Unit | ✅ |
| Library & ICT | ✅ |
| Sports & Clubs | ✅ |
| PLC | ✅ |
| Teacher Platform | ✅ |
| Bursary / Finance | ✅ |
| Stores | ✅ |
| Registry (with admissions flow) | ✅ |
| Security | ✅ |
| Domestic (Asst. Headmaster) | ✅ |
| Senior Housemaster/Housemistress | ✅ |
| Boarding House (individual) | ✅ |
| Catering / Kitchen | ✅ |
| Health / Sick Bay | ✅ |
| Transport | ✅ |
| Cleaning / Labourers | ✅ |
| Student Portal | ✅ |

## Next Steps

1. Install Node.js from [nodejs.org](https://nodejs.org), then run `npm install` to resolve dependencies
2. Set up WatermelonDB schema and sync engine
3. Build NestJS backend with PostgreSQL
4. Implement real authentication (JWT with tenant + role claims)
5. Connect mock data to actual local database queries
