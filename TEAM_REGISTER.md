# Team register in Google Sheets (optional)

Every report saved or shared from the app is already logged in the **Register** on that phone or laptop. Each party (CST, WPC, SOR) can keep its own records this way, and import other users' logs under **Register → Import log** using the `photo_log.csv` inside their ZIP.

A team that wants **one register for all its reports**, filled in automatically, can connect the app to its own Google Sheet. This page explains how. It is optional, and each team sets up and owns its own sheet.

## What the sheet holds

Four tabs, created by the script:

| Tab | One row per |
|---|---|
| Reports | Report: date, team, reporter, zone, weather, number of photos, activities, chainage range, RFI numbers |
| Photos | Photo: activity, BQ or QC ref, structure, chainage, side, RFI no., remarks, GPS |
| RFIs | RFI in a report: inspection date and time, description, location, PIC, result |
| Log | Each message received, including test rows and rejected ones |

Sending the same report again replaces its earlier rows, so the sheet does not fill with duplicates.

## Set it up (about 15 minutes, once per team)

1. Use a Google account the team can keep, preferably an office account rather than a personal one. Create a new Google Sheet, for example **WP12 SDR Register – CST**.
2. In the sheet, open **Extensions → Apps Script**. Delete the sample code and paste the whole of [Code.gs](Code.gs).
3. In the code, change `const TEAM_KEY = 'CHANGE-ME';` to your own pass phrase. Click the save icon.
4. Click **Deploy → New deployment**, then the gear icon → **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy → Authorize access**, choose the account, then **Advanced → Go to (project name) → Allow**. Google shows this warning for every new script; it is your own script.
6. Copy the **Web app URL** (it starts with `https://script.google.com/macros/s/`).
7. On each team member's phone: **Setup → Team register**, paste the link, type the team key, then tap **Send test row**. A row appears in the sheet's **Log** tab.

From then on, every report the member saves or shares is also sent to the sheet. **Register → Send unsent to team sheet** sends reports made before the link was added.

## Keep the link and key private

The link and the team key are not put into `setup.json`, because this repository is public. Send them to your team members directly, not in a group or on this page. If they leak, change the key in the script and deploy a new version; then update the key on the phones.

## Changing the script later

**Deploy → Manage deployments → pencil icon → Version: New version → Deploy.** The link stays the same.
