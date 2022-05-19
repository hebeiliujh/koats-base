import { User } from "../entity/user";
import { AppDataSource } from "../app-data-source";

const userRepository = AppDataSource.getRepository(User);

export default class UserService {
  public checkUserExists(userId: number) {
    return userRepository.count({
      where: {
        id: userId,
      }
    }).then(count => count === 1);
  }
}
