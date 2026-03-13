# Smart Curriculum & Attendance

## Current State
The Curriculum page shows subject tabs (Hindi, English, Maths, Science) with topic cards listed per subject. Topics are displayed as static read-only cards with a chapter number badge. No video functionality exists.

## Requested Changes (Diff)

### Add
- YouTube API key input: A small settings button/icon in the Curriculum page header opens a dialog where the student can paste their YouTube Data API v3 key. Key is stored in localStorage.
- Per-topic video fetch: Each topic card becomes expandable. Clicking a topic sends a YouTube Data API v3 search request from the browser (using the stored API key) with the query: `<topic> Class 10 NCERT <subject>`. Returns up to 3 video results.
- Video result display: Expanded topic shows up to 3 YouTube video thumbnails with title, channel name, and an embedded player (or link to open in YouTube) inline below the topic.
- Loading and error states: Show a spinner while fetching. Show a helpful error if the API key is missing or invalid.

### Modify
- CurriculumPage: Topic cards become accordion-style collapsible items. Clicking toggles the video section open/closed.
- Each topic card: Add a YouTube icon/indicator to signal videos are available.

### Remove
- Nothing removed.

## Implementation Plan
1. Add a `youtubeApiKey` state (read/write from localStorage) and a settings dialog in CurriculumPage header.
2. Convert topic cards to collapsible rows -- clicking toggles open state.
3. When a topic is opened and API key is present, call `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=<encoded query>&key=<apiKey>&type=video`.
4. Cache results per topic key in a local `Map` state to avoid repeated fetches.
5. Render video results: thumbnail image, title, channel. Clicking a video opens `https://www.youtube.com/watch?v=<videoId>` in a new tab.
6. Show skeleton loaders while fetching, error message if API key missing or response is non-200.
