CREATE TABLE IF NOT EXISTS habit_routines (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_habit_routines_created_at 
ON habit_routines(created_at);

CREATE TABLE IF NOT EXISTS habits (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    routine_id INT REFERENCES habit_routines(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon TEXT NOT NULL DEFAULT 'Activity',
    completion_type VARCHAR(20) NOT NULL DEFAULT 'step',
    completions_per_day INT NOT NULL DEFAULT 1,
    unit_of_measurement VARCHAR(20) NOT NULL DEFAULT 'times',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_completion_type CHECK (completion_type IN ('step', 'custom')),
    CONSTRAINT chk_unit_of_measurement CHECK (unit_of_measurement IN ('minutes', 'times', 'reps')),
    CONSTRAINT chk_completions_per_day CHECK (completions_per_day >= 1)
);

CREATE INDEX idx_habits_created_at 
ON habits(created_at);
CREATE INDEX idx_habits_routine_id 
ON habits(routine_id);


CREATE TABLE IF NOT EXISTS habit_contributions (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    habit_id INT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    completions INT NOT NULL DEFAULT 1,
    date TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_habit_contributions_habit_id 
ON habit_contributions(habit_id);

CREATE INDEX idx_habit_contributions_created_at
ON habit_contributions(created_at);

CREATE UNIQUE INDEX idx_habit_contributions_date 
ON habit_contributions(habit_id, date);
