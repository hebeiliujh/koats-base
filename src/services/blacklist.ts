import { AppDataSource } from "../app-data-source";
import { Blacklist } from "../entity/blacklist";

const blacklistRepository = AppDataSource.getRepository(Blacklist);

export default class BlacklistService {
  public getInfo(userId: number, friendId: number) {
    return blacklistRepository.findOne({
      where: {
        userId,
        friendId
      },
      select: ['status']
    });
  }
}
