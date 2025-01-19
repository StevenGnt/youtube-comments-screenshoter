const { writeFileSync } = require('fs');
const { google } = require('googleapis');

const { API_KEY, CHANNEL_ID, FETCH_OUTPUT_FILENAME } = require('./config');


const youtube = google.youtube({ version: 'v3', auth: API_KEY });

/**
 * Get videos from a YouTube channel
 * @param {string} channelId YouTube channel ID
 * @returns {array}
 */
async function getVideosFromChannel(channelId) {
    const videos = [];
    let nextPageToken = null;

    try {
        do {
            const res = await youtube.search.list({
                channelId,
                part: 'id',
                maxResults: 100,
                pageToken: nextPageToken,
            });

            const items = res.data.items || [];
            items.forEach((item) => {
                if (item.id.kind === 'youtube#video') {
                    videos.push(item.id.videoId);
                }
            });

            nextPageToken = res.data.nextPageToken;
        } while (nextPageToken);

        return videos;
    } catch (error) {
        console.error('Error while fetching YouTube channel videos :', error);
        return [];
    }
}

/**
 * Get the comments for a given YouTube video
 * @param {string} videoId YouTube video ID
 * @returns {array}
 */
async function getCommentsForVideo(videoId) {
    const comments = [];
    let nextPageToken = null;

    try {
        do {
            const res = await youtube.commentThreads.list({
                videoId,
                part: 'snippet',
                maxResults: 100,
                pageToken: nextPageToken,
            });

            const items = res.data.items || [];
            items.forEach((item) => {
                const { authorDisplayName, authorProfileImageUrl, textDisplay } = item.snippet.topLevelComment.snippet;
                comments.push({ authorDisplayName, authorProfileImageUrl, textDisplay });
            });

            nextPageToken = res.data.nextPageToken;
        } while (nextPageToken);

        return comments;
    } catch (error) {
        console.error(`Error fetching comments for video ${videoId} :`, error);
        return [];
    }
}

/**
 * Main function
 */
async function main() {
    console.log('Fetching videos...');
    const videoIds = await getVideosFromChannel(CHANNEL_ID);

    const allComments = [];

    console.log(`Found ${videoIds.length} videos, fetching comments...`);

    for (const videoId of videoIds) {
        console.log(`Fetching comments for video ${videoId}...`);
        const comments = await getCommentsForVideo(videoId);
        console.log(`${comments.length} comments found`);
        allComments.push(...comments);
    }

    console.log(`Writing output in ${FETCH_OUTPUT_FILENAME}`);

    writeFileSync(FETCH_OUTPUT_FILENAME, JSON.stringify(allComments, null, 2));
}

// Start
main().catch((err) => {
    console.error('Erreur dans le script :', err);
});
