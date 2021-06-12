export function isCoop(video) {
    let isCoop = false;
    for (let i = 0; i < video.submissions.length; ++i) {
        const submission = video.submissions[i];
        for (let j = 0; j < submission.played_characters.length; ++j) {
            if (submission.played_characters[j].game_mode === 12) {
                isCoop = true;
            }
        }
    }

    return isCoop;
}