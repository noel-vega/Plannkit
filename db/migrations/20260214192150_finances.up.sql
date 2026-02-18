CREATE TABLE IF NOT EXISTS finance_spaces (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_finance_spaces_created_at
ON finance_spaces(created_at);

CREATE INDEX idx_finance_spaces_user_id
ON finance_spaces(user_id);

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

CREATE TABLE IF NOT EXISTS finance_spaces_expenses (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    finance_space_id INT NOT NULL REFERENCES finance_spaces(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount INT NOT NULL,
    category TEXT NULL,
    description TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_finance_spaces_expenses_created_at
ON finance_spaces_expenses(created_at);

CREATE INDEX idx_finance_spaces_expenses_finance_space_id
ON finance_spaces_expenses(finance_space_id);

CREATE INDEX idx_finance_spaces_expenses_user_id
ON finance_spaces_expenses(user_id);

CREATE TABLE IF NOT EXISTS finance_spaces_income_sources (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  finance_space_id INT NOT NULL REFERENCES finance_spaces(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_finance_spaces_income_sources_finance_space_id
ON finance_spaces_income_sources(finance_space_id);

CREATE INDEX idx_finance_spaces_income_sources_user_id
ON finance_spaces_income_sources(user_id);

CREATE INDEX idx_finance_spaces_income_sources_created_at
ON finance_spaces_income_sources(created_at);


CREATE TABLE IF NOT EXISTS finance_spaces_goals (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  finance_space_id INT NOT NULL REFERENCES finance_spaces(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount INT NOT NULL,
  monthly_commitment INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_finance_spaces_goals_finance_space_id
ON finance_spaces_goals(finance_space_id);

CREATE INDEX idx_finance_spaces_goals_user_id
ON finance_spaces_goals(user_id);

CREATE INDEX idx_finance_spaces_goals_created_at
ON finance_spaces_goals(created_at);

CREATE TABLE IF NOT EXISTS finance_spaces_goals_commitments (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  finance_space_id INT NOT NULL REFERENCES finance_spaces(id) ON DELETE CASCADE,
  finance_space_goal_id INT NOT NULL REFERENCES finance_spaces_goals(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  note TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_finance_spaces_goals_commitments_finance_space_id
ON finance_spaces_goals_commitments(finance_space_id);

CREATE INDEX idx_finance_spaces_goals_commitments_finance_goal_id
ON finance_spaces_goals_commitments(finance_space_goal_id);

CREATE INDEX idx_finance_spaces_goals_commitments_user_id
ON finance_spaces_goals_commitments(user_id);

CREATE INDEX idx_finance_spaces_goals_commitments_created_at
ON finance_spaces_goals_commitments(created_at);












