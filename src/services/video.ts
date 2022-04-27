import { Buffer } from 'buffer';
import { aesEncrypt } from "../utils/utils";

import { RtcTokenBuilder, Role as RtcRole } from "../utils/RtcTokenBuilder";

interface IAgoraConfig {
  appId: string;
  appCertificate: string;
}

const expirationTimeInSeconds = 3600;

const agoraConfig: IAgoraConfig = {
  appId: "9f0c045f563b481bac3f0cf3ccd56714",
  appCertificate: "32a4ca378bd34b4b8c110950e5f1d076"
};

export default class VideoService {
  public generateTokenByUid(uid: number | string, channelName: string) {
    const appID = agoraConfig.appId;
    const appCertificate = agoraConfig.appCertificate;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
    const role = RtcRole.PUBLISHER;

    // Build token with uid
    const token = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid, role, privilegeExpiredTs);
    console.log("Token With Integer Number Uid: " + token);
    return Promise.resolve(token);
  }

  public generate256AESSecretAndSalt(channelId: string) {
    const buf = Buffer.from(channelId, 'utf8');
    const salt = buf.toString("base64");
    const secret = aesEncrypt(channelId);
    return { salt, secret };
  }
}
