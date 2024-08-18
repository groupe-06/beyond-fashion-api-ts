import {Express, Response,Request } from 'express';
import {z} from 'zod';

const postShema = z.object({
    content: z.string().min(1,"content is required"),
    // description: z.string().min(1,"description is required")

});
// Validation middleware
const validatePostRequest = async (req:Request, res:Response, next:Function) => {
    try {
        postShema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).send({message: error});
        } else {
            throw error;
        }
    }
}

export {validatePostRequest}