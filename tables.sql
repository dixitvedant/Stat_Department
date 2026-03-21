--DON'T ADD VALUES WHERE PRIMARY KEY IS AUTO-INCREMENTED LIKE GIVE BELOW 
/*
CREATE  TABLE Team_Attack(
    Attack_id INT PRIMARY KEY AUTO_INCREMENT,
    match_id INT,
    team_id INT NOT NULL,
    points INT NOT NULL,
    inning INT CHECK(inning IN (1,2)),
    phase VARCHAR(10) CHECK(phase IN ('Early','Mid','End')),
    FOREIGN KEY (match_id) REFERENCES Match_details(match_id),
    FOREIGN KEY (team_id) REFERENCES Team(team_id)
);

INSERT INTO Team_Attack (match_id, team_id, points, inning, phase)
VALUES
-- Inning 1
(1, 1, 3, 1, 'Early'),
(1, 2, 1, 1, 'Early'),
(1, 1, 4, 1, 'Mid'),
(1, 2, 3, 1, 'Mid'),

-- Inning 2
(1, 1, 2, 2, 'Early'),
(1, 2, 2, 2, 'Early'),
(1, 1, 3, 2, 'Mid'),
(1, 2, 5, 2, 'Mid');
*/

CREATE TABLE Player (
    player_id INT PRIMARY KEY AUTO_INCREMENT,
    team_id INT NOT NULL,
    player_name VARCHAR(50) NOT NULL,
    role VARCHAR(20),
        CHECK (role IN ('Attacker','Defender','All-Rounder','Unknown')),

    jersey_no INT NOT NULL,
    
    CONSTRAINT chk_jersey_range 
        CHECK (jersey_no BETWEEN 1 AND 15),

    CONSTRAINT unique_team_jersey 
        UNIQUE (team_id, jersey_no),

    FOREIGN KEY (team_id) 
        REFERENCES Team(team_id)
);

INSERT INTO Player (player_id, team_id, player_name, role,jersey_no)
VALUES 
(1, 1, 'aayush yadav', 'Defender',1),
(2, 1, 'dhaygude atharva', 'All-Rounder',2),
(3, 1, 'varad pol', 'Attacker',3),
(4, 1, 'vaibhav jadhav', 'Attacker',4),
(5, 1, 'aayush panghare', 'All-Rounder',5),
(6, 1, 'swaraj ghadhave', 'Attacker',6),
(7, 1, 'pratik aadhav', 'Defender',7),
(8, 1, 'raj pawar', 'Attacker',8),
(9, 1, 'swaraj uttekar', 'All-Rounder',9),
(10, 1, 'mayureshwar gosavi', 'Defender',10),
(11, 1, 'vighnesh girme', 'Attacker',11),
(12, 1, 'soham hipparkar', 'All-Rounder',12),
(13, 1, 'soham bhamare', 'Attacker',13),
(14, 1, 'Tej Shinde', 'Attacker',14),
(15, 1, 'Sarthak Mahadik', 'All-Rounder',15),
(16, 2, 'kartavya gandekr', 'Defender',1),
(17, 2, 'soham deshmukh', 'Attacker',2),
(18, 2, 'atul parde', 'All-Rounder',3),
(19, 2, 'shreeyash maharugade', 'Attacker',4),
(20, 2, 'om wagh', 'Defender',5),
(21, 2, 'sangam thakur', 'Attacker',6),
(22, 2, 'krushna mahanvar', 'All-Rounder',7),
(23, 2, 'pranav mane', 'Defender',8),
(24, 2, 'shreeraj tangade', 'Defender',9),
(25, 2, 'satyam sakat', 'Attacker',10),
(26, 2, 'tanmay nigudkar', 'All-Rounder',11),
(27, 2, 'umesh dongare', 'Attacker',12),
(28, 2, 'pallav sarade', 'Defender',13),
(29, 2, 'arjun gorade', 'Attacker',14),
(30, 2, 'vedant gaikwad', 'All-Rounder',15);

CREATE TABLE Team(
    team_id INT PRIMARY KEY AUTO_INCREMENT,
    team_name VARCHAR(50) NOT NULL UNIQUE,
    No_of_attackers INT CHECK (No_of_attackers >= 0),
    No_of_defenders INT CHECK (No_of_defenders >= 0),
    No_of_all_arounders INT CHECK (No_of_all_arounders >= 0),
    City_name VARCHAR(50),
    Coach_name VARCHAR(30)
);

