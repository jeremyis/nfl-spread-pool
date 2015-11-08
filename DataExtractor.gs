function DataExtractor(range) {
  // gameRows = [ 13, 14, .... ]
  this.gameRows = [];
  this.numGames = -1;
  this.range = range;
  // home: 1, jeremy: 3,
  this.columnIndex = {};
};
DataExtractor.JEREMY = 'jeremy';
DataExtractor.JOHN = 'john';
DataExtractor.MATT = 'matt';
DataExtractor.PICK = 'pick';
DataExtractor.PARTICIPANTS = [
  DataExtractor.JEREMY,
  DataExtractor.JOHN,
  DataExtractor.MATT,
  DataExtractor.PICK
];
DataExtractor.AWAY = 'away';
DataExtractor.HOME = 'home';
DataExtractor.RESULT = 'result';
DataExtractor.prototype.numGames = function () {
  return this.numGames;
};
DataExtractor.prototype.extract = function () {
  Logger.log('exract!');
  var header = this._getHeaderRow();
  var values = this.range.getValues();
  this.initializeColumnIndex(header);
  this.initializeGameRows(header);
  this.numGames = this.gameRows.length;
};
DataExtractor.prototype._getHeaderRow = function () {
  var values = this.range.getValues();
  for (var i = 0; i < this.range.getLastRow(); i++) {
    for (var j = 0; j < this.range.getLastColumn(); j++) {
      // are rows and cols right here?
      var value = values[i][j] || "";
      if ("away" == value.toLowerCase()) {
        return i;
      }
    }
  }
  throw new Error("Cannot find header row!");
}
DataExtractor.prototype.initializeColumnIndex = function(header) {
  var vals = []
    .concat([ DataExtractor.AWAY, DataExtractor.HOME, DataExtractor.RESULT ])
    .concat([ DataExtractor.JEREMY, DataExtractor.JOHN, DataExtractor.MATT, DataExtractor.PICK ]);
  for (val in vals) this.columnIndex[ vals[val] ] = -1;

  var remainingCount = vals.length;
  var remaining = {};
  for (i in vals) remaining[ vals[i] ] = true;

  var values = this.range.getValues()[header];
  for (var i in values) {
    var cell = values[i];
    for (key in remaining) {
      if (cell.trim().substr(0, key.length).toLowerCase() == key.toLowerCase()) {
        this.columnIndex[ key ] = i;
        delete remaining[ key];
        remainingCount--;
        break;
      }
    }
    if (remainingCount == 0) {
      break;
    }
  }
};
DataExtractor.prototype.initializeGameRows = function (header) {
  var gameRows = [];
  var awayCol = this.columnIndex[ DataExtractor.AWAY ];
  var homeCol = this.columnIndex[ DataExtractor.AWAY ];
  var values = this.range.getValues();
  for (var i = header; i < this.range.getLastRow(); i++) {
    if (isValidTeam(values[i][awayCol]) && isValidTeam(values[i][homeCol])) {
      gameRows.push(i);
    }
  };
  this.gameRows = gameRows;
};

DataExtractor.prototype.pickedCorrectForGame = function (person, gameNum) {
  if (!(0 <= gameNum && gameNum < this.gameRows.length)) {
    throw new Error("Invalid gameNum: " + gameNum + ". # of Game Rows: " + this.gameRows.length);
  }

  return this.pick(person, gameNum) == this.result(gameNum);
};
DataExtractor.prototype.gameIsDivisional = function (gameNum) {
  var teams = this.teams(gameNum);

  return teamsAreInSameDivision(teams[0], teams[1]);
};
DataExtractor.prototype.teams = function (gameNum) {
  var gameRow = this.gameRows[ gameNum ];
  var homeCol = this.columnIndex[ DataExtractor.HOME ];
  var awayCol = this.columnIndex[ DataExtractor.AWAY ];
  var values = this.range.getValues();
  return [ values[gameRow][awayCol].trim(), values[gameRow][homeCol].trim() ];
}
DataExtractor.prototype.result = function (gameNum) {
  var resultCol = this.columnIndex[ DataExtractor.RESULT ];
  var gameRow = this.gameRows[ gameNum ];
  return this.range.getValues()[gameRow][resultCol].trim();
};
DataExtractor.prototype.pick = function (person, gameNum) {
  var gameRow = this.gameRows[ gameNum ];
  var personCol = this.columnIndex[ person ];
  var pick = this.range.getValues()[gameRow][personCol].trim();
  return pick;
};
