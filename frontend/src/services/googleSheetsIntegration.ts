// Google Sheets Integration for Ahl Umran Network Events
// This integrates with: https://drive.google.com/drive/folders/1FKWBfZ4pKiqYYvDrg0vagoAWyke583s2

import { gapi } from 'gapi-script';

// Google Sheets API configuration
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file';

// Ahl Umran Network specific configuration
const AHL_UMRAN_FOLDER_ID = '1FKWBfZ4pKiqYYvDrg0vagoAWyke583s2';
const TEMPLATE_SPREADSHEET_ID = ''; // To be set after creating template

interface EventAttendee {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  checkInTime: string;
  pointsAwarded: number;
  tier: string;
  qrCodeId: string;
  scannedBy: string;
}

class GoogleSheetsService {
  private isInitialized = false;
  private isSignedIn = false;

  // Initialize Google Sheets API
  async initClient(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      gapi.load('client:auth2', async () => {
        try {
          await gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES,
          });

          // Listen for sign-in state changes
          gapi.auth2.getAuthInstance().isSignedIn.listen((signedIn: boolean) => {
            this.isSignedIn = signedIn;
          });

          // Handle initial sign-in state
          this.isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
          this.isInitialized = true;
          resolve();
        } catch (error) {
          console.error('Error initializing Google Sheets client:', error);
          reject(error);
        }
      });
    });
  }

  // Sign in to Google
  async signIn(): Promise<void> {
    if (!this.isInitialized) {
      await this.initClient();
    }
    
    if (!this.isSignedIn) {
      await gapi.auth2.getAuthInstance().signIn();
      this.isSignedIn = true;
    }
  }

  // Sign out from Google
  async signOut(): Promise<void> {
    if (this.isSignedIn) {
      await gapi.auth2.getAuthInstance().signOut();
      this.isSignedIn = false;
    }
  }

  // Create a new spreadsheet for an event
  async createEventSpreadsheet(eventTitle: string, eventDate: string): Promise<string> {
    if (!this.isSignedIn) {
      throw new Error('User must be signed in to create spreadsheet');
    }

    try {
      // Create new spreadsheet
      const spreadsheet = await gapi.client.sheets.spreadsheets.create({
        properties: {
          title: `[BerseMuka] ${eventTitle} - ${eventDate} Attendance`,
          locale: 'en',
          timeZone: 'Asia/Kuala_Lumpur'
        },
        sheets: [
          {
            properties: {
              title: 'Attendees',
              gridProperties: {
                rowCount: 1000,
                columnCount: 15,
                frozenRowCount: 1
              }
            }
          },
          {
            properties: {
              title: 'Summary',
              gridProperties: {
                rowCount: 100,
                columnCount: 10
              }
            }
          }
        ]
      });

      const spreadsheetId = spreadsheet.result.spreadsheetId;

      // Set up headers
      await this.setupSpreadsheetHeaders(spreadsheetId);

      // Move to Ahl Umran folder (if Drive API is available)
      // Note: This requires Drive API permissions
      
      return spreadsheetId;
    } catch (error) {
      console.error('Error creating spreadsheet:', error);
      throw error;
    }
  }

  // Set up spreadsheet headers
  private async setupSpreadsheetHeaders(spreadsheetId: string): Promise<void> {
    const headers = [
      ['Timestamp', 'Event ID', 'Event Title', 'Event Date', 'User ID', 'Name', 'Email', 
       'Phone', 'Check-in Time', 'Points Awarded', 'Tier', 'QR Code ID', 'Scanned By', 
       'Notes', 'Status']
    ];

    const summaryHeaders = [
      ['Metric', 'Value'],
      ['Total Attendees', '=COUNTA(Attendees!F:F)-1'],
      ['Total Points Distributed', '=SUM(Attendees!J:J)'],
      ['Average Points', '=AVERAGE(Attendees!J:J)'],
      ['Bronze Tier', '=COUNTIF(Attendees!K:K,"bronze")'],
      ['Silver Tier', '=COUNTIF(Attendees!K:K,"silver")'],
      ['Gold Tier', '=COUNTIF(Attendees!K:K,"gold")'],
      ['Platinum Tier', '=COUNTIF(Attendees!K:K,"platinum")'],
      ['Last Updated', '=NOW()']
    ];

    // Update Attendees sheet headers
    await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: 'Attendees!A1:O1',
      valueInputOption: 'RAW',
      values: headers
    });

    // Update Summary sheet
    await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: 'Summary!A1:B9',
      valueInputOption: 'USER_ENTERED',
      values: summaryHeaders
    });

    // Format headers
    await this.formatHeaders(spreadsheetId);
  }

  // Format spreadsheet headers
  private async formatHeaders(spreadsheetId: string): Promise<void> {
    const requests = [
      {
        repeatCell: {
          range: {
            sheetId: 0, // Attendees sheet
            startRowIndex: 0,
            endRowIndex: 1
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.2, green: 0.8, blue: 0.6 },
              textFormat: {
                foregroundColor: { red: 1, green: 1, blue: 1 },
                bold: true
              }
            }
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat)'
        }
      },
      {
        updateDimensionProperties: {
          range: {
            sheetId: 0,
            dimension: 'COLUMNS',
            startIndex: 0,
            endIndex: 15
          },
          properties: {
            pixelSize: 120
          },
          fields: 'pixelSize'
        }
      }
    ];

    await gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheetId,
      requests: requests
    });
  }

  // Add attendee to spreadsheet
  async addAttendee(spreadsheetId: string, attendee: EventAttendee): Promise<void> {
    if (!this.isSignedIn) {
      throw new Error('User must be signed in to update spreadsheet');
    }

    const values = [
      [
        new Date().toISOString(),
        attendee.eventId,
        attendee.eventTitle,
        attendee.eventDate,
        attendee.userId,
        attendee.userName,
        attendee.userEmail,
        attendee.userPhone,
        attendee.checkInTime,
        attendee.pointsAwarded,
        attendee.tier,
        attendee.qrCodeId,
        attendee.scannedBy,
        '', // Notes
        'Checked In'
      ]
    ];

    try {
      await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: 'Attendees!A:O',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        values: values
      });
    } catch (error) {
      console.error('Error adding attendee to spreadsheet:', error);
      throw error;
    }
  }

  // Batch add attendees
  async batchAddAttendees(spreadsheetId: string, attendees: EventAttendee[]): Promise<void> {
    if (!this.isSignedIn) {
      throw new Error('User must be signed in to update spreadsheet');
    }

    const values = attendees.map(attendee => [
      new Date().toISOString(),
      attendee.eventId,
      attendee.eventTitle,
      attendee.eventDate,
      attendee.userId,
      attendee.userName,
      attendee.userEmail,
      attendee.userPhone,
      attendee.checkInTime,
      attendee.pointsAwarded,
      attendee.tier,
      attendee.qrCodeId,
      attendee.scannedBy,
      '', // Notes
      'Checked In'
    ]);

    try {
      await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: 'Attendees!A:O',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        values: values
      });
    } catch (error) {
      console.error('Error batch adding attendees:', error);
      throw error;
    }
  }

  // Get spreadsheet URL
  getSpreadsheetUrl(spreadsheetId: string): string {
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
  }

  // Get attendees from spreadsheet
  async getAttendees(spreadsheetId: string): Promise<EventAttendee[]> {
    if (!this.isSignedIn) {
      throw new Error('User must be signed in to read spreadsheet');
    }

    try {
      const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: 'Attendees!A2:O'
      });

      const values = response.result.values || [];
      
      return values.map(row => ({
        eventId: row[1] || '',
        eventTitle: row[2] || '',
        eventDate: row[3] || '',
        userId: row[4] || '',
        userName: row[5] || '',
        userEmail: row[6] || '',
        userPhone: row[7] || '',
        checkInTime: row[8] || '',
        pointsAwarded: parseInt(row[9]) || 0,
        tier: row[10] || 'bronze',
        qrCodeId: row[11] || '',
        scannedBy: row[12] || ''
      }));
    } catch (error) {
      console.error('Error getting attendees:', error);
      throw error;
    }
  }

  // Create summary report
  async createSummaryReport(spreadsheetId: string): Promise<any> {
    if (!this.isSignedIn) {
      throw new Error('User must be signed in to read spreadsheet');
    }

    try {
      const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: 'Summary!A1:B9'
      });

      const values = response.result.values || [];
      const summary: any = {};
      
      values.forEach(row => {
        if (row[0] && row[1]) {
          summary[row[0]] = row[1];
        }
      });
      
      return summary;
    } catch (error) {
      console.error('Error creating summary report:', error);
      throw error;
    }
  }

  // Check if user is signed in
  isUserSignedIn(): boolean {
    return this.isSignedIn;
  }
}

// Export singleton instance
export const googleSheetsService = new GoogleSheetsService();

// Helper function to sync Ahl Umran event to Google Sheets
export const syncAhlUmranEventToSheets = async (
  eventData: {
    eventId: string;
    eventTitle: string;
    eventDate: string;
    attendees: EventAttendee[];
  }
): Promise<string | null> => {
  try {
    // Initialize and sign in
    await googleSheetsService.initClient();
    
    if (!googleSheetsService.isUserSignedIn()) {
      await googleSheetsService.signIn();
    }

    // Create spreadsheet for the event
    const spreadsheetId = await googleSheetsService.createEventSpreadsheet(
      eventData.eventTitle,
      eventData.eventDate
    );

    // Add attendees if any
    if (eventData.attendees.length > 0) {
      await googleSheetsService.batchAddAttendees(spreadsheetId, eventData.attendees);
    }

    // Return spreadsheet URL
    return googleSheetsService.getSpreadsheetUrl(spreadsheetId);
  } catch (error) {
    console.error('Failed to sync to Google Sheets:', error);
    return null;
  }
};