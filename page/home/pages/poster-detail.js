let app = getApp();
const posterUrl = 'wxapp.php?c=index_activity&a=posterDetail';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    posterDetail: null,
    uid: '',
    store_id: '',
    openid: '',
    posterId: '',//海报id
    type: '',
    height: "100%",
  },

  loadData() {
    var params = {
      "id": this.data.posterId, "type": this.data.type
    };
    app.api.postApi(posterUrl, { params }, (err, rep) => {
      if (rep.err_code == 0) {
        this.setData({
          posterDetail: rep.err_msg.posterDetail
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.src) {
      var posterDetail = {
        rediurl: options.src
      }
      this.setData({ posterDetail });
    }
    wx.getSystemInfo({
      success: function (res) {

        console.log('高度是=', res);
        // winPage.setData({
        //   dkheight: winHeight - winHeight * 0.05 - 80
        // })
      }
    })
    // let uid = wx.getStorageSync('userUid');
    // let store_id = app.store_id;
    // let openid = wx.getStorageSync('openid');
    // let { type,id} = options;
    // this.setData({
    //   uid, store_id, openid, posterId:id,type
    // })

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
    this.loadData();
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