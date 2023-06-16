# B 站用户屏蔽

提供 B 站当前缺少的屏蔽功能。
隐藏屏蔽用户上传的视频，目前支持以下位置：

- 首页
- 搜索页
- 视频页右侧推荐
- 视频页播放结束后推荐（基于同页面已屏蔽视频的标题匹配，可能误伤相同标题的视频）
- 排行榜

纯本地运行，不进行任何网络请求。

## 屏蔽和取消屏蔽

![chrome_2023-05-08_23-14-07.png](https://cdn.jsdelivr.net/gh/NateScarlet/user-scripts@master/src/bilibili.com/img/chrome_2023-05-08_23-14-07.png)

至目标用户个人空间，点击 `屏蔽` 或 `取消屏蔽` 按钮。

![chrome_2023-06-16_01-11-42.png](https://cdn.jsdelivr.net/gh/NateScarlet/user-scripts@master/src/bilibili.com/img/chrome_2023-06-16_01-11-42.png)

或者点击单个视频左上角的屏蔽按钮，误操作时需要从屏蔽列表中找回。

## 查看已屏蔽的用户

![chrome_2023-05-08_23-18-47.png](https://cdn.jsdelivr.net/gh/NateScarlet/user-scripts@master/src/bilibili.com/img/chrome_2023-05-08_23-18-47.png)

设置屏蔽后顶端导航栏会多出 `屏蔽` 按钮，点击即可查看已屏蔽用户。

打开的屏蔽列表页面是静态的，更改屏蔽设置后需要重新从顶栏打开才是最新。

## 多设备支持

当前不支持多设备同步，数据保存在设备本地。

数据迁移请使用脚本管理器的备份和还原功能。
