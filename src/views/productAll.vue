<script setup>
import { ref, computed, watch } from 'vue'
// components
import carousel from '@/components/carousel.vue'
// composables
import { updateFavorite } from '@/composables/updateFavorite'
import { getImageUrl } from '@/composables/getBackendAssets'
// pinia
import { usetoggleStore, useSearchStore } from '@/stores'
const toggleStore = usetoggleStore()
const searchStore = useSearchStore()

import { useProductsStore } from '@/stores/products'
const productsStore = useProductsStore()
// productsStore.getProducts()

import { useCartProductsStore } from '@/stores/cartProducts'
const cartProductsStore = useCartProductsStore()
const { addCart, infoToggle } = cartProductsStore
// Router
import { RouterLink } from 'vue-router'


//// 其他邏輯
//商品中所有的類型(側選單用 去掉重複)
const typeAll = computed(()=>{
  let arr=[]
  productsStore.products.forEach(i=>arr.push(i.type))
  return arr.filter((item,index)=>arr.indexOf(item)===index)
})
//商品中所有的種類(側選單用 去掉重複)
const ingredientAll = computed(()=>{
  let arr=[]
  productsStore.products.forEach(i=>{
    i.ingredient.forEach(j=>{
      arr.push(j)
    })
  })
  return arr.filter((item,index)=>arr.indexOf(item)===index)
})
//商品中最高與最低價格(側選單用)
const priceMax = computed(()=>Math.max(...productsStore.products.map(i=>i.price)))
const priceMin = computed(()=>Math.min(...productsStore.products.map(i=>i.price)))
const priceRange = ref(priceMax.value) //選中的價格
watch(priceMax, (newvalue) => { 
  priceRange.value = newvalue;
})
const type = ref([]) //選中的類型
const ingredient = ref([]) //選中的關鍵字
const search = computed(()=>searchStore.search) //輸入框內容拿store的資料
// 如果radio已經被選定時又被點擊第二次就取消選定
const radioClick =(event)=>{
  if(event.target.value === type.value) type.value=[];
}
// 全部清除
const clearAll=()=>{
  searchStore.clearSearch()
  priceRange.value=priceMax.value
  type.value=[]
  ingredient.value=[]
}
// 刪除單個"關鍵字"
const clearIngredient=(item)=>{
  const index = ingredient.value.indexOf(item)
  ingredient.value.splice(index,1)
}
// 顯示商品
const sortItem = ref('由舊至新')
const productsDisplay = computed(()=>{
  // 排序
  if(sortItem.value==='由舊至新'){
    productsStore.products.sort((a,b)=>a.id-b.id)
  }else if(sortItem.value==='由新至舊'){
    productsStore.products.sort((a,b)=>b.id-a.id)
  }else if(sortItem.value==='價格由高至低'){
    productsStore.products.sort((a,b)=>b.price-a.price)
  }else if(sortItem.value==='價格由低至高'){
    productsStore.products.sort((a,b)=>a.price-b.price)
  }
  // 如果使用者給 搜尋 價格 類型 關鍵字 任一篩選條件就改成return filterProductsDisplay
  if(priceRange.value!==priceMax.value || type.value.length || ingredient.value.length || search.value.length){
    const filterProductsDisplay = ref([...productsStore.products])
    //搜尋 條件篩選
    if(search.value.length){
      filterProductsDisplay.value = filterProductsDisplay.value.filter(i=>i.name.includes(search.value))
    }
    //價格範圍 條件篩選
    if(priceRange.value!==priceMax.value){
      filterProductsDisplay.value = filterProductsDisplay.value.filter(i=>i.price<=priceRange.value)
    }
    //類型 條件篩選
    if(type.value.length){
      filterProductsDisplay.value = filterProductsDisplay.value.filter(i=>i.type===type.value)
    }
    //關鍵字 條件篩選
    if(ingredient.value.length){
      ingredient.value.forEach(k=>{
        // filterProductsDisplay.value = filterProductsDisplay.value.filter(i=>ingredient.value.every(()=>i.ingredient.includes(k)))
        filterProductsDisplay.value = filterProductsDisplay.value.filter(i=>i.ingredient.every(()=>i.ingredient.includes(k)))
      })
    }
    nowPage.value=1
    return filterProductsDisplay.value
  }else{
    nowPage.value=1
    return productsStore.products
  }
})
// 顯示商品-分頁
const productsDisplayPage = computed(()=>{
  let page = [...productsDisplay.value]
  return page = page.slice((nowPage.value-1)*manyEachPage.value, nowPage.value*manyEachPage.value)
})
// 分頁功能
const manyEachPage = ref(12)
const nowPage = ref(1)
const totalPage = computed(()=>Math.ceil(productsDisplay.value.length / manyEachPage.value))
// CSS toggle
const showFilter = ref(false)
const priceFilterHide = ref(false)
const typeFilterHide = ref(false)
const ingredientFilterHide = ref(false)