INSERT INTO TEAM (team_id, team_name, No_of_attackers, No_of_defenders, No_of_all_arounders, City_name, Coach_name)
VALUES 
(1, 'Satara Warriors', 5, 6, 4, 'satara', 'Coach gaikwad'),
(2, 'Pune Champions', 4, 6, 4, 'pune', 'Coach jagdale'),
(3, 'Solapur Royals', 7, 4, 4, 'solapur', 'Coach waghmare'),
(4, 'Dharashiv Marshals', 5, 5, 5, 'dharashiv', 'Coach valunj'),
(5, 'Chennai Guns', 4, 4, 7, 'chennai', 'Coach shinde'),
(6, 'Mumbai Khiladi', 3, 6, 6, 'mumbai', 'Coach pawar'),
(7, 'Delhi Deredevils', 2, 7, 6, 'delhi', 'Coach yadav'),
(8, 'Hyderabad Spartans', 4, 5, 6, 'hyderabad', 'Coach kalyankar');

CREATE TABLE Match_details(
    match_id INT PRIMARY KEY,
	match_name VARCHAR(20),
    tournament_id INT,
    venue VARCHAR(100) NOT NULL,
    home_team INT NOT NULL,
    away_team INT NOT NULL,
    match_date DATE NOT NULL,
    winning_team INT,
	home_team_score INT, --updated
	away_team_score INT, --updated
    result VARCHAR(40), --updated
	UNIQUE (tournament_id, match_name),
    FOREIGN KEY(home_team) REFERENCES Team(team_id),
    FOREIGN KEY(away_team) REFERENCES Team(team_id),
    FOREIGN KEY(winning_team) REFERENCES Team(team_id),
    FOREIGN KEY(tournament_id) REFERENCES Tournament(tournament_id) 
);

