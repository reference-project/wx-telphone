
var app = getApp();
import { getPhoneNumber } from '../../common/template/get-tel.js';
// let hasPhone = wx.getStorageSync('hasPhone');
let phone = wx.getStorageSync('phone');
let uid = wx.getStorageSync('userUid');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showPhoneModle:false,//true有手機號，不彈窗
    nickName:'',
    userImg:'',
    uid,
    phone:null,
  },
  getPhoneNumber: getPhoneNumber,
  cancelPhone() {
    let that = this;
    clearInterval(phoneTime);
    let phoneTime = setInterval(() => {
      var hasPhone = wx.getStorageSync('hasPhone');
      if (hasPhone) {
        clearInterval(phoneTime);
        that.setData({ hasPhone });
      }
    }, 5000)
  },
  /**手机号脱敏 */
  substring(str) {
    if (typeof str == 'string') { //参数为字符串类型
      let ruten = str.substring(3, 8); //提取字符串下标之间的字符。
      return str.replace(ruten, '*****'); //字符串中用字符替换另外字符，或替换一个与正则表达式匹配的子串。
    }
  },
  showPhone(opt){
    var phone = opt;
    phone = this.substring(phone);
    this.setData({phone})
  },
  goSearch (){
    wx.navigateTo({
      url: '../../common/pages/my-order'
    });
  },
  mycard (){
    wx.navigateTo({
      url: '../../common/pages/mycard'
    });
  },
  gostore (){
    wx.navigateTo({
      url: '../../common/pages/store-list'
    });
  },
  goaddress (){
    wx.navigateTo({
      url: '../../common/pages/address-list?is_from_my=0'
    });
  },
  gogroup (e){
    var group = e.currentTarget.dataset.group
    wx.navigateTo({
      url: '../../common/pages/my-order?group=' + group
    });
  },
  goToList(e){
    var list = e.currentTarget.dataset.list
    wx.navigateTo({
      url: '../../common/pages/my-order?list=' + list
    });
  },
  goStoreServer(){
    wx.navigateTo({
      url: '../../my/pages/server-wechat'
    });
  },
  myGroupGo(){
    wx.navigateTo({
      url: '../../group-buying/my-order'
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    uid = wx.getStorageSync('userUid');
    if (!uid) {
      console.log('ui',uid);
      setTimeout(function(){
      wx.switchTab({
        url: '../home/index-new',
      })
      },1000);
      
      return;
    }else{
      console.log('有uid');
      that.setData({ uid, phone });
      wx.getUserInfo({
        success: function (res) {
          var userInfo = res.userInfo
          var nickName = userInfo.nickName
          var avatarUrl = userInfo.avatarUrl
          that.setData({
            nickName: nickName,
            userImg: avatarUrl
          })
        },
        fail: function () {
          var userInfo = wx.getStorageSync('userInfo');
          if (userInfo) {
            that.setData({
              nickName: userInfo.nickName,
              userImg: userInfo.avatarUrl
            })
          } else {
            that.checkPhone();
          }
        }
      })
    }
  

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
    uid = wx.getStorageSync('userUid');
    if (!uid) {
      console.log('ui', uid);
      setTimeout(function () {
        wx.switchTab({
          url: '../home/index-new',
        })
      }, 1000);

      return;
    }
    // this.setData({ hasPhone });
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