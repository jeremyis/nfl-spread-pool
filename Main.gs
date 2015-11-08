var CURRENT_WEEK = 'week 9';

/**
 * Adds a custom menu to the active spreadsheet, containing a single menu item
 * for invoking the readRows() function specified above.
 * The onOpen() function, when defined, is automatically invoked whenever the
 * spreadsheet is opened.
 * For more information on using the Spreadsheet API, see
 * https://developers.google.com/apps-script/service_spreadsheet
 */
function onOpen() {
  var spreadsheet = getSheet();
  var entries = [{
    name : "Highlight Correct/Incorrect Picks",
    functionName : "colorizePicks"
  }, {
    name : "Calculate Division Win % Stats",
    functionName: "calculateDivisionWinPercentage"
  }];
  spreadsheet.addMenu("Script Center Menu", entries);
};

function calculateDivisionWinPercentage() {

  //var sheet = getSheets();
  var sheets = getCompletedWeekSheets();
  var results = [];
  for (var i = 0; i < sheets.length; i++) {
    // Record for each pick, the week, what each selected, what total selected, and if it was a divison
    results.push(divisionWinPercentage(sheets[i]));
  }
  // see for each week x person, division and total, and then overall and division
  // results = [{
  // data={matt={divisionalCorrect=4.0, picksCorrect=6.0},
  //   pick={divisionalCorrect=0.0, picksCorrect=0.0},
  //   john={divisionalCorrect=5.0, picksCorrect=6.0},
  //   jeremy={divisionalCorrect=5.0, picksCorrect=9.0}},
  // totalGames=14.0, name=Week 8, divisionalGames=6.0
  // }]
  var total = {
    totalGames: 0,
    divisionalGames: 0
  };
  var totalKey = function(p) { return p + 'AllCorrect'; };
  var divisionalKey = function(p) { return p + 'DivisionalCorrect'; };
  var parts = DataExtractor.PARTICIPANTS;
  for (var p in parts) {
    total[totalKey(parts[p])] = 0;
    total[divisionalKey(parts[p])] = 0;
  }
  for (var i in results) {
    var week = results[i];
    total.totalGames += week.totalGames;
    total.divisionalGames += week.divisionalGames;
    for (var p in parts) {
      total[totalKey(parts[p])] += week.data[parts[p]].picksCorrect;
      total[divisionalKey(parts[p])] += week.data[parts[p]].divisionalCorrect;
    }
  }

  Logger.log("=================================================================");
  Logger.log("Results for ALL weeks (excluding current:" + CURRENT_WEEK + ")");
  Logger.log("-----------------------------------------------------------------");
  Logger.log("Total games: " + total.totalGames);
  Logger.log("Total divisional games: " + total.divisionalGames);
  for (var p in parts) {
    var person = parts[p];
    var percentage = total[totalKey(person)] / total.totalGames;
    Logger.log(person + " total correct: " + String(total[totalKey(person)])
        + " / " + String(total.totalGames) + " (" + formatPercent(percentage) + ")");
    var divPercent = total[divisionalKey(person)] / total.divisionalGames;
    Logger.log(person + " divisional correct: " + String(total[divisionalKey(person)])
        + " / " + String(total.divisionalGames) + " (" + formatPercent(divPercent) + ")");
  }
  Logger.log("=================================================================");
};
function divisionWinPercentage(sheet) {
  var results = {
    name: sheet.getName(),
    data: {},
    totalGames: 0,
    divisionalGames:0
  };

  var participants = DataExtractor.PARTICIPANTS;
  for (var p in participants) {
    results.data[ participants[p] ] = { picksCorrect: 0, divisionalCorrect: 0 };
  }
  var extractor = new DataExtractor(sheet.getDataRange());
  extractor.extract();
  results.totalGames = extractor.numGames;
  for (var game = 0; game < extractor.numGames; game++) {
    var isDivisional = extractor.gameIsDivisional(game);
    results.divisionalGames += isDivisional ? 1 : 0
    for (var j in participants) {
      var participant = participants[j];
      var correct = extractor.pickedCorrectForGame(participant, game);
      results.data[participant].picksCorrect += correct ? 1 : 0;
      results.data[participant].divisionalCorrect += (correct && isDivisional) ? 1 : 0;
    }
  }
  return results;
};

