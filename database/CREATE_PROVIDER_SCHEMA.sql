-- Schema for Provider Registration and Categories

-- Table to store service categories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Table to store provider registration requests
CREATE TABLE provider_requests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Update providers table to include category_id
ALTER TABLE providers
ADD COLUMN category_id INT,
ADD FOREIGN KEY (category_id) REFERENCES categories(id);