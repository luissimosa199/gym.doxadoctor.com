import { DeletedTimeline } from "./deletedTimelineModel";
import { DeletedUserPhoto } from "./deletedUserPhotosModel";
import { Timeline } from "./timelineModel";
import { getModelForClass } from "@typegoose/typegoose";
import { UserAgent } from "./userAgentModel";
import { Student } from "./studentModel";
import { DeletedStudent } from "./deletedStudentModel";

export const TimeLineModel = getModelForClass(Timeline);
export const DeletedTimelineModel = getModelForClass(DeletedTimeline);
export const DeletedUserPhotoModel = getModelForClass(DeletedUserPhoto);
export const UserAgentModel = getModelForClass(UserAgent);
export const StudentModel = getModelForClass(Student);
export const DeletedStudentModel = getModelForClass(DeletedStudent);

// add other models here
