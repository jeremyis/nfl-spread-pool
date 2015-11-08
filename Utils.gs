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

function getStatsSheet() {
  var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  var results = [];
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName().toLowerCase().trim() == "pick stats") {
      return sheets[i];
    }
  }
  throw new Error("Cannot find stats sheet.");
}

function getCompletedWeekSheets() {
  var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  var results = [];
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName().toLowerCase() != "pick stats" && sheets[i].getName().toLowerCase() != CURRENT_WEEK) {
      // Record for each pick, the week, what each selected, what total selected, and if it was a divison
      results.push(sheets[i]);
    }
  }
  return results;
};
