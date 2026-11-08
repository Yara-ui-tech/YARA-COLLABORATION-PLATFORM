-- ==============================================================================
-- 00_purge_all_courses_and_competitions.sql
-- YARA Platform: Complete Fresh Slate for Courses and Competitions
-- Run this in your Supabase SQL Editor to completely wipe all courses & competitions
-- ==============================================================================

BEGIN;

-- 1. Purge all child and parent tables related to courses
DELETE FROM public.course_resources;
DELETE FROM public.course_lessons;
DELETE FROM public.course_modules;
DELETE FROM public.course_project_submissions;
DELETE FROM public.course_projects;
DELETE FROM public.course_enrollments;
DELETE FROM public.module_progress;
DELETE FROM public.courses;

-- 2. Purge all competitions and tournament entries
DELETE FROM public.competition_submissions;
DELETE FROM public.competition_scores;
DELETE FROM public.competition_stages;
DELETE FROM public.competition_teams;
DELETE FROM public.competitions;
DELETE FROM public.yara_competition_registrations;
DELETE FROM public.yara_competition_scores;

COMMIT;

