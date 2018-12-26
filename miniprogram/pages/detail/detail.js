// miniprogram/pages/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 当前id
    id: '',
    // 当前数据的标题信息
    title: '',
    // 获取当前remark的信息
    remark: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取传过来的id值
    const _id = options.id;
    this.setData({ id: _id });
    // 然后执行详情查询功能
    this.handleDetail(_id);
  },

  // 获取详情接口
  handleDetail: function (id) {
    const db = wx.cloud.database();
    wx.showLoading({
      title: '加载中',
    });
    db.collection('notes').where({ _id: id }).get().then(res => {
      wx.hideLoading();
      if (res.errMsg === 'collection.get:ok') {
        const data = res.data[0];
        this.setData({
          title: data.noteInfo || '',
          remark: data.description || '',
        })
      }
    }).catch(err => {
      wx.hideLoading();
      console.error(err);
    })
  },

  // 修改当前数据
  handleUpdateDetail: function () {
    const { id, title, remark } = this.data;
    const db = wx.cloud.database();
    db.collection('notes').doc(id).update({
      data: {
        noteInfo: title,
        description: remark
      }
    }).then(res => {
      if (res.errMsg === 'document.update:ok') {
        console.log('更新成功');
      }
    }).catch(err => {
      console.log(err);
    })
  },

  // 修改标题
  bindChangeTitle: function (e) {
    this.setData({ title: e.detail.value });
  },

  // 修改描述
  bindChangeRemark: function (e) {
    this.setData({ remark: e.detail.value });
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
    // hide时调用详情修改操作
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // unload时调用详情修改操作
    this.handleUpdateDetail();
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