INSERT INTO match_details
(venue, home_team, away_team, match_date, winning_team, home_team_score, away_team_score, result, match_name, tournament_id)
VALUES
('Pune', 1, 2, '2026-01-10', 1, 18, 15, 'won by 3 points', 'M01', 1),
('Mumbai', 3, 4, '2026-01-12', 4, 20, 25, 'won by 5 points', 'M02', 1),
('Nashik', 5, 6, '2026-01-15', NULL, 15, 15, 'Match Drawn', 'M03', 1),
('Nagpur', 7, 8, '2026-01-18', 8, 10, 35, 'won by 25 points', 'M04', 1),
('Kolhapur', 2, 3, '2026-01-20', 2, 28, 15, 'won by 13 points', 'M05', 1),
('Pune', 1, 3, '2026-02-01', 1, 30, 20, 'won by 10 points', 'M06', 1),
('Pune', 1, 4, '2026-02-03', 4, 18, 25, 'won by 7 points', 'M07', 1),
('Pune', 1, 5, '2026-02-05', NULL, 22, 22, 'Match Drawn', 'M08', 1),
('Pune', 1, 6, '2026-02-07', 1, 35, 28, 'won by 7 points', 'M09', 1),
('Pune', 1, 7, '2026-02-09', 7, 19, 24, 'won by 5 points', 'M10', 1),
('Mumbai', 2, 4, '2026-02-11', 2, 27, 20, 'won by 7 points', 'M11', 1),
('Mumbai', 2, 5, '2026-02-13', 5, 15, 21, 'won by 6 points', 'M12', 1),
('Mumbai', 2, 6, '2026-02-15', NULL, 18, 18, 'Match Drawn', 'M13', 1),
('Mumbai', 2, 7, '2026-02-17', 2, 29, 26, 'won by 3 points', 'M14', 1),
('Mumbai', 2, 8, '2026-02-19', 8, 16, 30, 'won by 14 points', 'M15', 1),
('Nashik', 3, 5, '2026-02-21', 3, 25, 19, 'won by 6 points', 'M16', 1),
('Nashik', 3, 6, '2026-02-23', 6, 20, 22, 'won by 2 points', 'M17', 1),
('Nashik', 3, 7, '2026-02-25', NULL, 24, 24, 'Match Drawn', 'M18', 1),
('Nashik', 3, 8, '2026-02-27', 3, 28, 21, 'won by 7 points', 'M19', 1),
('Nashik', 3, 1, '2026-03-01', 1, 17, 23, 'won by 6 points', 'M20', 1),
('Nagpur', 4, 5, '2026-03-03', 4, 31, 20, 'won by 11 points', 'M21', 1),
('Nagpur', 4, 6, '2026-03-05', NULL, 22, 22, 'Match Drawn', 'M22', 1),
('Nagpur', 4, 7, '2026-03-07', 7, 18, 25, 'won by 7 points', 'M23', 1),
('Nagpur', 4, 8, '2026-03-09', 4, 27, 19, 'won by 8 points', 'M24', 1),
('Nagpur', 4, 2, '2026-03-11', 2, 16, 20, 'won by 4 points', 'M25', 1),
('Kolhapur', 5, 6, '2026-03-13', 5, 29, 22, 'won by 7 points', 'M26', 1),
('Kolhapur', 5, 7, '2026-03-15', 7, 18, 21, 'won by 3 points', 'M27', 1),
('Kolhapur', 5, 8, '2026-03-17', NULL, 20, 20, 'Match Drawn', 'M28', 1),
('Kolhapur', 5, 1, '2026-03-19', 1, 19, 24, 'won by 5 points', 'M29', 1),
('Kolhapur', 5, 2, '2026-03-21', 5, 26, 18, 'won by 8 points', 'M30', 1),
('Pune', 6, 7, '2026-03-23', 6, 27, 21, 'won by 6 points', 'M31', 1),
('Pune', 6, 8, '2026-03-25', 8, 19, 24, 'won by 5 points', 'M32', 1),
('Pune', 6, 1, '2026-03-27', 1, 20, 28, 'won by 8 points', 'M33', 1),
('Pune', 6, 2, '2026-03-29', NULL, 22, 22, 'Match Drawn', 'M34', 1),
('Pune', 6, 3, '2026-03-31', 3, 18, 25, 'won by 7 points', 'M35', 1),
('Mumbai', 7, 8, '2026-04-02', 7, 30, 26, 'won by 4 points', 'M36', 1),
('Mumbai', 7, 1, '2026-04-04', 1, 21, 27, 'won by 6 points', 'M37', 1),
('Mumbai', 7, 2, '2026-04-06', 2, 19, 24, 'won by 5 points', 'M38', 1),
('Mumbai', 7, 3, '2026-04-08', NULL, 23, 23, 'Match Drawn', 'M39', 1),
('Mumbai', 7, 4, '2026-04-10', 4, 18, 29, 'won by 11 points', 'M01', 2),
('Nashik', 8, 1, '2026-04-12', 1, 20, 26, 'won by 6 points', 'M02', 2),
('Nashik', 8, 2, '2026-04-14', 8, 28, 21, 'won by 7 points', 'M03', 2),
('Nashik', 8, 3, '2026-04-16', 3, 19, 27, 'won by 8 points', 'M04', 2),
('Nashik', 8, 4, '2026-04-18', NULL, 22, 22, 'Match Drawn', 'M05', 2),
('Nashik', 8, 5, '2026-04-20', 5, 24, 30, 'won by 6 points', 'M06', 2),
('Nagpur', 1, 2, '2026-04-22', 2, 18, 23, 'won by 5 points', 'M07', 2),
('Nagpur', 3, 4, '2026-04-24', 3, 26, 20, 'won by 6 points', 'M08', 2),
('Nagpur', 5, 6, '2026-04-26', NULL, 21, 21, 'Match Drawn', 'M09', 2),
('Nagpur', 7, 8, '2026-04-28', 8, 19, 27, 'won by 8 points', 'M10', 2),
('Nagpur', 2, 5, '2026-04-30', 5, 22, 29, 'won by 7 points', 'M11', 2);


CREATE TABLE Player_match_stat(
    stat_id INT PRIMARY KEY AUTO_INCREMENT,
	player_id INT,
	match_id INT,
	attack_points INT,
	defense_points INT,
	pole_dives INT,
	sky_dives INT,
	touches INT,
	tournament_id INT,
    FOREIGN KEY(player_id) REFERENCES Player(player_id),
    FOREIGN KEY(match_id) REFERENCES Match_details(match_id),
	FOREIGN KEY(tournament_id) REFERENCES Tournament(tournament_id)
);