</script>
<template>
<main class="productAll">
  <aside :class="{active:showFilter}" @click.self="showFilter=!showFilter">
      <div class="container">
        <i class="fa-regular fa-circle-xmark" @click="showFilter=!showFilter"></i>
        <div class="title main" @click="priceFilterHide=!priceFilterHide;ingredientFilterHide=!ingredientFilterHide;typeFilterHide=!typeFilterHide">
          <i class="fa-solid fa-filter"></i>
          <h3>篩選</h3>
        </div>
        <div class="title" @click="priceFilterHide=!priceFilterHide">
          <i class="fa-solid fa-caret-right" :class="{hide:priceFilterHide}"></i>
          <h4><i class="fa-solid fa-sack-dollar"></i>金額</h4>
        </div>
        <div class="rangeFilter" :class="{hide:priceFilterHide}">
          <div>
            <input type="range" :min=priceMin :max=priceMax v-model="priceRange">
            <label>
              <div v-if="priceRange==priceMax">不限金額</div>
              <div v-else>單價{{ priceRange }}元以內</div>
            </label>
          </div>
        </div>
        <div class="title" @click="typeFilterHide=!typeFilterHide">
          <i class="fa-solid fa-caret-right" :class="{hide:typeFilterHide}"></i>
          <h4><i class="fa-solid fa-tag"></i>類型</h4>
        </div>
        <div class="typeFilter" :class="{hide:typeFilterHide}">
          <div v-for="item in typeAll">
            <input type="radio" :id="item" :value="item" v-model="type" @click="radioClick">
            <label :for="item">
              <div class="radio">
                <i class="fa-solid fa-check"></i>
              </div>
              <div>{{ item }}</div>
            </label>
          </div>
        </div>
        <div class="title" @click="ingredientFilterHide=!ingredientFilterHide">
          <i class="fa-solid fa-caret-right" :class="{hide:ingredientFilterHide}"></i>
          <h4><i class="fa-solid fa-hashtag"></i>關鍵字</h4>
        </div>
        <div class="ingredientFilter" :class="{hide:ingredientFilterHide}">
          <div v-for="item in ingredientAll">
            <input type="checkbox" :id="item" :value="item" v-model="ingredient">
            <label :for="item">
              <div class="checkBox">
                <i class="fa-solid fa-check"></i>
              </div>
              <div>{{ item }}</div>
            </label>
          </div>
        </div>
      </div>
    </aside>
    <section>
      <carousel />
      <div class="options">
        <div class="selectdFilters">
          <div class="selectdFilter icon" @click="showFilter=!showFilter"><i class="fa-solid fa-filter"></i></div>
          <div v-if="search.length" class="selectdFilter">
            <i class="fa-solid fa-magnifying-glass"></i><span>「{{ search }}」</span><i @click="searchStore.clearSearch()" class="fa-solid fa-xmark"></i>
          </div>
          <div v-if="priceRange!=priceMax" class="selectdFilter">
            <i class="fa-solid fa-sack-dollar"></i><span>單價{{ priceRange }}元以內</span><i @click="priceRange=priceMax" class="fa-solid fa-xmark"></i>
          </div>
          <div v-if="type.length" class="selectdFilter">
            <i class="fa-solid fa-tag"></i><span>{{ type }}</span><i @click="type=[]" class="fa-solid fa-xmark"></i>
          </div>
          <div v-for="item in ingredient" class="selectdFilter">
            <i class="fa-solid fa-hashtag"></i><span>{{ item }}</span><i @click="clearIngredient(item)" class="fa-solid fa-xmark"></i>
          </div>
          <div v-if="priceRange!=priceMax || type.length || ingredient.length || search.length" class="clear" @click="clearAll">全部清除</div>
        </div>
        <div v-if="productsDisplay.length" class="wrap">
          <div class="msg">共有{{ productsDisplay.length }}筆產品</div>
          <div class="option">
            <div class="sort">
              <label>排序</label>
              <select v-model="sortItem">
                <option>由舊至新</option>
                <option>由新至舊</option>
                <option>價格由高至低</option>
                <option>價格由低至高</option>
              </select>
            </div>
            <div class="manyEachPage">
              <label>每頁</label>
              <select v-model="manyEachPage">
                <option>4</option>
                <option>8</option>
                <option>12</option>
                <option>16</option>
              </select>
              <label>筆</label>
            </div>
          </div>
        </div>
      </div>
      <Transition name="fadeIn" mode='out-in'>
        <div v-if="productsDisplay.length" class="productsDisplay">
            <TransitionGroup name="fadeIn" tag="div" class="products" mode='out-in'>
              <div v-for="item in productsDisplayPage" :key="item.id" class="item">
                <!-- <a :href="item.id"> -->
                <RouterLink :to="'/'+item.id">
                  <div class="product">
                    <div class="img">
                      <img v-for="file in item.imgs.slice(0,2)" :src=getImageUrl(file) alt="">
                      <i @click.prevent="updateFavorite(item)" :class="{'fa-solid':item.favorite}" class="favorite fa-regular fa-heart " ></i>
                    </div>
                    <div class="name">{{ item.name }}</div>
                    <div class="unit">({{ item.unit }})</div>
                    <div class="price">NT$ {{ item.price }}</div>
                  </div>
                <!-- </a> -->
                </RouterLink>
                <div class="wrap">
                  <div @click="addCart(item)" class="addCart">
                    <Transition name="slideUp" @after-leave="infoToggle(item)" mode="out-in">
                      <div v-if="item.animation">加入成功!</div>
                      <div v-else>加入購物車</div>
                    </Transition>
                  </div>
                  <div @click="addCart(item); toggleStore.cartOpenToggle()" class="toCart">立即購買</div>
                </div>
              </div>
            </TransitionGroup>
          <ul v-if="totalPage>1" class="pages">
            <li>
              <span v-if="nowPage>1" @click="nowPage===1?nowPage:nowPage--"><i class="fa-solid fa-angle-left"></i></span>
              <div v-else></div>
            </li>
            <li v-for="page in totalPage">
              <span @click="nowPage=page" :class="{active:page==nowPage}" >{{ page }}</span>
            </li>
            <li>
              <span v-if="nowPage<totalPage" @click="nowPage===totalPage?nowPage:nowPage++"><i class="fa-solid fa-angle-right"></i></span>
              <div v-else></div>
            </li>
          </ul>
        </div>
        <div v-else-if="productsStore.serverError" class="noProducts">
          <div class="img">
            <img src="@/assets/001.png" alt="">
          </div>
          <div class="msg">伺服器錯誤</div>
        </div>
        <div v-else-if="productsStore.isBusy" class="noProducts">
          <div class="img">
            <img src="@/assets/001.png" alt="">
          </div>
          <div class="msg">等等我，就快好了</div>
        </div>
        <div v-else class="noProducts">
          <div class="img">
            <img src="@/assets/001.png" alt="">
          </div>
          <div class="msg">沒有符合的產品，請減少篩選條件</div>
        </div>
      </Transition>
    </section>
  </main>
