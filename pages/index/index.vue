<template>
  <view class="home flex-col">
    <view class="box1 flex-col" v-if="!noPile">
      <view class="bd14 flex-row">
        <view class="layer11 flex-col" @tap="start">
          <span class="layer111">启动</span>
        </view>
        <view class="layer12 flex-col" @tap="openAppoint">
          <span class="layer122 flex-col">预约</span>
        </view>
        <view class="layer13 flex-col" @tap="stop">
          <span class="layer133 flex-col">停止</span>
        </view>
      </view>
      <img class="bd-bj" v-if="status == 1" src="@/static/point-bg1.gif" />
      <img class="bd-bj" v-if="status == 4" src="@/static/point-bg2.png" />
      <img class="bd-bj" v-if="status == 6" src="@/static/point-bg3.png" />
      <img
        class="bd-bj"
        v-if="status == 0 || status == 2 || status == 3 || status == 5"
        src="@/static/point-bg5.png"
      />
      <img class="bd-bj2" src="@/static/point-bg.png" />
      <span class="word1" v-if="status == 1">充电中</span>
      <span class="word1" v-if="status == 2">待机</span>
      <span class="word1" v-if="status == 3">插枪</span>
      <span class="word1" v-if="status == 4">充电完成</span>
      <span class="word1" v-if="status == 5">充电暂停</span>
      <span class="word1" v-if="status == 6" style="color: rgba(220, 83, 81, 1)"
        >充电故障</span
      >
      <span
        class="word1"
        v-if="status == 0"
        style="color: rgba(194, 194, 194, 1)"
        >未连接</span
      >
      <span class="word2" v-if="powerShow">{{ chargePower }}</span>
      <span class="word3" v-if="powerShow">{{
        (chargeTime / 60).toFixed(2)
      }}</span>
      <span class="word4">状态</span>
      <span class="word5" v-if="powerShow">已充电量（KW/h）</span>
      <span class="txt1" v-if="powerShow">已充时间（H)</span>
      <span class="word6">充电电量仅供参考</span>
    </view>
    <view @tap="openSelect" v-if="!noPile">
      <view class="word7">
        <text>{{ name }}</text>
        <span class="arrow-bottom"></span>
      </view>
    </view>
    <view class="no-pile" v-if="noPile">
      <view>
        <img class="bd-bj2" src="@/static/point-bg.png" />
        <img class="bd-no" src="@/static/no.png" />
        <span class="bd-no-span">未绑定充电桩</span>
      </view>
    </view>
    <view class="foot" v-if="noPile">
      <button class="change-btn" type="primary" @tap="gotoAdd">去绑定</button>
    </view>
    <uni-popup ref="loginOpt" type="bottom">
      <login-opt @close="loginClose" @confirm="loginConfirm"></login-opt>
    </uni-popup>
  </view>
</template>