INSERT INTO player_match_stat
(player_id, match_id, attack_points, defense_points, touches, sky_dives, pole_dives, tournament_id)
VALUES
(1,1,0,60,0,0,0,1),
(2,1,0,0,0,0,0,1),
(3,1,2,60,0,0,0,1),
(4,1,8,150,0,0,0,1),
(5,1,0,60,0,0,0,1),
(6,1,2,180,0,0,0,1),
(7,1,0,120,0,0,0,1),
(8,1,0,40,0,0,0,1),
(9,1,2,80,0,0,0,1),
(10,1,4,90,0,0,0,1),
(11,1,2,0,0,0,0,1),
(12,1,0,0,0,0,0,1),
(13,1,0,0,0,0,0,1),
(14,1,0,0,0,0,0,1),
(15,1,0,0,0,0,0,1),
(16,1,4,260,0,0,0,1),
(17,1,6,135,0,0,0,1),
(18,1,0,0,0,0,0,1),
(19,1,0,100,0,0,0,1),
(20,1,0,60,0,0,0,1),
(21,1,0,0,0,0,0,1),
(22,1,0,10,0,0,0,1),
(23,1,2,60,0,0,0,1),
(24,1,0,0,0,0,0,1),
(25,1,6,0,0,0,0,1),
(26,1,0,20,0,0,0,1),
(27,1,0,0,0,0,0,1),
(28,1,0,0,0,0,0,1),
(29,1,0,0,0,0,0,1),
(30,1,2,90,0,0,0,1),
(1,40,4,80,0,0,0,2),
(2,40,2,60,0,0,0,2),
(3,40,6,120,0,0,0,2),
(4,40,10,140,0,0,0,2),
(5,40,0,70,0,0,0,2),
(6,40,3,160,0,0,0,2),
(7,40,1,110,0,0,0,2),
(8,40,0,50,0,0,0,2),
(9,40,5,90,0,0,0,2),
(10,40,7,100,0,0,0,2),
(11,40,3,20,0,0,0,2),
(12,40,0,10,0,0,0,2),
(13,40,0,0,0,0,0,2),
(14,40,2,0,0,0,0,2),
(15,40,1,0,0,0,0,2),
(16,40,8,200,0,0,0,2),
(17,40,9,150,0,0,0,2),
(18,40,0,30,0,0,0,2),
(19,40,2,95,0,0,0,2),
(20,40,0,60,0,0,0,2),
(21,40,0,0,0,0,0,2),
(22,40,1,25,0,0,0,2),
(23,40,4,70,0,0,0,2),
(24,40,0,0,0,0,0,2),
(25,40,7,0,0,0,0,2),
(26,40,0,40,0,0,0,2),
(27,40,0,0,0,0,0,2),
(28,40,0,0,0,0,0,2),
(29,40,0,0,0,0,0,2),
(30,40,3,85,0,0,0,2),
(1,41,5,60,12,1,2,2),
(2,41,7,40,10,2,1,2),
(3,41,15,20,14,1,3,2),
(4,41,12,30,13,2,2,2),
(5,41,8,50,11,1,2,2),
(6,41,14,25,13,2,3,2),
(7,41,4,80,9,3,2,2),
(8,41,16,15,15,1,3,2),
(9,41,10,35,12,2,2,2),
(31,41,6,55,11,1,2,2),
(32,41,9,45,12,2,2,2),
(33,41,18,20,16,1,3,2),
(34,41,11,30,13,2,2,2),
(35,41,7,60,10,1,2,2),
(36,41,13,25,14,2,3,2),
(37,41,3,90,8,3,2,2),
(38,41,17,10,15,1,3,2),
(39,41,12,35,13,2,2,2);

CREATE  TABLE Team_stat(
	team_id INT ,
	matches_played INT,
	matches_wins INT,
	matches_lost INT,
	matches_draws INT,
	total_points INT,
	recent_form JSON,
    tournament_id INT, --updated
	PRIMARY KEY (team_id,tournament_id),
    FOREIGN KEY(team_id) REFERENCES Team(team_id),
    FOREIGN KEY(tournament_id) REFERENCES Tournament(tournament_id)
);

INSERT INTO team_stat 
(team_id, matches_played, matches_wins, matches_lost, matches_draws, total_points, recent_form, tournament_id)
VALUES
(1,7,4,3,0,8,'["W","W","W","L","W"]',1),
(1,7,3,2,2,8,'["W","L","D","W","L"]',2),
(2,7,7,0,0,14,'["W","W","W","W","W"]',1),
(2,7,5,1,1,11,'["W","W","L","W","D"]',2),
(3,7,5,1,1,11,'["D","W","W","L","W"]',1),
(3,7,4,2,1,9,'["L","W","W","D","L"]',2),
(4,7,1,6,0,2,'["L","L","W","L","L"]',1),
(4,7,2,4,1,5,'["L","L","W","D","L"]',2),
(5,7,3,4,0,6,'["L","W","W","L","W"]',1),
(5,7,3,3,1,7,'["W","L","W","L","D"]',2),
(6,7,0,5,2,2,'["D","L","D","L","L"]',1),
(6,7,1,4,2,4,'["D","L","L","W","D"]',2),
(7,7,6,1,0,12,'["L","W","W","W","W"]',1),
(7,7,6,1,0,12,'["W","W","W","L","W"]',2),
(8,7,5,1,1,11,'["W","D","W","L","W"]',1),
(8,7,4,2,1,9,'["W","D","L","W","W"]',2);