</template>

<style lang="scss" scoped>
@import "@/style.scss";
input[type="range"]{
  padding: 5px;
  -webkit-appearance: none; //把原來的樣式取消
  background: transparent;
  width: 100%;
  cursor: pointer;
  &::-webkit-slider-runnable-track{ //軌道的樣式
    height: 8px;
    background:rgb(241, 184, 184);
    border-radius: 20px;
  }
  &::-webkit-slider-thumb{ //滑塊的樣式
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    background: $color_orange;
    border-radius: 50%;
    transition:all .2s;
    position: relative; //讓滑塊在軌道中垂直置中(往上移動一半的高度差)
    top: -6px;
  }
  &:hover::-webkit-slider-thumb{ //按下時滑塊變大
    width: 26px;
    height: 26px;
    position: relative;
    top: -9px;
  }
  &::-webkit-slider-progress{ //被滑塊滑過的軌道樣式
    height: 8px;
    border-radius: 20px;
    background: $color_orange;
  }
}
input[type="range"]{
  background: transparent;
  width: 100%;
  &::-moz-range-track{ //軌道的樣式
    height: 8px;
    background:rgb(241, 184, 184);
    border-radius: 20px;
  }
  &::-moz-range-thumb{ //滑塊的樣式
    width: 20px;
    height: 20px;
    background: $color_orange;
    border-radius: 50%;
    transition:all .2s;
    position: relative; //讓滑塊在軌道中垂直置中(往上移動一半的高度差)
    top: -6px;
    border: unset;
  }
  &:hover::-moz-range-thumb{ //按下時滑塊變大
    width: 26px;
    height: 26px;
    position: relative;
    top: -9px;
  }
  &::-moz-range-progress{ //被滑塊滑過的軌道樣式
    height: 8px;
    border-radius: 20px;
    background: $color_orange;
  }
}
.productAll{
  display: flex;
  box-sizing: border-box;
  min-height: 100vh;
  aside{
    background: url(@/assets/bg03.png);
    flex: 0 0 180px;
    box-sizing: border-box;
    box-shadow: 10px 0 17px -21px black;
    height: calc(100vh - 140px); //去掉標頭高度
    position: sticky;
    top: 140px; //固定在標頭下方
    overflow: hidden;
    font-size: 14px;
    border-right: 1px solid rgb(228, 228, 228);
    padding-right: 6px;
    scrollbar-color: rgb(241, 108, 93, .5) transparent;
    scrollbar-width: thin;
    &:hover{
      overflow: auto;
      padding-right: 0px;
    }
    &::-webkit-scrollbar { //滾動條樣式
      width: 6px;
      background: transparent;
    }
    &::-webkit-scrollbar-thumb { //滾動條滑塊樣式
      background: rgb(241, 108, 93, .5);
      border-radius: 20px;
    }
    @include tablet-768{
      width: 100vw;
      height: 100vh;
      position: fixed;
      top: 0;
      left: 0;
      overflow: auto;
      padding: 60px 5px 60px 5px;
      background: unset;
      background-color:rgba(29, 29, 29, 0.7);
      opacity: 0;
      pointer-events: none;
    }
    &.active{
      @include tablet-768{
        opacity: 1;
        pointer-events: auto;
        z-index: 2;
        transition: all .5s;
      }
    }
    .container{
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      position: relative;
      @include tablet-768{
        background: url(@/assets/bg03.png);
        width: 80%;
        min-height: 80%;
        border-radius: 20px;
      }
      .fa-circle-xmark{
        position: absolute;
        top: 5px;
        right: 5px;
        font-size: 24px;
        display: none;
        @include tablet-768{
          display: block;
        }
      }
      .title{
        display: flex;
        justify-content: flex-start;
        align-items: center;
        margin: 5px 0 5px 10px;
        border-radius: 20px;
        cursor: pointer;
        @include tablet-768{
          &:nth-child(3){
            margin-top: 30px;
          }
        }
        &.main{
          background: url(@/assets/bg03.png);
          margin-bottom: 20px;
          @include tablet-768{
            justify-content: center;
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translate(-50%,-50%);
            width: 10%;
            font-size: 24px;
            background-color: rgb(255, 255, 255);
            border-radius: 30px 30px 0 0;
            padding: 20px;
            text-align: center;
          }
        }
        h3{
          margin-left: 8px;
          font-size: 20px;
          @include tablet-768{
            display: none;
          }
        }
        h4{
          margin-left: 8px;
          font-size: 16px;
          
        }
        i.fa-caret-right{
          transform: rotate(90deg);
          transition: all .1s;
          &.hide{
            transform: rotate(0deg);
          }
        }
      }
      .rangeFilter{
        margin-bottom: 10px;
        overflow: hidden;
        max-height: 500px; //動畫用
        transition: all .5s;
        &.hide{
          max-height: 0;
          border: 0px dotted $color_orange;
        }
        >div{
          padding: 10px;
          &:hover{
            background-color: #f1f1f1;
          }
          label{
            display: flex;
            align-items: center;
            padding: 5px 0 5px 5px;
          }
        }
      }
      .typeFilter{
        margin-bottom: 10px;
        overflow: hidden;
        max-height: 500px; //動畫用
        transition: all .5s;
        &.hide{
          max-height: 0;
          border: 0px dotted $color_orange;
        }
        >div{
          padding: 2px 0 2px 10px;
          &:hover{
            background-color: #f1f1f1;
          }
          input[type="radio"]{
            display: none;
            &:checked{
              ~label{
                .radio{
                  background-color: $color_orange;
                  i{
                    display: block;
                    color: white;
                  }
                }
              }
            }
          }
          label{
            display: flex;
            align-items: center;
            padding: 5px 0 5px 5px;
            &:hover{
              .radio{
                  background-color: $color_orange;
                }
              }
            .radio{
              box-sizing: border-box;
              width: 20px;
              height: 20px;
              border: 1px solid rgb(176, 176, 176);
              border-radius: 50%;
              margin-right: 5px;
              @include flex_center;
              i{
                display: none;
              }
            }
          }
        }
      }
      .ingredientFilter{
        margin-bottom: 10px;
        overflow: hidden;
        max-height: 1500px; //動畫用
        transition: all .5s;
        &.hide{
          max-height: 0;
        }
        >div{
          padding: 2px 0 2px 10px;
          &:hover{
            background-color: #f1f1f1;
          }
          input[type="checkbox"]{
            display: none;
            &:checked{
              ~label{
                .checkBox{
                  background-color: $color_orange;
                  i{
                    display: block;
                    color: white;
                  }
                }
              }
            }
          }
          label{
            display: flex;
            align-items: center;
            padding: 5px 0 5px 5px;
            &:hover{
              .checkBox{
                  background-color: $color_orange;
                }
              }
            .checkBox{
              box-sizing: border-box;
              width: 20px;
              height: 20px;
              border: 1px solid rgb(176, 176, 176);
              border-radius: 10%;
              margin-right: 5px;
              @include flex_center;
              i{
                display: none;
              }
            }
          }
        }
      }
    }
  }
  section{
    flex: 1 1;
    box-sizing: border-box;
    position: relative;
    padding: 160px 60px 60px 60px;
    background: url(@/assets/bg03.png);
    @include tablet-768{
      padding: 160px 20px 20px 20px;
    }
    .options{
      margin: 10px 0 50px 0;
      .selectdFilters{
        display: flex;
        align-items: center;
        margin-bottom: 30px;
        flex-wrap: wrap;
        min-height: 50px;
        .selectdFilter{
          display: flex;
          align-items: center;
          background-color: rgb(238, 238, 238);
          padding: 10px;
          margin: 0 5px 10px 0;
          border-radius: 50px;
          white-space: nowrap;
          i{
            cursor: default;
            @include tablet-768{
              cursor: pointer;
            }
          }
          span{
            margin-right: 5px;
          }
        }
        .clear{
          color: rgb(66, 155, 190);
          margin-bottom: 10px;
          cursor: pointer;
          &:hover{
            color: rgb(41, 93, 114);
          }
        }
      }
      .wrap{
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 30px;
        .option{
          display: flex;
          @include tablet-768{
            flex-direction: column;
          }
          .sort, .manyEachPage{
            margin-bottom: 10px;
            select{
              margin: 0 4px 0 4px;
              padding: 10px 5px 10px 5px;
              border-radius: 20px;
              border: 1px solid #e5e5e5;
              font-size: 16px;
              cursor: pointer;
            }
          }
        }
      }
    }
    .productsDisplay{
      .products{
        display: flex;
        flex-wrap: wrap;        
        .item{
          flex: 1 0 300px;
          max-width: 500px;
          margin: 0 5px 30px 5px;
          padding: 10px;
          @include tablet-768{
            flex: 1 0 156px;
          }
          .product{
            border-radius: 20px;
            background: linear-gradient(90deg, rgba(253, 253, 253, 0.495) 0%, rgb(255, 179, 154) 100%);
            box-shadow: 0px 0px 15px -10px black;
            display: flex;
            flex-direction: column;
            .img{
              border-radius: 20px 20px 0 0;
              margin-bottom: 10px;
              position: relative;
              overflow: hidden;
              font-size: 0;
              img{
                width: 100%;
              }
              img:nth-child(2){
                opacity: 0;
                position: absolute;
                top: 0;
                left: 0;
                will-change: opacity;
                transition: all 1s;
              }
              .favorite{
                display: none;
                position: absolute;
                right: 16px;
                bottom: 16px;
                font-size: 20px;
                color: $color_orange;
                @include tablet-768{
                  display: block;
                }
              }
            }
            .name{
              margin-top: 5px;
              font-weight: 900;
              text-align: center;
            }
            .unit{
              margin-bottom: 5px;
              color: rgb(85, 85, 85);
              text-align: center;
            }
            .price{
              margin-bottom: 5px;
              color: rgb(16, 86, 123);
              font-weight: 600;
              text-align: center;
            }
          }
          .wrap{
            margin-top: 10px;
            height: 40px;
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
            @include tablet-768{
              display: none;
            }
            .number{
              padding: 10px;
              width: 50%;
              display: flex;
              justify-content: space-between;
              align-items: center;
              border: 1px rgb(176, 176, 176) solid;
              background-color: white;
              border-radius: 5px;
            }
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
          &:hover{
            .img{
              img:nth-child(2){
              opacity: 1;
              transform: scale(1.1);
            }
              .favorite{
                display: block;
              }
            }
            .wrap{
              opacity: 1;
            }
          }
        }
      }
      .pages{
        display: flex;
        justify-content: center;
        align-items: center;
        li{
          span{
            display: block;
            width: 30px;
            height: 30px;
            margin: 0 10px 0 10px;
            font-size: 20px;
            text-align: center;
            line-height: 30px;
            border-radius: 10px;
            cursor: pointer;
            &:hover, &.active{
              background-color: $color_orange;
              color: white;
              i{
                color: white;
              }
            }
          }
          div{
            margin: 0 10px 0 10px;
            width: 30px;
            height: 30px;
          }
        }
      }
    }
    .noProducts{
      display: flex;
      flex-direction: column;
      align-items: center;
      .img{
        width: 50%;
        img{
          width: 100%;
        }
      }
      .msg{
        font-size: 20px;
      }
    }
  }
}
</style>