-- =================================================================
-- marahuyo — extend work_kind enum
-- Adds article, story, note alongside the original poem/essay/oneshot/series.
-- Lets the picker on /studio/works/new offer more than 3 buckets without
-- losing the discriminator that drives per-kind rendering.
-- =================================================================

alter type work_kind add value if not exists 'article';
alter type work_kind add value if not exists 'story';
alter type work_kind add value if not exists 'note';