/*CREATE TABLE Match_Stats (
	stat_id INT PRIMARY KEY AUTO_INCREMENT,
	match_id INT,
	category VARCHAR(50) NOT NULL,
	stat_type VARCHAR(50) NOT NULL,--changed
	home_team_count INT DEFAULT 0,
	away_team_count INT DEFAULT 0,
	FOREIGN KEY (match_id) REFERENCES Match_details(match_id));

INSERT INTO Match_Stats (stat_id, match_id, category, stat_type, home_team_count, away_team_count)
VALUES 
(1, 1, 'Attacker Skill', 'Simple Touch', 7, 7),
(2, 1, 'Attacker Skill', 'Dive', 0, 2),
(3, 1, 'Attacker Skill', 'Pole Dive', 2, 1),
(4, 1, 'Attacker Skill', 'Sudden Attempt', 0, 0),
(5, 1, 'Attacker Skill', 'Tap', 0, 0),
(6, 1, 'Defender Self Out', 'Out of Field', 0, 1),
(7, 1, 'Defender Self Out', 'Late Entry', 0, 0),
(8, 1, 'Defender Self Out', 'Retired', 0, 0),
(9, 1, 'Defender Self Out', 'Warning', 0, 0);*/

--NEW TABLES
CREATE  TABLE Team_Attack(
    Attack_id INT PRIMARY KEY AUTO_INCREMENT,
    match_id INT,
    team_id INT NOT NULL,
    points INT NOT NULL,
    inning INT CHECK(inning IN (1, 2, 3, 4)),
    phase VARCHAR(10) CHECK(phase IN ('Early','Mid','End','Unknown')),
	tournament_id INT,
    FOREIGN KEY (match_id) REFERENCES Match_details(match_id),
    FOREIGN KEY (team_id) REFERENCES Team(team_id),
	FOREIGN KEY (tournament_id) REFERENCES Tournament(tournament_id)
);

INSERT INTO team_attack (match_id, team_id, points, inning, phase)
VALUES
(1,1,3,1,'Early'),
(1,2,1,1,'Early'),
(1,1,4,1,'Mid'),
(1,2,3,1,'Mid'),
(1,1,2,2,'Early'),
(1,2,2,2,'Early'),
(1,1,3,2,'Mid'),
(1,2,5,2,'Mid'),
(2,3,4,1,'Early'),
(2,4,2,1,'Early'),
(2,3,5,1,'Mid'),
(2,4,3,1,'Mid'),
(2,3,3,1,'End'),
(2,4,4,1,'End'),
(2,3,2,2,'Early'),
(2,4,3,2,'Early'),
(2,3,4,2,'Mid'),
(2,4,5,2,'Mid'),
(2,3,3,2,'End'),
(2,4,2,2,'End'),
(1,1,5,1,'End'),
(1,2,3,1,'End'),
(1,1,2,2,'End'),
(1,2,6,2,'End'),
(3,5,3,1,'Early'),
(3,6,2,1,'Early'),
(3,5,4,1,'Mid'),
(3,6,3,1,'Mid'),
(3,5,5,1,'End'),
(3,6,2,1,'End'),
(3,5,2,2,'Early'),
(3,6,3,2,'Early'),
(3,5,3,2,'Mid'),
(3,6,4,2,'Mid'),
(3,5,2,2,'End'),
(3,6,5,2,'End'),
(3,5,4,3,'Early'),
(3,6,2,3,'Early'),
(3,5,3,3,'Mid'),
(3,6,3,3,'Mid'),
(3,5,5,3,'End'),
(3,6,4,3,'End'),
(3,5,3,4,'Early'),
(3,6,2,4,'Early'),
(3,5,4,4,'Mid'),
(3,6,3,4,'Mid'),
(3,5,2,4,'End'),
(3,6,5,4,'End');



