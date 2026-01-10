import { BlacklistModel, IBlacklist } from "../schema/blacklist";

export class BlacklistRepository {
    async add(token: string): Promise<IBlacklist> {
        return BlacklistModel.create({ token });
    }

    async find(token: string): Promise<IBlacklist | null> {
        return BlacklistModel.findOne({ token });
    }
}
