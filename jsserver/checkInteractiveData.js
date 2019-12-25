exports.main = function(arg) {
    try {
        arg = JSON.parse(arg);
        const myOpenid = wx.getOpenId();
        const toOpenid = arg.toUser;
        const now = new Date();
        const giftStorageKey = now.toDateString();
        const friendsStorage = wx.getFriendUserStorage([giftStorageKey]);
        const userList = friendsStorage.user_item;
        let ok = false;

        // 用户每天只能给同一个好友赠送一次金币,每天最多送3次
        const friendData = userList.find(userItem => userItem.openid === toOpenid);
        const myData = userList.find(userItem => userItem.openid === myOpenid);
        if (friendData) {
            // 获取最新的用户托管数据
            const friendKV = friendData.kv_list[friendData.kv_list.length - 1];
            const selfKV = myData.kv_list[myData.kv_list.length - 1];

            // 当最新的用户托管数据不存在就进行创建
            let friendGift = (friendKV && JSON.parse(friendKV.value || null)) || {
                receiveRecords: [],
                sendCount: 0
            };
            let selfGift = (selfKV && JSON.parse(selfKV.value || null)) || {
                receiveRecords: [],
                sendCount: 0
            };

            // 金币重复送给同一个人
            const giftToSameOne = friendGift.receiveRecords.some(item => {
                return item.fromOpenid === myOpenid;
            });

            // 判断当天是否超出赠送上限
            const outLimit = selfGift.sendCount > 2;

            // 赠送次数超过限制
            const canNotGift = giftToSameOne || outLimit;

            // 验证
            if (!canNotGift) {
                friendGift.receiveRecords.push({
                    fromOpenid: myOpenid,
                    time: Date.now()
                });
                selfGift.sendCount = selfGift.sendCount + 1;
                // 写对方的数据
                let ret1 = wx.setFriendUserStorage(toOpenid, [
                    {
                        key: giftStorageKey,
                        value: JSON.stringify(friendGift)
                    }
                ]);
                // 写自己的数据
                let ret2 = wx.setFriendUserStorage(myOpenid, [
                    {
                        key: giftStorageKey,
                        value: JSON.stringify(selfGift)
                    }
                ]);
                if (ret1.errcode == 0 && ret2.errcode == 0) {
                    ok = true;
                } else {
                    console.error('fail');
                }
            }
        }

        if (ok) {
            // 验证通过
            return JSON.stringify({ ret: true });
        } else {
            // 验证不通过
            return JSON.stringify({ ret: false });
        }
    } catch (err) {
        console.error(err.message);
    }
};
