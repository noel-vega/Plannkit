CREATE TABLE IF NOT EXISTS finance_spaces (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_finance_spaces_created_at
ON finance_spaces(created_at);

CREATE TABLE IF NOT EXISTS finance_spaces_members (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    finance_space_id INT NOT NULL REFERENCES finance_spaces(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(finance_space_id, user_id)
);

CREATE INDEX idx_finance_spaces_members_created_at
ON finance_spaces_members(created_at);

CREATE INDEX idx_finance_spaces_members_finance_space_id
ON finance_spaces_members(finance_space_id);

CREATE INDEX idx_finance_spaces_members_user_id
ON finance_spaces_members(user_id);

