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
    // 当前显示删除按钮的index
    currentProductIndex: -1,
    // 当前选中的日期
    dayColor: [],
    // 是否显示日历
    isCalShow: false,
    // 当前选择日期毫秒数
    selectedDate: 0,
    // 当前选择时间
    selectTime: '09:00',
    // 当前点击的日期
    clickedDate: '',
    // 当前formId
    formId: '',

    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },

  onLoad: function () {
    const that = this;
    // this.bindDataList();
    // 计算tabBar的高度
    wx.getSystemInfo({
      success: function (res) {
        if (res.errMsg === 'getSystemInfo:ok') {
          const tabBarHeight = res.screenHeight - res.windowHeight;
          that.setData({ tabBarHeight, windowHeight: res.windowHeight });
        }
      },
    });

    // 调用云函数获取openId
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        wx.setStorageSync('openid', res.result.openid);
      }
    })
  },

  // 页面显示/切入前台时触发
  onShow: function () {
    this.bindDataList();
  },

  // 点击新增按钮
  bindAddInput: function (e) {
    const formId = e.detail.formId;
    this.setData({ selectedDate: '', formId });
    this.showAddInput();
  },

  // 显示输入框，并且弹出键盘
  showAddInput: function () {
    const { delIndex, dataList } = this.data;
    this.setData({
      focus: true,
      isScroll: false,
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

    // wx.showLoading({
    //   title: '请稍候',
    // });
    wx.showNavigationBarLoading();
    // 利用云函数来查找列表
    wx.cloud.callFunction({
      name: 'indexQuery',
      data: {
        _openid: 'oWl_80LXwJ4Ch1GCMc500cYVvfE4'
      },
      complete: res => {
        // wx.hideLoading();
        wx.hideNavigationBarLoading();
        if (res.errMsg === 'cloud.callFunction:ok') {
          // 将数据进行反转
          const data = res.result.length > 1 ? res.result.reverse() : res.result;
          this.setData({
            dataList: data
          })
        }
      }
    });

    // wx.cloud.callFunction({
    //   name: 'login',
    //   data: {
    //     _openid: 'oWl_80LXwJ4Ch1GCMc500cYVvfE4'
    //   },
    //   complete: res => {
    //     console.log(res);
    //   }
    // })
  },

  // 提交输入框中的信息
  bindNotesAdd: function (e) {
    const { selectedDate, formId } = this.data;
    const value = e.detail.value;
    const db = wx.cloud.database();
    // 如果输入的信息为空，那么什么都不操作
    if (!value) return;
    db.collection('notes').add({
      data: {
        ischeck: false,
        noteInfo: value,
        date: selectedDate,
        formId
      }
    }).then(res => {
      this.setData({
        isShow: false,
        focus: false,
        inputValue: '',
        isScroll: true,
        // 将选择日期设为空
        selectedDate: ''
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

  /**
   * 显示删除按钮
   */
  showDeleteButton: function (productIndex) {
    this.setXmove(productIndex, -65)
  },

  /**
   * 隐藏删除按钮
   */
  hideDeleteButton: function (productIndex) {
    this.setXmove(productIndex, 0)
  },

  /**
   * 设置movable-view位移
   */
  setXmove: function (productIndex, xmove) {
    let dataList = this.data.dataList
    dataList[productIndex].xmove = xmove

    this.setData({
      dataList
    })
  },

  /**
   * 处理movable-view移动事件
   */
  handleMovableChange: function (e) {
    const that = this;
    const { currentProductIndex } = that.data;
    const productIndex = e.currentTarget.dataset.productindex;
    if (e.detail.source === 'friction') {
      if (Math.abs(e.detail.x) >= 30) {
        this.showDeleteButton(productIndex)
      } else {
        this.hideDeleteButton(productIndex)
      }
    } else if (e.detail.source === 'out-of-bounds' && e.detail.x === 0) {
      this.hideDeleteButton(productIndex)
    }
  },

  /**
   * 处理touchstart事件
   */
  handleTouchStart(e) {
    const { currentProductIndex } = this.data;
    const productIndex = e.currentTarget.dataset.productindex;
    this.startX = e.touches[0].pageX;
    if (productIndex !== currentProductIndex && currentProductIndex !== -1) {
      this.hideDeleteButton(currentProductIndex);
    }
  },

  /**
   * 处理touchend事件
   */
  handleTouchEnd(e) {
    const productIndex = e.currentTarget.dataset.productindex;
    // if (e.changedTouches[0].pageX < this.startX && e.changedTouches[0].pageX - this.startX <= -30) {
    //   this.showDeleteButton(productIndex)
    // } else if (e.changedTouches[0].pageX > this.startX && e.changedTouches[0].pageX - this.startX < 30) {
    //   this.showDeleteButton(productIndex)
    // } else {
    //   this.hideDeleteButton(productIndex)
    // }
    // 将当前的productIndex存在currentProductIndex中
    this.setData({ currentProductIndex: productIndex });
  },

  /**
   * 删除产品
   */
  handleDeleteProduct: function ({ currentTarget: { dataset: { id } } }) {
    const that = this;
    const db = wx.cloud.database();
    db.collection('notes').doc(id).remove({
      success(res) {
        if (res.errMsg === 'document.remove:ok') {
          that.bindDataList();
        }
      }
    })
    // let dataList = this.data.dataList
    // let productIndex = dataList.findIndex(item => item._id = id)

    // dataList.splice(productIndex, 1)

    // this.setData({
    //   dataList
    // })
    // if (dataList[productIndex]) {
    //   this.setXmove(productIndex, 0)
    // }
  },

  // 更多已完成链接
  bindMoreFinished: function () {
    wx.navigateTo({
      url: '/pages/finished/finished',
    });
  },

  // 打开日历
  bindOpeningCal: function () {
    const { selectedDate } = this.data;
    // 设置当前日历的日期，将当前日期标注背景色
    const currentDate = !selectedDate ? new Date().getDate() : new Date(selectedDate).getDate();
    this.setData({
      dayColor: [{ month: 'current', day: currentDate, color: '#fff', background: '#3897dd' }],
      isCalShow: true,
      isShow: false,
      focus: false,
    })
  },

  // 点击日历日期
  dayClick: function (e) {
    const detail = e.detail;
    const clickedDate = detail.year + '-' + detail.month + '-' + detail.day
    this.setData({
      dayColor: [{
        month: 'current',
        day: detail.day,
        color: '#fff',
        background: '#3897dd'
      }],
      clickedDate
    })
  },

  // 清除日历
  bindClearCal: function () {
    this.setData({ isCalShow: false, selectedDate: '' });
    this.showAddInput();
  },

  // 点击日历完成按钮
  bindGetCal: function () {
    const { clickedDate, selectTime } = this.data;
    const selectedDate = this.getMillisecond(clickedDate, selectTime);
    // 判断选择的日期是否小于当前日期
    if (selectedDate < new Date().getTime()) {
      wx.showToast({
        icon: 'none',
        title: '日期不能小于当前日期',
      });
      return;
    }
    this.setData({ isCalShow: false, selectedDate });
    this.showAddInput();
  },

  // 日历中三个按钮
  bindBtnCal: function (e) {
    const type = e.currentTarget.dataset.type;
    const date = new Date();
    let currentDate = date.getFullYear() + '-' + this.formatDate(date.getMonth() + 1) + '-' + this.formatDate(date.getDate());;
    let selectedDate = 0;
    switch (type) {
      case 'today':
        // 设定今天的提交日期为YYYY-MM-DD 09:00:00
        selectedDate = new Date(currentDate + ' 09:00:00').getTime();
        break;
      case 'tomorrow':
        // 设定今天的提交日期为YYYY-MM-DD 09:00:00
        const otherDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
        currentDate = otherDate.getFullYear() + '-' + this.formatDate(otherDate.getMonth() + 1) + '-' + this.formatDate(otherDate.getDate());
        selectedDate = new Date(currentDate + ' 09:00:00').getTime();
        break;
      case 'afternoon':
        // 设定今天的提交日期为YYYY-MM-DD 13:00:00
        selectedDate = new Date(currentDate + ' 13:00:00').getTime();
        break;
      default:
        // 设定今天的提交日期为YYYY-MM-DD 09:00:00
        selectedDate = new Date(currentDate + ' 09:00:00').getTime();
        break;
    }
    this.setData({ isCalShow: false, selectedDate });
    this.showAddInput();
  },

  // 关闭日历弹框
  bindCloseCalModal: function () {

  },

  // 判断日期是否小于9，如果小于则前面加0
  formatDate: function (val) {
    if (!val) return;
    if (typeof val !== 'number') {
      val = parseInt(val, 10);
    }
    return val > 9 ? val : '0' + val;
  },

  // 将日期由YYYY-MM-DD或YYYY-M-D变为毫秒数
  getMillisecond(date, time) {
    return new Date(date + ' ' + time).getTime();
  },

  // 发送给自己模版消息
  button_one: function (e) {
    console.log(e);
    let form_id = e.detail.formId
    let date = new Date();
    let data = JSON.stringify({
      "keyword1": {
        "value": '我的第一次模板消息'
      },
      "keyword2": {
        "value": "2019年01月08日 22:22"
      },
      "keyword3": {
        "value": "哇喔哇喔哇喔"
      }
    })
    //调用云函数发送模版消息
    wx.cloud.callFunction({
      name: 'template',
      data: {
        openid: wx.getStorageSync("openid"),
        template_id: "NuAyxRIUBc-SSPhCk64oxzQ0vjt1xMkheDINMQY4rno",
        page: "",
        form_id,
        data,
      },
      success: res => {
        console.log('[云函数] [login] : ', res)
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },
  bindTimeChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      selectTime: e.detail.value
    })
  },
})
