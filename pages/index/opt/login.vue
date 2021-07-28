<template>
  <view class="login">
    <view class="card-content">
      <view class="header">
        <image src="../../../static/wx_login.jpg"></image>
      </view>
      <view class="content">
		<view>该小程序服务对象为使用智汇充电桩产品的客户，使用时请先进行授权</view>
        <view>若未授权仅能体验部分功能</view>
        <view>如需体验完整功能请先授权</view>
        <view>申请获取以下权限</view>
        <text>获得你的公开信息(昵称，头像、地区等)</text>
        <text>获得你微信绑定的手机号</text>
        <view class="userinfo"> </view>
      </view>
      <view v-if="!hasUserInfo">
        <button
          class="bottom"
          type="primary"
          v-if="canIUseGetUserProfile"
          @tap="getUserProfile"
        >
          获取头像昵称
        </button>
        <button
          v-else
          class="bottom"
          type="primary"
          open-type="getUserInfo"
          bindgetuserinfo="onGotUserInfo"
        >
          获取微信头像昵称
        </button>
      </view>
      <view v-else>
        <image
          bindtap="bindViewTap"
          class="userinfo-avatar"
          :src="userInfo.avatarUrl"
          mode="cover"
        ></image>
        <text class="userinfo-nickname">{{ userInfo.nickName }}</text>
      </view>
      <!-- <button
        class="bottom"
        type="primary"
        open-type="getUserInfo"
        withCredentials="true"
        lang="zh_CN"
      >
        授权登录
      </button> -->

      <button
        class="bottom"
        type="primary"
        open-type="getPhoneNumber"
        @getphonenumber="getPhoneNumber"
        withCredentials="true"
        lang="zh_CN"
      >
        手机号授权
      </button>
      <button class="bottom" type="primary" @click="cancel">取消授权</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      appId: "wx5ef2d2d07f800bba",
    //   appId: "wx931d1f3c24a240d8",
      type: 0,
      phone: "",
      phoneParams: {
        sessionkey: "",
        ivdata: "",
        encrypdata: "",
      },
      encryptedData: "",
      iv: "",
      loginStatus: false,
      phoneStatus: false,
      userInfo: {},
      hasUserInfo: false,
      canIUseGetUserProfile: false,
    };
  },
  onLoad() {},
  mounted() {
	let vm = this;
    uni.setStorage({
      key: "applets",
      data: "",
    });
    if (wx.getUserProfile) {
	  uni.login({
	    provider: "weixin",
	    success(data) {
	      vm.code = data.code;
	      vm.canIUseGetUserProfile = true;
	    },
	  });
      
    }
  },
  methods: {
    login() {
      let vm = this;
      uni.login({
        provider: "weixin",
        success(data) {
          vm.code = data.code;
          let param = {
            code: vm.code,
            encryptedData: vm.encryptedData,
            iv: vm.iv,
            appId: vm.appId,
          };
          vm.getOpenId(param);
        },
      });
    },
    getOpenId(param) {
      let vm = this;
      try {
        this.$http({
          url: this.$api.login,
          method: "POST",
          data: param,
        }).then((res) => {
          if (res.data.code != 200) {
            uni.showToast({
              title: res.data.message,
              icon: "none",
              duration: 2000,
            });
            vm.loginStatus = false;
          } else {
            //保存OpenId
            uni.setStorage({
              key: "openID",
              data: res.data.result.openId,
              success() {
                console.log("openID缓存成功");
              },
              fail() {
                console.log("openID缓存失败");
              },
            });
            vm.openId = res.data.result.openId;
            if (res.data.result.openId == null) {
              vm.hasUserInfo = false;
            }
            vm.loginStatus = true;
            this.reLaunch();
          }
        });
      } catch (error) {
        uni.removeStorage({
          key: "pileData",
          success: function () {
            console.log("pileData删除成功");
          },
        });
        uni.removeStorage({
          key: "openID",
          success: function () {
            console.log("openID删除成功");
          },
        });
        vm.hasUserInfo = false;
        vm.loginStatus = false;
      }
    },
    getUserProfile(e) {
      // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
      // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
      console.log(e);
	  let vm = this;
	 wx.getUserProfile({
	   desc: "用于完善会员资料", // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
	   success: (res) => {
	     console.log("用于完善会员资料", res); //code
	     vm.userInfo = res.userInfo;
	     vm.hasUserInfo = true;
	     vm.loginStatus = true;
	     vm.encryptedData = res.encryptedData;
	     vm.iv = res.iv;	  
		  let param = {
			code: vm.code,
			encryptedData: vm.encryptedData,
			iv: vm.iv,
			appId: vm.appId,
		  };
		  vm.getOpenId(param);
	     //this.login();
	   },
	   fail: (res) => {
	     //用户按了拒绝按钮
	     vm.loginStatus = false;
	     uni.showToast({
	       title: "为了方便您的使用，请先允许授权",
	       icon: "none",
	       duration: 2000,
	     });
	     console.log("用户按了拒绝按钮"); //code
	   },
	 });
      
    },
    onGotUserInfo(e) {
      // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
	  if (e.detail.userInfo) {
        console.log("用户按了允许授权按钮"); //code
        this.loginStatus = true;
        this.login();
        //用户按了允许授权按钮
      } else {
        //用户按了拒绝按钮
        this.loginStatus = false;
        uni.showToast({
          title: "为了方便您的使用，请先允许授权",
          icon: "none",
          duration: 2000,
        });
        console.log("用户按了拒绝按钮"); //code
      }
    },
    getPhoneNumber(e) {
      if (e.detail.errMsg == "getPhoneNumber:ok") {
        this.getUserPhoneInfo(e.detail.encryptedData, e.detail.iv);
      } else {
        uni.showToast({
          title: "授权失败，请稍后再试。。。",
          icon: "none",
          duration: 2000,
        });
      }
    },
    getUserPhoneInfo(encryptedData, iv) {
      // uni.showLoading({
      //   title: "微信授权中。。。",
      // });
      let vm = this;
      uni.login({
        provider: " weixin",
        success: function (loginRes) {
          vm.$http({
            url: vm.$api.login,
            method: "POST",
            data: {
              code: loginRes.code,
              encryptedData: encryptedData,
              iv: iv,
              appId: vm.appId,
            },
          }).then((res) => {
            if (res.data.code == 200) {
              uni.showToast({
                title: "获取到手机：" + res.data.result.phoneNumber,
                icon: "none",
                duration: 2000,
              });
              vm.phoneStatus = true;
              //保存OpenId
              uni.setStorage({
                key: "openID",
                data: res.data.result.openId,
                success() {
                  console.log("openID缓存成功");
                },
                fail() {
                  console.log("openID缓存失败");
                },
              });
              vm.reLaunch();
            } else {
              vm.phoneStatus = false;
              // uni.showToast({
              //   title: "授权失败，请稍后再试。。。",
              //   icon: "none",
              //   duration: 2000,
              // });
            }
          });
        },
      });
    },
    reLaunch() {
      if (this.loginStatus && this.phoneStatus) {
        uni.removeStorage({
          key: "pileData",
          success: function () {
            console.log("pileData删除成功");
          },
        });
        this.$emit("confirm");
        // 后续业务代码
        // uni.reLaunch({//信息更新成功后跳转到小程序首页
        // 	url: '/pages/index/index'
        // });
      }
    },
    cancel() {
      uni.removeStorage({
        key: "pileData",
        success: function () {
          console.log("pileData删除成功");
        },
      });
      uni.removeStorage({
        key: "openID",
        success: function () {
          console.log("openID删除成功");
        },
      });
      this.$emit("confirm");
    },
  },
};
</script>

<style lang="scss" scoped>
.login {
  width: 100wh;
  padding: 0 20rpx;
  .card-content {
    margin-top: 20rpx;
    height: calc(100vh - 90rpx);
  }
}
.header {
  margin: 90rpx 0 50rpx 50rpx;
  border-bottom: 1px solid #ccc;
  text-align: center;
  width: 650rpx;
  height: 300rpx;
  line-height: 450rpx;
}
.header image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 200rpx;
}
.content {
  margin-left: 50rpx;
  margin-bottom: 50rpx;
}
.content text {
  display: block;
  color: #9d9d9d;
  margin-top: 40rpx;
}
.bottom {
  height: 73rpx;
  line-height: 73rpx;
  border-radius: 80rpx;
  margin: 35rpx 50rpx;
  font-size: 35rpx;
}
.bottom:first-child {
  margin-top: 50rpx;
}

.view_input {
  margin: 0 50rpx;
  background-color: white;
  padding: 10px;
  height: 1rem;
  line-height: 1rem;
}
</style>

