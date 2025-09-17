# Prayer Meeting Thankfulness Wall

A lightweight, mobile-friendly web app where attendees submit what they’re thankful to God for and watch a live word cloud grow in real time.

## Features
- Two-stage flow: visitors submit a word/phrase, then view the community word cloud.
- Realtime updates powered by Firebase Firestore with simple aggregation.
- Colorful, responsive word cloud using `wordcloud2.js`; optimized for phones and large displays.
- Hosted as a static site (Netlify-ready) with no build step.

## Tech Stack
- Vanilla HTML/CSS/JavaScript
- Firebase Firestore (Realtime database)
- wordcloud2.js (client-side word cloud rendering)

## Getting Started
1. Clone the repository:
   ```bash
   git clone https://github.com/<your-account>/prayer-meeting-wordcloud.git
   cd prayer-meeting-wordcloud
   ```
2. Update `app.js` with your Firebase web app config (replace the placeholder `firebaseConfig`).
3. Enable Firestore in **Production mode** and apply the recommended security rules in the Firebase console:
   ```rules
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /thanks/{docId} {
         allow read: if true;
         allow create: if request.resource.data.keys().hasOnly(['text','normalized','createdAt']) &&
                       request.resource.data.text is string &&
                       request.resource.data.text.size() > 0 &&
                       request.resource.data.text.size() <= 60;
         allow update, delete: if false;
       }
     }
   }
   ```
4. Serve locally with any static server (optional):
   ```bash
   npx serve .
   ```
5. Deploy to your preferred static host (e.g., Netlify). No build command is required; publish directory is the repo root.

## Usage
- Share the hosted URL (or a QR code) with attendees.
- Submissions add entries to the `thanks` collection in Firestore.
- The cloud aggregates identical phrases and updates immediately for everyone viewing the page.

## Customization
- Adjust colors/typography in `styles.css`.
- Tweak word cloud behavior (size, palette, weighting) inside `renderWordCloud` in `app.js`.
- Add moderation or rate limiting by introducing Firebase Functions or additional security rules.

## License
MIT
