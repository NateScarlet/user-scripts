# B 站内容屏蔽

屏蔽你不感兴趣的内容。

目前支持：

- 首页视频列表
- 首页推广卡片
- 搜索页视频列表
- 视频列表中的广告
- 视频页右侧推荐
- 视频页播放结束后推荐（基于同页面已屏蔽视频的标题匹配，可能误伤相同标题的视频）
- 排行榜

纯本地运行，不进行任何网络请求。

为保证脚本管理器能正常更新，脚本显示名称依旧为 `B站用户屏蔽`，但是实际上不止能够屏蔽用户。

## 屏蔽用户

![chrome_2023-05-08_23-14-07.png](https://cdn.jsdelivr.net/gh/NateScarlet/user-scripts@master/src/bilibili.com/img/chrome_2023-05-08_23-14-07.png)

至目标用户个人空间，点击 `屏蔽` 或 `取消屏蔽` 按钮。

![chrome_2023-06-16_01-11-42.png](https://cdn.jsdelivr.net/gh/NateScarlet/user-scripts@master/src/bilibili.com/img/chrome_2023-06-16_01-11-42.png)

或者点击单个视频左上角的屏蔽按钮，误操作时需要从屏蔽列表中找回。

## 屏蔽首页楼层推广卡片

![firefox_2023-06-19_00-38-06.png](https://cdn.jsdelivr.net/gh/NateScarlet/user-scripts@master/src/bilibili.com/img/firefox_2023-06-19_00-38-06.png)

点击在卡片左上角的屏蔽按钮即可屏蔽此频道的推广，可在设置中取消屏蔽。

## 屏蔽广告

默认就是屏蔽的，在设置中可勾选`允许广告`来取消屏蔽。

现在只支持屏蔽视频列表中的广告。

## 查看当前设置

![chrome_2023-06-19_00-56-11](https://cdn.jsdelivr.net/gh/NateScarlet/user-scripts@master/src/bilibili.com/img/chrome_2023-06-19_00-56-11)

点击顶端导航栏的 `屏蔽` 按钮。

## 多设备支持

当前不支持多设备同步，数据保存在设备本地。

数据迁移请使用脚本管理器的备份和还原功能。
