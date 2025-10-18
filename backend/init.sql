-- Drop tables if they exist (for clean re-initialization)
DROP TABLE IF EXISTS project_outcomes CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS positions_history CASCADE;
DROP TABLE IF EXISTS experiences CASCADE;
DROP TABLE IF EXISTS education CASCADE;
DROP TABLE IF EXISTS competencies CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS languages CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS skills_taxonomy CASCADE;

-- Create skills_taxonomy table (from Function-Skills.csv)
CREATE TABLE skills_taxonomy (
    id SERIAL PRIMARY KEY,
    function_area VARCHAR(255) NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    UNIQUE(function_area, specialization)
);

-- Create employees table
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    office_location VARCHAR(100),
    job_title VARCHAR(100),
    department VARCHAR(100),
    unit VARCHAR(150),
    line_manager VARCHAR(255),
    in_role_since DATE,
    hire_date DATE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Languages spoken by employees
CREATE TABLE languages (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) REFERENCES employees(employee_id) ON DELETE CASCADE,
    language VARCHAR(50),
    proficiency VARCHAR(50),
    UNIQUE(employee_id, language)
);

-- Skills possessed by employees
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) REFERENCES employees(employee_id) ON DELETE CASCADE,
    function_area VARCHAR(255),
    specialization VARCHAR(255),
    skill_name VARCHAR(255)
);

-- Competencies of employees
CREATE TABLE competencies (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) REFERENCES employees(employee_id) ON DELETE CASCADE,
    name VARCHAR(255),
    level VARCHAR(50),
    UNIQUE(employee_id, name)
);

-- Employee experiences 
CREATE TABLE experiences (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) REFERENCES employees(employee_id) ON DELETE CASCADE,
    type VARCHAR(50),
    organization VARCHAR(100),
    program VARCHAR(150),
    start_date DATE,
    end_date DATE,
    focus TEXT
);

-- Employee position history
CREATE TABLE positions_history (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) REFERENCES employees(employee_id) ON DELETE CASCADE,
    role_title VARCHAR(100),
    organization VARCHAR(100),
    start_date DATE,
    end_date DATE,
    focus_area TEXT[],
    key_skills_used TEXT[]
);

-- Projects undertaken by employees
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) REFERENCES employees(employee_id) ON DELETE CASCADE,
    project_name VARCHAR(255),
    start_date DATE,
    end_date DATE,
    role VARCHAR(100),
    description TEXT
);

-- Project outcomes
CREATE TABLE project_outcomes (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    outcome TEXT
);

-- Education details of employees
CREATE TABLE education (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) REFERENCES employees(employee_id) ON DELETE CASCADE,
    degree VARCHAR(100),
    institution VARCHAR(150),
    start_date DATE,
    end_date DATE,
    UNIQUE(employee_id, degree, institution)
);

-- Indexes for performance optimization
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_skills_employee ON skills(employee_id);
CREATE INDEX idx_skills_function ON skills(function_area);
CREATE INDEX idx_competencies_employee ON competencies(employee_id);
CREATE INDEX idx_projects_employee ON projects(employee_id);
CREATE INDEX idx_skills_taxonomy_function ON skills_taxonomy(function_area);