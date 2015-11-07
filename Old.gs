/**
 * Google Spreadsheets App Script for setting background color for correct /
 * incorrect NFL Pick-em pool selections.
 *
 * Assumptions:
 *   1) First row with text is the header row. Data are immediately below it.
 *   2) There are three participants (Jeremy, John, Matt).
 *   3) No blank rows (games) between data rows.
 */

var getSheet;
(function () {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  getSheet = function() {
    return sheet;
  }

})();

/**
 * Retrieves all the rows in the active spreadsheet that contain data and logs the
 * values for each row.
 * For more information on using the Spreadsheet API, see
 * https://developers.google.com/apps-script/service_spreadsheet
 */
function readRows() {
  var sheet = getSheet();
  var rows = sheet.getDataRange();
  var numRows = rows.getNumRows();
  var values = rows.getValues();

  for (var i = 0; i <= numRows - 1; i++) {
    var row = values[i];
    Logger.log(row);
  }
};

var GREEN_HEX = '#dff0d8';
var RED_HEX = '#f2dede';

// TOOD: finish this;
NUM_PICK_COLS = 4;
/**
 * Scans the sheet looking for the columns that contain users or aggregate
 * picks (by searching for the string 'pick'). Stops after finding NUM_PICK_COLS
 * or reaching the end of sheet.
 *
 * Returns a list of column numbers for each pick category.
 */
function getPickStartColumns(sheet) {
  var cells = sheet.getSheetValues(1, 1, 40, 40);
  var picks = [];
  for (var row = 0; row < cells.length; row++) {
    for (var col = 0; col < cells[row].length; col++) {
      Logger.log(cells[row][col]);
      var cell = String(cells[row][col]);
      if (cell && cell.toLowerCase().indexOf('pick') > 0) {
        picks.push(col);
        break;
      }
    }
    if (picks.length >= NUM_PICK_COLS) {
      break;
    }
  }
  return picks;
}

/**
 * Returns a column number for the second row with data. The first row with
 * data is considered to be the header row.
 */
function getDataStartRow() {
  var sheet = getSheet();
  var cells = sheet.getSheetValues(1, 1, 40, 40);
  var headerFound = false;
  for (var row = 0; row < cells.length; row++) {
    for (var col = 0; col < cells[row].length; col++) {
      var hasData = !!String(cells[row][col]);
      if (hasData && headerFound) return row;
      if (hasData) headerFound = true
    }
  }
  return -1;
}

/**
 * Returns number of rows with data starting at the startRow. Tests data in
 * dataColumn.
 */
function getNumGames(startRow, dataColumn) {
  var sheet = getSheet();
  var maxRows = 30;
  var values = sheet.getRange(startRow, dataColumn, maxRows, 1).getValues();
  var i = 1;
  for (var row in values) {
    if(!values[row][0]) return i;
    i += 1;
  }
  return -1;
}

function colorizePicks() {
  // 1. Determine # of games
  //   1a. Find "Away", "Home".
  //   2b.  Count rows below until first empty row
  // 2. Determine "Pick" and "Result" columns
  //   - look for "Pick" columns / "Result" in same row as "Away" / "Home")
  // 3. Go through pick columns, highlight if win or loss
  Logger.log("on edit!");
  var sheet = getSheet();

  var pickStartColumns = getPickStartColumns(sheet);
  var pickStartRow = getDataStartRow();
  var numGames = getNumGames(pickStartRow, pickStartColumns[0]);

  Logger.log(["Pick start row:", pickStartRow, ". Pick columns: (",
       pickStartColumns.join(','), "). Number of games: ", numGames].join(" "));
  return;

  /*****************/
  // TODO: get results column.... Use that to compare to each pick columns.
  /*****************/

  var results = sheet.getRange(pickStartRow, Math.max.apply(Math, pickStartColumns), numGames, 1).getValues();
    Logger.log("C!");
  for (var colIndex in pickStartColumns) {
    //Logger.log("col " + col + " = " + results[rowIndex][0] + " : " );
    Logger.log("erger PENIS!");
    for (var rowIndex in results) {
      Logger.log("OOP");
      var result = results[rowIndex][0];
      //Logger.log("cell " + rowIndex + " : " + col + "= " + result);
      if (result.length > 0) {
        var col = pickStartColumns[colIndex];
        var pickCell = sheet.getRange(Number(pickStartRow) + Number(rowIndex), col, 1, 1);
        Logger.log(pickStartRow + " + " + rowIndex + ", " + col + " ->" + pickCell.getValue() + " ==? " + result);
        pickCell.setBackgroundColor(pickCell.getValue()[0][0] == result ? GREEN_HEX : RED_HEX);
      }
    }
  }
}
// Also run on edit.
function onEdit() {
  Logger.log("on edit!");
  //colorizePicks();
}
function onChange() {
  Logger.log("On change!");
}
