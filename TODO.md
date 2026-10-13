# YARA Platform — Master Implementation Status & Roadmap (v3.3)

**Motto:** "Innovate Local, Build Global"  
**Database Schema Target:** v3.3.0

---

## 1. Golden Rules Compliance
- [x] **No table / schema alterations:** All frontend components query existing tables, views, and RPCs exclusively without altering table structures or creating migrations.
- [x] **Zero hardcoding:** Courses, chapters, modules, events, competitions, library items, team members, and site copy are loaded dynamically from Supabase database tables/views.
- [x] **Zero client-side grading:** Quiz grading, module access calculations, certificate issuance, and course progress are calculated exclusively through server-side RPC functions (`can_access_module`, `start_quiz`, `submit_quiz`, `issue_course_certificate`).
- [x] **Anon key only:** Never expose or ship the Supabase service-role key to the browser.
- [x] **Rural & low-data first:** PWA offline caching, 2G/3G low-data mode, lazy image loading with file sizes displayed before download, and text-first offline worksheets.

---

## 2. Features & Coming-Soon States
The following features are cleanly handled with "Coming Soon" indicators in the interface pending external service integrations:

### A. Communications
- **SMS Broadcasting:** Listed as "Coming Soon" in the Admin Messaging Console (SMS gateway credentials to be configured via Twilio / Africa's Talking). Currently, Email (`send-member-emails`) and WhatsApp Click-to-Chat are live.

### B. Offline Synchronisation
- **IndexedDB Sync:** Queues offline study events locally and syncs them automatically to `sync_offline_progress` when an active connection returns.
- **Offline Pack Downloads:** Powered by the storage bucket `offline-packs` and logged via `record_offline_pack_download`.

### C. Language Localisation
- **Platform Languages:** English, chiShona, and isiNdebele. Additional indigenous African languages can be added via `platform_languages` table in the database and loaded via `get_translations`.
