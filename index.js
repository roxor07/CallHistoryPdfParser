const { PdfReader } = require("pdfreader");

let rows = {};
let count = 0;
let dateTimeMap = {};

function convertTimeStringToSeconds(timeString) {
  let indexOfHour = timeString.indexOf("h");
  let indexOfMinute = timeString.indexOf("m");
  let indexOfSeconds = timeString.length - 1;
  let hours =
    indexOfHour != -1 ? parseInt(timeString.substring(0, indexOfHour)) : 0;
  let minutes =
    indexOfHour != -1
      ? indexOfMinute != -1
        ? parseInt(timeString.substring(indexOfHour + 1, indexOfMinute))
        : 0
      : indexOfMinute != -1
      ? parseInt(timeString.substring(0, indexOfMinute))
      : 0;
  let seconds =
    indexOfMinute != -1
      ? parseInt(timeString.substring(indexOfMinute + 1, indexOfSeconds))
      : parseInt(timeString.substring(0, indexOfSeconds));
  return hours * 60 * 60 + minutes * 60 + seconds;
}

function getTimeInString(timeInSeconds) {
  let hours = parseInt(timeInSeconds / 3600);
  let minutes = 0;
  let seconds = 0;
  if (hours) {
    minutes = parseInt((timeInSeconds - hours * 60 * 60) / 60);
    seconds = parseInt(timeInSeconds - (hours * 60 * 60 + minutes * 60));
  } else {
    minutes = parseInt(timeInSeconds / 60);
    seconds = parseInt(minutes ? timeInSeconds - minutes * 60 : timeInSeconds);
  }
  let result = hours ? hours + "h" : "";
  result += minutes ? minutes + "m" : "";
  result += seconds ? seconds + "s" : "";
  return result;
}

function printRows() {
  let res = [];
  Object.keys(rows)
    .sort((y1, y2) => parseFloat(y1) - parseFloat(y2))
    .forEach((y) => {
      let record = (rows[y] || []).join("");
      if (record.match(/<number>/) && record.match(/ANSWERED/)) {
        res = record
          .replace(/ShekharPratik011<number>/, " ")
          .replace(/ANSWERED([0-9A-Z:]+)/, "")
          .trim()
          .split(" ");
        dateTimeMap[res[0]] = dateTimeMap[res[0]]
          ? parseInt(dateTimeMap[res[0]]) + convertTimeStringToSeconds(res[1])
          : convertTimeStringToSeconds(res[1]);
        count++;
      }
    });
}
new PdfReader().parseFileItems("./resource/CallHistory.pdf", (err, item) => {
  if (!item) {
    let resultMap = {};
    console.log("count: " + count);
    Object.entries(dateTimeMap).forEach((entry) => {
      resultMap[entry[0]] = getTimeInString(entry[1]);
    });
    console.log(resultMap);
  } else if (item.page) {
    printRows();
    rows = {};
  } else if (item.text) {
    (rows[item.y] = rows[item.y] || []).push(item.text);
  }
});
