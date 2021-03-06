const util = require('../../../utils/util.js');
var app = getApp();

const AddressSettingURL = 'wxapp.php?c=address&a=MyAddress';   // 设置售货地址
const ListURL = 'store/ls';          // 门店列表
const DetailURL = 'store/detail';    // 门店详情
const methodUrl = 'buy/shipping/method';//邮寄方式


let _prodId;                          // 记录商品id
let skuid;                          // 记录商品多属性标识 id
let quantity;                          // 购买商品的数量
let cartId;
Page({
  data: {
    // cardList: [],
    //addrList: [],
    // fee: null,
    error: false,
    products: [],
    totals: [],
    isLoading: true,

    shippingMethod: 'flat.flat',  // 邮寄方式，默认平邮   flat.flat-平邮  pickup.pickup 到店自提
    shippingMethods: [],    // 有效的配送方式
    hasFlatShip: false,   //是否邮寄方式
    hasPickupShip: false,  //是否到店自提方式

    address: null,    // 存放当前收货地址数据
    addressId: 0,     // 选择的收货地址id
    pickupStoreId: 0, // 自提门店id

    showAreaPicer: false,
    areaText: '',   // 区域
    zoneList: [],
    cityList: [],
    districtList: [],
    selectedZoneIndex: 0,
    zoneId: 0,
    selectedCityIndex: 0,
    cityId: 0,
    selectedDistrictIndex: 0,
    districtId: 0,//区域id
    fullname: '',//收货人
    shippingTelephone: '',//电话
    location: '',//当地地址

    curActIndex: 0,        // swiper 下标指示
    shopListData: null,    // 商店列表数据
    ShopDetailData: null,  // 商店详情数据
    //2017年8月17日16:21:58
    productColor: '',   // 商品颜色
    productSize: '',   // 商品尺码
    matteShow: false,  //购买成功弹窗
    methodShow: false,//配送说明弹窗
    showFormError: false,//表单错误弹窗
    //2017年12月18日17:22:02
    order_no: '',
    postage_int: 0,
    sub_total: 0,


    //2017-12-19
    uid: '',//用户id
    addressId: '',//地址id
    addressList: [],//地址列表
    address: '',//默认地址
    lastPay: '￥0',//实付款

    //2017年12月19日13:43:56
    storeId: app.store_id,//商店id
    shipping_method: 'express',
    //addressId: 0,
    postage_list: "",
    user_coupon_id: 0,
    is_app: false,
    payType: 'weixin',
    //2017年12月26日13:44:11
    couponInfo: [], //选择的优惠券信息
    normal_coupon_count: '', //可用的优惠券数量
    totalId: [],
    page: '',//扫码确认订单-saoma
    itemheights: ['168', '408', '342'],//方式高度列表
    formData: {
      fullname: '',
      telephone: ''
    },//表单数据：姓名和电话
    formErrorMsg: '不能为空，请填写完整',
  },
  /**
   * 自提姓名和电话获取验证
   */
  pullname(e) {
    var { value } = e.detail.value;
    this.setData({
      formData: {
        fullname: value
      }
    })
  },
  pulltelephone(e) {
    var { value } = e.detail.value;
    this.setData({
      formData: {
        telephone: value
      }
    })
  },
  /*
 *地址详情列表
 */
  getAddress(uid) {
    var url = 'wxapp.php?c=address&a=MyAddress';
    var that = this;
    var store_id = that.data.storeId
    var address = that.data.address;
    var params = {
      store_id, uid
    }
    app.api.postApi(url, { params }, (err, rep) => {
      if (!err && rep.err_code == 0) {
        var addressList = rep.err_msg.addresslist;
        if (addressList.length) {
          if (addressList.length > 1) {
            //设置默认地址
            for (var i in addressList) {
              if (addressList[i].default == 1) {
                address = addressList[i];
              }
            }
          } else if (addressList.length == 1) {
            address = addressList[0];
          }
          this.setData({
            "address": address,
            "addressList": addressList,
            "addressId": addressList[0].address_id
          });
        } else {
          wx.showModal({
            title: '请先设置收货地址',
            content: '你还没有设置收货地址，请点击这里设置！',
            success: function (res) {
              if (res.confirm) {
                wx.redirectTo({
                  url: './address-list',
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }

      }
    });

  },



  onLoad: function (options) {

    // wx.removeStorageSync('couponInfo');
    var order_no = options.order_no;
    var uid = wx.getStorageSync('userUid');
    this.setData({ order_no: order_no, uid });
    //this.getAddress(uid);
    var couponInfo = wx.getStorageSync('couponInfo') ? wx.getStorageSync('couponInfo') : [];
    if (couponInfo.length > 0) {
      var user_coupon_id = [];  //23  ['23']
      user_coupon_id.push(couponInfo[0]);
      this.setData({
        user_coupon_id: user_coupon_id
      })
    }
    this.setData({
      couponInfo: couponInfo
    })
    // this.loadCouponData();
  },

  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    var uid = this.data.uid;
    var order_no = this.data.order_no;
    this.getAddress(uid);
    this._prepare(order_no);
    this.loadCouponData();

    // var couponInfo = wx.getStorageSync('couponInfo') ? wx.getStorageSync('couponInfo') : [];
    // if (couponInfo.length > 0) {
    //   var user_coupon_id = [];  //23  ['23']
    //   user_coupon_id.push(couponInfo[0]);
    //   this.setData({
    //     user_coupon_id: user_coupon_id
    //   })
    // }

    // this.setData({
    //   couponInfo: couponInfo
    // })

  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },

  _prepare(order_no) {
    var that = this;
    var params = {
      order_no: order_no
    }
    app.api.postApi('wxapp.php?c=order&a=mydetail', { params }, (err, resp) => {
      if (err) {
        that._showError(err);
        return;
      }
      if (resp.err_code == 0) {
        let { product, sub_total, postage_int, } = resp.err_msg.orderdata;
        var lastPay = (sub_total - postage_int).toFixed(2);//实付款
        var totalId = [];
        for (var i = 0; i < product.length; i++) {
          totalId.push(product[i].product_id);//总id
        }
        this.setData({ products: product, postage_int, sub_total, lastPay, totalId });
      }
    });
  },

  addAddr: function (event) {
    wx.navigateTo({
      url: '../../common/pages/address?goodsId='
    });
  },

  /**
  * 设置收货地址
  * 设置完成后需重新刷新订单
  */
  changeAddress(uid) {
    var url = 'wxapp.php?c=address&a=MyAddress';
    var that = this;
    var address = that.data.address;

    app.api.postApi(url, { "params": { uid } }, (err, rep) => {
      if (!err && rep.err_code == 0) {
        var addressList = rep.err_msg.addresslist;
        if (addressList.length) {
          if (addressList.length = 1) {
            address = addressList[0];
          } else if (addressList.length > 0) {
            //设置默认地址
            for (var i in addressList) {
              if (addressList[i].default == 1) {
                address = addressList[i];
              }
            }

          }
          this.setData({
            "address": address,
            "addressList": addressList,
            "addressId": addressList[0].address_id
          });
        } else {
          wx.showModal({
            title: '请先设置收货地址',
            content: '你还没有设置收货地址，请点击这里设置！',
            success: function (res) {
              if (res.confirm) {
                wx.redirectTo({
                  url: '../../common.pages/address-list',
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }

      }
    });
  },
  /**
   * 准备订单信息
   */
  _prepareOrder(prodId, skuid, quantity, cartId) {
    wx.showLoading({ title: '加载中...', mask: true, });
    let url = 'buy/prepare_cart';
    app.api.postApi(url, { prodId, skuid, quantity, cartId }, (err, resp) => {
      wx.hideLoading();
      if (err) {
        return this._showError('加载数据出错，请重试');
      }
      this._handlePrepareData(resp);
    });
  },

  /**
   * 加载数据
   */
  _handlePrepareData(resp) {
    let { rtnCode, rtnMessage, data } = resp;
    if (rtnCode != 0) {
      return this._showError(rtnMessage);
    }

    let { products, addrList, totals, preOrderId, shippingMethods, shippingMethod } = data;
    let { zoneList } = this.data;

    let addressId = false;
    let address = null;
    if (addrList && addrList.length) {
      for (let i = 0; i < addrList.length; i++) {
        if (addrList[i].isSelected) {
          addressId = addrList[i].addressId;
          address = addrList[i];
          break;
        }
      }
    } else if (!zoneList | !zoneList.length) {
      // this.loadZone();
    }

    let hasFlatShip = false, hasPickupShip = false;
    for (let i = 0; shippingMethods && shippingMethods.length && i < shippingMethods.length; i++) {
      if (shippingMethods[i].code == 'flat.flat') hasFlatShip = true;
      if (shippingMethods[i].code == 'pickup.pickup') hasPickupShip = true;
    }

    let curActIndex = this.data.curActIndex;
    if (this.data.isLoading) {  // 第一次加载
      if (shippingMethod == 'flat.flat') {
        curActIndex = 0;
      } else if (shippingMethod == 'pickup.pickup') {
        curActIndex = 1;
      }
    }

    this.setData({ products, totals, addrList, address, addressId, isLoading: false, shippingMethods, shippingMethod, hasFlatShip, hasPickupShip, curActIndex });
  },

  /**
   * 刷新数据
   */
  _handleData(resp) {
    let { rtnCode, rtnMessage, data } = resp;
    if (rtnCode != 0) {
      return this._showError(rtnMessage);
    }

    let { products, totals } = data;

    if (!products) products = this.data.products;

    this.setData({ products, totals, isLoading: false });
  },

  /**
   * 提交订单
   */
  submitOrder: function (event) {
    //let params = this.buildAddressParams();
    //params.cartId = cartId;
    //wx.showLoading({ title: '加载中...', mask: true, });
    //收货地址
    let address_params = this.buildAddressParams();
    let address_id = address_params.addressId;
    console.log('地址id是=' + address_id);
    //let address_id = 47;
    let payType = this.data.payType;
    let is_app = this.data.is_app;
    //let postage_list = this.data.postage_list;
    let postage_list = "a:1:{i:6;d:0;}";
    let uid = this.data.uid;
    let store_id = this.data.storeId;
    let user_coupon_id = this.data.user_coupon_id;
    let shipping_method = this.data.shipping_method;
    let orderId = this.data.order_no; //注意是order_no

    var params = {
      payType: payType,
      orderNo: orderId,
      is_app: is_app,
      postage_list: postage_list,
      shipping_method: shipping_method,
      address_id: address_id,
      uid: uid,
      store_id: store_id,
      user_coupon_id: 0,
    }
    //console.log(params);return;
    wx.showLoading({ title: '请稍候...', mask: true, });
    app.api.postApi('wap/wxapp_saveorder.php?action=pay_xcx', { params }, (err, resp) => {
      wx.hideLoading();
      //console.log(resp, 344444)
      var data = resp.err_msg;
      //console.log(data);
      // 调起微信支付
      //this._startPay(data);
      if (resp.err_code != 0) {
        //console.log('不能支付，原因是：', data)
        wx.showModal({
          title: '支付失败',
          content: data,
          confirmText: '好的',
        });
      } else {
        // 调起微信支付

        if (resp.err_dom) {
          //console.log('不需要支付');
          wx.navigateTo({
            url: '../../common/pages/my-order?goodsindex=' + 2
          })
        } else {
          //console.log('需要支付');
          // 调起微信支付
          this._startPay(data);
        }
      }
    });
  },


  /**
   * 调起微信支付
   */
  _startPay(payParams) {
    let param = {
      timeStamp: payParams.timeStamp + "",
      nonceStr: payParams.nonceStr,
      //"package": "prepay_id=" + payParams.prepayId,
      "package": payParams.package,
      signType: 'MD5',
      paySign: payParams.paySign,
      success: res => this._onPaySuccess(res),
      fail: err => this._onPayFail(err)
    };
    wx.requestPayment(param);
  },

  /**
   * 订单提交成功，不需要支付
   */
  _onSubmitNoPay() {
    wx.showToast({ title: "提交成功", icon: "success", duration: 1000 });
    setTimeout(function () {
      wx.navigateTo({
        url: '../../common/pages/my-order'
      });
    }, 1000);
  },
  //关闭弹窗
  closeBtn() {
    var that = this;
    that.setData({
      matteShow: false
    });

    //500毫秒后跳转
    setTimeout(function () {
      wx.redirectTo({
        url: '../../common/pages/my-order'
      });
    }, 500);
  },
  closeMethod() {
    this.setData({
      methodShow: false
    });
  },
  // 配送说明
  showMehodModel() {
    this.setData({
      methodShow: true
    })
  },
  /**
   * 支付成功
   */
  _onPaySuccess(res) {
    wx.removeStorageSync('couponInfo');
    var that = this;
    // 支付成功弹窗
    that.setData({
      matteShow: true
    });
  },

  /**
   * 支付失败
   */
  _onPayFail(err) {
    wx.showModal({
      title: '支付失败',
      content: '订单支付失败，请到[订单-待付款]列表里重新支付',
      cancelColor: '#FF0000',
      confirmText: '好的',
      success: function (res) {
        wx.navigateTo({
          url: '../shopping/my-order'
        });
      },
    });
  },

  addrViewClick() {
    wx.navigateTo({
      url: '../../common/pages/address-list?addressId=' + this.data.addressId
      //url: '../shop/address-list?addressId=' + this.data.addressId
    });
  },



  /**  新增地址相关 */
  /**
   * 校验地址输入
   */
  checkAddress() {
    let { addressId, zoneId, cityId, districtId, fullname, shippingTelephone, location, shippingMethod, pickupStoreId } = this.data;

    if (shippingMethod == 'flat.flat') {
      if (addressId) return true;   // 有选了地址

      // 新增地址，校验输入
      if (!fullname) {
        return this._showError('请填写收货人姓名');
      }
      if (!shippingTelephone) {
        return this._showError('请填写手机号码');
      }
      if (!util.checkMobile(shippingTelephone)) {
        return this._showError('不是有效的手机号码');
      }
      if (!location) {
        return this._showError('请填写详细地址');
      }
      if (!zoneId) {
        return this._showError('请选择省份');
      }
      if (!cityId) {
        return this._showError('请选择城市');
      }
      if (!districtId) {
        return this._showError('请选择县区');
      }
      return true;
    } else if (shippingMethod == 'pickup.pickup') {
      if (!pickupStoreId) {
        return this._showError('请选择自提门店');
      }
      return true;
    }
  },

  /**
   * 组装地址参数
   */
  buildAddressParams() {
    let { addressId, zoneId, cityId, districtId, fullname, shippingTelephone, location, shippingMethod, pickupStoreId } = this.data;
    let params;
    if (shippingMethod == 'flat.flat') {
      if (addressId) {
        params = {
          'addressId': addressId,
          'shippingMethod': shippingMethod,
        }
      } else {
        params = {
          'address[zone_id]': zoneId,
          'address[city_id]': cityId,
          'address[district_id]': districtId,
          'address[fullname]': fullname,
          'address[shipping_telephone]': shippingTelephone,
          'address[address]': location,
          'shippingMethod': shippingMethod,
        }
      }
    } else if (shippingMethod == 'pickup.pickup') {
      params = {
        'pickupStoreId': pickupStoreId,
        'shippingMethod': shippingMethod,
      };
    }
    return params;
  },

  /**
   * 选择自提门店事件
   */
  onStoreSelected(e) {
    let storeId = e.detail.value;
    this.setData({ pickupStoreId: storeId });
    let params = { storeId };
    wx.showLoading({ title: '加载中...', mask: true, });
    app.api.postApi('buy/pickup_store', params, (err, resp) => {
      wx.hideLoading();
      if (err) {
        return this._showError('加载数据出错，请重试');
      }
      let { rtnCode, rtnMessage, data } = resp;
      if (rtnCode != 0) {
        return this._showError(rtnMessage);;
      }
      this._handleData(resp);
    });
  },

  /**
   * 显示地区选择器
   */
  showAreaPickerView() {
    this.setData({ showAreaPicer: true });
  },
  /**
   * 隐藏地区选择器
   */
  hideAreaPickerView() {
    let { zoneList, cityList, districtList, selectedZoneIndex, selectedCityIndex, selectedDistrictIndex } = this.data;
    let areaText = zoneList[selectedZoneIndex].name + cityList[selectedCityIndex].name + districtList[selectedDistrictIndex].name;
    this.setData({ showAreaPicer: false, areaText });
    let params = {
      "address[zone_id]": zoneList[selectedZoneIndex].zoneId,
      "address[city_id]": cityList[selectedCityIndex].cityId,
      "address[district_id]": districtList[selectedDistrictIndex].districtId,
    }
    console.log('隐藏地区选择器');
    app.api.postApi('buy/address', params, (err, resp) => {
      if (err) {
        // return this._showError('加载数据出错，请重试');
      }
      let { rtnCode, rtnMessage, data } = resp;
      if (rtnCode != 0) {
        return this._showError(rtnMessage);;
      }
      this._handleData(resp);
    });
  },
  loadZone() {
    this.setData({ zoneList: [], cityList: [], districtList: [] });
    app.api.fetchApi('address/zone', (err, response) => {
      let { data } = response;
      if (data) {
        this.setData({ zoneList: data, selectedZoneIndex: 0, zoneId: data[0].zoneId });
        this.loadCity(data[0].zoneId);
      }
    });
  },

  loadCity(zoneId) {
    this.setData({ cityList: [], districtList: [] });
    app.api.fetchApi('address/city/' + zoneId, (err, response) => {
      let { data } = response;
      if (data) {
        this.setData({ cityList: data, selectedCityIndex: 0, cityId: data[0].cityId });
        this.loadDistrict(data[0].cityId);
      }
    });
  },

  loadDistrict(cityId) {
    this.setData({ districtList: [] });
    app.api.fetchApi('address/district/' + cityId, (err, response) => {
      let { data } = response;
      if (data) {
        this.setData({ districtList: data, selectedDistrictIndex: 0, districtId: data[0].districtId });
      }
    });
  },

  bindAddrPickerChange(e) {
    const val = e.detail.value;
    let { zoneList, cityList, districtList, selectedZoneIndex, selectedCityIndex, selectedDistrictIndex } = this.data;
    if (val[0] != selectedZoneIndex) {
      if (!zoneList.length) return;
      let { zoneId } = zoneList[val[0]];
      this.setData({
        selectedZoneIndex: val[0],
        zoneId: zoneId,
      });
      this.loadCity(zoneId);
    } else if (val[1] != selectedCityIndex) {
      if (!cityList.length) return;
      let { cityId } = cityList[val[1]];
      this.setData({
        selectedCityIndex: val[1],
        cityId: cityId,
      });
      this.loadDistrict(cityId);
    } else if (val[2] != selectedDistrictIndex) {
      if (!districtList.length) return;
      let { districtId } = districtList[val[2]];
      this.setData({
        selectedDistrictIndex: val[2],
        districtId: districtId,
      });
    }
  },

  bindFullnameChange(e) {
    this.setData({ fullname: e.detail.value.trim() });
  },
  bindLocationChange(e) {
    this.setData({ location: e.detail.value.trim() });
  },
  bindShippingTelephoneChange(e) {
    this.setData({ shippingTelephone: e.detail.value.trim() });
  },

  /**
   * 设置邮寄方式
   */
  setShippingMethod(method) {
    this.setData({ shippingMethod: method });
    let params = { shipping_method: method };
    wx.showLoading({ title: '加载中...', mask: true, });
    app.api.postApi(methodUrl, params, (err, resp) => {
      wx.hideLoading();
      if (err) {
        return this._showError('加载数据出错，请重试');
      }
      let { rtnCode, rtnMessage, data } = resp;
      if (rtnCode != 0) {
        return this._showError(rtnMessage);;
      }
      this._handleData(resp);
    });
  },

  /**
   * 显示错误信息
   */
  _showError(errorMsg) {
    wx.showToast({ title: errorMsg, image: '../../../image/use-ruler.png', mask: true });
    this.setData({ error: errorMsg });
    return false;
  },
  showFormError(msg) {
    this.setData({
      showFormError: true,
      formErrorMsg: msg,
    })
    setTimeout(() => {
      this.setData({
        showFormError: false,
        formErrorMsg: '',
      })
    }, 15000)
  },
  /**
   * 获取门店列表数据
   */
  _loadShopData() {
    app.api.fetchApi(ListURL, (err, res) => {   // 获取门店列表数据
      if (!err && res.rtnCode == 0) {
        let { data: shopListData } = res;
        this._loadShopDetailData(shopListData[0]);   // 默认加载第一个门店的详情数据
        this.setData({ shopListData });
      } else {
      }
    });
  },

  /**
   * 获取门店详情数据
   * options: object: 门店列表数据中的一项
   * loading: boolean: 是否等待加载完成后滑动到详情页
   */
  _loadShopDetailData(options, loading = false) {
    if (loading) wx.showLoading({ title: '请稍等...' });
    //const DetailURL = 'store/detail';    // 门店详情
    app.api.fetchApi(DetailURL + '/' + options.storeId, (err, res) => {    // 获取门店详情数据
      if (!err && res.rtnCode == 0) {
        let { data: ShopDetailData } = res;
        if (loading) {
          wx.hideLoading();
          this.setData({
            ShopDetailData,
            curActIndex: 2
          });
        } else {
          this.setData({ ShopDetailData });
        }
      } else {
        if (loading) wx.hideLoading();
      }
    });
  },

  /**
   * 用户点击门店列表中的一项，加载门店详情数据
   */
  loadShopDetailData(e) {
    let { index } = e.currentTarget.dataset;
    let options = this.data.shopListData[index];
    this._loadShopDetailData(options, true);
  },

  /**
   * 点击查看街景
   */
  seeStreet() {
  },


  /**
   * 点击查看图集
   */
  previewAlbum(e) {
    let { albums } = e.currentTarget.dataset;

    wx.previewImage({
      current: albums, // 当前显示图片的http链接
      urls: [albums] // 需要预览的图片http链接列表
    });
  },

  /**
   * swiper 滑动
   */
  swiperChange(event) {
    this.setData({
      curActIndex: event.detail.current
    });
  },

  /**
  * 选项改变
  */
  changeCurActIndex(e) {
    let { idx: curActIndex, method } = e.currentTarget.dataset;
    this.setData({ curActIndex });
    //this.setShippingMethod(method);
  },
  changeCoupon: function (event) {
    console.log('点击进入优惠券选择界面', event);
    //navigateTo  redirectTo
    var pro_price = event.currentTarget.dataset.sub_total;
    var product_id = event.currentTarget.dataset.total_id;
    wx.navigateTo({
      url: '../../shopping/pages/buycard?product_id=' + product_id + '&pro_price=' + pro_price
    });
  },
  //优惠券的数量
  loadCouponData: function () {
    var that = this;
    var params = {
      "uid": 91,
      "store_id": 6,
      "product_id": ["23"],
      "total_price": "79"
    };

    console.log('线上优惠券列表(可用和不可用)请求参数params=', params);

    var url = 'wxapp.php?c=coupon&a=store_coupon_use';
    app.api.postApi(url, { params }, (err, resp) => {
      if (resp) {

        if (resp.err_code == 0) {

          if (resp.err_msg.coupon_list) {
            console.log('resp.err_msg.coupon_list存在');

            //var normal = resp.err_msg.coupon_list['normal_coupon_list'];
            //var expired = resp.err_msg.coupon_list['unnormal_coupon_list'];


            //更新数据
            that.setData({
              normal_coupon_count: resp.err_msg.normal_coupon_count,

            });

          }
        } else {
          return;
        }

      }
      console.log('normal_coupon_count', this.data.normal_coupon_count);

    });
  },

})