<script setup>
// Router
import { RouterLink, RouterView } from 'vue-router'

// components
import favor from '@/components/favor.vue'
import cart from '@/components/cart.vue'

// pinia
import { storeToRefs } from 'pinia'

import { usetoggleStore, useSearchStore } from '@/stores'
const toggleStore = usetoggleStore() // 基本共用狀態
const searchStore = useSearchStore() // 搜尋欄位

import { useProductsStore } from '@/stores/products'
const productsStore = useProductsStore() //商品資料
productsStore.getProducts()

import { useCartProductsStore } from '@/stores/cartProducts'
const cartProductsStore = useCartProductsStore() //購物車商品資料
const { cartProducts } = storeToRefs(cartProductsStore)

</script>
<template>
  <div class="container">
    <header>
      <div class="headerWarp">
        <RouterLink to="/">
          <div class="logo">
            <img src="./assets/logo.png" alt="">
          </div>
        </RouterLink>
        <div class="search">
          <input type="text" v-model="searchStore.search" placeholder="搜尋商品名稱">
          <i v-show="!searchStore.search" class="fa-solid fa-magnifying-glass"></i>
          <i v-show="searchStore.search" @click="searchStore.clearSearch()" class="fa-solid fa-xmark"></i>
        </div>
      </div>
      <div class="shopItems">
        <div class="shopItem">
          <i @click="toggleStore.cartOpen=!toggleStore.cartOpen" class="fa-solid fa-cart-shopping"></i>
          <div v-if="cartProducts.length" class="count">{{ cartProducts.length }}</div>
        </div>
        <div class="shopItem">
          <i @click="toggleStore.favoriteOpenToggle()" class="fa-solid fa-heart"></i>
        </div>
      </div>
    </header>
    <RouterView />
    <footer>
      <div class="wrap">
        <div class="logo">
          <img src="./assets/logo.png" alt="">
        </div>
        <div class="content">
          <ul class="info">
            <li>營業時間 週一至週日 11:00-20:00</li>
            <li>最後取貨時間 週一至週日 20:00</li>
            <li>客服電話 02 8282 2828</li>
            <li>客服時間 10:00-18:00</li>
            <li>門市地址 台北市大安區仁愛路五段168巷8號</li>
          </ul>
          <ul class="sns">
            <li><i class="fa-brands fa-line"></i></li>
            <li><i class="fa-brands fa-square-twitter"></i></li>
            <li><i class="fa-brands fa-square-facebook"></i></li>
            <li><i class="fa-brands fa-square-instagram"></i></li>
          </ul>
        </div>
      </div>
    </footer>
  </div>
  <cart />
  <favor />
</template>

<style lang="scss" scoped>
@import "@/style.scss";
.container{
  margin: auto;
  max-width: 1600px;
}
header{
  width: 100%;
  max-width: 1600px;
  height: 140px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  padding: 20px;
  box-shadow: 0 8px 15px -16px black;
  background: url(./assets/bg03.png);
  position: fixed;
  top: 0;
  z-index: 1;
  .headerWarp{
    display: flex;
    align-items: center;
    .logo{
      width: 120px;
      height: 120px;
      img{
        width: 100%;
        height: 100%;
      }
    }
    .search{
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 2px solid rgb(225, 225, 225);
      border-radius: 10px;
      height: 40px;
      margin-left: 20px;
      padding: 0 10px 0 10px;
      flex: 1 1 ;
      @include tablet-768{
        margin-left: 10px;
      }
      &:has(input:focus){
        border: 2px solid $color_orange;
      }
      input{
        padding: 5px;
        border-radius: 10px;
        outline: none; 
        border: none;
        font-size: 16px;
        width: 100%;
        background: url(./assets/bg03.png);
      }
    }
  }
  .shopItems{
    display: flex;
    .shopItem{
      position: relative;
      .count{
      @include flex_center;
      position: absolute;
      right: 0;
      top: -5px;
      width: 15px;
      height: 15px;
      background-color: rgb(255, 0, 0);
      color: white;
      border-radius: 50%;
      font-size: 10px;
      }
      i{
        font-size: 24px;
        margin: 0 5px 0 5px;
        color: rgb(255, 140, 128);
        &:hover{
            color: $color_orange;
        }
      }
    }
  }
}
footer{
  margin-top: 10px;
  box-sizing: border-box;
  width: 100%;
  padding: 30px;
  background-color: rgb(255, 255, 255);
  box-shadow: 0 -8px 15px -16px black;
  background: url(./assets/bg03.png);
  .wrap{
    @include flex_center;
    @include tablet-768{
      flex-direction: column;
    }
    .logo{
      flex:1 0 50%;
      text-align: right;
      @include tablet-768{
        text-align: center;
      }
      img{
        width: 20%;
        @include tablet-768{
          width: 30%;
        }
      }
    }
    .content{
      flex:1 0 50%;
      margin: 0 0 0 40px;
      color: rgb(89, 89, 89);
      @include tablet-768{
        margin: 10px 0 0 0;
      }
      .info{
        @include tablet-768{
          text-align: center;
        }
        li{
          line-height: 40px;
        }
      }
      .sns{
        @include flex_center;
        justify-content: start;
        @include tablet-768{
          justify-content: center;
        }
        li{
          line-height: 40px;
          margin-right: 10px;
          font-size: 30px;
          &:last-child{
            margin-right: 0;
          }
          i{
            transition: all .5s;
            &:hover{
              color: $color_orange;
            }
          }
        }
      }
    }
  }
}
</style>