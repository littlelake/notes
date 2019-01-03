//index.js
const app = getApp()

Page({
  data: {
    // 数据集合
    dataList: [],
    // 输入框是否显示
    isShow: false,
    // 是否聚焦
    focus: false,
    // 动态显示输入框的bottom
    bottom: -200,
    // 输入框中的信息
    inputValue: '',
    // 是否上下滚动
    isScroll: true,
    // scroll-view的高度
    windowHeight: 0,
    // tabBar的高度
    tabBarHeight: 0,
    // 开始触摸的点
    startX: 0,
    // 删除按钮的总长度
    delBtnWidth: 100,
    // 记录当前进行删除按钮操作的index
    delIndex: -1
  },

  onLoad: function () {
    const that = this;
    // this.bindDataList();
    // 计算tabBar的高度
    wx.getSystemInfo({
      success: function (res) {
        console.log(res);
        if (res.errMsg === 'getSystemInfo:ok') {
          const tabBarHeight = res.screenHeight - res.windowHeight;
          that.setData({ tabBarHeight, windowHeight: res.windowHeight });
        }
      },
    })
  },

  // 页面显示/切入前台时触发
  onShow: function () {
    this.bindDataList();
  },

  onReady: function () {
    console.log('ready')
  },

  // 显示输入框，并且弹出键盘
  showAddInput: function () {
    const { delIndex, dataList } = this.data;
    dataList[delIndex].styleX = '';
    this.setData({
      focus: true,
      isScroll: false,
      dataList
    });
  },

  // 聚焦时设置输入框的高度
  bindfocus: function (e) {
    const that = this;
    const { tabBarHeight } = this.data;
    that.setData({ isShow: true, bottom: e.detail.height - tabBarHeight / 2 + 10 });
  },

  // 失去焦点时设置输入框的bottom值
  bindblur: function () {
    const that = this;
    that.setData({ bottom: -200, isShow: false, isScroll: true });
  },

  // 请求数据库列表
  bindDataList: function () {
    // 初始化
    // const db = wx.cloud.database();
    // wx.showLoading({
    //   title: '请稍候',
    // });
    // db.collection('notes').where({
    //   _openid: 'oWl_80LXwJ4Ch1GCMc500cYVvfE4'
    // }).get().then((res) => {
    //   wx.hideLoading();
    //   if (res.errMsg === 'collection.get:ok') {
    //     // 将数据进行反转
    //     const data = res.data.length > 1 ? res.data.reverse() : res.data;
    //     this.setData({
    //       dataList: res.data
    //     })
    //   }
    // }).catch(err => {
    //   wx.hideLoading();
    //   console.err(err);
    // });

    wx.showLoading({
      title: '请稍候',
    });
    // 利用云函数来查找列表
    wx.cloud.callFunction({
      name: 'indexQuery',
      data: {
        _openid: 'oWl_80LXwJ4Ch1GCMc500cYVvfE4'
      },
      complete: res => {
        wx.hideLoading();
        if (res.errMsg === 'cloud.callFunction:ok') {
          // 将数据进行反转
          const data = res.result.length > 1 ? res.result.reverse() : res.result;
          this.setData({
            dataList: data
          })
        }
      }
    })
  },

  // 提交输入框中的信息
  bindNotesAdd: function (e) {
    const value = e.detail.value;
    const db = wx.cloud.database();
    // 如果输入的信息为空，那么什么都不操作
    if (!value) return;
    db.collection('notes').add({
      data: {
        ischeck: false,
        noteInfo: value
      }
    }).then(res => {
      this.setData({
        isShow: false,
        focus: false,
        inputValue: '',
        isScroll: true
      });
      this.bindDataList();
    }).catch(err => {
      console.error(err);
    });
  },

  // 当前数据已完成
  bindcheckfinish: function (e) {
    // 获取当前列的id
    const _id = e.target.dataset.id;
    // 将未完成变成已完成
    const db = wx.cloud.database();
    db.collection('notes').doc(_id).update({
      data: {
        ischeck: true
      }
    }).then(res => {
      console.log(res);
      if (res.errMsg === 'document.update:ok') {
        this.bindDataList();
      }
    }).catch(err => {
      console.error(err);
    })
  },

  // 跳转到详情页面
  goToDetail: function (e) {
    // 获取当前列的id
    const _id = e.target.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${_id}`,
    })
  },

  // 手指开始移动时
  bindtouchstart: function (e) {
    const that = this;
    const { delIndex, dataList } = that.data;
    // 判断是否只有一个触摸点
    if (e.touches.length === 1) {
      if (delIndex !== -1) {
        dataList[delIndex].styleX = '';
      }
      const index = e.currentTarget.dataset.index;
      // 将开始触摸的点记录下来
      this.setData({ startX: e.touches[0].clientX, delIndex: index });
    }
  },

  // 手指移动中
  bindtouchmove: function (e) {
    const that = this;
    const { startX, delBtnWidth, dataList } = that.data;
    // 当前item向左移动的位移
    let styleX = '';
    // 判断是否只有一个触摸点
    if (e.touches.length === 1) {
      const moveX = e.touches[0].clientX;
      // 用startX - moveX
      const diffX = startX - moveX;
      // 通过left来改变当前item的位移
      if (diffX === 0 || diffX < 0) {
        styleX = "margin-left: 0";
      } else {
        styleX = "margin-left: -" + diffX + "px";
        if (diffX >= delBtnWidth) {
          styleX = "margin-left: -" + delBtnWidth + "px";
        }
      }

      //获取手指触摸的是哪一个item
      const index = e.currentTarget.dataset.index;

      const list = dataList;
      list[index].styleX = styleX;
      that.setData({ dataList: list });
    }
  },

  // 手指结束移动时
  bindtouchend: function (e) {
    const that = this;
    const { startX, delBtnWidth, dataList } = that.data;
    // 判断是否只有一个触摸点
    if (e.changedTouches.length === 1) {
      const endX = e.changedTouches[0].clientX;
      // 如果起点到终点的距离小于delBtnWidth/2，那么还是回到0的位置，如果大于delBtnWidth/2.那么则显示删除按钮
      const diffX = startX - endX;
      // 当前item向左移动的位移
      let styleX = '';
      if (diffX < (delBtnWidth / 2)) {
        styleX = "margin-left: 0";
      } else {
        styleX = "margin-left: -" + delBtnWidth + "px";
      }

      //获取手指触摸的是哪一个item
      const index = e.currentTarget.dataset.index;

      const list = dataList;
      list[index].styleX = styleX;
      that.setData({ dataList: list });
    }
  }
})
