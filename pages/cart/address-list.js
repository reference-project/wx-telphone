// pages/shopping/address-list.js

const app = getApp();
import { Api } from '../../utils/api_2';
Page({
  data:{
    addrList: [],
    uid:''
  },
  onLoad:function(options){
    console.log(2222)
    
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    Api.signin();//获取以及存储openid、uid
    // 获取uid
    var uid = wx.getStorageSync('userUid');
    console.log('uid', uid)
    that.setData({
      uid
    })
    this.addressList(that);
  },
  addressList(that){
    var uid = that.data.uid;
    var params = {
      uid
    }
    console.log('执行到')
    // app.api.postApi('wxapp.php?c=address&a=index&action=list', { params }, (err, response) => {
    //   if (err) return;
    //   console.log(response,'response')
    // });
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },

  /**
   * 加载页面数据
   */
  /**
   * 添加地址
   */
  gotoAddAddr() {
    wx.redirectTo({
      url: './address',
    })
  },
  
  /**
   * 改变收货地址，回退到上一页面 
   */
  changeAdress(e) {
    let {addressId} = e.currentTarget.dataset;

    if(_addressId == addressId) return wx.navigateBack();
    
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];  //上一个页面
    prevPage.changeAddress(addressId);
    wx.navigateBack();
  },

  /**
   * 删除地址
   */
  bindDelAddr(e) {
    wx.showModal({
      title: '确认操作',
      content: '是否确认删除地址？',
      success: res => {
     
        if(res.confirm) {
          let addrId = e.currentTarget.dataset.addrId;
          wx.showLoading({ title: '正在删除地址' });
          app.api.fetchApi('address/remove/' + addrId, (err, response) => {
            wx.hideLoading();

            if (err) {
              return this._showError('操作失败，请重试');
            }

            let {rtnCode, rtnMessage, data} = response;
            if (rtnCode != 0) {
              return this._showError(rtnMessage);;
            }

            this.loadAddr();
          });
        }
      }
    });
  },
  
  /**
   * 更新地址
   */
  updateAddress(e) {
    let {address} = e.currentTarget.dataset;
    wx.redirectTo({
      url: `./address?type=update&address=${JSON.stringify(address)}`,
    })
  },
  
  /**
   * 修改默认地址
   */
  changeDefaultAdress(e) {
 
    let {addressId, isDefault} = e.currentTarget.dataset;
    if(isDefault) return;
    app.api.postApi(SetDefaultURL, {addressId}, (err, res) => {  // 修改默认地址
      if(!err && res.rtnCode == 0) {
   
        this.loadAddr();
      } else {
     
      }
    });
  }
})