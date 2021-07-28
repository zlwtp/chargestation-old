<template>
  <view class="appoint-add">
    <!-- <view class="charg-item" @touchmove.stop.prevent> -->
    <view class="charg-item">
      <t-slide
        ref="slide"
        @edit="edit"
        @del="del"
        :btnArr="btnArr"
        @itemClick="itemClick"
        key="slide"
        v-if="showSlide"
      >
        <template v-slot:default="{ item }">
          <view class="appoint-card" @tap="itemClick(item)">
            <view class="tip" v-if="false"> <span>常用设置</span></view>
            <view v-else style="height: 40rpx"> </view>
            <view class="appoint-switch">
              <view class="time">
                <span v-if="item.endTime"
                  >{{ item.beginTime }}——{{ item.endTime }}</span
                >
                <span v-else>{{ item.beginTime }}——充满为止</span>
                <span class="full" v-if="item.endTime">{{ item.differ }}</span>
              </view>
              <view class="switch" @tap.stop.prevent>
                <switch
                  :checked="item.active"
                  @change="switch1Change(item)"
                  style="transform: scale(0.7)"
                />
              </view>
            </view>
            <view class="appoint-foot">
              <span>重复：{{ item.activeDayShow || "仅此一次" }}</span>
            </view>
          </view>
        </template>
      </t-slide>
    </view>
    <view style="height: 142rpx; background-color: unset"></view>
    <view class="foot">
      <button class="change-btn" type="primary" @tap="add">新增</button>
    </view>
    <uni-popup ref="delPopup" type="bottom">
      <view class="del-popup">
        <text class="title">请确定是否删除{{ title }}</text>
        <text class="title"></text>
        <view class="foot">
          <button class="change-btn foot-btn" type="primary" @tap="delConfirm">
            确定
          </button>
          <button class="change-btn foot-btn" type="primary" @tap="delClose">
            取消
          </button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import MxDatePicker from "@/components/mx-datepicker/mx-datepicker.vue";
