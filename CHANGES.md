# YARA Master Schema Migration v3.1.0 — Architecture & Migration Audit Changelog

## Executive Summary
This document provides a complete audit of the fixes applied to the YARA (Young Africans Robotics Association) master database schema (`database.sql` / `01_schema_fixed.sql`), the live cleanup migration (`00_cleanup_mock_data.sql`), the staging and bulk ingestion system (`02_staging_and_import.sql`), the standard CSV upload templates (`/templates/*.csv`), and the Admin upload interface (`DataUploadManager.tsx`).

All mock data, placeholder URLs, and test records have been excised. The schema is 100% idempotent, robust against older database versions, and hardened against security vulnerabilities.

---

## 1. Legacy Schema Conflicts & Bugs Resolved (Part 1)

### 1.1 Resolution of `ERROR 23502: null value in column "reference_id" of relation "impact_ledger"`
* **Root Cause**: `CREATE TABLE IF NOT EXISTS public.impact_ledger` was skipped because an older migration (`2026-09-02-impact-ledger-media-posts-and-admin-management.sql`) had already instantiated `impact_ledger` with `reference_id TEXT NOT NULL`. When master inserts attempted to seed metric summaries without `reference_id`, PostgreSQL aborted execution.
* **Fix**:
  1. Implemented a reusable, non-destructive helper function: `public.relax_legacy_not_null(p_table TEXT, p_keep TEXT[])`. It inspects `information_schema.columns` and runs `ALTER COLUMN ... DROP NOT NULL` on any legacy NOT NULL column that is neither part of the primary key nor in the intended preserved list.
  2. Applied `relax_legacy_not_null` immediately in a preflight diagnostic block on `impact_ledger`, `chapters`, `competitions`, `events`, `event_registrations`, and other legacy tables.
  3. Completely removed mock metric seed inserts that were causing the constraint failure.

### 1.2 Deduplication of Shadowed Table Definitions
Four core tables were defined twice in `database.sql` with divergent column structures (the second `CREATE TABLE IF NOT EXISTS` was silently skipped by PostgreSQL):
* **`events`**: Merged Section 14 (line 987) and Section 27 (line 3501) into a single unified table containing the complete union of columns (`id`, `title`, `slug`, `description`, `category`, `event_date`, `end_date`, `start_time`, `end_time`, `venue`, `is_virtual`, `virtual_meeting_url`, `image_url`, `registration_link`, `capacity`, `registered_count`, `fee_usd`, `registration_fee_usd`, `is_upcoming`, `is_published`, `created_at`, `updated_at`).
* **`event_registrations`**: Merged Section 14 (line 1007) and Section 27 (line 3533) into a single master definition containing financial, institutional, and ticketing fields (`registration_code`, `payment_status`, `payment_method`, `continuous_support_opt_in`, `role_title`, `school_institution`, etc.).
* **`notifications`**: Merged Section 15 (line 1022) and Section 30 (line 3781), harmonizing notification types and supporting both `action_url` and `link`.
* **`training_registrations`**: Merged Section 03 (line 229) and Section 24 (line 2998), unifying certificate issuing fields, school linkages, and status workflows.

### 1.3 Deduplication & Idempotent `ON CONFLICT` Guarantees
* **`course_projects`**: Replaced bare `ON CONFLICT DO NOTHING;` with a unique index `CREATE UNIQUE INDEX IF NOT EXISTS course_projects_course_type_idx ON public.course_projects (course_id, project_type);` and an explicit `ON CONFLICT (course_id, project_type) DO UPDATE SET ...` to prevent row duplication on repeated runs.
* **`competition_categories`**: Added `CREATE UNIQUE INDEX IF NOT EXISTS competition_categories_comp_name_idx ON public.competition_categories (competition_id, name);` and targeted upsert.
* **`chapters`**: Added `CREATE UNIQUE INDEX IF NOT EXISTS chapters_name_idx ON public.chapters (name);`.
* **`courses`**: Deduplicated course definitions (see Section 2.2 below).

### 1.4 CHECK Constraint Harmonization
* **`competitions.status`**: Expanded check constraint from restrictive values to include `'active'` alongside `'draft'`, `'registration_open'`, `'registration_closed'`, `'live'`, `'completed'`.
* **`courses.track`**: Expanded check constraint to allow `'Technology'`, `'Specialized'`, and `'General'` in addition to `'Robotics'`, `'Coding'`, `'Artificial Intelligence'`, `'IoT'`, `'Engineering'`, `'STEM'`, `'Digital Literacy'`, `'Kids'`.

