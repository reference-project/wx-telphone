// pages/card/mycard.js
var app = getApp();
var _tapLock = false;    // 点击锁
import { Api } from '../../utils/api_2';
import { store_Id } from '../../utils/store_id';
Page({
  data: {
    loading: true,
    status: true,
    windowHeight: '',
    windowWidth: '',
    msgList: [],
    usedMsg: [],
    expiredMsg: [],
    scrollTop: 0,
    scrollHeight: 0,
    pagesone: 1,
    pagestwo: 1,
    pagesthree: 1,
    dataStatus: 0,
    curActIndex: "",
    store_id: '',
    uid: '',
    image: '',
    ex_image: '',
    use_image: '',
    showHide: true,
    typeText: '门店券',
    category: 3,
    selectCardone: 0,
    selectCardtwo: 0,
    selectCardthree: 0,
    searchValue: '',
    onlinecard:'',
    mendiancard:'',
    onlinecard: '',
    shopCard: '',
    nullList:false

  },
  // 搜索卡包
  searchCard(e){
    var that = this;
    var searchValue = e.detail.value;//搜索值
    if (searchValue){
      that.setData({
        searchValue:searchValue,
        pagesone: 1,
        selectCardone: 1,
      });
    }
    that.loadData1(that);
  },
  goNull(e){
    var that = this;
    var searchValue = e.detail.value;
    if (!searchValue){
      that.setData({
        searchValue: searchValue,
        pagesone: 1,
        selectCardone: 1,
      });
      that.loadData1(that);
    }
  },
  getCoupon() {
    wx.navigateTo({
      url: '../index-new/shop-promotion',
    })
  },
  // 点击弹出选择券类型
  goSelect() {
    this.setData({
      showHide: false
    });
  },
  // 选择券类型
  goChooseCard(e) {
    var that = this;
    // 事件代理拿到点击目标
    var indexSelect = e.target.dataset.select;
    if (indexSelect == 0) {
      this.setData({
        typeText: '线上券',
        showHide: true,
        category: 1,
        pagesone: 1,
        loadingone:true,
        pagestwo: 1,
        pagesthree: 1,
        selectCardone: 1,
        selectCardtwo: 1,
        selectCardthree: 1,
        onlinecard:'trues',
        mendiancard: '',
        xianshangCard: 'xianshangCard',
        shopCard: ''
      });
      console.log(that.data.normal.length, '线上券normal数据')
      that.loadData1(that);
    } else if (indexSelect == 1) {
      this.setData({
        typeText: '门店券',
        showHide: true,
        category: 3,
        pagesone: 1,
        pagestwo: 1,
        pagesthree: 1,
        selectCardone: 1,
        selectCardtwo: 1,
        selectCardthree: 1, // 判断是否切换
        mendiancard:'mendiancard',
        onlinecard: '',
        xianshangCard: '',
        shopCard: 'shopCard'
      });
      console.log(that.data.normal.length, '是否点击线下券normal数据')
      that.loadData1(that);
    }
  },
  pullUpLoadone(e) {
    var that = this;
    var { loadingone, pagesone } = that.data;
    if (!loadingone) {//全部加载完成
      return;
    }
    wx.showLoading({ title: '加载中' });
    pagesone++;
    that.setData({ pagesone })
    setTimeout(function () {
      that.loadData1(that);
      wx.hideLoading();
    }, 1000)
  },
  onLoad: function (options) {
    var that = this;
    that.setData({
      mendiancard: 'mendiancard',
      shopCard: "shopCard"
    })
    var store_id = store_Id.store_Id();//store_id
    Api.signin();//获取以及存储openid、uid
    // 获取uid
    var uid = wx.getStorageSync('userUid');
    console.log(uid, store_id);
    // 页面初始化 options为页面跳转所带来的参数
    // wx.showLoading({ title: '加载中' });
    that.setData({ curSwiperIdx: 0, curActIndex: 0, uid: uid, store_id: store_id });
    // 自动获取手机宽高
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })
    that.loadData1(that);
  },

  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示

  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  closeOverlay: function () {
    this.setData({ showOverlay: false });
  },
  showCheckQr: function (event) {
    let qrUrl = event.currentTarget.dataset.qrImageUrl;
    this.setData({ qrImageUrl: qrUrl, showOverlay: true });
  },
  //加载页面数据
  loadData1: function (that) {
    var { selectCardone, msgList, searchValue, pagesone, store_id, uid, category}=that.data;



    if (selectCardone == 1) {
      msgList.splice(0, msgList.length);//splice方法直接更改原始数组以及返回被删除/更改的项目
    }
    var params = {
      page: pagesone, store_id: store_id, uid: uid, type: 'all', category: category, keyword: searchValue
    }
   
    app.api.postApi('wxapp.php?c=coupon&a=my', { params }, (err, reps) => {
      wx.hideLoading();
      if (err) return;
      wx.hideLoading();
      if (err && reps.err_code != 0) return;
      var { image, coupon_list, next_page } = reps.err_msg;
      if (!next_page) {//全部加载完成
        wx.showToast({
          title: '已经没有数据！',
          image: '../../image/use-ruler.png',
          duration: 2000
        });
        that.setData({
          loadingone: next_page
        });
        return;
      }
      for (var j = 0; j < coupon_list.length; j++) {
        msgList.push(coupon_list[j]);
      }
    
      //更新数据
      if (!msgList.length){
        // 不为真
        that.setData({
          nullList:true
        })
      }else{
        that.setData({
          nullList: false
        })
      }
      that.setData({
        loading: false,
        normal: msgList,
        image: image,
        selectCardone: 0
      });
    });
  },
  goDetail(e) {
    if (_tapLock) return;
    console.log(this.tabLock);
    console.log('参数', e)
    // 区分是否从卡包进入
    var distinguish = e.currentTarget.dataset.distinguish;
    var id = e.currentTarget.dataset.id;
    var _type = e.currentTarget.dataset.type;
    if (_type == 3) {
      // 线下券
      wx.navigateTo({
        url: './card_summary?id=' + id + '&distinguish=' + distinguish
      })
    } else {
      // 线上券跳到某个商品详情
      wx.navigateTo({
        url: '../index-new/index-boabao'
      })
    }
  },
  /**
   * 长按删除
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  deleteCard(e) {
    _tapLock = true;
    let recId = e.currentTarget.dataset.recid;
    let that = this;
    wx.showModal({
      title: '提示',
      content: '是否确认删除卡券',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定');
          app.api.postApi('card/deleteCardRecord', { recId: recId }, (err, response) => {
            if (err) return;
            let { rtnCode } = response;
            let tip = '';
            if (rtnCode != 0) {
              tip = '系统繁忙，删除失败。';
            } else {
              tip = '删除成功';
            }
            wx.showToast({
              title: tip,
            });
            that.loadData();
            wx.hideLoading();
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      },
      complete: () => _tapLock = false

    });
    wx.showActionSheet({
      itemList: ['删除卡券'],
      success: function (res) {
        console.log(res.tapIndex);
        if (res.tapIndex === 0) {   // 确认删除
          console.log('删除');
        }
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    });
  }
})