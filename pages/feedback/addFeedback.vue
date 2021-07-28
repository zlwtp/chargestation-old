<template>
  <view class="addFeedback">
    <view class="top" @tap="openSelect">
      <text>{{ name }}</text>
      <span class="arrow-bottom"></span>
    </view>
    <view class="foot-top"></view>

    <view class="charg-card">
      <view class="charg-title">
        <input
          type="text"
          value=""
          placeholder="问题标题"
          class="perInput"
          v-model="params.title"
        />
      </view>
      <view class="foot-top"></view>
      <view class="charg-opinion">
        <textarea
          type="text"
          value=""
          :maxlength="maxlength"
          placeholder="请反馈你遇到的问题"
          class="opinionText"
          v-model="params.content"
        />
      </view>
    </view>
    <view class="foot">
      <span class="add-btn" @tap="add">提交</span>
    </view>
  </view>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      params: {
        openId: uni.getStorageSync("openID"),
        title: "",
        content: "",
        pileId: "",
      },
      name: "",
    };
  },
  onLoad: function (option) {
    if (uni.getStorageSync("pileData")) {
      this.params.pileId = uni.getStorageSync("pileData").id;
      this.name = uni.getStorageSync("pileData").name;
      this.currentCharg = uni.getStorageSync("pileData");
    } else {
      uni.showToast({
        title: "请先添加充电桩",
        icon: "none",
        duration: 2000,
      });
    }
  },
  mounted() {},
  methods: {
    add() {
      let vm = this;
      if (vm.params.pileId == "") {
        uni.showToast({
          title: "充电桩不能为空",
          icon: "none",
          duration: 2000,
        });
        return false;
      }
      if (vm.params.title == "") {
        uni.showToast({
          title: "标题不能为空",
          icon: "none",
          duration: 2000,
        });
        return false;
      }
      if (vm.params.content == "") {
        uni.showToast({
          title: "意见不能为空",
          icon: "none",
          duration: 2000,
        });
        return false;
      }
      this.$http({
        url: vm.$api.feedbackAdd,
        method: "POST",
        data: vm.params,
      }).then((res) => {
        if (res.data.code == 200) {
          uni.showToast({
            title: res.data.result,
            icon: "none",
            duration: 2000,
          });
          uni.navigateTo({
            url: "/pages/feedback/feedback",
          });
        }
      });
    },
    openSelect() {
      uni.navigateTo({
        url: "/pages/myChargPoint/selectCharg",
      });
    },
    confirm(data) {
      this.params.code = data.code;
      this.name = data.name;
    },
  },
  onShow() {
    if (uni.getStorageSync("pileData")) {
      this.params.pileId = uni.getStorageSync("pileData").id;
      this.name = uni.getStorageSync("pileData").name;
      this.confirm(uni.getStorageSync("pileData"));
    } else {
      uni.showToast({
        title: "请先添加充电桩",
        icon: "none",
        duration: 2000,
      });
    }
  },
  onPullDownRefresh() {
    console.log("refresh");
    setTimeout(function () {
      uni.stopPullDownRefresh();
    }, 1000);
  },
};
</script>

<style lang="scss" scoped>
@import "@/asset/scss/common.scss";

.addFeedback {
  width: 100wh;
  background-color: transparent;
  padding: 20rpx;
  .top {
    display: flex;
    align-items: center;
    padding: 20rpx;
    height: 84rpx;
    justify-content: space-between;
    text {
      margin-right: 20rpx;
    }
    .arrow {
      width: 20rpx;
      height: 20rpx;
    }
    .arrow-bottom {
      display: inline-block;
      width: 8px;
      height: 8px;
      // margin-top: 41rpx;
      // margin-right: -20rpx;
      border-right: 1px solid rgba(51, 51, 51, 1);
      border-bottom: 1px solid rgba(51, 51, 51, 1);
      transform: rotate(-45deg);
      margin-top: -5rpx;
    }
  }
  .foot-top {
    width: 100%;
    height: 20rpx;
    background: transparent;
  }
  .charg-card {
    // background-color: #f7f7f7;
    // padding-top: 20rpx;
    // margin: 0 40rpx;
    display: flex;
    flex-direction: column;
    .foot-top {
      width: 100%;
      height: 20rpx;
      background: #f7f7f7;
    }
    .charg-title {
      // margin-bottom: 40rpx;
      padding: 0 20rpx;
      .textName {
        line-height: 80rpx;
        height: 80rpx;
        float: left;
        width: 150rpx;
      }
      .perInput {
        float: left;
        width: 100%;
        height: 80rpx;

        background-color: #fff;
      }
    }

    .charg-opinion {
      .textName {
        line-height: 80rpx;
        height: 80rpx;
        float: left;
        width: 150rpx;
      }
      .perInput {
        float: left;
        height: 80rpx;
      }
      .opinionText {
        // margin: 0 20rpx;
        // border-bottom: 2rpx #dedede solid;
        // border-top: 2rpx #dedede solid;
        padding: 20rpx;
        height: 360rpx;
        width: 100%;
        background-color: #fff;
      }
    }
  }
  .foot {
    margin-top: 70rpx;
    text-align: center;
    background-color: transparent;
    .add-btn {
      padding: 24rpx 150rpx;
      width: 445rpx;
      height: 135rpx;
      line-height: 116rpx;
      font-size: 44rpx;
    }
  }
}
</style>
