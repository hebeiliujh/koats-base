import crypto from "crypto";
import crc32 from "crc-32";
import { UINT32 } from "cuint";
const _version = "006";
const randomInt = Math.floor(Math.random() * 0xffffffff);
const VERSION_LENGTH = 3;
const APP_ID_LENGTH = 32;

export class AccessToken {
  appID: string;
  appCertificate: string;
  channelName: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  messages: {};
  salt: number;
  ts: any;
  uid: string;
  signature: any;
  crc_channel_name: any;
  crc_uid: any;
  m: any;
  constructor(appID: string, appCertificate: string, channelName: string, uid: string | number) {
    this.appID = appID;
    this.appCertificate = appCertificate;
    this.channelName = channelName;
    this.messages = {};
    this.salt = randomInt;
    this.ts = Math.floor(+(new Date()) / 1000) + 24 * 3600;

    if (uid === 0) {
      this.uid = "";
    } else {
      this.uid = `${uid}`;
    }
  }

  build() {
    const m = Message({
      salt: this.salt,
      ts: this.ts,
      messages: this.messages
    }).pack();

    const toSign = Buffer.concat([
      Buffer.from(this.appID, "utf8"),
      Buffer.from(this.channelName, "utf8"),
      Buffer.from(this.uid, "utf8"),
      m
    ]);

    const signature = encodeHMac(this.appCertificate, toSign);
    const crc_channel = UINT32(crc32.str(this.channelName)).and(UINT32(0xffffffff)).toNumber();
    const crc_uid = UINT32(crc32.str(this.uid)).and(UINT32(0xffffffff)).toNumber();
    const content = AccessTokenContent({
      signature: signature,
      crc_channel: crc_channel,
      crc_uid: crc_uid,
      m: m
    }).pack();
    return _version + this.appID + content.toString("base64");
  }

  addPriviledge(priviledge: string | number, expireTimestamp: any) {
    this.messages[priviledge] = expireTimestamp;
  }

  fromString(originToken: string) {
    try {
      const originVersion = originToken.substr(0, VERSION_LENGTH);
      if (originVersion != _version) {
        return false;
      }
      // const originAppID = originToken.substr(VERSION_LENGTH, VERSION_LENGTH + APP_ID_LENGTH);
      const originContent = originToken.substr(VERSION_LENGTH + APP_ID_LENGTH);
      const originContentDecodedBuf = Buffer.from(originContent, "base64");

      const content = unPackContent(originContentDecodedBuf);
      this.signature = content.signature;
      this.crc_channel_name = content.crc_channel_name;
      this.crc_uid = content.crc_uid;
      this.m = content.m;

      const msgs = unPackMessages(this.m);
      this.salt = msgs.salt;
      this.ts = msgs.ts;
      this.messages = msgs.messages;
    } catch (err) {
      console.log(err);
      return false;
    }

    return true;
  }
}

export const version = _version;
// export const AccessToken = _AccessToken;
export const Priviledges = {
  kJoinChannel: 1,
  kPublishAudioStream: 2,
  kPublishVideoStream: 3,
  kPublishDataStream: 4,
  kRtmLogin: 1000
};

const encodeHMac = function (key: crypto.BinaryLike | crypto.KeyObject, message: Buffer | crypto.BinaryLike) {
  return crypto.createHmac("sha256", key).update(message).digest();
};

class ByteBuf {
  buffer: Buffer;
  position: number;
  constructor() {
    this.buffer = Buffer.alloc(1024);
    this.position = 0;

    this.buffer.fill(0);
  }

  pack() {
    const out = Buffer.alloc(this.position);
    this.buffer.copy(out, 0, 0, out.length);
    return out;
  }

  putUint16(v: any) {
    this.buffer.writeUInt16LE(v, this.position);
    this.position += 2;
    return this;
  }

  putUint32(v: number) {
    this.buffer.writeUInt32LE(v, this.position);
    this.position += 4;
    return this;
  }

  putBytes(bytes: { length: any; copy: (arg0: any, arg1: any) => void; }) {
    this.putUint16(bytes.length);
    bytes.copy(this.buffer, this.position);
    this.position += bytes.length;
    return this;
  }

  putString(str: WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>) {
    return this.putBytes(Buffer.from(str));
  }

  putTreeMap(map: { [x: string]: any; }) {
    if (!map) {
      this.putUint16(0);
      return this;
    }

    this.putUint16(Object.keys(map).length);
    for (const key in map) {
      this.putUint16(key);
      this.putString(map[key]);
    }

    return this;
  }

  putTreeMapUInt32(map: { [x: string]: number; }) {
    if (!map) {
      this.putUint16(0);
      return this;
    }

    this.putUint16(Object.keys(map).length);
    for (const key in map) {
      this.putUint16(key);
      this.putUint32(map[key]);
    }

    return this;
  }
}
class ReadByteBuf {
  buffer: any;
  position: number;
  constructor(bytes: any) {
    this.buffer = bytes;
    this.position = 0;
  }

  getUint16() {
    const ret = this.buffer.readUInt16LE(this.position);
    this.position += 2;
    return ret;
  }
  getUint32() {
    const ret = this.buffer.readUInt32LE(this.position);
    this.position += 4;
    return ret;
  }
  getString() {
    const len = this.getUint16();

    const out = Buffer.alloc(len);
    this.buffer.copy(out, 0, this.position, this.position + len);
    this.position += len;
    return out;
  }
  getTreeMapUInt32() {
    const map = {};
    const len = this.getUint16();
    for (let i = 0; i < len; i++) {
      const key = this.getUint16();
      const value = this.getUint32();
      map[key] = value;
    }
    return map;
  }
}

const AccessTokenContent = function (options: { signature: any; crc_channel?: any; crc_uid: any; m: any; crc_channel_name?: any; pack?: any; }) {
  options.pack = function () {
    const out = new ByteBuf();
    return out.putString(options.signature).putUint32(options.crc_channel).putUint32(options.crc_uid).putString(options.m).pack();
  };

  return options;
};

const Message = function (options: { salt: any; ts: any; messages: any; pack?: any; }) {
  options.pack = function () {
    const out = new ByteBuf();
    const val = out.putUint32(options.salt).putUint32(options.ts).putTreeMapUInt32(options.messages).pack();
    return val;
  };

  return options;
};

const unPackContent = function (bytes: Buffer) {
  const readbuf = new ReadByteBuf(bytes);
  return AccessTokenContent({
    signature: readbuf.getString(),
    crc_channel_name: readbuf.getUint32(),
    crc_uid: readbuf.getUint32(),
    m: readbuf.getString()
  });
};

const unPackMessages = function (bytes: any) {
  const readbuf = new ReadByteBuf(bytes);
  return Message({
    salt: readbuf.getUint32(),
    ts: readbuf.getUint32(),
    messages: readbuf.getTreeMapUInt32()
  });
};
