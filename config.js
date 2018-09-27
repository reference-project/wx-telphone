/**
 * 小程序配置文件
 */
/**
 * host  服务器名称
 * AGENT  api请求中的hear参数
 * sid   店铺id
 */
var isRelease = true;
var host = "https://saas.qutego.com/"
var testhost = "https://zy.qutego.com/"
// var testhost = "https://saas.qutego.com/"
var AGENT_ID = 2
var sid = 310;//咿呀
var sid_test = 293;//婴众趣购590
var title = '咿呀';
var title_test = '婴众趣购';
var phonetest = '4006088520';//测试客服电话
var phone = '4006897779';//正式客服电话趣购精选
var phoneTxt = '400-689-7779';
var serverTxt = '702060';
var appid = 'wx79871653a25c3be2';//咿呀appid:wx79871653a25c3be2婴众趣购appid: wx57d5cde97d7e1fd3';

var config = {

  isRelease:isRelease,

  // 下面的地址配合云端 Server 工作
  host: isRelease ? host : testhost,

  // 上线时需要根据实际数据修改
  AGENT_ID,

  //客服电话
  serverPhone: phone,
  
  //客服电话txt
  phoneTxt,

  //客服微信
  serverTxt,
  //店铺id
  sid: isRelease ? sid : sid_test,

  //appid
  appid,
  
  //分享标题
  shareTitle: isRelease ? title : title_test,

  //获取小程序客服微信
  getTelWxUrl: `api.php?c=common&a=getTelnWx`,

  // 登录地址，用于建立会话
  loginUrl: `wxapp.php?c=wechatapp_v2&a=login_new`,

  //判断用户是否绑定了手机
  checkBingUrl: `wxapp.php?c=promote&a=check_phone`,

  //获取sessionkey
  sessionUrl: `wxapp.php?c=wechatapp_v2&a=get_session_key`,

  //获取手机号
  getPhoneUrl:`wxapp.php?c=wechatapp_v2&a=get_phone`,

  //绑定手机号
  bingPhoneUrl:`wxapp.php?c=wechatapp_v2&a=bind_phone_v2`,

  //用code换取openId 第一版本接口
  openIdOldUrl: `wxapp.php?c=wechatapp&a=login_new`,

  // 用code换取openId 第二版
  openIdUrl: `wxapp.php?c=wechatapp_v2&a=login_new`,

  //用code换取openid新接口,需要session_key，第三版
  openIdNewUrl:`wxapp.php?c=wechatapp_v2&a=login_new_v2`,


  //弹窗提示参团信息
  jumpintuanUrl: `wxapp.php?c=tuan_v2&a=pop_team_list_v2`,



};

module.exports = config
