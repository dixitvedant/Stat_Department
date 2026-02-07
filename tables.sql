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

CREATE TABLE Player(
    player_id INT PRIMARY KEY AUTO_INCREMENT ,
    team_id INT NOT NULL,
    player_name VARCHAR(50) NOT NULL,
    player_age INT CHECK(player_age>0),
    role VARCHAR(20) CHECK (role IN ('Attacker','Defender','All-Rounder')),
    FOREIGN KEY(team_id) REFERENCES Team(team_id) 
);

INSERT INTO Player (player_id, team_id, player_name, player_age, role)
VALUES 
(1, 1, 'aayush yadav', 22, 'Defender'),
(2, 1, 'dhaygude atharva', 16, 'All-Rounder'),
(3, 1, 'varad pol', 14, 'Attacker'),
(4, 1, 'vaibhav jadhav', 16, 'Attacker'),
(5, 1, 'aayush panghare', 21, 'All-Rounder'),
(6, 1, 'swaraj ghadhave', 15, 'Attacker'),
(7, 1, 'pratik aadhav', 14, 'Defender'),
(8, 1, 'raj pawar', 16, 'Attacker'),
(9, 1, 'swaraj uttekar', 16, 'All-Rounder'),
(10, 1, 'mayureshwar gosavi', 14, 'Defender'),
(11, 1, 'vighnesh girme', 16, 'Attacker'),
(12, 1, 'soham hipparkar', 16, 'All-Rounder'),
(13, 1, 'soham bhamare', 15, 'Attacker'),
(14, 1, 'Tej Shinde', 14, 'Attacker'),
(15, 1, 'Sarthak Mahadik', 15, 'All-Rounder'),
(16, 2, 'kartavya gandekr', 14, 'Defender'),
(17, 2, 'soham deshmukh', 16, 'Attacker'),
(18, 2, 'atul parde', 16, 'All-Rounder'),
(19, 2, 'shreeyash maharugade', 15, 'Attacker'),
(20, 2, 'om wagh', 14, 'Defender'),
(21, 2, 'sangam thakur', 14, 'Attacker'),
(22, 2, 'krushna mahanvar', 16, 'All-Rounder'),
(23, 2, 'pranav mane', 15, 'Defender'),
(24, 2, 'shreeraj tangade', 14, 'Defender'),
(25, 2, 'satyam sakat', 16, 'Attacker'),
(26, 2, 'tanmay nigudkar', 16, 'All-Rounder'),
(27, 2, 'umesh dongare', 15, 'Attacker'),
(28, 2, 'pallav sarade', 14, 'Defender'),
(29, 2, 'arjun gorade', 16, 'Attacker'),
(30, 2, 'vedant gaikwad', 16, 'All-Rounder');

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
    match_id INT PRIMARY KEY AUTO_INCREMENT,
    season_id INT,
    venue VARCHAR(30) NOT NULL,
    team_a INT NOT NULL,
    team_b INT NOT NULL,
    match_date DATE NOT NULL,
    winning_team INT,
	teamA_score INT,
	teamB_score INT,
    result VARCHAR(40),   --updated
    FOREIGN KEY(team_a) REFERENCES Team(team_id),
    FOREIGN KEY(team_b) REFERENCES Team(team_id),
    FOREIGN KEY(winning_team) REFERENCES Team(team_id),
    FOREIGN KEY(season_id) REFERENCES Season(season_id) 
);

INSERT INTO Match_details (match_id, venue, team_a, team_b, match_date, winning_team)
VALUES 
(1, 'Pune', 1, 2, '2026-01-10', 2),
(2, 'Mumbai', 3, 4, '2026-01-12', 3),
(3, 'Nashik', 5, 6, '2026-01-15', 6),
(4, 'Nagpur', 7, 8, '2026-01-18', 7),
(5, 'Kolhapur', 2, 3, '2026-01-20', 2);


CREATE TABLE Player_match_stat(
    stat_id INT PRIMARY KEY AUTO_INCREMENT,
	player_id INT,
	match_id INT,
	attack_points INT,
	defense_points INT,
	successful_dives INT,
	out_given INT,
    FOREIGN KEY(player_id) REFERENCES Player(player_id),
    FOREIGN KEY(match_id) REFERENCES Match_details(match_id)
);

INSERT INTO Player_match_stat (stat_id, player_id, match_id, attack_points, defense_points, successful_dives, out_given)
VALUES 
(1, 1, 1, 0, 60, 0, 0),
(2, 2, 1, 0, 0, 0, 0),
(3, 3, 1, 2, 60, 0, 0),
(4, 4, 1, 8, 150, 1, 0),
(5, 5, 1, 0, 60, 0, 0),
(6, 6, 1, 2, 180, 0, 0),
(7, 7, 1, 0, 120, 1, 0),
(8, 8, 1, 0, 40, 0, 0),
(9, 9, 1, 2, 80, 0, 0),
(10, 10, 1, 4, 90, 0, 0),
(11, 11, 1, 2, 0, 0, 0),
(12, 12, 1, 0, 0, 0, 0),
(13, 13, 1, 0, 0, 0, 0),
(14, 14, 1, 0, 0, 0, 0),
(15, 15, 1, 0, 0, 0, 0),
(16, 16, 2, 4, 260, 0, 0),
(17, 17, 2, 6, 135, 1, 0),
(18, 18, 2, 0, 0, 0, 0),
(19, 19, 2, 0, 100, 0, 0),
(20, 20, 2, 0, 60, 0, 0),
(21, 21, 2, 0, 0, 0, 0),
(22, 22, 2, 0, 10, 0, 0),
(23, 23, 2, 2, 60, 0, 0),
(24, 24, 2, 0, 0, 1, 0),
(25, 25, 2, 6, 0, 0, 0),
(26, 26, 2, 0, 20, 0, 0),
(27, 27, 2, 0, 0, 0, 0),
(28, 28, 2, 0, 0, 0, 0),
(29, 29, 2, 0, 0, 0, 0),
(30, 30, 2, 2, 90, 0, 1);

