/**
 * Backend for the Dec 5 Volunteer Sign-Up page.
 * Deploy this as a Web App (Execute as: Me, Who has access: Anyone)
 * and paste the resulting URL into APPS_SCRIPT_URL in index.html.
 *
 * Paste your Google Sheet's ID below (it's the long string in the
 * sheet's URL, between /d/ and /edit). The script will create a
 * "Slots" tab in that sheet automatically on first use.
 *
 * Data lives in a sheet tab called "Slots" with columns:
 * SlotID | Name | Group | Token | Timestamp
 * The tab and header row are created automatically on first use.
 */
var SPREADSHEET_ID = "PASTE_YOUR_GOOGLE_SHEET_ID_HERE";

function doGet(e) {
  return respond_(listSlots_());
}

function doPost(e) {
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return respond_({ ok: false, error: "Bad request." });
  }
  var action = data.action;
  var result;
  if (action === "claim") {
    result = claimSlot_(data.slotId, data.name, data.group);
  } else if (action === "remove") {
    result = removeSlot_(data.slotId, data.token);
  } else {
    result = { ok: false, error: "Unknown action." };
  }
  return respond_(result);
}

function respond_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function sheet_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sh = ss.getSheetByName("Slots");
  if (!sh) {
    sh = ss.insertSheet("Slots");
    sh.appendRow(["SlotID", "Name", "Group", "Token", "Timestamp"]);
  }
  return sh;
}

function findRow_(sh, slotId) {
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === slotId) return i + 1; // 1-indexed sheet row
  }
  return -1;
}

function listSlots_() {
  var sh = sheet_();
  var data = sh.getDataRange().getValues();
  var slots = {};
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row[0] && row[1]) {
      slots[row[0]] = { name: row[1], group: row[2] || "" };
    }
  }
  return { ok: true, slots: slots };
}

function claimSlot_(slotId, name, group) {
  if (!slotId || !name) return { ok: false, error: "Please enter your name." };
  name = name.toString().trim().slice(0, 60);
  group = (group || "").toString().slice(0, 60);
  if (!name) return { ok: false, error: "Please enter your name." };

  var lock = LockService.getScriptLock();
  var gotLock = lock.tryLock(10000);
  if (!gotLock) return { ok: false, error: "Server is busy, please try again." };
  try {
    var sh = sheet_();
    var row = findRow_(sh, slotId);
    if (row > 0) {
      var existingName = sh.getRange(row, 2).getValue();
      if (existingName) return { ok: false, error: "taken" };
      var token = Utilities.getUuid();
      sh.getRange(row, 2, 1, 4).setValues([[name, group, token, new Date()]]);
      return { ok: true, token: token };
    } else {
      var newToken = Utilities.getUuid();
      sh.appendRow([slotId, name, group, newToken, new Date()]);
      return { ok: true, token: newToken };
    }
  } finally {
    lock.releaseLock();
  }
}

function removeSlot_(slotId, token) {
  if (!slotId || !token) return { ok: false, error: "Missing info." };
  var lock = LockService.getScriptLock();
  var gotLock = lock.tryLock(10000);
  if (!gotLock) return { ok: false, error: "Server is busy, please try again." };
  try {
    var sh = sheet_();
    var row = findRow_(sh, slotId);
    if (row < 0) return { ok: false, error: "Not found." };
    var existingToken = sh.getRange(row, 4).getValue();
    if (existingToken !== token) return { ok: false, error: "Not authorized." };
    sh.getRange(row, 2, 1, 4).setValues([["", "", "", ""]]);
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}