### 1.5 Security & RLS Policy Isolation
* **Bulk DO Block Split (Section 32)**: Previously, over 60 RLS policies were wrapped in a single `DO $$ BEGIN ... EXCEPTION WHEN OTHERS THEN NULL; END $$;`. Any minor column mismatch aborted the entire block and skipped all remaining policies silently. Replaced with `public.safely_apply_policy(...)` procedure, isolating each policy creation and logging diagnostic `NOTICE`s on skipped items.
* **Tightened Overly Permissive Policies**:
  * `public.profiles`: Prevented unauthenticated open modifications.
  * `public.mentorship_messages`: Replaced `USING (true)` with sender/recipient/admin access.
  * `public.chapter_reports`: Restricted visibility to authenticated chapter members and administrators.
  * `public.study_materials`: Required authentication or admin role.
  * `storage.objects`: Fixed critical flaw where any authenticated user could execute `UPDATE` on files; enforced `(owner = auth.uid() OR public.is_admin())` and created dedicated admin-only policies for `data-uploads`.
* **RBAC Hardening (`is_admin()`)**: Removed reliance on hardcoded plaintext email addresses (`goyaracorp@gmail.com`, `admin@yara.org`, `director@yara.org`). The function now strictly enforces role-based access control via `public.profiles.role IN ('admin', 'super_admin')`.
* **Function Hardening (`refresh_course_progress`)**:
  * Explicitly declared `SET search_path = public` to defeat search-path hijack attacks.
  * Added caller validation: rejects invocations if `auth.uid() <> p_user_id` and caller is not an administrator.

### 1.6 Resolution of `ERROR 42P01: relation "public.notifications" does not exist`
* **Root Cause**: During table deduplication, the primary `CREATE TABLE IF NOT EXISTS public.notifications` and `public.events` statements were mistakenly consolidated down in Sections 27 & 30, leaving empty comments in Sections 14 & 15. However, Section 22 (lines 1305, 1327, 1345, 1346) immediately executed bare top-level `ALTER TABLE public.notifications`, `CREATE INDEX`, and `ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;` before Sections 27 & 30 were reached.
* **Fix**:
  1. Relocated the unified, fully backward-compatible master table definitions for `public.events`, `public.event_registrations`, and `public.event_meetings` back up into **Section 14**.
  2. Relocated the unified master table definition for `public.notifications` (including both `link` and `action_url`) back up into **Section 15**.
  3. Replaced subsequent redundant re-declarations in Sections 27 & 30 with backward-compatibility notes.
  4. Added `IF EXISTS` guards to top-level `ALTER TABLE` statements in Section 22.
### 1.7 Excising Destructive `DELETE` Statements in Favor of Non-Destructive Upserts
* **Issue**: Seed inserts previously included pre-emptive `DELETE FROM public.courses`, `DELETE FROM public.competition_categories`, and `DELETE FROM public.training_programs` before running inserts. On live databases or rerun migrations, these deletes caused foreign-key cascade risks and threatened active student enrollment records.
* **Fix**: Removed all pre-insert `DELETE` statements. Relies strictly on idempotent unique indexes (`courses_pkey_idx`, `competitions_pkey_idx`, `training_programs_slug_idx`, `courses_slug_idx`) paired with `ON CONFLICT (...) DO UPDATE SET ...` and `ON CONFLICT (...) DO NOTHING;`.

### 1.8 v3.2.0 Privilege Escalation Guards & Backend Authorization
* **`is_backend_caller()`**: Created STABLE helper function verifying if caller is SQL Editor / migrations or `service_role` (never treating untrusted anonymous calls as trusted).
* **`guard_profile_privileged_fields()` Trigger**: Enforced database-level protection blocking non-admin users from escalating `role`, `is_verified`, `registration_paid`, `amount_paid`, `commission_*`, or `is_executive_auditor` on `public.profiles`.
* **Stored Procedure Authorization**:
  * `refresh_course_progress()`: Validates that caller is either the profile owner, an admin, or backend service role.
  * `admin_add_course_module()`: Validates caller role before allowing curriculum modifications.
* **`ensure_chapter_fk()` Helper**: Dynamically detects column data type (`TEXT` vs `UUID`) on `public.chapters(id)` across legacy and new schemas, preventing `ERROR 42804` foreign key mismatch.

### 1.9 Section 36: Full 100% RLS Coverage (23 Previously Open Tables Secured)
* Enabled Row Level Security on all 23 previously un-RLS'd tables (`school_clubs`, `school_rosters`, `training_sessions`, `course_resources`, `quizzes`, `quiz_questions`, `quiz_submissions`, `teacher_lesson_plans`, `competition_prep_guides`, `robotics_inspection_checklists`, `competitions`, `competition_categories`, `competition_scores`, `certificate_verification_logs`, `projects`, `ideas`, `mentorship_sessions`, `live_rooms`, `chapters`, `partners`, `site_content`, `impact_ledger`, `financial_records`).
* Created and applied role-restricted policies using `public.safely_apply_policy(...)` ensuring 100% (92 of 92) platform tables are protected.

---

## 2. Removal of Mock & Test Data (Part 2)