CREATE  TABLE team_stat(
	team_id INT ,
	matches_played INT,
	matches_wins INT,
	matches_lost INT,
	matches_draws INT,
	total_points INT,
    tournament_id INT, --updated
    PRIMARY KEY (team_id,tournament_id),
    FOREIGN KEY(team_id) REFERENCES Team(team_id),
    FOREIGN KEY(tournament_id) REFERENCES Tournament(tournament_id)
);

INSERT INTO team_stat (team_id, matches_played, matches_wins, matches_lost, matches_draws, total_points)
VALUES 
(1, 7, 4, 3, 0, 8),
(2, 7, 7, 0, 0, 14),
(3, 7, 5, 1, 1, 11),
(4, 7, 1, 6, 0, 2),
(5, 7, 3, 4, 0, 6),
(6, 7, 0, 5, 2, 2),
(7, 7, 6, 1, 0, 12),
(8, 7, 5, 1, 1, 11);

CREATE TABLE Match_Stats (
	stat_id INT PRIMARY KEY AUTO_INCREMENT,
	match_id INT,
	category VARCHAR(50) NOT NULL,
	particular VARCHAR(50) NOT NULL,
	team_a_count INT DEFAULT 0,
	team_b_count INT DEFAULT 0,
	FOREIGN KEY (match_id) REFERENCES Match_details(match_id));

INSERT INTO Match_Stats (stat_id, match_id, category, particular, team_a_count, team_b_count)
VALUES 
(1, 1, 'Attacker Skill', 'Simple Touch', 7, 7),
(2, 1, 'Attacker Skill', 'Dive', 0, 2),
(3, 1, 'Attacker Skill', 'Pole Dive', 2, 1),
(4, 1, 'Attacker Skill', 'Sudden Attempt', 0, 0),
(5, 1, 'Attacker Skill', 'Tap', 0, 0),
(6, 1, 'Defender Self Out', 'Out of Field', 0, 1),
(7, 1, 'Defender Self Out', 'Late Entry', 0, 0),
(8, 1, 'Defender Self Out', 'Retired', 0, 0),
(9, 1, 'Defender Self Out', 'Warning', 0, 0);

--NEW TABLES
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

CREATE TABLE Team_Defence(
    defence_id INT PRIMARY KEY AUTO_INCREMENT,
    match_id INT,
    inning_no INT CHECK(inning_no IN (1,2)),
    team_id INT NOT NULL,
    batch_no INT,
    start_minute INT CHECK(start_minute>0),
    duration INT CHECK(duration>0),
    FOREIGN KEY (match_id) REFERENCES Match_details(match_id),
    FOREIGN KEY (team_id) REFERENCES Team(team_id)
);

CREATE TABLE Season(
    season_id INT PRIMARY KEY AUTO_INCREMENT,
    season_name VARCHAR(30) NOT NULL,
    tournament_id INT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    CHECK (start_date<end_date)
    FOREIGN KEY (tournament_id) REFERENCES Tournament(tournament_id)
);

CREATE TABLE Player_Role_History (
    player_id INT,
    season_id INT,
    role VARCHAR(20) CHECK (role IN ('Attacker','Defender','All-Rounder')),
    PRIMARY KEY (player_id, season_id),
    FOREIGN KEY (player_id) REFERENCES Player(player_id),
    FOREIGN KEY (season_id) REFERENCES Season(season_id)
);

CREATE TABLE Injury_Report (
    injury_id INT PRIMARY KEY AUTO_INCREMENT,
    player_id INT,
    match_id INT,
    injury_type VARCHAR(50) NOT NULL,
    recovery_days INT CHECK(recovery_days>0),
    FOREIGN KEY (player_id) REFERENCES Player(player_id),
    FOREIGN KEY (match_id) REFERENCES Match_details(match_id)
);

CREATE TABLE Player_season_stat (
    player_id INT,
    season_id INT,
    total_attack_points INT ,
    total_defense_points INT ,
    total_dives INT,
    matches_played INT,
    PRIMARY KEY (player_id, season_id),
    FOREIGN KEY (player_id) REFERENCES Player(player_id),
    FOREIGN KEY (season_id) REFERENCES Season(season_id)
);

CREATE TABLE Tournament(
    tournament_id INT PRIMARY KEY AUTO_INCREMENT,
    tournament_name VARCHAR(30) NOT NULL,
    tournament_type VARCHAR(30) CHECK (tournament_type IN ('Round Robin','Knockout','Group + Knockout')),
    tournament_year INT,
);

CREATE TABLE Match_Awards(
    match_id INT,
    award_type VARCHAR(20) CHECK (award_type IN ('MVP','Best Attacker','Best Defender')),   
    player_id INT,
    tournament_id INT,
    PRIMARY KEY (match_id, award_type),
    FOREIGN KEY (match_id) REFERENCES Match_details(match_id),
    FOREIGN KEY (player_id) REFERENCES Player(player_id),
    FOREIGN KEY (tournament_id) REFERENCES Tournament(tournament_id)
);

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
	raw_team_a VARCHAR(30),
	raw_team_b VARCHAR(30),
	raw_team_a_score VARCHAR(50),
	raw_team_b_score VARCHAR(50),
	raw_result VARCHAR(50),
	raw_winner VARCHAR(30),
	raw_venue VARCHAR(100),
	FOREIGN KEY (file_id) REFERENCES raw_match_file_log(file_id)
);


