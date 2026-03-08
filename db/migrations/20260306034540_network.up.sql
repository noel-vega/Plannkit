CREATE TABLE IF NOT EXISTS network_followers (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    follower_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_user_id, following_user_id),
    CHECK(follower_user_id != following_user_id),
    CHECK (status IN ('pending', 'accepted'))
);

CREATE INDEX idx_network_followers_follower_user_id
ON network_followers(follower_user_id);

CREATE INDEX idx_followers_following_user_id
ON network_followers(following_user_id);

CREATE TABLE IF NOT EXISTS network_connections (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_1_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_2_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requested_by_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_1_id, user_2_id),
    CHECK(user_1_id < user_2_id),
    CHECK (status IN ('pending', 'accepted'))
);

CREATE INDEX idx_network_connections_user_1_id
ON network_connections(user_1_id);

CREATE INDEX idx_network_connections_user_2_id
ON network_connections(user_2_id);

CREATE INDEX idx_network_connections_requested_by_user_id
ON network_connections(requested_by_user_id);