/**
 * Append table to stats sheet. Teams as rows, participants as columns. Value is
 * percentage of time we guess correctly.
 */
function teamBias() {
  var participants = DataExtractor.PARTICIPANTS;
  function main() {
    var sheets = getCompletedWeekSheets();
    var results = [];
    for (var i = 0; i < sheets.length; i++) {
      // Record for each pick, the week, what each selected, what total selected, and if it was a divison
      results.push(teamBiasForWeek(sheets[i]));
    }
    var data = compileResults(results);
    printAsTable(data);
  };
  function compileResults(results) {
    /**
      * Results looks like:
      * results = [{
      *   teams= [  Miami, New England, ...],
      *   name=Week 8,
      *   correctPicks= {
      *     pick = [ New England, ... ],
      *     matt = [ New England, ... ],
      *     john = [ New England, ... ]
      *   }
      * }]
      */
    var data = {
      gamesPerTeam: {},
      correctPicksPerParticipant: {}
    }
    for (var team in TEAMS) { data.gamesPerTeam[ team ] = 0; }
    for (var p in participants) {
      data.correctPicksPerParticipant[ participants[p] ] = {};
      for (var team in TEAMS) {
        data.correctPicksPerParticipant[ participants[p] ][ team ] = 0;
      }
    }

    // Iterate through each sheet results.
    for (var r in results) {
      var result = results[r];

      // Count total games played by teams.
      for (var t in result.teams) {
        data.gamesPerTeam[ result.teams[t] ] += 1;
      }

      // Aggregate correct picks by participant x team.
      for (var part in result.correctPicks) {
        for (var pickI in result.correctPicks[part]) {
          var pick = result.correctPicks[part][pickI];
          data.correctPicksPerParticipant[part][pick] += 1;
        }
      }
    }
    return data;
  };
  function printAsTable(data) {
    var teamRow = [ '' ];
    for (var team in TEAMS) { teamRow.push(team); }
    var totalGamesRow = [ 'games played' ];
    for (var team in TEAMS) {
      totalGamesRow.push(data.gamesPerTeam[ team ]);
    }
    var headerRow = ['Team bias summary', 'Run on:', new Date()];
    var rows = [ [''], headerRow,  teamRow, totalGamesRow ];

    for (var p in participants) {
      var person = participants[p];
      var row = [ person ];
      rows.push(row);
      for (var team in TEAMS) {
        var correct = data.correctPicksPerParticipant[person][team];
        row.push(correct);
      }
    }
    var statsSheet = getStatsSheet();
    for (var r in rows) {
      var row = rows[r];
      Logger.log(row.length);
      Logger.log(row);
      statsSheet.appendRow(row);
    }
  }

  function teamBiasForWeek(sheet) {
    var results = {
      name: sheet.getName(),
      correctPicks: {},
      teams: []
    };
    for (var p in participants) {
      results.correctPicks[ participants[p] ] = [];
    }
    var extractor = new DataExtractor(sheet.getDataRange());
    extractor.extract();
    for (var game = 0; game < extractor.numGames; game++) {
      var result = extractor.result(game);
      var teams = extractor.teams(game);
      results.teams.push(teams[0], teams[1]);
      for (var p in participants) {
        var pick = extractor.pick(participants[p], game);
        var opponent = pick == teams[0] ? teams[1] : teams[0];
        if (pick == result) {
          // Count a successful selection as correct for both the winning team
          // AND their opponent. Count the opponent since the participant
          // successfully selected against them.
          results.correctPicks[ participants[p] ].push(pick)
          results.correctPicks[ participants[p] ].push(opponent)
        }
      }
    }
    return results;
  }

    return main();
};

