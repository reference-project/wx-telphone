
const app = getApp();

let _params = null;
let groupbuyId;                   //团购ID
//var prodId;                   //团购ID
Page({
  data: {
    loading: false,
    data: null,
    prodId: null,
    action: null,    // 'present' 为赠品   'havealook'为从订单来查看详细的
    //多规格 start
    firstIndex: -1,
    //准备数据
    //数据结构：以一组一组来进行设定
    commodityAttr: [],
    attrValueList: [],
    firstIndex: -1,
    numShow: '',//库存
    //skuId:'', //多属性标识
    skuId: 0, //修改 2017年8月31日16:34:42
    attrPrice: '', //多属性的价格
    //多规格 end
    //数量增减
    // input默认是1
    num: 1,
    showhide: false,
    // 使用data数据对象设置样式名
    minusStatus: 'disabled',
    replaceData: [],    // 团购订单
    groupbuyId: null,
    showHide: false,
    listStatus: 0
    //mid:null, //团长ID
  },
  onShareAppMessage(res) {
    return { title: '', path: '' }
  },
  showDetail(e) {
    var that = this;
    var listStatus = e.currentTarget.dataset.liststatus;
    if (listStatus == 0) {
      that.setData({
        showHide: true,
        listStatus: 1
      });
    } else {
      that.setData({
        showHide: false,
        listStatus: 0
      });
    }
  },
  showHide() {
    this.setData({
      showhide: true
    })
  },
  hideMsg() {
    this.setData({
      showhide: false
    })
  },
  onLoad: function (options) {
    let { prodId, action, params } = options;
    _params = params;
    prodId = options.prodId;
    groupbuyId = options.groupbuyId;
    this.setData({
      prodId: prodId
    });
    groupbuyId = options.groupbuyId;
    this.setData({
      groupbuyId: groupbuyId
    });
    this.loadData(prodId, groupbuyId, action);
  },
  onReady: function () {
    // 页面渲染完成
  },
  //多规格 onShow
  onShow: function () {

  },
  onHide: function () {
    // 页面隐藏
    this.stopCountDown();
  },
  onUnload: function () {
    // 页面关闭
  },

  loadData(prodId, groupbuyId, action) {
    wx.showLoading({ title: '加载中' });
    let url = 'groupbuy/GroupbuyDetail'; //新接口
    app.api.postApi(url, { prodId, groupbuyId }, (err, response) => {
      wx.hideLoading();
      if (err) return;
      let { rtnCode, rtnMessage, data } = response;
      if (rtnCode != 0 && rtnMessage) {
        rtnMessage = rtnMessage || '加载商品信息出错';
        wx.showToast({
          title: rtnMessage,
          icon: 'loading',
          duration: 2000
        });
        return;
      }
      this.setData({
        'commodityAttr': data.productSku
        //'commodityAttr': commodityAttr
      });

      //多规格，从show（）移动来这里
      this.setData({
        includeGroup: this.data.commodityAttr
      });
      this.distachAttrValue(this.data.commodityAttr);
      if (this.data.commodityAttr.length == 1) {
        for (var i = 0; i < this.data.commodityAttr[0].attrValueList.length; i++) {
          this.data.attrValueList[i].selectedValue = this.data.commodityAttr[0].attrValueList[i].attrValue;
        }
        this.setData({
          attrValueList: this.data.attrValueList
        });
      }
      //多规格 end
      if (data.tag) {
        data.tag = data.tag.split(',');
      }
      if (data.images) {
        data.images = data.images.split(',');
      }
      if (data.description) {
        data.description = data.description.split(',');
      }
      this.setData({ data, prodId, action });
    });
  },

  doBuy: function (e) {
    var type = e.target.dataset.ordertype;
    var value = [];
    for (var i = 0; i < this.data.attrValueList.length; i++) {
      if (!this.data.attrValueList[i].selectedValue) {
        break;
      }
      value.push(this.data.attrValueList[i].selectedValue);
    }
    if (i < this.data.attrValueList.length) {
      wx.showToast({
        title: '请选择商品属性',
        icon: 'loading',
        duration: 1000
      })
      return;
    } else {
      console.log('选择的属性：' + value.join('-'));
      wx.setStorage({
        key: "key",
        data: value.join('-')
      })
    }
    //多规格 end
    let { prodId, action, skuId, num } = this.data;    
    if (skuId) {
      //let url = './buy?prodId=' + prodId + '&skuid=' + skuId;
    } else {
      skuId = 0;
      //let url = './buy?prodId=' + prodId + '&skuid=0';
    }
    if (type == 2) {
      //团购
      var url = './buy?prodId=' + prodId + '&groupbuyId=' + groupbuyId + '&groupbuyOrderId=0' + '&skuid=' + skuId + '&num=' + num;
    } else {
      //单独购买
      var url = '../shopping/buy?prodId=' + prodId + '&groupbuyId=0' + '&groupbuyOrderId=0' + '&skuid=' + skuId + '&num=' + num;
    }

    //return;
    wx.redirectTo({ url });

  },
  gotoCart: function () {
    let url = "../cart/cart";
    wx.redirectTo({

      url: '../cart/cart'
    });

  },
 
  //多规格 js  start
  /* 获取数据 */
  distachAttrValue: function (commodityAttr) {
    // 把数据对象的数据（视图使用），写到局部内
    var attrValueList = this.data.attrValueList;
    // 遍历获取的数据
    for (var i = 0; i < commodityAttr.length; i++) {
      for (var j = 0; j < commodityAttr[i].attrValueList.length; j++) {
        var attrIndex = this.getAttrIndex(commodityAttr[i].attrValueList[j].attrKey, attrValueList);
        // 如果还没有属性索引为-1，此时新增属性并设置属性值数组的第一个值；索引大于等于0，表示已存在的属性名的位置
        if (attrIndex >= 0) {
          // 如果属性值数组中没有该值，push新值；否则不处理
          if (!this.isValueExist(commodityAttr[i].attrValueList[j].attrValue, attrValueList[attrIndex].attrValues)) {
            attrValueList[attrIndex].attrValues.push(commodityAttr[i].attrValueList[j].attrValue);
          }
        } else {
          attrValueList.push({
            attrKey: commodityAttr[i].attrValueList[j].attrKey,
            attrValues: [commodityAttr[i].attrValueList[j].attrValue]
          });
        }
      }
    }
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        if (attrValueList[i].attrValueStatus) {
          attrValueList[i].attrValueStatus[j] = true;
        } else {
          attrValueList[i].attrValueStatus = [];
          attrValueList[i].attrValueStatus[j] = true;
        }
      }
    }
    this.setData({
      attrValueList: attrValueList
    });
  },
  getAttrIndex: function (attrName, attrValueList) {
    // 判断数组中的attrKey是否有该属性值
    for (var i = 0; i < attrValueList.length; i++) {
      if (attrName == attrValueList[i].attrKey) {
        break;
      }
    }
    return i < attrValueList.length ? i : -1;
  },
  isValueExist: function (value, valueArr) {
    // 判断是否已有属性值
    for (var i = 0; i < valueArr.length; i++) {
      if (valueArr[i] == value) {
        break;
      }
    }
    return i < valueArr.length;
  },
  /* 选择属性值事件 */
  selectAttrValue: function (e) {
    /*
    点选属性值，联动判断其他属性值是否可选
    {
      attrKey:'型号',
      attrValueList:['1','2','3'],
      selectedValue:'1',
      attrValueStatus:[true,true,true]
    }
    */
    var attrValueList = this.data.attrValueList;
    var index = e.currentTarget.dataset.index;//属性索引
    var key = e.currentTarget.dataset.key;
    var value = e.currentTarget.dataset.value;
    if (e.currentTarget.dataset.status || index == this.data.firstIndex) {
      if (e.currentTarget.dataset.selectedvalue == e.currentTarget.dataset.value) {
        // 取消选中
        this.disSelectValue(attrValueList, index, key, value);
      } else {
        // 选中
        this.selectValue(attrValueList, index, key, value);
      }

    }
  },
  /* 选中 */
  selectValue: function (attrValueList, index, key, value, unselectStatus) {
    var includeGroup = [];
    var skuId;
    if (index == this.data.firstIndex && !unselectStatus) { // 如果是第一个选中的属性值，则该属性所有值可选
      var commodityAttr = this.data.commodityAttr;
      // 其他选中的属性值全都置空
      for (var i = 0; i < attrValueList.length; i++) {
        for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
          attrValueList[i].selectedValue = '';
        }
      }
    } else {
      var commodityAttr = this.data.includeGroup;
    }

    for (var i = 0; i < commodityAttr.length; i++) {
      for (var j = 0; j < commodityAttr[i].attrValueList.length; j++) {
        if (commodityAttr[i].attrValueList[j].attrKey == key && commodityAttr[i].attrValueList[j].attrValue == value) {
          includeGroup.push(commodityAttr[i]);
          this.setData({
            numShow: commodityAttr[i]['num'], skuId: commodityAttr[i]['skuId']
          });
        }
      }
    }
    attrValueList[index].selectedValue = value;

    // 判断属性是否可选
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        attrValueList[i].attrValueStatus[j] = false;
      }
    }
    for (var k = 0; k < attrValueList.length; k++) {
      for (var i = 0; i < includeGroup.length; i++) {
        for (var j = 0; j < includeGroup[i].attrValueList.length; j++) {
          if (attrValueList[k].attrKey == includeGroup[i].attrValueList[j].attrKey) {
            for (var m = 0; m < attrValueList[k].attrValues.length; m++) {
              if (attrValueList[k].attrValues[m] == includeGroup[i].attrValueList[j].attrValue) {
                attrValueList[k].attrValueStatus[m] = true;
              }
            }
          }
        }
      }
    }
    this.setData({
      attrValueList: attrValueList,
      includeGroup: includeGroup,
      attrPrice: includeGroup[0]['price'],
    });
    var count = 0;
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        if (attrValueList[i].selectedValue) {
          count++;
          break;
        }
      }
    }
    if (count < 2) {// 第一次选中，同属性的值都可选
      this.setData({
        firstIndex: index
      });
    } else {
      this.setData({
        firstIndex: -1
      });
    }
  },
  /* 取消选中 */
  disSelectValue: function (attrValueList, index, key, value) {
    var commodityAttr = this.data.commodityAttr;
    attrValueList[index].selectedValue = '';

    // 判断属性是否可选
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        attrValueList[i].attrValueStatus[j] = true;
      }
    }
    this.setData({
      includeGroup: commodityAttr,
      attrValueList: attrValueList
    });

    for (var i = 0; i < attrValueList.length; i++) {
      if (attrValueList[i].selectedValue) {
        this.selectValue(attrValueList, i, attrValueList[i].attrKey, attrValueList[i].selectedValue, true);
      }
    }
  },
  //多规格end
  //数量增减start
  /* 点击减号 */
  bindMinus: function () {
    var num = this.data.num;
    // 如果大于1时，才可以减
    if (num > 1) {
      num--;
    }
    // 只有大于一件的时候，才能normal状态，否则disable状态
    var minusStatus = num <= 1 ? 'disabled' : 'normal';
    // 将数值与状态写回
    this.setData({
      num: num,
      minusStatus: minusStatus
    });
  },
  /* 点击加号 */
  bindPlus: function () {
    var num = this.data.num;
    // 不作过多考虑自增1
    num++;
    // 只有大于一件的时候，才能normal状态，否则disable状态
    var minusStatus = num < 1 ? 'disabled' : 'normal';
    // 将数值与状态写回
    this.setData({
      num: num,
      minusStatus: minusStatus
    });
  },
  /* 输入框事件 */
  bindManual: function (e) {
    var num = e.detail.value;
    // 将数值与状态写回
    this.setData({
      num: num
    });
  },
  //数量增减end
  //加入购物车start
  addShopCart: function (e) { //添加到购物车
    //2017年8月31日15:48:52 多属性 start
    var value = [];
    for (var i = 0; i < this.data.attrValueList.length; i++) {
      if (!this.data.attrValueList[i].selectedValue) {
        break;
      }
      value.push(this.data.attrValueList[i].selectedValue);
    }
    if (i < this.data.attrValueList.length) {
      wx.showToast({
        title: '请选择商品属性',
        icon: 'loading',
        duration: 1000
      })
      return;
    } else {
      wx.setStorage({
        key: "key",
        data: value.join('-')
      })
    }
    //end

    var skuId = this.data.skuId;

    var that = this;
    var user_id = app.d.userId;
    var num = this.data.num;
    var prodId = this.data.prodId;
    let url = 'shop/add_cart';
    app.api.postApi(url, { user_id, num, prodId, skuId }, (err, resp) => {
      if (err) {
        return this._showError('加载数据出错，请重试');
      }

      let { rtnCode, rtnMessage, data } = resp;
      if (rtnCode != 0) {
        return this._showError(rtnMessage);
      }

      var status = data.status;
      if (status == 1) {
        var ptype = e.currentTarget.dataset.type;
        if (ptype == 'buynow') {
          wx.redirectTo({

            //url: '../order/pay?cartId=' + data.cart_id
          });
          return;
        } else {
          wx.showToast({
            title: '加入购物车成功',
            icon: 'success',
            duration: 2000
          });
        }
      } else {
        wx.showToast({
          title: data.err,
          duration: 2000
        });
      }

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
  //加入购物车end

  /**
   * 换一批数据处理
   * onLoaded: 加载成功回调函数
   */
  _loadOrderData(prodId) {
    wx.showLoading({ title: '加载中...', mask: true, });
    let replaceData = [];
    app.api.fetchApi("groupbuy/GroupbuyReplace/" + prodId, (err, resp) => {
      wx.hideLoading();
      if (err) {
        return this._showError('网络出错，请稍候重试');;
      }
      let { rtnCode, rtnMessage, data = [] } = resp;
      if (rtnCode != 0) {
        return this._showError(rtnMessage);
      }
      let replaceData = data;
      //typeof onLoaded === 'function' && onLoaded();
      this.startCountDown(replaceData);
    });
  },
  //倒计时处理
  /**
   * 倒计时处理
   */
  startCountDown(replaceData) {
    this.timer = setInterval(() => {
      let now = new Date().getTime();
      // 正在进行
      for (let i = replaceData.length - 1; i >= 0; i--) {
        let item = replaceData[i];
        let expireTime = item.expireTimeStr;
        let leftTime = (expireTime - now) / 1000;
        if (leftTime < 0) {
          //replaceData.splice(i, 1);   // 到了失效时间，从活动里删除
          //continue;
        } else {
          item.countDown = this.countDown(leftTime);
        }

      }
      this.setData({ replaceData });
    }, 1000);
  },
  /**
   * 停止倒计时
   */
  stopCountDown() {
    this.timer && clearInterval(this.timer);
  },

  /**
   * 格式化倒计时显示
   */
  countDown(leftTime) {
    let day = parseInt(leftTime / 24 / 60 / 60);
    let hour = parseInt((leftTime - day * 24 * 60 * 60) / 60 / 60);
    let minute = parseInt((leftTime - day * 24 * 60 * 60 - hour * 60 * 60) / 60);
    let second = parseInt(leftTime - day * 24 * 60 * 60 - hour * 60 * 60 - minute * 60);

    if (hour < 10) hour = '0' + hour;
    if (minute < 10) minute = '0' + minute;
    if (second < 10) second = '0' + second;

    return { day, hour, minute, second };
  },

  //点击换一批
  clickReplace: function () {
    var prodId = this.data.prodId;
    this.stopCountDown();
    this._loadOrderData(prodId); //换一批数据
  },
  //去参加团
  joinGroup: function () {
    wx.redirectTo({
    });
  },
  //去参加团 方法2 
  listClick: function (event) {
    var groupbuyOrderId = event.currentTarget.id
    var prodId = this.data.prodId;
    var groupbuyId = this.data.groupbuyId;
    var mid = this.data.mid; //团长的ID
    let url = 'group-join?prodId=' + prodId + '&groupbuyId=' + groupbuyId + '&groupbuyOrderId=' + groupbuyOrderId;
    wx.navigateTo({ url: url })
  },

  //发送模板消息测试
  fromid: function (e) {
    var user_id = app.d.userId; //测试参数
    var formId = e.detail.formId;
    let url = 'buy/sendmsg';
    app.api.postApi(url, { user_id }, (err, resp) => {
      if (err) {
        //return this._showError('加载数据出错，请重试');
        wx.showToast({
          title: '加载数据出错，请重试',
          icon: 'loading',
          duration: 2000
        });
        return;
      }

      let { rtnCode, rtnMessage, data } = resp;
      if (rtnCode != 0) {
        //return this._showError(rtnMessage);
      }

    });
  },


})