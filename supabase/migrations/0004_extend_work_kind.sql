-- =================================================================
-- marahuyo — extend work_kind enum
-- Original enum (0001_init): poem, essay, oneshot, series.
-- This migration adds: article, story, note.
-- Final enum after running: poem, essay, oneshot, series, article, story, note.
-- Lets the picker on /studio/works/new offer six standalone buckets
-- (poem/essay/oneshot/article/story/note) + series, without losing the
-- discriminator that drives per-kind rendering.
-- =================================================================

alter type work_kind add value if not exists 'article';
alter type work_kind add value if not exists 'story';
alter type work_kind add value if not exists 'note';
