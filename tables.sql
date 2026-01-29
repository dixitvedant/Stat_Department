Create Table Player(
    player_id INT PRIMARY KEY AUTO_INCREMENT,
    team_id INT,
    player_name VARCHAR(50),
    player_age INT,
    role VARCHAR(20),
    FOREIGN KEY(team_id) REFERENCES Team(team_id) 
);

Create Table Team(
    team_id INT PRIMARY KEY AUTO_INCREMENT,
    team_name VARCHAR(50),
    No_of_attackers INT,
    No_of_defenders INT,
    No_of_all_arounders INT,
    City_name VARCHAR(50),
    Coach_name VARCHAR(30)
);

Create Table Match_details(
    match_id INT PRIMARY KEY AUTO_INCREMENT,
    venue VARCHAR(30),
    team_a INT,
    team_b INT,
    match_date DATE,
    winning_team INT,
    FOREIGN KEY(team_a) REFERENCES Team(team_id),
    FOREIGN KEY(team_b) REFERENCES Team(team_id),
    FOREIGN KEY(winning_team) REFERENCES Team(team_id)
);

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

Create Table Player_season_stat(
		player_id INT PRIMARY KEY,
		matches_played INT,
		total_points INT,
		avg_points Float,
		best_match_point INT,
		ranking INT,
        FOREIGN KEY(player_id) REFERENCES Player(player_id)
);

Create Table team_stat(
		team_id INT PRIMARY KEY,
		matches_played INT,
		matches_wins INT,
		matches_lost INT,
		total_points INT,
        FOREIGN KEY(team_id) REFERENCES Team(team_id)
);