var DIVISIONS = [
  [ 'Baltimore', 'Cincinnati', 'Cleveland', 'Pittsburgh' ],
  [ 'Chicago', 'Detroit', 'Green Bay', 'Minnesota' ],
  [ 'Houston', 'Indianapolis', 'Jacksonville', 'Tennessee' ],
  [ 'Atlanta', 'Carolina', 'New Orleans', 'Tampa Bay' ],
  [ 'Buffalo', 'Miami', 'New England', 'NY Jets' ],
  [ 'Dallas', 'NY Giants', 'Philadelphia', 'Washington' ],
  [ 'Denver', 'Kansas City', 'Oakland', 'San Diego' ],
  [ 'Arizona', 'San Francisco', 'Seattle', 'St. Louis' ]
];

function teamsAreInSameDivision(teamA, teamB) {
  teamA = teamA.trim().toLowerCase();
  teamB = teamB.trim().toLowerCase();
  for (var i in DIVISIONS) {
    var teams = DIVISIONS[i].map(function(x) { return x.toLowerCase(); });
    if (teams.indexOf(teamA) > -1) {
      return teams.indexOf(teamB) > -1;
    }
  }
  throw new Error("Unrecognized team in DIVISIONS: " + teamA);
};

var TEAMS = {};
for (var i in DIVISIONS) {
  for (var j in DIVISIONS[i]) {
    TEAMS[ DIVISIONS[i][j] ] = true;
  }
};

function isValidTeam(team) {
  return !!TEAMS[team];
}

function formatPercent(num) {
  var x = String(num * 100);
  return x.substr(0, 5) + '%';
}
