import view from './view';
import * as errMsgObj from '../../../errMsg/index';
import show from '../../../libs/show';
module.exports = function(PIXI, app, obj) {
    let video;
    return view(PIXI, app, obj, res => {
        switch (res.status) {
            case 'createVideo':
                //调起视频控件
                video = wx.createVideo({
                    x: res.data.x,
                    y: res.data.y,
                    width: res.data.width,
                    height: res.data.height,
                    // 显示默认的视频控件
                    controls: true,
                    // 传入
                    src: 'https://res.wx.qq.com/wechatgame/product/webpack/userupload/20190812/video.mp4'
                });
                video.onError(res => {
                    for (var i = 0, errMsglist = Object.keys(errMsgObj); i < errMsglist.length; i++) {
                        if (res.errMsg.includes(errMsglist[i])) {
                            errMsgObj[errMsglist[i]]({
                                callback(res) {
                                    show.Modal(res, '发生错误');
                                }
                            });
                            break;
                        }
                    }
                });
                video.onEnded(() => {
                    show.Toast('播放结束', 'success', 1000);
                });
                video.onPause(() => {
                    show.Toast('暂停成功', 'success', 1000);
                });
                video.onPlay(() => {
                    show.Toast('播放成功', 'success', 1000);
                });
                video.onWaiting(() => {
                    show.Toast('视频缓冲中', 'success', 1000);
                });
                break;
            case 'destroy': //销毁当前视频控件
                video.destroy();
                break;
        }
    });
};