<script>
import loginOpt from "./opt/login";
export default {
  components: { loginOpt },
  data() {
    return {
      name: "",
      electricity: 10,
      isStart: true,
      openId: uni.getStorageSync("openID"),
      code: "",
      VXcode: "",
      command: "",
      sn: "",
      time: "",
      upData: null, //定时刷新任务
      status: "",
      chargeTime: "0",
      chargePower: "0",
      noPile: true,
      powerShow: true, // 是否显示电量 时间
      // page: 0,
      applets: "",
    };
  },
  onLoad() {
    let vm = this;
    let applets = uni.getStorageSync("applets");
    this.applets = applets;
    if (uni.getStorageSync("openID")) {
      vm.login();
      // vm.getData();
    } else {
      vm.openLogin();
    }
  },
  mounted() {},
  methods: {
    login() {
      let vm = this;
      uni.login({
        provider: "weixin",
        success(data) {
          vm.VXcode = data.code;

          let param = {
            code: vm.VXcode,
            encryptedData: vm.encryptedData,
            iv: vm.iv,
            appId: vm.appId,
          };
          vm.isAuth(param);
        },
      });
    },
    isAuth(param) {
      let vm = this;
      this.$http({
        url: this.$api.isAuthNew,
        method: "POST",
        data: param,
      }).then((res) => {
        if (res.data.code == 200) {
          console.log("isAuth", res.data.message);
          if (res.data.result.openId == null) {
            vm.openLogin();
          } else {
            //保存OpenId
            uni.setStorage({
              key: "openID",
              data: res.data.result.openId,
              success() {},
              fail() {},
            });
            vm.openId = res.data.result.openId;
            vm.getAppoint();
          }
        } else {
          vm.openLogin();
        }
      });
    },
    //定时获取充电桩数据 刷新
    getData() {
      let vm = this;
      if (!uni.getStorageSync("openID")) {
        console.log("没有openid");
        return;
      }
      this.$http({
        url: vm.$api.bindingList + "?openId=" + uni.getStorageSync("openID"),
        method: "GET",
        data: {},
      }).then((res) => {
        let type = [];
        if (res.data.result == null || res.data.result.length == 0) {
          uni.removeStorage({
            key: "pileData",
            success: function () {},
          });
          uni.setStorage({
            key: "chargNum",
            data: 0,
            success() {},
          });
          uni.setStorage({
            key: "chargType",
            data: [],
            success() {},
          });
          vm.noPile = true;
          // 没有充电桩先清除跳转参数
          uni.setStorage({
            key: "applets",
            data: "",
          });
          vm.applets = "";
          return wx.showToast({
            title: "暂无数据", // 标题
            icon: "none", // 图标类型，默认success
            duration: 2000, // 提示窗停留时间，默认1500ms
          });
        }
        let data = res.data.result;
        if (uni.getStorageSync("pileData")) {
          data.forEach((item) => {
            type.push(item.type);
            if (item.code == uni.getStorageSync("pileData").code) {
              vm.noPile = false;
              vm.name = item.name;
              vm.code = item.code;
              vm.sn = item.sn;
              vm.status = item.status;
              vm.chargeLatest();
              uni.setStorage({
                key: "pileData",
                data: item,
                success() {},
                fail() {},
              });
            }
          });
          if (vm.code.indexOf("09") == 0 || vm.code.indexOf("03") == 0) {
            vm.powerShow = false;
          } else {
            vm.powerShow = true;
          }
          uni.setStorage({
            key: "chargType",
            data: vm.dedupe(type),
            success() {},
          });
        } else {
          vm.getAppoint();
        }

        uni.setStorage({
          key: "chargNum",
          data: res.data.result.length,
          success() {},
        });
        vm.jumpPage();
      });
    },
    jumpPage() {
      //微信公众号跳转过来要做什么操作
      let vm = this;
      let applets = this.applets;
      if (applets) {
      } else {
        return;
      }
      if (!this.noPile) {
      } else {
        uni.setStorage({
          key: "applets",
          data: "",
        });
        vm.applets = "";
        uni.showToast({
          title: "请先绑定桩后进行操作",
          icon: "none",
          duration: 2000,
        });
        return;
      }
      if (applets == "start") {
        uni.setStorage({
          key: "applets",
          data: "",
        });
        vm.applets = "";
        vm.start();
      }
      if (applets == "stop") {
        uni.setStorage({
          key: "applets",
          data: "",
        });
        vm.applets = "";
        vm.stop();
      }
      if (applets == "appoint") {
        uni.setStorage({
          key: "applets",
          data: "",
        });
        vm.applets = "";
        vm.openAppoint();
      }
    },
    chargeLatest() {
      let vm = this;
      this.$http({
        url: vm.$api.chargeLatest,
        method: "GET",
        data: {
          code: vm.code,
        },
      }).then((res) => {
        if (res.data.code == 200) {
          vm.chargeTime = res.data.result.chargeTime;
          vm.chargePower = res.data.result.chargePower.toFixed(2);
        } else {
          vm.getAppointList();
          vm.delClose();
        }
      });
    },
    dedupe(array) {
      return Array.from(new Set(array));
    },
    start() {
      let vm = this;
      if (!uni.getStorageSync("openID")) {
        return;
      }
      let param = {
        openId: uni.getStorageSync("openID"),
        code: this.code,
        command: "start",
        sn: this.sn,
      };
      this.$http({
        url: vm.$api.control,
        method: "POST",
        data: param,
      }).then((res) => {
        if (res.data.code == 200) {
          wx.showToast({
            title: "开始指令发送成功", // 标题
            icon: "none", // 图标类型，默认success
            duration: 2000, // 提示窗停留时间，默认1500ms
          });
          vm.status = res.data.result.status;
        }
      });
    },
    stop() {
      let vm = this;
      if (!uni.getStorageSync("openID")) {
        return;
      }
      let param = {
        openId: uni.getStorageSync("openID"),
        code: this.code,
        command: "stop",
        sn: this.sn,
      };
      this.$http({
        url: vm.$api.control,
        method: "POST",
        data: param,
      }).then((res) => {
        if (res.data.code == 200) {
          wx.showToast({
            title: "停止指令发送成功", // 标题
            icon: "none", // 图标类型，默认success
            duration: 2000, // 提示窗停留时间，默认1500ms
          });
          vm.status = res.data.result.status;
        }
      });
    },
    //获取绑定桩
    getAppoint() {
      let vm = this;
      if (!uni.getStorageSync("openID")) {
        return;
      }
      this.$http({
        url: vm.$api.getMainPile,
        method: "GET",
        data: {
          openId: uni.getStorageSync("openID"),
        },
      }).then((res) => {
        if (res.data.code == 200) {
          if (res.data.result == null || res.data.result.length == 0) {
            uni.removeStorage({
              key: "pileData",
            });
            uni.setStorage({
              key: "chargNum",
              data: 0,
            });
            uni.setStorage({
              key: "chargType",
              data: [],
            });
            uni.setStorage({
              key: "applets",
              data: "",
            });
            vm.noPile = true;
            // 没有充电桩先清除跳转参数
            uni.setStorage({
              key: "applets",
              data: "",
            });
            vm.applets = "";
            // uni.hideTabBar();
            return wx.showToast({
              title: "暂无数据", // 标题
              icon: "none", // 图标类型，默认success
              duration: 2000, // 提示窗停留时间，默认1500ms
            });
          }
          vm.noPile = false;
          vm.name = res.data.result.name;
          vm.code = res.data.result.code;
          if (vm.code.indexOf("09") == 0 || vm.code.indexOf("03") == 0) {
            vm.powerShow = false;
          } else {
            vm.powerShow = true;
          }
          vm.sn = res.data.result.sn;
          vm.status = res.data.result.status;
          vm.chargeLatest();
          uni.setStorage({
            key: "pileData",
            data: res.data.result,
          });
          uni.setStorage({
            key: "chargType",
            data: [res.data.result.type],
            success() {},
          });
          vm.getData();
        } else {
          vm.noPile = true;
          // 没有充电桩时先清除跳转参数
          uni.setStorage({
            key: "applets",
            data: "",
          });
          vm.applets = "";
        }
      });
    },
    appoint() {},
    //预约
    openAppoint() {
      uni.navigateTo({
        url: "/pages/index/appointList",
      });
    },
    //更换
    openSelect() {
      uni.navigateTo({
        url: "/pages/myChargPoint/selectCharg",
      });
    },
    //登录
    openLogin() {
      // 没有登录时先清除跳转参数
      uni.setStorage({
        key: "applets",
        data: "",
      });
      this.applets = "";
      uni.hideTabBar();
      this.$refs.loginOpt.open();
    },
    loginConfirm() {
      this.loginClose();
      this.getAppoint();
    },
    loginClose() {
      uni.showTabBar();
      this.$refs.loginOpt.close();
    },
    getUpData() {
      this.upData = setInterval(() => {
        this.getData();
      }, 1000 * 15);
    },
    gotoAdd() {
      uni.navigateTo({
        url: "/pages/myChargPoint/addChargPoint",
      });
    },
  },
  onShow() {
    clearTimeout(this.upData);
    this.upData = null;
    if (uni.getStorageSync("openID")) {
      this.getData();
      if (uni.getStorageSync("chargNum") > 0) {
        this.getUpData();
      } else {
        if (this.upData) {
          clearTimeout(this.upData);
          this.upData = null;
        }
      }
    }
  },
  onHide() {
    if (this.upData) {
      clearTimeout(this.upData);
      this.upData = null;
    }
  },
  onPullDownRefresh() {
    this.getData();
    uni.showToast({
      title: "刷新",
      icon: "none",
      duration: 2000,
    });
    setTimeout(function () {
      uni.stopPullDownRefresh();
    }, 1000);
  },
};
</script>

<style lang="scss" scoped>
@import "./css/index.scss";
.home2 {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  // background-color: #fff;
  // height: 100%;
  .text {
    color: #000;
  }
  .top {
    width: 750rpx;
    height: 325rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    .top-text {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-right: 40rpx;
      font-size: 38rpx;
      font-weight: bold;
    }
  }
  .content {
    height: 125rpx;
    margin: 60rpx auto;
    text {
      display: block;
    }
  }
  .content-btn {
    display: flex;
    margin-bottom: 200rpx;
    .circular-btn {
      width: 144rpx;
      height: 144rpx;
      color: #ffffff;
      border-radius: 144rpx;
      margin-right: 40rpx;
      justify-content: center;
      align-items: center;
      display: flex;
    }
  }
}
</style>