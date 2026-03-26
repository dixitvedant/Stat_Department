from flask import Flask, jsonify,request
from flask_cors import CORS
from attack_json import build_attack_json
from database_connectivity import connect_db, fetch_tables
from Point_Table_json import Point_Table
from roaster_json import build_roaster_json
from h2h_json import build_h2h_json
from defence_json import build_defence_json
from match_wise_json import build_match_wise
from LeaderBoard_tournament_json import LeaderBoard_tournament
from match_details_json import build_match_details_json
from tournament_player_stats import tournament_players_json
from player_profile import build_players_json
from LeaderBoard import LeaderBoard_match

app = Flask(__name__)
CORS(app)

def load_clean_data():
    conn = connect_db()
    dfs = fetch_tables(conn)
    conn.close()
    return dfs

@app.route("/LeaderBoard")
def get_LeaderBoard_match():
    filters = {}

    tournament = request.args.get("tournament")
    match_name = request.args.get("id")
    if tournament and tournament != "all":
        filters["tournament"] = tournament
    if match_name:
        filters["match"] = match_name
    dfs=load_clean_data()
    data=LeaderBoard_match(dfs,filters)
    return jsonify(data)

@app.route("/player-profile")
def get_player_profile():
    filters = {}

    tournament = request.args.get("tournament")
    player_code = request.args.get("playerId")  
    if tournament and tournament != "all":
        filters["tournament"] = tournament

    if player_code:
        filters["player_code"] = player_code

    dfs = load_clean_data()
    data = build_players_json(dfs, filters)

    return jsonify(data)

@app.route("/player-tournament")
def get_player_tournament_stats():
    filters = {}

    tournament = request.args.get("tournament")

    if tournament:
        filters["tournament"] = tournament
    dfs=load_clean_data()
    data=tournament_players_json(dfs,filters)
    return jsonify(data)

@app.route("/match-details")
def get_match_details():
    tournament_name = request.args.get("tournament")
    match_name = request.args.get("id")

    filters = {}

    if tournament_name:
        filters["tournament"] = tournament_name

    if match_name:
        filters["match"] = match_name
    dfs=load_clean_data()
    data=build_match_details_json(dfs,filters)
    return jsonify(data)
    
@app.route("/point-table")
def get_point_table():
    filters = {}

    if request.args.get("tournament"):
        filters["tournament"] = request.args.get("tournament")

    dfs = load_clean_data()
    data = Point_Table(dfs, filters)

    return jsonify(data)

@app.route("/roaster")
def get_roaster():
    tournament_name = request.args.get("tournament")
    match_name = request.args.get("id")

    filters = {}

    if tournament_name:
        filters["tournament"] = tournament_name

    if match_name:
        filters["match"] = match_name
    dfs=load_clean_data()
    data=build_roaster_json(dfs,filters)
    return jsonify(data)

@app.route("/attacker")
def get_attacker():
    tournament_name = request.args.get("tournament")
    match_name = request.args.get("id")

    filters = {}

    if tournament_name:
        filters["tournament"] = tournament_name

    if match_name:
        filters["match"] = match_name

    dfs=load_clean_data()
    data=build_attack_json(dfs,filters)
    return jsonify(data)

@app.route("/h2h")
def get_h2h():
    tournament_name = request.args.get("tournament")
    match_name = request.args.get("id")

    filters = {}

    if tournament_name:
        filters["tournament"] = tournament_name

    if match_name:
        filters["match"] = match_name
    dfs=load_clean_data()
    data=build_h2h_json(dfs,filters)
    return jsonify(data)

@app.route("/defence")
def get_defence():
    tournament_name = request.args.get("tournament")
    match_name = request.args.get("id")

    filters = {}

    if tournament_name:
        filters["tournament"] = tournament_name

    if match_name:
        filters["match"] = match_name
    dfs=load_clean_data()
    data=build_defence_json(dfs,filters)
    return jsonify(data)

@app.route("/match-wise")
def get_match_wise():

    filters = {}

    query = request.args.get("query")
    year = request.args.get("year")
    tournament = request.args.get("tournament")

    if query:
        filters["query"] = query

    if year and year != "all":
        filters["year"] = year

    if tournament and tournament != "all":
        filters["tournament"] = tournament

    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))

    dfs = load_clean_data()

    data = build_match_wise(dfs, filters)

    all_matches = data["matches"]

    total_matches = len(all_matches)

    start = (page - 1) * limit
    end = start + limit

    page_matches = all_matches[start:end]

    return jsonify({
        "matches": page_matches,
        "page": page,
        "limit": limit,
        "total": total_matches
    })
    
@app.route("/LeaderBoard-tournament")
def get_leaderboard_season():
    filters = {}

    tournament = request.args.get("tournament")
    if tournament and tournament != "all":
        filters["tournament"] = tournament
    dfs=load_clean_data()
    data=LeaderBoard_tournament(dfs,filters)
    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True)