CREATE TABLE Team_Defence (
	defence_id INT PRIMARY KEY AUTO_INCREMENT,
	match_id INT NOT NULL,
	inning_no INT NOT NULL,
	team_id INT NOT NULL,
	batch_no INT NOT NULL,
	start_time FLOAT NOT NULL,
	end_time FLOAT NOT NULL,
	duration FLOAT NOT NULL,
	tournament_id INT,
	FOREIGN KEY (match_id) REFERENCES Match_details(match_id),
	FOREIGN KEY (team_id) REFERENCES Team(team_id),
	FOREIGN KEY (tournament_id) REFERENCES Tournament(tournament_id),
-- TABLE-LEVEL CHECK constraints
    CHECK (inning_no IN (1, 2, 3, 4)),
    CHECK (batch_no > 0),
    CHECK (start_time >= 0),
    CHECK (end_time > start_time),
    CHECK (duration > 0)
);

INSERT INTO team_Defence 
(defence_id, match_id, inning_no, team_id, batch_no, start_time, end_time, duration)
VALUES
(1,1,1,1,1,0,3,3),
(2,1,1,1,2,3,5.3,2.3),
(3,1,1,1,3,5.3,7,1.3),
(4,1,2,1,1,0,2.3,2.3),
(5,1,2,1,2,2.3,3.4,1.1),
(6,1,2,1,3,3.4,5,1.2),
(7,1,2,1,4,5,6.3,1.3),
(8,1,2,1,5,6.3,7,0.3),
(9,1,1,2,1,0,3.4,3.4),
(10,1,1,2,2,3.4,7,3.2),
(11,1,2,2,1,0,2.2,2.2),
(12,1,2,2,2,2.2,4.4,2.2),
(13,1,2,2,3,4.4,7,2.2),
(14,3,1,5,1,0,2.5,2.5),
(15,3,1,5,2,2.5,5,2.5),
(16,3,1,5,3,5,7,2),
(17,3,2,5,1,0,2,2),
(18,3,2,5,2,2,4.5,2.5),
(19,3,2,5,3,4.5,7,2.5),
(20,3,3,5,1,0,2.3,2.3),
(21,3,3,5,2,2.3,5.2,2.9),
(22,3,3,5,3,5.2,7,1.8),
(23,3,4,5,1,0,2.1,2.1),
(24,3,4,5,2,2.1,4.6,2.5),
(25,3,4,5,3,4.6,7,2.4),
(26,3,1,6,1,0,3,3),
(27,3,1,6,2,3,6,3),
(28,3,1,6,3,6,7,1),
(29,3,2,6,1,0,2.2,2.2),
(30,3,2,6,2,2.2,5,2.8),
(31,3,2,6,3,5,7,2),
(32,3,3,6,1,0,2.4,2.4),
(33,3,3,6,2,2.4,5.5,3.1),
(34,3,3,6,3,5.5,7,1.5),
(35,3,4,6,1,0,2,2),
(36,3,4,6,2,2,4.8,2.8),
(37,3,4,6,3,4.8,7,2.2);

/*CREATE TABLE Season (
	season_id INT PRIMARY KEY AUTO_INCREMENT,
	season_name VARCHAR(30) NOT NULL,
	tournament_id INT NOT NULL,
	start_date DATE NOT NULL,
	end_date DATE NOT NULL,
	FOREIGN KEY (tournament_id)
	REFERENCES Tournament(tournament_id),
	CHECK (start_date < end_date));

INSERT INTO Season (season_name,tournament_id,start_date,end_date)
VALUES
('Season 2020', 1, '2020-01-05', '2020-03-20'),
('Season 2021', 1, '2021-01-10', '2021-03-25'),
('Season 2022', 1, '2022-01-08', '2022-03-30'),
('Season 2023', 1, '2023-01-12', '2023-04-05'),
('Season 2024', 1, '2024-01-15', '2024-04-10');

CREATE TABLE Player_Role_History (
    player_id INT,
    season_id INT,
    role VARCHAR(20) CHECK (role IN ('Attacker','Defender','All-Rounder','Unknown')),
    PRIMARY KEY (player_id, season_id),
    FOREIGN KEY (player_id) REFERENCES Player(player_id),
    FOREIGN KEY (season_id) REFERENCES Season(season_id)
);

INSERT INTO Player_Role_History (player_id,season_id,role)
VALUES
(1, 1, 'Attacker'),
(2, 1, 'Defender'),
(3, 1, 'All-Rounder'),
(4, 2, 'Attacker'),
(5, 2, 'Defender'),
(6, 2, 'All-Rounder'),
(7, 3, 'All-Rounder'),
(8, 3, 'Defender'),
(9, 3, 'Attacker'),
(10, 3, 'Attacker');*/


