DROP TYPE IF EXISTS categ_produse;
DROP TYPE IF EXISTS tipuri_produse;

CREATE TYPE categ_produse AS ENUM( 'carte', 'album', 'boardgame', 'merch', 'scolar');
CREATE TYPE tipuri_produse AS ENUM('adulti', 'adolescenti', 'copii', 'toti');


CREATE TABLE IF NOT EXISTS produse (
   id serial PRIMARY KEY,
   nume VARCHAR(50) UNIQUE NOT NULL,
   descriere TEXT,
   pret NUMERIC(8,2) NOT NULL,   
   tip_produs tipuri_produse DEFAULT 'toti',
   categorie categ_produse DEFAULT 'carte',
   cantitate NUMERIC(4,0),  
   gen VARCHAR [] NOT NULL,
   caracteristici TEXT,
   imagine VARCHAR(300),
   livrare BOOLEAN DEFAULT TRUE,
   data_adaugarii DATE
);

CREATE USER andreea WITH ENCRYPTED PASSWORD 'admin';
GRANT ALL PRIVILEGES ON DATABASE produse TO andreea ;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO andreea;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO andreea;

INSERT into produse (nume, descriere, pret, tip_produs, categorie, cantitate, gen, caracteristici, imagine, livrare, data_adaugarii) VALUES 
('"Enigma Otiliei" de George Calinescu', 'Ceva ceva despre sugar daddies', 19.99, 'adulti', 'carte', 40, '{"realist"}', 'lung, balzacian, romanesc', 'enigma.jpg', TRUE, '2022-02-11'),
('"Sticletele" de Donna Tartt', 'Ceva ceva opera de arta', 34.99, 'adolescenti', 'carte', 23, '{"thriller"}', 'suspans, coming-of-age, arta', 'sticletele.jpg', TRUE, '2019-09-12'),
('Solitaire - Alice Oseman', 'Ceva ceva gagica trista si edgy', 39.99, 'adolescenti', 'carte', 25, '{"YA"}', 'liceu, coming-of-age, engleza', 'solitaire.jpg', TRUE, '2019-09-12'),
('"Demonii" de Feodor Dostoievski', 'Ceva ceva rusesc', 35.99, 'adulti', 'carte', 10, '{"fictiune filozofica"}', 'lung, foarte lung, mega lung', 'demonii.jpg', TRUE, '2014-11-20' ),
('Universul in culori - Lydia Alexai', 'Carte de colorat pt adulti cu prea mult timp', 42.99, 'adulti', 'carte', 5, '{"colorat"}', 'culori, creioane, carioci', 'universul.jpg', FALSE, '2023-06-15');