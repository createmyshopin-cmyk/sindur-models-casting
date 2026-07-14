/**
 * Google Apps Script Web App Template for Model Casting Registration
 * 
 * Automatically structures uploads inside Google Drive as:
 * Sindur Casting Photos / [Candidate Name] - [WhatsApp Number] / [Photos]
 * And triggers a WhatsApp template message via Wati API V3.
 */

// Configuration - Main folder name in Google Drive
const MAIN_FOLDER_NAME = "Sindur Casting Photos";

const WATI_API_ENDPOINT = "https://live-mt-server.wati.io";
const WATI_BEARER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6Imtlcy5zaW5kdXJAZ21haWwuY29tIiwibmFtZWlkIjoia2VzLnNpbmR1ckBnbWFpbC5jb20iLCJlbWFpbCI6Imtlcy5zaW5kdXJAZ21haWwuY29tIiwiYXV0aF90aW1lIjoiMDcvMTQvMjAyNiAwNzoxMjo1NCIsInRlbmFudF9pZCI6IjEwMTkzMDI0IiwiZGJfbmFtZSI6Im10LXByb2QtVGVuYW50cyIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkFETUlOSVNUUkFUT1IiLCJleHAiOjI1MzQwMjMwMDgwMCwiaXNzIjoiQ2xhcmVfQUkiLCJhdWQiOiJDbGFyZV9BSSJ9.rFu5n7UUeVzvuwjs-ShneQMKdEKS-qGQ4csMNmd7yME";
const WATI_TEMPLATE_NAME = "model_casting_2026";
const WATI_CHANNEL = "916235905050"; // Sender number (numbers only)

function doPost(e) {
  try {
    // Parse incoming JSON payload
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Auto-initialize headers if the spreadsheet is empty
    if (sheet.getLastRow() === 0) {
      const headers = [
        "Timestamp",
        "Name",
        "Gender",
        "Age",
        "WhatsApp Number",
        "Location",
        "Height",
        "Previous Model Shoot",
        "Instagram",
        "Photo 1 URL",
        "Photo 2 URL"
      ];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#F5F5F5");
    }

    // 1. Get or create the main "Sindur Casting Photos" folder
    let mainFolder;
    const mainFolders = DriveApp.getFoldersByName(MAIN_FOLDER_NAME);
    if (mainFolders.hasNext()) {
      mainFolder = mainFolders.next();
    } else {
      mainFolder = DriveApp.createFolder(MAIN_FOLDER_NAME);
    }

    // 2. Create subfolder named "[Name] - [WhatsApp]" inside the main folder
    const subFolderName = data.name + " - " + data.whatsapp;
    const candidateFolder = mainFolder.createFolder(subFolderName);
    
    // Make the subfolder publicly accessible so photos can be viewed via URLs
    candidateFolder.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);

    // 3. Process and upload Image 1 inside candidate subfolder
    let photo1Url = "";
    if (data.photo1 && data.photo1.base64) {
      photo1Url = uploadFileToFolder(candidateFolder, data.photo1.base64, data.photo1.name || "photo1.jpg", data.photo1.type || "image/jpeg");
    }

    // 4. Process and upload Image 2 inside candidate subfolder
    let photo2Url = "";
    if (data.photo2 && data.photo2.base64) {
      photo2Url = uploadFileToFolder(candidateFolder, data.photo2.base64, data.photo2.name || "photo2.jpg", data.photo2.type || "image/jpeg");
    }

    // Prepare row data for Google Sheet (standardize WhatsApp to '91' + 10 digits)
    var cleanWhatsapp = data.whatsapp.replace(/\D/g, '');
    if (cleanWhatsapp.length === 10) {
      cleanWhatsapp = "91" + cleanWhatsapp;
    }

    const timestamp = new Date();
    const row = [
      timestamp,
      data.name,
      data.gender,
      data.age,
      cleanWhatsapp, // Standardized in sheet
      data.location,
      (data.height === "other" && data.customHeight) ? data.customHeight : data.height,
      data.previousShoot,
      data.instagram || "",
      photo1Url,
      photo2Url
    ];

    sheet.appendRow(row);

    // 5. Send Wati WhatsApp Template Notification to Candidate (Secure Server-side Call)
    try {
      sendWatiTemplateMessage(cleanWhatsapp, data.name);
    } catch (watiError) {
      // Log errors but do not crash the registration response
      Logger.log("WATI WhatsApp Error: " + watiError.toString());
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Application submitted successfully",
      urls: { photo1: photo1Url, photo2: photo2Url }
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Helper function to decode base64 images and save inside a specific folder object
function uploadFileToFolder(folder, base64Data, fileName, mimeType) {
  const decodedData = Utilities.base64Decode(base64Data);
  const blob = Utilities.newBlob(decodedData, mimeType, fileName);
  
  // Create file in the subfolder
  const file = folder.createFile(blob);
  
  // Make the file publicly accessible
  file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
  
  return file.getUrl();
}

// Secure helper function to call Wati API V3 template messaging
function sendWatiTemplateMessage(recipientNumber, name, location) {
  // Format phone number: remove non-digits, prepend 91 for India if 10-digit number
  var cleanNumber = recipientNumber.replace(/\D/g, '');
  if (cleanNumber.length === 10) {
    cleanNumber = "91" + cleanNumber;
  }

  var url = WATI_API_ENDPOINT + "/api/ext/v3/messageTemplates/send";
  
  var payload = {
    "template_name": WATI_TEMPLATE_NAME,
    "broadcast_name": "Model Casting Submission",
    "channel": WATI_CHANNEL,
    "recipients": [
      {
        "phone_number": cleanNumber,
        "custom_params": [
          { "name": "Name", "value": name },
          { "name": "1", "value": name } // Positional fallback
        ]
      }
    ]
  };

  var options = {
    "method": "post",
    "contentType": "application/json",
    "headers": {
      "Authorization": "Bearer " + WATI_BEARER_TOKEN
    },
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };

  var response = UrlFetchApp.fetch(url, options);
  Logger.log("WATI API Response Code: " + response.getResponseCode());
  Logger.log("WATI API Response Body: " + response.getContentText());
}

function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}
