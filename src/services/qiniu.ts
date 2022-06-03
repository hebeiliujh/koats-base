import qiniu from 'qiniu';
import config from '../utils/config';

export default class QiniuService {
  public uploadFile(filePath: string, key: string) {
    const accessKey = config.qiniu.QINIU_ACCESS_KEY; // 七牛accessKey
    const secretKey = config.qiniu.QINIU_SECRET_KEY; // 七牛secretKey
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

    const options = {
      scope: config.qiniu.QINIU_SCOPE, // 七牛存储bucketName
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const uploadToken = putPolicy.uploadToken(mac);

    const qiniuConfig = new qiniu.conf.Config();
    qiniuConfig['zone'] = qiniu.zone.Zone_z2;
    const localFile = filePath;
    const formUploader = new qiniu.form_up.FormUploader(qiniuConfig);
    const putExtra = new qiniu.form_up.PutExtra();
    // 文件上传
    return new Promise((resolved, reject) => {
      formUploader.putFile(
        uploadToken,
        key,
        localFile,
        putExtra,
        function (respErr, respBody, respInfo) {
          if (respErr) {
            reject(respErr);
          }
          if (respInfo.statusCode == 200) {
            resolved(respBody);
          } else {
            resolved(respBody);
          }
        },
      );
    });
  }
}
