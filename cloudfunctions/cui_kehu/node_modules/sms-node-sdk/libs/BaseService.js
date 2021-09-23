const QcloudSms = require('qcloudsms_js');


class BaseService {

    constructor({ AppID, AppKey } = {}) {
        this.AppID = AppID;
        this.AppKey = AppKey;
        this.qcloudsms = QcloudSms(AppID, AppKey);
    }

    init({ action = '', data = {}, options = {}}) {

        if (!action) {
            throw new Error('action should not be empty.');
        }

        if (!this[action]) {
            throw new Error('action cannot be found.');
        }

        return this[action](data, options);
    }

    // 单发
    SmsSingleSend(data = {}, options = {}) {
        let {
            msgType,
            nationCode,
            phoneNumber,
            msg,
            extend = '',
            ext = ''
        } = data;
        let sender = this.qcloudsms.SmsSingleSender();

        return new Promise((resolve, reject) => {
            sender.send(msgType, nationCode, phoneNumber, msg, extend, ext, (err, res, resData) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        resData,
                        req: res.req,
                    });
                }
            });
        });

    }

    // 单发-指定模板id
    SmsSingleSendTemplate(data = {}, options = {}) {
        let {
            nationCode,
            phoneNumber,
            templId,
            params = [],
            sign,
            extend = '',
            ext = ''
        } = data;
        let sender = this.qcloudsms.SmsSingleSender();

        return new Promise((resolve, reject) => {
            sender.sendWithParam(nationCode, phoneNumber, templId, params, sign, extend, ext, (err, res, resData) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        resData,
                        req: res.req,
                    });
                }
            });
        });
    }

    // 群发
    SmsMultiSend(data = {}, options = {}) {
        let {
            msgType,
            nationCode,
            phoneNumbers = [],
            msg,
            extend = '',
            ext = ''
        } = data;
        let sender = this.qcloudsms.SmsMultiSender();

        return new Promise((resolve, reject) => {
            sender.send(msgType, nationCode, phoneNumbers, msg, extend, ext, (err, res, resData) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        resData,
                        req: res.req,
                    });
                }
            });
        });
    }

    // 群发-指定模板id
    SmsMultiSendTemplate(data = {}, options = {}) {
        let {
            nationCode,
            phoneNumbers = [],
            templId,
            params = [],
            sign,
            extend = '',
            ext = ''
        } = data;
        let sender = this.qcloudsms.SmsMultiSender();

        return new Promise((resolve, reject) => {
            sender.sendWithParam(nationCode, phoneNumbers, templId, params, sign, extend, ext, (err, res, resData) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        resData,
                        req: res.req,
                    });
                }
            });
        });
    }

    // 发送语音验证码
    CodeVoiceSend(data = {}, options = {}) {
        let {
            nationCode,
            phoneNumber,
            msg,
            playtimes = 2,
            ext = ''
        } = data;
        let sender = this.qcloudsms.CodeVoiceSender();

        return new Promise((resolve, reject) => {
            sender.send(nationCode, phoneNumber, msg, playtimes, ext, (err, res, resData) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        resData,
                        req: res.req,
                    });
                }
            });
        });
    }

    // 发送语音通知
    PromptVoiceSend(data = {}, options = {}) {
        let {
            nationCode,
            phoneNumber,
            prompttype = 2,
            msg,
            playtimes = 2,
            ext = ''
        } = data;
        let sender = this.qcloudsms.PromptVoiceSender();

        return new Promise((resolve, reject) => {
            sender.send(nationCode, phoneNumber, prompttype, msg, playtimes, ext, (err, res, resData) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        resData,
                        req: res.req,
                    });
                }
            });
        });
    }

    // 拉取短信回执
    SmsStatusPullCallback(data = {}, options = {}) {
        let {
            maxNum
        } = data;
        let puller = this.qcloudsms.SmsStatusPuller();

        return new Promise((resolve, reject) => {
            puller.pullCallback(maxNum, (err, res, resData) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        resData,
                        req: res.req,
                    });
                }
            });
        });
    }

    // 拉取短信回复
    SmsStatusPullReply(data = {}, options = {}) {
        let {
            maxNum
        } = data;
        let puller = this.qcloudsms.SmsStatusPuller();

        return new Promise((resolve, reject) => {
            puller.pullReply(maxNum, (err, res, resData) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        resData,
                        req: res.req,
                    });
                }
            });
        });
    }

    // 拉取单个手机短信回执
    SmsMobileStatusPullCallback(data = {}, options = {}) {
        let {
            nationCode,
            phoneNumber,
            beginTime,
            endTime,
            maxNum
        } = data;
        let puller = this.qcloudsms.SmsMobileStatusPuller();

        return new Promise((resolve, reject) => {
            puller.pullCallback(nationCode, phoneNumber, beginTime, endTime, maxNum, (err, res, resData) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        resData,
                        req: res.req,
                    });
                }
            });
        });
    }

    // 拉取单个手机短信回复
    SmsMobileStatusPullReply(data = {}, options = {}) {
        let {
            nationCode,
            phoneNumber,
            beginTime,
            endTime,
            maxNum
        } = data;
        let puller = this.qcloudsms.SmsMobileStatusPuller();

        return new Promise((resolve, reject) => {
            puller.pullReply(nationCode, phoneNumber, beginTime, endTime, maxNum, (err, res, resData) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        resData,
                        req: res.req,
                    });
                }
            });
        });
    }

    // 上传语音文件
    VoiceFileUpload(data = {}, options = {}) {
        let {
            fileContent,
            contentType = 'mp3'
        } = data;

        let uploader = this.qcloudsms.VoiceFileUploader();

        return new Promise((resolve, reject) => {
            uploader.upload(fileContent, contentType, (err, res, resData) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        resData,
                        req: res.req,
                    });
                }
            });
        });
    }

    // 按语音文件fid发送语音通知
    FileVoiceSend(data = {}, options = {}) {
        let {
            nationCode,
            phoneNumber,
            fid,
            playtimes = 2,
            ext,
        } = data;

        let sender = this.qcloudsms.FileVoiceSender();

        return new Promise((resolve, reject) => {
            sender.send(nationCode, phoneNumber, fid, playtimes, ext, (err, res, resData) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        resData,
                        req: res.req,
                    });
                }
            });
        });
    }

    // 指定模板发送语音通知
    TtsVoiceSend(data = {}, options = {}) {
        let {
            nationCode,
            phoneNumber,
            templId,
            params = [],
            playtimes = 2,
            ext,
        } = data;

        let sender = this.qcloudsms.TtsVoiceSender();

        return new Promise((resolve, reject) => {
            sender.send(nationCode, phoneNumber, templId, params, playtimes, ext, (err, res, resData) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        resData,
                        req: res.req,
                    });
                }
            });
        });
    }

}

module.exports = BaseService;