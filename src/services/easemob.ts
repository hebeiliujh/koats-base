// import { Friendship } from "../entity/friendship";
// import { AppDataSource } from "../app-data-source";

// const friendshipRepository = AppDataSource.getRepository(Friendship);
import axios from 'axios';
const easemob_host = 'https://a1.easemob.com';
const app_name = 'demo';
const org_name = '1137220429093300';
const client_id = 'YXA6utu91G7nQhG5sEarFw06pw';
const client_secret = 'YXA6kwL-fTyBECmuAupcZkQq5EvEhk0';

export default class EasemobService {
  public async getToken () {
    const result = await axios.post(`${easemob_host}/${org_name}/${app_name}/token`, {
      grant_type: 'client_credentials', // client_credentials ，固定字符串。
      client_id, // App 的 client_id，参见 app 详情页面。
      client_secret, // App 的 client_secret，参见 app 详情页面。
      ttl: 7 * 24 * 60 * 60, // token 有效期，单位为秒(s)。
    });
    console.log(result);
    return result;
  }

  public async registerUser() {
    const result = await axios.post(`${easemob_host}/${org_name}/${app_name}/users`);
    console.log(result);
    return result;
    // return friendshipRepository.findOne({
    //   where: {
    //     userId: userId,
    //     friendId: friendId
    //   },
    //   select: ['id', 'status', 'message', 'updatedDate']
    // });
  }
}
