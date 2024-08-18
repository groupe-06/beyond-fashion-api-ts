import vine from '@vinejs/vine';
import { CustomErrorReporter } from './CustomErrorReport';

vine.errorReporter = () => new CustomErrorReporter();

export const storySchema = vine.object({
    content: vine.string(),
    //expiresAt: vine.date(),
});