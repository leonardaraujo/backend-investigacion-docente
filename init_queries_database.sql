
--@block
DROP DATABASE IF EXISTS investigacion_docente;
--@block
CREATe DATABASE IF NOT EXISTS investigacion_docente;
--@block
USE investigacion_docente;
--@block
INSERT INTO users (
        name,
        paternal_surname,
        maternal_surname,
        email,
        password,
        rol_id
    )
VALUES (
        'Leonardo',
        'Director',
        'UNCP',
        'director@uncp.edu.pe',
        '$2a$10$Joh1uhOcifzvb.fsd610SutNuJ7OIfIJn/jeVaIyK4UCg.9Oxlf7i',
        1
    ),
    (
        'Leonardo',
        'Revisor',
        'UNCP',
        'revisor@uncp.edu.pe',
        '$2a$10$Joh1uhOcifzvb.fsd610SutNuJ7OIfIJn/jeVaIyK4UCg.9Oxlf7i',
        2
    ),
    (
        'Ramiro',
        'Perez',
        'Lopez',
        '74875111@continental.edu.pe',
        '$2a$10$Joh1uhOcifzvb.fsd610SutNuJ7OIfIJn/jeVaIyK4UCg.9Oxlf7i',
        3
    ),
    (
        'Leonardo',
        'Torres',
        'Guzman',
        'leonardodanielaraujohuamani@gmail.com',
        '$2a$10$Joh1uhOcifzvb.fsd610SutNuJ7OIfIJn/jeVaIyK4UCg.9Oxlf7i',
        3
    ),
    (
        'Daniel',
        'Pereira',
        'Garcia',
        'leonardo_oct@hotmail.com',
        '$2a$10$Joh1uhOcifzvb.fsd610SutNuJ7OIfIJn/jeVaIyK4UCg.9Oxlf7i',
        3
    );



--@block
INSERT INTO reviews (
        user_id,
        status_review_id,
        review_date,
        observation_id,
        comments
    )
VALUES (
        2,
        1,
        '2025-02-16',
        NULL,
        'Revisión de prueba'
    );
--@block
-- Insertar una observación
INSERT INTO observations (
        start_date,
        finish_date,
        status_observation_id,
        doc_file_route_id,
        comments
    )
VALUES (
        '2025-02-15',
        '2025-02-16',
        1,
        NULL,
        'Observación de prueba'
    );
--@block
UPDATE reviews
SET observation_id = (
        SELECT id
        FROM observations
        ORDER BY id DESC
        LIMIT 1
    )
ORDER BY id DESC
LIMIT 1;
--@block
UPDATE project_deliveries
SET review_id = (
        SELECT id
        FROM reviews
        ORDER BY id DESC
        LIMIT 1
    )
WHERE id = 1;

--@block
UPDATE research_periods
SET doc_file_route_id = NULL
WHERE id = 5;