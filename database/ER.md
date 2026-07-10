# BrainBooster — Entity-Relationship Diagram

```mermaid
erDiagram
  users ||--o| progress : "has one cloud save"
  users ||--o{ purchases : "makes"
  users ||--o{ leaderboard : "ranks on"
  users ||--o{ analytics_events : "emits"

  users {
    uuid id PK
    text email UK
    text password_hash
    text role "parent|admin"
    boolean premium
    timestamptz created_at
  }
  progress {
    uuid user_id PK,FK
    jsonb snapshot "coins, xp, stars, badges, skills"
    timestamptz updated_at
  }
  purchases {
    bigserial id PK
    uuid user_id FK
    text platform "razorpay|google|apple"
    text reference UK
    integer amount_paise
  }
  content_riddles {
    bigserial id PK
    text question
    jsonb options
    integer answer_index
    integer min_tier
  }
  content_stories {
    bigserial id PK
    text title
    jsonb body
  }
  leaderboard {
    text board PK
    uuid user_id PK,FK
    integer score
  }
  analytics_events {
    bigserial id PK
    uuid user_id
    text event
    date day
    jsonb props
  }
  generated_activities {
    text id PK
    text topic
    jsonb payload
    text status "pending|approved|rejected"
    real quality
  }
```

## Notes
- **COPPA-friendly:** children have no accounts. Child profiles live inside `progress.snapshot`.
- `0001_init.sql` owns the shipping tables (users, progress, purchases, content_*).
- `0002_services.sql` adds the tables that back the extracted services (leaderboard, analytics, content generation queue). These are additive — the monolith server ignores them.
