import { dropid } from "dropid";

/**
 * DropID (https://www.dropaphi.xyz/docs/dropid) — human-readable prefixed
 * IDs, generated locally (it's an npm package, not an API call). Applied at
 * insert time in app code, matching DropAPHI's own documented Prisma usage.
 */
export const newUserId = () => dropid("user");
export const newProjectId = () => dropid("project");
export const newRecordId = () => dropid("record");
export const newEventId = () => dropid("event");
export const newInviteId = () => dropid("invite");