CREATE TABLE Player_tournament_stat (
    player_id INT NOT NULL,
    tournament_id INT NOT NULL,
    total_attack_points INT DEFAULT 0,
    total_defence_points INT DEFAULT 0,
    total_dives INT DEFAULT 0,
    matches_played INT DEFAULT 0,
    team_id INT NOT NULL,
    highest_score INT,
    pole_dives INT,
    sky_dives INT,
    assists INT,
    total_touches INT,
    avg_def_seconds INT,

    PRIMARY KEY (player_id, tournament_id),

    FOREIGN KEY (player_id) REFERENCES Player(player_id),
    FOREIGN KEY (tournament_id) REFERENCES Tournament(tournament_id),
    FOREIGN KEY (team_id) REFERENCES Team(team_id)
);


INSERT INTO player_tournament_stat 
(player_id, tournament_id, total_attack_points, total_defence_points, total_dives, matches_played, team_id, highest_attack_points, pole_dives, sky_dives, assists, total_touches, out_of_field, highest_def_time)
VALUES
(1,1,120,30,12,10,1,24,7,5,12,95,1,12),
(2,1,85,95,20,10,1,18,8,6,9,80,2,22),
(3,1,150,40,10,10,1,28,6,4,14,110,1,10),
(4,1,60,110,25,10,1,15,9,7,6,70,3,30),
(5,1,100,80,18,10,1,21,7,6,10,88,2,18),
(6,1,45,130,30,10,1,12,11,8,5,60,3,35),
(7,1,90,60,15,10,1,19,6,5,11,82,1,20),
(8,1,70,75,16,10,1,17,7,5,8,75,2,16);


CREATE TABLE Tournament(
    tournament_id INT PRIMARY KEY AUTO_INCREMENT,
    tournament_name VARCHAR(100) NOT NULL,
    tournament_type VARCHAR(50)
        CHECK (tournament_type IN ('All to all','Knockout','Group + Knockout','Unknown')),
    tournament_year INT
);

INSERT INTO Tournament (tournament_name,tournament_type,tournament_year)
VALUES
('National Kho-Kho League', 'All to all', 2020),
('Inter-University Championship', 'Knockout', 2020),
('State Level Tournament', 'Group + Knockout', 2021),
('Junior Nationals', 'All to all', 2021),
('Senior Nationals', 'Knockout', 2022),
('Inter-School League', 'Group + Knockout', 2022),
('University Premier League', 'All to all', 2023),
('Women National Championship', 'Group + Knockout', 2023),
('Kho-Kho Pro League', 'Knockout', 2024),
('National Games Kho-Kho', 'All to all', 2024);

