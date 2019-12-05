import { SubmissionType } from "../Enums/submission-type";

export interface AdminSubmission {
    submission_id: number;
    video_title: string | undefined;
    submission_type: SubmissionType;
    latest: boolean | undefined;
    user_name: string | undefined;
    video_id: string;
}

