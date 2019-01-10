// miniprogram/pages/user/user.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isAuth: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    // 查看是否授权
    wx.getSetting({
      success(res) {
        // 判断是否授权，授权则不显示授权按钮
        if (res.errMsg === 'getSetting:ok') {
          that.setData({ isAuth: true });
        } else {
          that.setData({ isAuth: false });
        }
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success(res) {
              that.setData({
                userInfo: res.userInfo
              });
            }
          });
        }
      }
    })
  },

  // 授权获取信息
  bindGetUserInfo: function (e) {
    const userInfo = e.detail.userInfo;
    this.setData({ userInfo });
  },

  // 关于小记页面跳转
  bindAboutUs: function() {
    wx.navigateTo({
      url: '/pages/aboutUs/aboutUs',
    })
  },

  // 已完成页面跳转
  bindFinished() {
    wx.navigateTo({
      url: 'pages/finished/finished',
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})