/**
 * Google Apps Script Web App Template for Model Casting Registration
 * 
 * Automatically structures uploads inside Google Drive as:
 * Sindur Casting Photos / [Candidate Name] - [WhatsApp Number] / [Photos]
 * 
 * Instructions to Deploy:
 * 1. Open Google Sheets (create a new sheet or open an existing one).
 * 2. In the top menu, go to Extensions -> Apps Script.
 * 3. Replace all default code in Apps Script with this script.
 * 4. Click the "Save" icon (Floppy disk).
 * 5. Click the blue "Deploy" button (top right) -> "New deployment".
 * 6. Click the Gear icon next to "Select type" and choose "Web app".
 * 7. Set the following options:
 *    - Description: Model Registration Web App with Subfolders
 *    - Execute as: Me (your-email@gmail.com)
 *    - Who has access: Anyone (MUST be "Anyone", do NOT choose "Anyone with Google account")
 * 8. Click "Deploy", authorize permissions, and copy the Web App URL.
 * 9. Paste this URL into your Vite project's `/src/config.ts` file.
 */

// Configuration - Main folder name in Google Drive
const MAIN_FOLDER_NAME = "Sindur Casting Photos";

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

    // Prepare row data for Google Sheet
    const timestamp = new Date();
    const row = [
      timestamp,
      data.name,
      data.gender,
      data.age,
      data.whatsapp,
      data.location,
      data.height,
      data.previousShoot,
      data.instagram || "",
      photo1Url,
      photo2Url
    ];

    sheet.appendRow(row);

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

function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}
