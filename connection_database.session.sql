--@block
DROP DATABASE investigacion_docente 

--@block
CREATe DATABASE IF NOT EXISTS investigacion_docente;

--@block
USE investigacion_docente;
INSERT INTO Roles (nombre)
VALUES ('investigator'),
    ('director');
INSERT INTO linea_investigacion (nombre, descripcion, activo)
VALUES (
        'Inteligencia Artificial',
        'Investigación en el campo de la inteligencia artificial y aprendizaje automático.',
        TRUE
    ),
    (
        'Biotecnología',
        'Investigación en biotecnología y sus aplicaciones en la medicina y la agricultura.',
        TRUE
    ),
    (
        'Energías Renovables',
        'Investigación en fuentes de energía renovable y tecnologías sostenibles.',
        TRUE
    ),
    (
        'Ciencias del Espacio',
        'Investigación en astronomía, astrofísica y exploración espacial.',
        TRUE
    );
INSERT INTO proyect_states (nombre)
VALUES ('en curso'),
    ('terminado');
INSERT INTO periodo_investigacion (nombre)
VALUES ('Periodo 1') 

--@block
USE investigacion_docente;
INSERT INTO users (
        name,
        name_paterno,
        name_materno,
        email,
        password,
        role_id
    )
VALUES (
        'John',
        'Doe',
        'Smith',
        '74875111@continental.edu.pe',
        '$2a$10$2KJUeALYwGIC/dyoD0/kwuWIPeo8YYwzaUwfbUxRj4jxO2divzMTK',
        2
    ),
    (
        'Leonardo',
        'Araujo',
        'Huamani',
        '74875112@continental.edu.pe',
        '$2a$10$2KJUeALYwGIC/dyoD0/kwuWIPeo8YYwzaUwfbUxRj4jxO2divzMTK',
        1
    ),
    (
        'Leonardo',
        'Araujo',
        '2',
        '74875113@continental.edu.pe',
        '$2a$10$2KJUeALYwGIC/dyoD0/kwuWIPeo8YYwzaUwfbUxRj4jxO2divzMTK',
        1
    );
-- Insertar datos en la tabla EntregaEstado
INSERT INTO entrega_estado (id, nombre)
VALUES (1, 'En Proceso'),
    (2, 'Completado');
-- Insertar datos en la tabla EntregaTipo
INSERT INTO entrega_tipo (id, nombre)
VALUES (1, 'Avance'),
    (2, 'Presentacion final');