### 2.1 Removed Mock Seed Records
The following mock rows have been completely removed from `01_schema_fixed.sql` and `database.sql`, and targeted for deletion in `00_cleanup_mock_data.sql`:
1. **Impact Ledger**: Fake statistics (`learners_reached_mashwest`, `teachers_upskilled`, `secondary_schools_equipped`, `girls_in_robotics_percentage`).
2. **Chapters**: Fake chapter (`Mashonaland West Provincial Chapter`, 1200 members, 14 schools).
3. **Sponsors**: Demo sponsors (`African STEM Advancement Foundation`, `Apex Microelectronics & Robotics Lab`).
4. **Quizzes**: Dummy brainstorming questions (`Circuit Voltage Division Under Load`, `Sensor Noise & Non-Blocking Ultrasonic Ranging`).
5. **Testimonials**: Fabricated entries (`Farai Chitepo`, `Ruvimbo Masawi`, `Eng. Kudakwashe Moyo`).
6. **Executive Auditors**: Hardcoded test auditors (`exec_1`, `exec_2`).

### 2.2 Deduplicated Course Seed
* **Decision**: Kept Section 23's canonical 3 Robotics Courses (`00000000-0000-0000-0000-000000000001`, `00000000-0000-0000-0000-000000000002`, `00000000-0000-0000-0000-000000000003`) because all 37 comprehensive modules, guided labs, assignments, and capstone projects reference these specific UUID foreign keys.
* **Action**: Removed duplicate course inserts from Section 18 (`robotics-beginner`, `robotics-intermediate`, `robotics-advanced`), while keeping non-duplicate secondary tracks (`python-robotics`, `scratch-junior`, `javascript-web-dev`, `ai-for-educators`, etc.).

### 2.3 Curriculum Structure Preservation & URL Neutralization
* Retained all **37 modules** (Level 1: 10 modules, Level 2: 12 modules, Level 3: 15 modules), all theory overviews, assignment instructions, equipment lists, rubrics, and troubleshooting guides.
* Neutralized placeholder and duplicate video links: set all `video_url` and `guided_lab_simulation_url` to `NULL` across all 37 modules. Ready for verified admin uploads.

---

## 3. Upload Containers, Staging & Ingestion System (Part 3)

### 3.1 Staging Tables (`02_staging_and_import.sql`)
Created 14 dedicated `staging_*` tables mirroring the production schema with `TEXT` columns for loose input parsing, alongside metadata columns:
* `status` (`pending` / `validated` / `rejected` / `imported`)
* `error_message`
* `batch_id`
* `uploaded_by`
* `uploaded_at`

Staging tables covered:
1. `staging_courses`
2. `staging_course_modules`
3. `staging_course_projects`
4. `staging_impact_ledger`
5. `staging_testimonials`
6. `staging_sponsors`
7. `staging_partners`
8. `staging_chapters`
9. `staging_schools`
10. `staging_events`
11. `staging_competitions`
12. `staging_competition_categories`
13. `staging_training_programs`
14. `staging_brainstorming_quizzes`

### 3.2 Ingestion Engine (`validate_*` & `import_*`)
* **Validation Functions**: `validate_<container>(p_batch_id UUID)` checks presence of required columns, formats, and sets `status = 'validated'` or `status = 'rejected'` with exact diagnostic messages.
* **Import Functions**: `import_<container>(p_batch_id UUID)` automatically runs the validation pass, type casts fields, and executes transactional `ON CONFLICT` upserts into the live production tables.
* **Storage Bucket**: Configured private `data-uploads` storage bucket with admin-only upload and read access.

### 3.3 CSV Templates (`/templates/*.csv`)
Generated 14 ready-to-use CSV templates with explicit header rows and clearly marked `[EXAMPLE TO DELETE]` sample rows.

### 3.4 Admin Ingestion UI (`src/components/admin/DataUploadManager.tsx`)
* Implemented container selector for all 14 entities.
* Integrated template downloader, CSV parser, preview table, batch validation, live DB import, and rejected rows CSV export.
* Embedded direct file uploader to Supabase Storage buckets for PDFs, videos, and schematics.
* Displays "No data yet. Upload a CSV to get started." empty state; zero mock data rendered.

---

## 4. Execution Order for Deployment

1. **Step 1 — Purge Existing Mock Data from Live Supabase Database**:
   Run `00_cleanup_mock_data.sql` in the Supabase SQL Editor.
2. **Step 2 — Execute Corrected Master Schema**:
   Run `01_schema_fixed.sql` (or `database.sql`) in the Supabase SQL Editor.
3. **Step 3 — Install Ingestion & Staging Infrastructure**:
   Run `02_staging_and_import.sql` in the Supabase SQL Editor.
4. **Step 4 — Upload Real Production Records**:
   Use the Admin Ingestion UI (`DataUploadManager.tsx`) or populated `/templates/*.csv` files.
