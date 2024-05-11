const request = require("request");
const privateToken = process.env.OAUTH_TOKEN;
const projectId = process.env.CI_PROJECT_ID;
const commitSHA = process.env.CI_COMMIT_SHA;
request.get(
    `http://gitlab.com/api/v4/projects/${projectId}/merge_requests?private_token=${privateToken}&state=opened`,
    {},
    (err, res) => {
        if (err) {
            console.warn("No Merge Requests Found");
        } else {
            const response = JSON.parse(res.body);
            if (response) {
                let mergeRequest;
                let i = 0;
                while (response.length && i < response.length && !mergeRequest) {
                    if (response[i] && response[i].sha === commitSHA) {
                        mergeRequest = response[i];
                    }
                    i += 1;
                }
                if (mergeRequest) {
                    const mergeRequestId = mergeRequest.iid;
                    const jobPath = process.env.CI_JOB_URL;
                    const message = `Commit Build:  ${jobPath}/artifacts/download`;
                    const path =
                        "https://gitlab.com/api/v4/projects/" +
                        projectId +
                        "/merge_requests/" +
                        mergeRequestId +
                        "/notes?private_token=" +
                        privateToken;
                    request.post(path, { form: { body: message } });
                } else {
                    console.warn("No Merge Requests Found - 2");
                }
            }
        }
    },
);
