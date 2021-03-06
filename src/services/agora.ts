import { Buffer } from 'buffer';
import { RtcTokenBuilder, RtmTokenBuilder, RtcRole, RtmRole } from 'agora-access-token';

import { aesEncrypt } from '../utils/utils';
import config from '../utils/config';

interface IAgoraConfig {
  appId: string;
  appCertificate: string;
}

const expirationTimeInSeconds = 3600;

const agoraConfig: IAgoraConfig = {
  appId: config.agoraConfig.appId as string,
  appCertificate: config.agoraConfig.appCertificate as string,
};

const appID = agoraConfig.appId;
const appCertificate = agoraConfig.appCertificate;
const currentTimestamp = Math.floor(Date.now() / 1000);
const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
const role = RtcRole.PUBLISHER;
const rtmRole = RtmRole.Rtm_User;

export default class AgoraService {
  public generateRtcTokenByUid(uid: number, channelName: string) {
    // Build token with uid
    const token = RtcTokenBuilder.buildTokenWithUid(
      appID,
      appCertificate,
      channelName,
      uid,
      role,
      privilegeExpiredTs,
    );
    console.log('Token With Integer Number Uid: ' + token);
    return Promise.resolve(token);
  }

  public generateRtcTokenByAccount(account: string, channelName: string) {
    // Build token with account
    const token = RtcTokenBuilder.buildTokenWithAccount(
      appID,
      appCertificate,
      channelName,
      account,
      role,
      privilegeExpiredTs,
    );
    console.log('Token With UserAccount: ' + token);
    return Promise.resolve(token);
  }

  public generateRtmTokenByAccount(account: string) {
    const token = RtmTokenBuilder.buildToken(
      appID,
      appCertificate,
      account,
      rtmRole,
      privilegeExpiredTs,
    );
    console.log('Rtm Token: ' + token);
    return Promise.resolve(token);
  }

  public generate256AESSecretAndSalt(channelId: string) {
    const buf = Buffer.from(channelId, 'utf8');
    const salt = buf.toString('base64');
    const secret = aesEncrypt(channelId);
    return { salt, secret };
  }
}
