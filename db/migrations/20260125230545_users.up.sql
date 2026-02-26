
CREATE TABLE IF NOT EXISTS users (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar TEXT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username
ON users(username);

CREATE INDEX idx_users_created_at
ON users(created_at);

CREATE TABLE IF NOT EXISTS followers (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    follower_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_user_id, following_user_id),
    CHECK(follower_user_id != following_user_id),
    CHECK (status IN ('pending', 'accepted'))
);

CREATE INDEX idx_followers_following_user_id
ON followers(following_user_id);
