import { Friendship } from "../entity/friendship";
import { AppDataSource } from "../app-data-source";

const friendshipRepository = AppDataSource.getRepository(Friendship);

export default class FriendshipService {
  public getInfo(userId: number, friendId: number) {
    return friendshipRepository.findOne({
      where: {
        userId: userId,
        friendId: friendId
      },
      select: ['id', 'status', 'message', 'updatedDate']
    });
  }
}