/*CREATE TABLE Match_Awards(
    match_id INT,
    award_type VARCHAR(20) CHECK (award_type IN ('Best AllRounder','Best Attacker','Best Defender')),   
    player_id INT,
    tournament_id INT,
    PRIMARY KEY (match_id, award_type),
    FOREIGN KEY (match_id) REFERENCES Match_details(match_id),
    FOREIGN KEY (player_id) REFERENCES Player(player_id),
    FOREIGN KEY (tournament_id) REFERENCES Tournament(tournament_id)
);

INSERT INTO Match_Awards (match_id,award_type,player_id,tournament_id)
VALUES
(1, 'Best AllRounder', 5, 1),
(1, 'Best Attacker', 8, 1),
(1, 'Best Defender', 3, 1),
(2, 'Best Defender', 6, 1),
(2, 'Best AllRounder', 9, 1),
(3, 'Best Attacker', 4, 2),
(4, 'Best Defender', 2, 2),
(5, 'Best Defender', 10, 3),
(5, 'Best AllRounder', 11, 3);

CREATE TABLE Player_Defence (
    player_def_id INT PRIMARY KEY AUTO_INCREMENT,
    match_id INT,
    player_id INT,
    inning_no INT,
    start_seconds INT,
    end_seconds INT,
    duration_seconds INT,
    FOREIGN KEY (match_id) REFERENCES Match_details(match_id),
    FOREIGN KEY (player_id) REFERENCES Player(player_id)
    );

INSERT INTO Player_Defence
(match_id, player_id, inning_no, start_seconds, end_seconds, duration_seconds)
VALUES
(1,1,1,30,90,60),
(1,3,1,100,130,30),
(1,3,2,50,80,30),
(1,4,1,0,70,70),
(1,4,1,150,200,50),
(1,4,2,100,130,30),
(1,5,2,200,260,60),
(1,6,1,200,280,80),
(1,6,2,50,150,100),
(1,7,1,300,360,60),
(1,7,2,150,210,60),
(1,8,2,10,50,40),
(1,9,1,50,90,40),
(1,9,2,250,290,40),
(1,10,1,180,210,30),
(1,10,2,300,360,60);


CREATE TABLE Player_Attack(
    player_attack_id INT PRIMARY KEY AUTO_INCREMENT,
    match_id INT,
    player_id INT,
    inning INT,
    phase VARCHAR(10),
    points INT,
    FOREIGN KEY (match_id) REFERENCES Match_details(match_id),
	FOREIGN KEY (player_id) REFERENCES Player(player_id)
	);

INSERT INTO Player_Attack
(match_id, player_id, inning, phase, points)
VALUES
(1,1,1,'Early',3),
(1,1,1,'Mid',2),
(1,1,2,'End',3),
(1,2,1,'Mid',4),
(1,2,2,'End',2),
(1,5,1,'Early',4),
(1,5,2,'Mid',3),
(1,5,2,'End',3),
(1,6,1,'End',3),
(1,6,2,'Mid',2),
(2,7,1,'Early',4),
(2,7,1,'Mid',3),
(2,7,2,'End',4),
(2,8,1,'Mid',5),
(2,8,2,'End',3),
(2,9,1,'Early',6),
(2,9,2,'Mid',4),
(2,9,2,'End',3),
(2,10,1,'End',2),
(2,10,2,'Mid',3),
(3,1,1,'Early',2),
(3,1,2,'End',3),
(3,2,1,'Mid',3),
(3,2,2,'End',2),
(3,3,1,'Early',4),
(3,3,2,'Mid',3),
(4,5,1,'Early',5),
(4,5,1,'Mid',3),
(4,5,2,'End',4),
(4,6,1,'Mid',4),
(4,6,2,'End',3),
(4,7,1,'Early',6),
(4,7,2,'Mid',4),
(5,5,1,'Early',4),
(5,5,1,'Mid',3),
(5,5,2,'End',5),
(5,6,1,'Mid',4),
(5,6,2,'End',3),
(5,9,1,'Early',5),
(5,9,2,'Mid',4);*/


-- Don't add values here
CREATE TABLE raw_match_file_log(
	file_id INT PRIMARY KEY AUTO_INCREMENT,
	file_name VARCHAR(200),
	file_type VARCHAR(50),
	uploaded_by VARCHAR(30),
	uploaded_at DATETIME
);

CREATE TABLE raw_match_data(
	raw_id INT PRIMARY KEY AUTO_INCREMENT,
	file_id INT,
	raw_match_id VARCHAR(50),
	raw_match_date VARCHAR(50),
	raw_home_team VARCHAR(30),
	raw_away_team VARCHAR(30),
	raw_home_team_score VARCHAR(50),
	raw_away_team_score VARCHAR(50),
	raw_result VARCHAR(50),
	raw_winner VARCHAR(30),
	raw_venue VARCHAR(100),
	FOREIGN KEY (file_id) REFERENCES raw_match_file_log(file_id)
);

CREATE TABLE raw_attack_details(
	raw_attack_id INT PRIMARY KEY AUTO_INCREMENT,
	file_id INT,
    raw_match INT,
    raw_team_name VARCHAR(50),
    raw_points INT,
    raw_inning INT ,
    raw_phase VARCHAR(10),
	FOREIGN KEY (file_id) REFERENCES raw_match_file_log(file_id),
	FOREIGN KEY (raw_match) REFERENCES raw_match_data(raw_id)
); 

CREATE TABLE raw_defence_details(
	raw_defence_id INT PRIMARY KEY AUTO_INCREMENT,
	file_id INT,
    raw_match INT,
    raw_team_name VARCHAR(50),
    raw_batch INT,
    raw_inning INT ,
	raw_start_time FLOAT,
    raw_end_time FLOAT,
	FOREIGN KEY (file_id) REFERENCES raw_match_file_log(file_id),
	FOREIGN KEY (raw_match) REFERENCES raw_match_data(raw_id)
);

CREATE TABLE raw_match_stats (
	raw_stat_id INT PRIMARY KEY AUTO_INCREMENT,
	file_id INT,
	raw_match INT,
	raw_category VARCHAR(50),
	raw_stat_type VARCHAR(50),
	raw_home_team_count INT,
	raw_away_team_count INT,
	FOREIGN KEY (file_id) REFERENCES raw_match_file_log(file_id),
	FOREIGN KEY (raw_match) REFERENCES raw_match_data(raw_id)
	);






















