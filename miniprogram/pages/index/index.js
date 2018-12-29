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
    this.setData({
      focus: true,
      isScroll: false
    })
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
  }
})
