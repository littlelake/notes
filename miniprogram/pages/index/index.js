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
    inputValue: ''
  },

  onLoad: function () {
    console.log('load')
    this.bindDataList();
  },

  // 页面显示/切入前台时触发
  onShow: function() {
    console.log('show')
    this.bindDataList();
  },

  onReady: function() {
    console.log('ready')
  },

  // 显示输入框，并且弹出键盘
  showAddInput: function () {
    this.setData({
      isShow: true,
      focus: true
    })
  },

  // 聚焦时设置输入框的高度
  bindfocus: function (e) {
    const that = this;
    that.setData({ isShow: true, bottom: e.detail.height });
  },

  // 失去焦点时设置输入框的bottom值
  bindblur: function () {
    const that = this;
    that.setData({ bottom: -200, isShow: false });
  },

  // 请求数据库列表
  bindDataList: function () {
    // 初始化
    const db = wx.cloud.database();
    wx.showLoading({
      title: '请稍候',
    });
    db.collection('notes').where({}).get().then((res) => {
      wx.hideLoading();
      if (res.errMsg === 'collection.get:ok') {
        // 将数据进行反转
        const data = res.data.length > 1 ? res.data.reverse() : res.data;
        this.setData({
          dataList: res.data
        })
      }
    }).catch(err => {
      wx.hideLoading();
      console.err(err);
    });
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
      console.log(res);
      this.setData({
        isShow: false,
        focus: false,
        inputValue: ''
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
  goToDetail: function(e) {
    // 获取当前列的id
    const _id = e.target.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${_id}`,
    })
  }
})
