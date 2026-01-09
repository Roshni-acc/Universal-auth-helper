import { Request } from "express";

export class SessionService {
    /**
     * Regenerates the session safely.
     */
    async regenerate(req: Request): Promise<void> {
        return new Promise((resolve, reject) => {
            req.session.regenerate((err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    /**
     * Destroys the session.
     */
    async destroy(req: Request): Promise<void> {
        return new Promise((resolve, reject) => {
            req.session.destroy((err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    /**
     * Saves the session.
     */
    async save(req: Request): Promise<void> {
        return new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }
}
