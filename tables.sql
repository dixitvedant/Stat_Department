Create Table Player(
    player_id INT PRIMARY KEY AUTO_INCREMENT,
    team_id INT,
    player_name VARCHAR(50),
    player_age INT,
    role VARCHAR(20),
    FOREIGN KEY(team_id) REFERENCES Team(team_id) 
);
/*INSERT INTO Player (player_id, team_id, player_name, player_age, role)
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
(30, 2, 'vedant gaikwad', 16, 'All-Rounder');*/

Create Table Team(
    team_id INT PRIMARY KEY AUTO_INCREMENT,
    team_name VARCHAR(50),
    No_of_attackers INT,
    No_of_defenders INT,
    No_of_all_arounders INT,
    City_name VARCHAR(50),
    Coach_name VARCHAR(30)
);
/*INSERT INTO TEAM (team_id, team_name, No_of_attackers, No_of_defenders, No_of_all_arounders, City_name, Coach_name)
VALUES 
(1, 'Satara Warriors', 5, 6, 4, 'satara', 'Coach gaikwad'),
(2, 'Pune Champions', 4, 6, 4, 'pune', 'Coach jagdale'),
(3, 'Solapur Royals', 7, 4, 4, 'solapur', 'Coach waghmare'),
(4, 'Dharashiv Marshals', 5, 5, 5, 'dharashiv', 'Coach valunj'),
(5, 'Chennai Guns', 4, 4, 7, 'chennai', 'Coach shinde'),
(6, 'Mumbai Khiladi', 3, 6, 6, 'mumbai', 'Coach pawar'),
(7, 'Delhi Deredevils', 2, 7, 6, 'delhi', 'Coach yadav'),
(8, 'Hyderabad Spartans', 4, 5, 6, 'hyderabad', 'Coach kalyankar');*/

Create Table Match_details(
    match_id INT PRIMARY KEY AUTO_INCREMENT,
    venue VARCHAR(30),
    team_a INT,
    team_b INT,
    match_date DATE,
    winning_team INT,
	teamA_score INT,
	teamB_score INT,
    FOREIGN KEY(team_a) REFERENCES Team(team_id),
    FOREIGN KEY(team_b) REFERENCES Team(team_id),
    FOREIGN KEY(winning_team) REFERENCES Team(team_id)
);
/*INSERT INTO Match_details (match_id, venue, team_a, team_b, match_date, winning_team,teamA_score,teamB_score)
VALUES 
(1, 'Pune', 1, 2, '2026-01-10', 2,18,15),
(2, 'Mumbai', 3, 4, '2026-01-12', 3,20,25),
(3, 'Nashik', 5, 6, '2026-01-15', 6,15,15),
(4, 'Nagpur', 7, 8, '2026-01-18', 7,10,35),
(5, 'Kolhapur', 2, 3, '2026-01-20', 2,28,15);*/


Create Table Player_match_stat(
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
/*INSERT INTO Player_match_stat (stat_id, player_id, match_id, attack_points, defense_points, successful_dives, out_given)
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
(16, 16, 1, 4, 260, 0, 0),
(17, 17, 1, 6, 135, 1, 0),
(18, 18, 1, 0, 0, 0, 0),
(19, 19, 1, 0, 100, 0, 0),
(20, 20, 1, 0, 60, 0, 0),
(21, 21, 1, 0, 0, 0, 0),
(22, 22, 1, 0, 10, 0, 0),
(23, 23, 1, 2, 60, 0, 0),
(24, 24, 1, 0, 0, 1, 0),
(25, 25, 1, 6, 0, 0, 0),
(26, 26, 1, 0, 20, 0, 0),
(27, 27, 1, 0, 0, 0, 0),
(28, 28, 1, 0, 0, 0, 0),
(29, 29, 1, 0, 0, 0, 0),
(30, 30, 1, 2, 90, 0, 1);*/

Create Table team_stat(
		team_id INT PRIMARY KEY,
		matches_played INT,
		matches_wins INT,
		matches_lost INT,
	    matches_draws INT,
		total_points INT,
        FOREIGN KEY(team_id) REFERENCES Team(team_id)

);
/*INSERT INTO team_stat (team_id, matches_played, matches_wins, matches_lost, matches_draws, total_points)
VALUES 
(1, 7, 4, 3, 0, 8),
(2, 7, 7, 0, 0, 14),
(3, 7, 5, 1, 1, 11),
(4, 7, 1, 6, 0, 2),
(5, 7, 3, 4, 0, 6),
(6, 7, 0, 5, 2, 2),
(7, 7, 6, 1, 0, 12),
(8, 7, 5, 1, 1, 11);*/

CREATE TABLE Match_Stats (
	stat_id INT PRIMARY KEY AUTO_INCREMENT,
	match_id INT,
	category VARCHAR(50),
	particular VARCHAR(50),
	team_a_count INT DEFAULT 0,
	team_b_count INT DEFAULT 0,
	FOREIGN KEY (match_id) REFERENCES Match_details(match_id));
/*INSERT INTO Match_Stats (stat_id, match_id, category, particular, team_a_count, team_b_count)
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

Create Table team_stat(
		team_id INT PRIMARY KEY,
		matches_played INT,
		matches_wins INT,
		matches_lost INT,
	    matches_draws INT,
		total_points INT,
        FOREIGN KEY(team_id) REFERENCES Team(team_id)
	);



