alter table public.restaurant_settings
  add column facebook text not null default '',
  add column tiktok text not null default '',
  add column google_rating numeric(2,1) check (google_rating is null or (google_rating >= 0 and google_rating <= 5)),
  add column google_reviews_count int check (google_reviews_count is null or google_reviews_count >= 0),
  add column google_review_url text not null default '';