CREATE DATABASE SECU;
USE SECU;

CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL,
    password NVARCHAR(50) NOT NULL
);

INSERT INTO users (username, password) VALUES ('admin', 'admin123');
