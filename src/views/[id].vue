<script setup>
import { ref, computed } from 'vue';
// route
import { useRoute } from 'vue-router'
const route = useRoute()
// pinia
import { usetoggleStore } from '@/stores'
const toggleStore = usetoggleStore()

import { useProductsStore } from '@/stores/products'
const productsStore = useProductsStore()
// productsStore.getProducts()
const index = computed(()=>productsStore.products.findIndex(p=>p.id==Number(route.path.slice(1))))

import { useCartProductsStore } from '@/stores/cartProducts'
const cartProductsStore = useCartProductsStore()
const { addCart, infoToggle } = cartProductsStore

// composables
import { updateFavorite } from '@/composables/updateFavorite'
import { touchstartHandler, touchendHandler } from '@/composables/touchHandler'
import { getBgStyle } from '@/composables/getBackendAssets'
// Router
import { RouterLink } from 'vue-router'

//// 其他邏輯
//商品詳情頁面
const productDetailNowIndex = ref(0)
//箭頭切換index
const productDetailIndexChange=(n)=>{
  productDetailNowIndex.value = (productDetailNowIndex.value + n + productsStore.products[index.value].imgs.length) % productsStore.products[index.value].imgs.length  
}
//點擊index切換index
const productDetailIndexpress=(n)=>{
  productDetailNowIndex.value = n
}
//依據index位置決定輪播容器移動的距離
const productDetailMove = computed(()=>{
  const x =100 * productDetailNowIndex.value
  return `transform:translateX(-${x}%)`
})
//複製當前網址
const clipboard = ref(false)
const copyUrl=()=>{
  const url= window.location.href
  navigator.clipboard.writeText(url)
  .then(()=>{
    clipboard.value=true
    setTimeout(()=>{
      clipboard.value=false
    },2000)})
}
</script>

<template>
  <main v-if="productsStore.serverError" class="productNotFound">
    <div class="img">
      <img src="@/assets/003.png" alt="">
    </div>
    <div class="msg">Ooops!伺服器錯誤</div>
  </main>
  <main v-else-if="productsStore.isBusy" class="productNotFound">
    <div class="img">
      <img src="@/assets/003.png" alt="">
    </div>
    <div class="msg">等等我，就快好了</div>
  </main>
  <main v-else-if="index===-1" class="productNotFound">
    <div class="img">
      <img src="@/assets/003.png" alt="">
    </div>
    <div class="msg">Ooops!找不到商品</div>
    <RouterLink to="/">
      <div class="msg2">回去逛逛</div>
    </RouterLink>
  </main>
  <main v-else class="productDetail">
    <div class="carouselWrap">
      <div class="carousel" @touchstart="touchstartHandler" @touchend="touchendHandler(productDetailIndexChange, $event)">
        <div class="itemWrap" :style="productDetailMove">
          <div class="item">
            <div class="img" v-for="img in productsStore.products[index].imgs" :style="getBgStyle(img)"></div>
          </div>
        </div>
        <div class="controlWrap">
          <div class="control" @click="productDetailIndexChange(-1)"><i class="fa-solid fa-chevron-left"></i></div>
          <div class="control" @click="productDetailIndexChange(+1)"><i class="fa-solid fa-chevron-right"></i></div>
        </div>
      </div>
      <div class="carouselIndex">
        <ul>
          <li v-for="(img, i) in productsStore.products[index].imgs" @click="productDetailIndexpress(i)" :class="{now:i===productDetailNowIndex}" :style="getBgStyle(img)"></li>
        </ul>
      </div>
    </div>
    <div class="info">
      <div class="product">
        <div class="nameWrap">
          <div class="name">{{ productsStore.products[index].name }} ({{ productsStore.products[index].unit }})</div>
          <i @click="updateFavorite(productsStore.products[index])" :class="{'fa-solid':productsStore.products[index].favorite}" class="favorite fa-regular fa-heart" ></i>
          <i @click="copyUrl" class="share fa-solid fa-share-nodes"></i>
          <Transition>
          <span v-if='clipboard' :class="{message: clipboard}">網址已複製!</span>
          </Transition>
        </div>
        <div class="price">價格：NT$ {{ productsStore.products[index].price }}</div>
        <div class="text">訂購天數需要3至5個工作天（不含訂購當天），</div>
        <div class="text">使用北海道空運乳酪、鮮奶及生鮮奶油製作而成，</div>
        <div class="text">冷藏可保存兩天，冷凍可保存兩週。</div>
        <div class="text">單筆消費800元即可享免運優惠</div>
      </div>
      <div class="number">
        <i @click="productsStore.products[index].number<=1?productsStore.products[index].number:productsStore.products[index].number--" class="fa-solid fa-minus"></i>
        <div class="count">{{ productsStore.products[index].number }}</div>
        <i @click="productsStore.products[index].number>=20?productsStore.products[index].number:productsStore.products[index].number++" class="fa-solid fa-plus"></i>
      </div>
      <div class="wrap">
        <div @click="addCart(productsStore.products[index])" class="addCart">
          <Transition name="slideUp" @after-leave="infoToggle(productsStore.products[index])" mode="out-in">
            <div v-if="productsStore.products[index].animation">加入成功!</div>
            <div v-else>加入購物車</div>
          </Transition>
        </div>
        <div @click="addCart(productsStore.products[index], toggleStore.cartOpenToggle())" class="toCart">立即購買</div>
      </div>
    </div>
  </main>
