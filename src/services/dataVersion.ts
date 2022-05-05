import { AppDataSource } from "../app-data-source";
import { DataVersion } from "../entity/data_version";

const dataVersionRepository = AppDataSource.getRepository(DataVersion);

export default class DataVersionService {
  public async updateFriendshipVersion(userId: number, timestamp: number) {
    return await dataVersionRepository.update({
      userId
    }, {
      friendshipVersion: timestamp
    });
  }
}