import tSlide from "@/components/t-slide/t-slide.vue";
export default {
  components: {
    MxDatePicker,
    tSlide,
  },
  data() {
    return {
      openId: uni.getStorageSync("openID"),
      param: {
        code: "",
        endTime: "00:00",
        startTime: "00:00",
      },
      showPicker: false,
      time: "",
      id: "",
      title: "",
      type: "time",
      value: "",
      chargList: [],
      btnArr: [
        {
          name: "删除",
          background: "#ff5500",
          color: "#fff",
          events: "del",
        },
      ],
      dateList: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
      showSlide: true,
    };
  },
  onLoad() {
    let vm = this;
    uni.getStorage({
      key: "openID",
      success(res) {
        vm.openId = res.data;
        vm.getAppointList();
      },
    });
  },
  mounted() {},
  methods: {
    add() {
      uni.navigateTo({
        url: "/pages/index/appoint",
      });
    },
    getDateType(num) {
      let a = parseInt(num, 2);
      a = parseInt(num, 10).toString(2);
      while (a.length < 7) {
        a = "0" + a;
      }
      let _a = a.split("");
      let str = "";
      for (let index = 0; index < _a.length; index++) {
        if (_a[index] == "1") {
          str += this.dateList[index] + "、";
        }
      }
      if (str == "") {
        return "";
      } else {
        return str.slice(0, str.length - 1);
      }
    },
    getAppointList() {
      let vm = this;
      uni.showLoading({
        title: "加载中",
        mask: true,
      });
      try {
        this.$http({
          url: vm.$api.appointListByCode,
          method: "GET",
          data: {
            code: uni.getStorageSync("pileData").code,
          },
        }).then((res) => {
          uni.hideLoading();
          if (res.data.result == null || res.data.result.length == 0) {
            vm.chargList = [];
            vm.showSlide = false;
            return wx.showToast({
              title: "暂无数据", // 标题
              icon: "none", // 图标类型，默认success
              duration: 2000, // 提示窗停留时间，默认1500ms
            });
          }
          vm.showSlide = true;
          vm.chargList = res.data.result;
          vm.chargList.forEach((item) => {
            if (item.activeDay == 0) {
              item.activeDayShow = "";
            } else {
              item.activeDayShow = vm.getDateType(item.activeDay);
            }
            if (item.endTime == "") {
              item.differ = "充满为止";
              return;
            }
            let time = vm.timeDifference(item.beginTime, item.endTime);
            if (time[0] == 0) {
              item.differ = vm.NoToChinese(time[1]) + "分钟";
            } else {
              if (time[1] == 0) {
                item.differ = vm.NoToChinese(time[0]) + "小时";
              } else {
                item.differ =
                  vm.NoToChinese(time[0]) +
                  "小时" +
                  vm.NoToChinese(time[1]) +
                  "分钟";
              }
            }
          });
          this.$nextTick(() => {
            this.$refs.slide.assignment(vm.chargList);
          });
        });
      } catch (error) {
        uni.hideLoading();
      }
    },
    //点击单行
    itemClick(data) {
      uni.navigateTo({
        url:
          "/pages/index/appoint?datas=" +
          encodeURIComponent(JSON.stringify(data)),
      });
    },
    //删除
    del(data) {
      let vm = this;
      this.id = data.id;
      this.title = data.name;
      this.$refs.delPopup.open();
      // uni.showToast({
      //   title: "删除ID--" + data.id,
      //   icon: "none",
      // });open
    },
    delClose() {
      this.$refs.delPopup.close();
    },
    delConfirm() {
      let vm = this;
      this.$http({
        url: vm.$api.appointDelete,
        method: "POST",
        data: {
          id: vm.id,
        },
      }).then((res) => {
        if (res.data.code == 200) {
          uni.showToast({
            title: "删除成功",
            icon: "none",
            duration: 2000,
          });
          vm.getAppointList();
          vm.delClose();
        } else {
          vm.getAppointList();
          vm.delClose();
        }
      });
    },
    //编辑
    edit(data) {},
    switch1Change: function (item) {
      let vm = this;
      // this.e.target.value
      this.$http({
        url: vm.$api.appointUpdate,
        method: "POST",
        data: {
          active: !item.active,
          activeDay: item.activeDay,
          appointId: item.appointId,
          beginTime: item.beginTime,
          endTime: item.endTime,
          id: item.id,
          name: item.name,
          oftenUsed: item.oftenUsed,
          openId: item.openId,
          // pileId: item.pileId,
          pileId: item.active ? item.pileId : uni.getStorageSync("pileData").id,
        },
      }).then((res) => {
        if (res.data.code == 200) {
          uni.showToast({
            title: "操作成功",
            icon: "none",
            duration: 2000,
          });
        }
        vm.getAppointList();
      });
    },
    //     var startTime="08:31:00";
    // var endTime="01:30:00";

    //计算时间差（相差分钟）
    timeDifference(startTime, endTime) {
      let start1 = startTime.split(":");
      let startAll = parseInt(start1[0] * 60) + parseInt(start1[1]);
      let end1 = endTime.split(":");
      let endAll = parseInt(end1[0] * 60) + parseInt(end1[1]);
      let minutes = endAll - startAll;
      if (minutes < 0) {
        minutes = 1440 + minutes;
      }
      return [Math.floor(minutes / 60), minutes % 60];
    },
    //阿拉伯数字转中文数字
    NoToChinese(num) {
      if (!/^\d*(\.\d*)?$/.test(num)) {
        alert("Number is wrong!");
        return "Number is wrong!";
      }
      var AA = new Array(
        "零",
        "一",
        "二",
        "三",
        "四",
        "五",
        "六",
        "七",
        "八",
        "九"
      );
      var BB = new Array("", "十", "百", "千", "万", "亿", "点", "");
      var a = ("" + num).replace(/(^0*)/g, "").split("."),
        k = 0,
        re = "";
      for (var i = a[0].length - 1; i >= 0; i--) {
        switch (k) {
          case 0:
            re = BB[7] + re;
            break;
          case 4:
            if (
              !new RegExp("0{4}\\d{" + (a[0].length - i - 1) + "}$").test(a[0])
            )
              re = BB[4] + re;
            break;
          case 8:
            re = BB[5] + re;
            BB[7] = BB[5];
            k = 0;
            break;
        }
        if (k % 4 == 2 && a[0].charAt(i + 2) != 0 && a[0].charAt(i + 1) == 0)
          re = AA[0] + re;
        if (a[0].charAt(i) != 0) re = AA[a[0].charAt(i)] + BB[k % 4] + re;
        k++;
      }
      if (a.length > 1) {
        //加上小数部分(如果有小数部分)
        re += BB[6];
        for (var i = 0; i < a[1].length; i++) re += AA[a[1].charAt(i)];
      }
      return re;
    },
  },
  onShow() {
    this.getAppointList();
  },
  onUnload() {
    uni.switchTab({
      url: "/pages/index/index",
    });
  },
  onPullDownRefresh() {
    console.log("refresh");
    this.getAppointList();
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
@import "@/asset/scss/common.scss";
.appoint-add {
  height: 100vh;
  background-color: rgba(248, 248, 248, 1);
  padding: 0 28rpx;
  overflow: auto;
  .appoint-card {
    // margin-top: 20rpx;
    background-color: #fff;
    padding: 10rpx 30rpx;
    border-radius: 15rpx;
    // pointer-events: auto;
    .tip {
      position: relative;
      top: -10rpx;
      left: -30rpx;
      background: #45d244;
      width: 117rpx;
      height: 40rpx;
      border-radius: 12rpx 0 12rpx 0;
      text-align: center;
      line-height: 40rpx;
      span {
        font-size: 24rpx;
        color: #ffffff;
      }
    }
    .appoint-item {
      margin-bottom: 50rpx !important;
      border-radius: 5rpx !important;
    }

    .appoint-switch {
      height: 70rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      span {
        font-size: 40rpx;
        color: #333333;
        font-weight: bold;
      }
      .time {
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .full {
        padding: 5rpx 16rpx;
        // width: 164rpx;
        height: 33rpx;
        background: #557dfb;
        border-radius: 6rpx;
        line-height: 33rpx;
        color: #fff;
        font-size: 24rpx;
        margin-left: 10rpx;
      }
      .switch {
        // pointer-events: none;
      }
    }
    .appoint-foot {
      height: 94rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: rgba(119, 119, 119, 1);

      span {
        font-size: 24rpx;
        color: rgba(119, 119, 119, 1);
        font-weight: bold;
      }
    }
    .down {
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      img {
        width: 32rpx;
        height: 42rpx;
      }
    }
  }
  .tips {
    background-color: transparent;
    text-align: center;
    margin-top: 42rpx;
    span {
      color: rgba(51, 51, 51, 1);
      font-size: 24rpx;
      &:first-child {
        color: rgba(243, 49, 49, 1);
      }
    }
  }
  .foot {
    @include fixed-bottom;
    button {
      height: 112rpx !important;
      line-height: 112rpx !important;
    }

    .primary {
      color: rgba(62, 105, 244, 1);
    }
  }
  /deep/.t-slide-box {
    border: 0rpx solid #ccc;
    margin-top: 30rpx;
    background-color: #ffffff;
    border-radius: 10rpx;
    view {
      background-color: unset;
    }
  }
  .del-popup {
    view {
      background-color: #ffffff !important;
    }
    margin: 80rpx 0;
    .title {
      height: 80rpx;
      text-align: center;
      display: block;
      line-height: 80rpx;
      background-color: #ffffff !important;
    }
    .foot {
      padding: 0 20rpx;
      display: flex;
      // bottom: 20rpx;
      justify-content: space-around;
      .foot-btn {
        width: 40%;
      }
    }
  }
  .test {
    text-align: center;
    padding: 10px 0;
  }
}
</style>

<style lang="scss">
.appoint-add {
  /deep/view {
    background-color: unset;
  }
  .t-slide-area {
    height: 230rpx !important;
  }
}
</style>