</template>

<style lang="scss" scoped>
@import "@/style.scss";
.productNotFound{
  padding: 160px 60px 60px 60px;
  @include flex_center;
  flex-direction: column;
  border-radius: 20px;
  background-color: rgb(255, 255, 255);
  .img{
    width: 30%;
    @include tablet-768{
      width: 40%;
    }
    img{
      width: 100%;
    }
  }
  .msg{
    margin-top: -30px;
    font-size: 30px;
    margin-bottom: 30px;
    @include tablet-768{
      margin-top: 0;
    }
  }
  .msg2{
    border-radius: 20px;
    padding: 10px;
    font-size: 20px;
    color: $color_orange;
    border: 2px solid $color_orange;
  }
}
.productDetail{
  display: flex;
  box-sizing: border-box;
  padding: 160px 60px 60px 60px;
  @include tablet-768{
    flex-direction: column;
    padding: 160px 30px 30px 30px;
  }
  .carouselWrap{
    flex: 0 1 50%;
    .carousel{
      width: 100%;
      overflow: hidden;
      position: relative;
      border-radius: 20px;
      .itemWrap{ 
        width: 100%;
        display: flex;
        transform: translateX(0%); //動態修改
        transition: all 0.5s;
        .item{
          flex-shrink: 0;
          width: 100%;
          height: 600px;
          display: flex;
          flex-wrap: nowrap;
          position: relative;
          @include tablet-768{
            height: 350px;
          }
          .img{
            flex: 0 0 100%;
            height: 100%;
            border-radius: 20px;
          }
        }
      }
      .controlWrap{
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .control{
          width: 30px;
          height: 30px;
          margin: 10px;
          border-radius: 50%;
          border: 2px solid rgb(199, 199, 199);
          cursor: pointer;
          @include flex_center;
          transition: all .5s;
          &:hover{
            transform: scale(1.2);
          }
          i{
            font-size: 16px;
            color: rgb(199, 199, 199);
          }
        }
      }
    }
    .carouselIndex{
      margin-top: 20px;
      ul{
        overflow: auto;
        margin: auto;
        @include flex_center;
        justify-content: flex-start;
        li{
          flex: 0 0 80px;
          height: 80px;
          margin-right: -5px;
          border: 5px solid transparent;
          cursor: pointer;
          &:last-child{
            margin-right: 0;
          }
          @include tablet-768{
            flex: 0 0 40px;
            height: 40px;
          }
          &.now{
            border: 5px solid $color_orange;
          }
        }
      }
    }
  }
  .info{
    flex: 0 1 50%;
    box-sizing: border-box;
    margin: 0 0 0 20px;
    @include tablet-768{
      flex: 0 1 50%;
      margin: 20px 0 0 0;
    }
    .product{
      margin-bottom: 20px;
      padding: 20px;
      border-radius: 20px;
      background-color:rgba(228, 228, 228, 0.634);
      box-shadow: 0px 0px 15px -10px black;
      display: flex;
      flex-direction: column;
      text-align: left;
      .nameWrap{
        display: flex;
        align-items: center;
        // position: relative;
        .name{
          font-size: 20px;
          color: $color_orange;
          padding: 5px;
          font-weight: 900;
        }
        .favorite, .share{
          font-size: 20px;
          color: $color_orange;
          margin: 0 2px;
        }
        .message{
          background: $color_orange;
          color: #e5e5e5;
          margin-left: 5px;
          padding: 4px;
          font-size: 14px;
          border-radius: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          white-space: nowrap;
          opacity: 0.8;
        }
      }
      .text{
        padding: 5px;
        font-weight: 900;
      }
      .price{
        padding: 5px;
        margin-bottom: 5px;
        color: rgb(16, 86, 123);
        font-weight: 600;
      }
    }
    .number{
      box-sizing: border-box;
      height: 40px;
      padding: 10px;
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px rgb(176, 176, 176) solid;
      background-color: white;
      border-radius: 5px;
    }
    .wrap{
      margin-top: 10px;
      height: 40px;
      @include flex_center;
      .addCart, .toCart{
        padding: 10px;
        width: 50%;
        height: 40px;
        box-sizing: border-box;
        margin: 5px 0 5px 0px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: white;
        border: 1px solid $color_orange;
        border-radius: 5px;
        cursor: pointer;
        white-space: nowrap;
        div{
          color: $color_orange;
        }
        &:hover{
          background-color: rgba(246, 235, 235, 0.548);
        }
      }
      .toCart{
        margin: 5px 0 5px 10px;
        background-color: $color_orange;
        color: white;
        &:hover{
          background-color: rgb(242, 70, 51);
        }
      }
    }
  }
}
</style>