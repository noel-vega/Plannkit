CREATE TABLE IF NOT EXISTS habits (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    completion_type VARCHAR(20) NOT NULL DEFAULT 'step',
    completions_per_day int NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_completion_type CHECK (completion_type IN ('step', 'custom')),
    CONSTRAINT chk_completions_per_day CHECK (completions_per_day >= 1)
);

CREATE INDEX idx_habits_created_at ON habits(created_at);
