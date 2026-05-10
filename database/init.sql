-- ============================================================
-- TYPES ENUM
-- Créés avant les tables qui les utilisent
-- ============================================================

-- ENUM types
CREATE TYPE gender_type AS ENUM (
    'male',
    'female', 
    'other'
);
CREATE TYPE sexual_preference_type AS ENUM (
    'male', 
    'female', 
    'both'
);

-- ============================================================
-- TABLE : users
-- Profil principal de l'utilisateur
-- ============================================================

CREATE TABLE users (
    id                          SERIAL PRIMARY KEY,
    username                    VARCHAR(50)  NOT NULL UNIQUE,
    email                       VARCHAR(255) NOT NULL UNIQUE,
    first_name                  VARCHAR(255) NOT NULL,
    last_name                   VARCHAR(255) NOT NULL,
    password_hash               VARCHAR(255) NOT NULL,
    gender                      gender_type,
    sexual_preference           sexual_preference_type,
    bio                         TEXT,
    is_verified                 BOOLEAN NOT NULL DEFAULT FALSE,
    fame_rating                 INT NOT NULL DEFAULT 0,
    latitude                    FLOAT,
    longitude                   FLOAT,
    city                        VARCHAR(255),
    email_token                 VARCHAR(255),
    email_token_expires_at      TIMESTAMPTZ,
    reset_password_token        VARCHAR(255),
    reset_password_expires_at   TIMESTAMPTZ,
    is_online                   BOOLEAN NOT NULL DEFAULT FALSE,
    last_seen_at                TIMESTAMPTZ,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- tags
CREATE TABLE tags (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- user_tags
CREATE TABLE user_tags (
    user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tag_id      INT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, tag_id)
);

-- views
CREATE TABLE views (
    id              SERIAL PRIMARY KEY,
    viewer_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    viewed_user_id  INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    viewed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_views_no_self_view CHECK (viewer_id != viewed_user_id)
);

-- photos
CREATE TABLE photos (
    id                  SERIAL PRIMARY KEY,
    is_profile_picture  BOOLEAN NOT NULL DEFAULT FALSE,
    user_id             INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_url           VARCHAR(500) NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- likes
CREATE TABLE likes (
    id              SERIAL PRIMARY KEY,
    liker_id        INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    liked_user_id   INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_likes_no_self_like CHECK (liker_id != liked_user_id),
    CONSTRAINT uq_likes UNIQUE (liker_id, liked_user_id)
);

-- blocks
CREATE TABLE blocks (
    id              SERIAL PRIMARY KEY,
    blocker_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_blocks_no_self_block CHECK (blocker_id != blocked_user_id),
    CONSTRAINT uq_blocks UNIQUE (blocker_id, blocked_user_id)
);

-- reports
CREATE TABLE reports (
    id                  SERIAL PRIMARY KEY,
    reporter_id         INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason              TEXT,
    reported_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_reports_no_self_report CHECK (reporter_id != reported_user_id)
);

-- ============================================================
-- INDEX
-- ============================================================
CREATE INDEX idx_photos_user_id ON photos(user_id);
CREATE INDEX idx_views_viewer_id ON views(viewer_id);
CREATE INDEX idx_views_viewed_user_id ON views(viewed_user_id);
CREATE INDEX idx_likes_liker_id ON likes(liker_id);
CREATE INDEX idx_likes_liked_user_id ON likes(liked_user_id);
CREATE INDEX idx_blocks_blocker_id ON blocks(blocker_id);
CREATE INDEX idx_blocks_blocked_user_id ON blocks(blocked_user_id);
CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX idx_reports_reported_user_id ON reports(reported_user_id);