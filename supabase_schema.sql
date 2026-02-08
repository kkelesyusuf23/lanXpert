BEGIN;

CREATE TABLE alembic_version (
    version_num VARCHAR(32) NOT NULL, 
    CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);

-- Running upgrade  -> 1c1819265ad8

CREATE TABLE languages (
    id VARCHAR NOT NULL, 
    code VARCHAR, 
    name VARCHAR, 
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX ix_languages_code ON languages (code);

CREATE TABLE plans (
    id VARCHAR NOT NULL, 
    name VARCHAR, 
    price NUMERIC, 
    daily_word_limit INTEGER, 
    daily_question_limit INTEGER, 
    daily_answer_limit INTEGER, 
    daily_article_limit INTEGER, 
    is_active BOOLEAN, 
    PRIMARY KEY (id), 
    UNIQUE (name)
);

CREATE TABLE roles (
    id VARCHAR NOT NULL, 
    name VARCHAR, 
    PRIMARY KEY (id), 
    UNIQUE (name)
);

CREATE TABLE site_settings (
    key VARCHAR NOT NULL, 
    value VARCHAR, 
    updated_at TIMESTAMP WITH TIME ZONE, 
    PRIMARY KEY (key)
);

CREATE TABLE users (
    id VARCHAR NOT NULL, 
    username VARCHAR, 
    email VARCHAR, 
    password_hash VARCHAR, 
    native_language_id VARCHAR, 
    target_language_id VARCHAR, 
    interface_language_id VARCHAR, 
    plan_id VARCHAR, 
    email_verified BOOLEAN, 
    phone_verified BOOLEAN, 
    is_active BOOLEAN, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP), 
    updated_at TIMESTAMP WITH TIME ZONE, 
    deleted_at TIMESTAMP WITH TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(interface_language_id) REFERENCES languages (id), 
    FOREIGN KEY(native_language_id) REFERENCES languages (id), 
    FOREIGN KEY(plan_id) REFERENCES plans (id), 
    FOREIGN KEY(target_language_id) REFERENCES languages (id)
);

CREATE UNIQUE INDEX ix_users_email ON users (email);

CREATE UNIQUE INDEX ix_users_username ON users (username);

CREATE TABLE words (
    id VARCHAR NOT NULL, 
    language_id VARCHAR, 
    word VARCHAR, 
    meaning TEXT, 
    level VARCHAR, 
    is_active BOOLEAN, 
    PRIMARY KEY (id), 
    FOREIGN KEY(language_id) REFERENCES languages (id)
);

CREATE TABLE admin_actions (
    id VARCHAR NOT NULL, 
    admin_id VARCHAR, 
    action VARCHAR, 
    target_table VARCHAR, 
    target_id VARCHAR, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP), 
    PRIMARY KEY (id), 
    FOREIGN KEY(admin_id) REFERENCES users (id)
);

CREATE TABLE articles (
    id VARCHAR NOT NULL, 
    user_id VARCHAR, 
    language_id VARCHAR, 
    title VARCHAR, 
    content TEXT, 
    is_published BOOLEAN, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP), 
    PRIMARY KEY (id), 
    FOREIGN KEY(language_id) REFERENCES languages (id), 
    FOREIGN KEY(user_id) REFERENCES users (id)
);

CREATE TABLE content_moderation (
    id VARCHAR NOT NULL, 
    content_type VARCHAR, 
    content_id VARCHAR, 
    status VARCHAR, 
    moderator_id VARCHAR, 
    PRIMARY KEY (id), 
    FOREIGN KEY(moderator_id) REFERENCES users (id)
);

CREATE TABLE login_logs (
    id VARCHAR NOT NULL, 
    user_id VARCHAR, 
    ip_address VARCHAR, 
    user_agent VARCHAR, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP), 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES users (id)
);

CREATE TABLE notification_settings (
    user_id VARCHAR NOT NULL, 
    email_enabled BOOLEAN, 
    in_app_enabled BOOLEAN, 
    PRIMARY KEY (user_id), 
    FOREIGN KEY(user_id) REFERENCES users (id)
);

CREATE TABLE notifications (
    id VARCHAR NOT NULL, 
    user_id VARCHAR, 
    title VARCHAR, 
    message TEXT, 
    is_read BOOLEAN, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP), 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES users (id)
);

CREATE TABLE questions (
    id VARCHAR NOT NULL, 
    user_id VARCHAR, 
    source_language_id VARCHAR, 
    target_language_id VARCHAR, 
    question_text TEXT, 
    description TEXT, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP), 
    is_active BOOLEAN, 
    PRIMARY KEY (id), 
    FOREIGN KEY(source_language_id) REFERENCES languages (id), 
    FOREIGN KEY(target_language_id) REFERENCES languages (id), 
    FOREIGN KEY(user_id) REFERENCES users (id)
);

CREATE TABLE rate_limit_logs (
    id VARCHAR NOT NULL, 
    user_id VARCHAR, 
    action_type VARCHAR, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP), 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES users (id)
);

CREATE TABLE refresh_tokens (
    id VARCHAR NOT NULL, 
    token VARCHAR, 
    user_id VARCHAR, 
    expires_at TIMESTAMP WITHOUT TIME ZONE, 
    revoked BOOLEAN, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP), 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES users (id)
);

CREATE UNIQUE INDEX ix_refresh_tokens_token ON refresh_tokens (token);

CREATE TABLE user_daily_limits (
    id VARCHAR NOT NULL, 
    user_id VARCHAR, 
    date DATE, 
    used_words INTEGER, 
    used_questions INTEGER, 
    used_answers INTEGER, 
    used_articles INTEGER, 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES users (id)
);

CREATE TABLE user_roles (
    user_id VARCHAR NOT NULL, 
    role_id VARCHAR NOT NULL, 
    PRIMARY KEY (user_id, role_id), 
    FOREIGN KEY(role_id) REFERENCES roles (id), 
    FOREIGN KEY(user_id) REFERENCES users (id)
);

CREATE TABLE word_logs (
    id VARCHAR NOT NULL, 
    user_id VARCHAR, 
    word_id VARCHAR, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP), 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES users (id), 
    FOREIGN KEY(word_id) REFERENCES words (id)
);

CREATE TABLE answers (
    id VARCHAR NOT NULL, 
    question_id VARCHAR, 
    user_id VARCHAR, 
    answer_text TEXT, 
    is_edited BOOLEAN, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP), 
    updated_at TIMESTAMP WITH TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(question_id) REFERENCES questions (id), 
    FOREIGN KEY(user_id) REFERENCES users (id)
);

CREATE TABLE answer_reports (
    id VARCHAR NOT NULL, 
    answer_id VARCHAR, 
    user_id VARCHAR, 
    reason VARCHAR, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP), 
    PRIMARY KEY (id), 
    FOREIGN KEY(answer_id) REFERENCES answers (id), 
    FOREIGN KEY(user_id) REFERENCES users (id)
);

CREATE TABLE answer_votes (
    id VARCHAR NOT NULL, 
    answer_id VARCHAR, 
    user_id VARCHAR, 
    vote_type BOOLEAN, 
    PRIMARY KEY (id), 
    FOREIGN KEY(answer_id) REFERENCES answers (id), 
    FOREIGN KEY(user_id) REFERENCES users (id)
);

INSERT INTO alembic_version (version_num) VALUES ('1c1819265ad8') RETURNING alembic_version.version_num;

COMMIT;

