<script setup>
import { ref, computed, watch, watchEffect} from 'vue';
import productsJson from '../json/products.json'
import couponsJson from '../json/coupons.json'

//所有商品 如果localStorage找不到就從JSON檔取得
const products = ref(JSON.parse(localStorage.getItem('products')) || productsJson)

//動態綁定背景
// const getBgStyle=(url)=>{
//   return `background: url(${url}) no-repeat center center / cover`
// }
const getBgStyle=(file)=>{
  const url = new URL(`./assets/${file}`, import.meta.url).href
  return `background: url(${url}) no-repeat center center / cover`
}
const getImageUrl=(file)=>{
  return new URL(`./assets/${file}`, import.meta.url).href
}
console.log(import.meta.url)
watch(products, (renew)=>{
  localStorage.setItem('products',JSON.stringify(renew))
},{ deep: true })

//商品中所有的類型(側選單用 去掉重複)
const typeAll = computed(()=>{
  let arr=[]
  products.value.forEach(i=>arr.push(i.type))
  arr = arr.filter((item,index)=>arr.indexOf(item)===index)
  return arr
})

//商品中所有的種類(側選單用 去掉重複)
const ingredientAll = computed(()=>{
  let arr=[]
  products.value.forEach(i=>{
    i.ingredient.forEach(j=>{
      arr.push(j)
    })
  })
  arr = arr.filter((item,index)=>arr.indexOf(item)===index)
  return arr
})

//商品中最高與最低價格(側選單用)
const priceMax = computed(()=>{
  let arr=[]
  products.value.forEach(i=>arr.push(i.price))
  return Math.max(...arr)
})
const priceMin = computed(()=>{
  let arr=[]
  products.value.forEach(i=>arr.push(i.price))
  return Math.min(...arr)
})
const priceRange = ref(priceMax.value) //選中的價格
// const price = ref([]) //選中的價格
const type = ref([]) //選中的類型
const ingredient = ref([]) //選中的關鍵字
const search = ref('') //輸入框內容

// 如果radio已經被選定時又被點擊第二次就取消選定
const radioClick =(event)=>{
  if(event.target.value === type.value) type.value=[];
}

// 全部清除
const clearAll=()=>{
  search.value=''
  priceRange.value=priceMax.value
  // price.value=[]
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
    products.value.sort((a,b)=>a.id-b.id)
  }else if(sortItem.value==='由新至舊'){
    products.value.sort((a,b)=>b.id-a.id)
  }else if(sortItem.value==='價格由高至低'){
    products.value.sort((a,b)=>b.price-a.price)
  }else if(sortItem.value==='價格由低至高'){
    products.value.sort((a,b)=>a.price-b.price)
  }
  // 如果使用者給 搜尋 價格 類型 關鍵字 任一篩選條件就改成return filterProductsDisplay
  // if(priceRange.value!==priceMax.value || price.value.length || type.value.length || ingredient.value.length || search.value.length){
  if(priceRange.value!==priceMax.value || type.value.length || ingredient.value.length || search.value.length){
    const filterProductsDisplay = ref([...products.value])
    //搜尋 條件篩選
    if(search.value.length){
      filterProductsDisplay.value = filterProductsDisplay.value.filter(i=>i.name.includes(search.value))
    }
    //價格範圍 條件篩選
    if(priceRange.value!==priceMax.value){
      filterProductsDisplay.value = filterProductsDisplay.value.filter(i=>i.price<=priceRange.value)
    }
    //價格 條件篩選
    // if(price.value==='200元以下'){
    //   filterProductsDisplay.value = filterProductsDisplay.value.filter(i=>i.price<=200)
    // }else if(price.value==='201 - 400元'){
    //   filterProductsDisplay.value = filterProductsDisplay.value.filter(i=>i.price>=201 && i.price<=400)
    // }else if(price.value==='401 - 600元'){
    //   filterProductsDisplay.value = filterProductsDisplay.value.filter(i=>i.price>=401 && i.price<=600)
    // }else if(price.value==='601元以上'){
    //   filterProductsDisplay.value = filterProductsDisplay.value.filter(i=>i.price>=601)
    // }
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
    return products.value
  }
})
// 顯示商品-分頁
const productsDisplayPage = computed(()=>{
  let page = [...productsDisplay.value]
  return page = page.slice((nowPage.value-1)*manyEachPage.value, nowPage.value*manyEachPage.value)
})

// 篩選出最愛項目
const favoriteProducts = computed(()=>{
  const filterProductsDisplay = ref([...products.value])
  filterProductsDisplay.value = filterProductsDisplay.value.filter(i=>i.favorite===true)
  return filterProductsDisplay.value
})

// 加入購物車
const cartProducts = ref(JSON.parse(localStorage.getItem('cartProducts')) || [])

watch(cartProducts, (renew)=>{
  localStorage.setItem('cartProducts',JSON.stringify(renew))
},{ deep: true })

const addCart=(item, openCart)=>{
  if(item.animation===true)return
  const index = cartProducts.value.findIndex(i=>i.id===item.id)
  if(index===-1){
    cartProducts.value.push({...item})
  }else{
    cartProducts.value[index].number+=item.number
  }
  item.number=1
  item.animation=true
  if(openCart)openCart()
}
const toggle=(item)=>{
  setTimeout(()=>{
    item.animation=false
  },2000)  
}
// 刪除購物車
const deleCartProducts=(id)=>{
  const index = cartProducts.value.findIndex(i=>i.id===id)
  cartProducts.value.splice(index,1)
}
// 加到最愛
const moveProducts=(id)=>{
  products.value.forEach(i=>{if(i.id===id)i.favorite=true})
  deleCartProducts(id)
}
// 計算金額
const totalPrice = computed(()=>{
  let totle = 0
  cartProducts.value.forEach(i=>{
    if(i.select===true){
      totle += i.price*i.number
    }
  })
  return totle
})
// 運費
const freight=computed(()=>{
  if(totalPrice.value>=freightFree.value){
    return 0
  }else{
    return 80
  }
})
// 免運門檻
const freightFree=ref(800)
// 距離免運門檻
const freightDeficiency=computed(()=>{
  return freightFree.value-totalPrice.value
})
// 到達低消顯示百分比
const freightPercent=computed(()=>{
  if(totalPrice.value>=freightFree.value){
    return '100%'
  }else{
    return totalPrice.value / freightFree.value*100+'%'
  }
})
// 折扣金額
const discount=computed(()=>{
  if(Object.keys(selectedCoupon.value).length===0){ //沒選到券
    return 0
  }else if(totalPrice.value<=selectedCoupon.value.min){ //沒超過低消 0
    return 0
  }else if(selectedCoupon.value.discount_percent){
    const discountPercent = 1 - selectedCoupon.value.discount_percent // 得到0.1折數
    if(selectedCoupon.value.discount_max===0){
      return Math.round(discountPercent*totalPrice.value)
    }else if((discountPercent*totalPrice.value)>selectedCoupon.value.discount_max){
      return selectedCoupon.value.discount_max
    }else{
      return Math.round(discountPercent*totalPrice.value)
    }
  }else if(selectedCoupon.value.discount_percent===''){
    return selectedCoupon.value.discount_minus
  }
})
// 計算總金額
const finalPrice = computed(()=>{
  let totle=totalPrice.value - discount.value + freight.value
  return totle
})
// 計算總件數
const totalItem = computed(()=>{
  let totle = 0
  cartProducts.value.forEach(i=>{
    if(i.select===true){
      totle += 1
    }
  })
  return totle})
// 購物車全選
const select=ref(true)
const selectAll=()=>{
  if(select.value){
    cartProducts.value.forEach(i=>{
    i.select=false
    })
  }else{
    cartProducts.value.forEach(i=>{
      i.select=true
    })
  }
}
// 分頁功能
const manyEachPage = ref(12)
const nowPage = ref(1)
const totalPage = computed(()=>Math.ceil(productsDisplay.value.length / manyEachPage.value))
// 限制分頁顯示總數
// const showPage=(page)=>{
//   const min = page-4
//   const max = page+4  
//   if(nowPage.value>=min && nowPage.value<=max)return true
// }

// CSS toggle
const showFilter = ref(false)
const cartOpen = ref(false)
const favoriteOpen = ref(false)
const priceFilterHide = ref(false)
const typeFilterHide = ref(false)
const ingredientFilterHide = ref(false)

// 輪播
//輪播定時器
let stop = setInterval(()=>{
  carouselIndexChange(1)
},5000)

const carouselNowIndex = ref(0)
//箭頭切換index
const carouselIndexChange=(n)=>{
  carouselNowIndex.value = (carouselNowIndex.value + n + products.value.length) % products.value.length
  clearInterval(stop)
  stop = setInterval(()=>{
    carouselIndexChange(1)
  },5000)
}
//點擊index切換index
const carouselIndexpress=(n)=>{
  carouselNowIndex.value = n
  clearInterval(stop)
  stop = setInterval(()=>{
    carouselIndexChange(1)
  },5000)
}
//依據index位置決定輪播容器移動的距離
const move = computed(()=>{
  const x =100*carouselNowIndex.value
  return `transform:translateX(-${x}%)`
})
//商品詳情頁面
const productIndexOfproducts = ref(0) //動態修改
const productDetailNowIndex = ref(0)
//箭頭切換index
const productDetailIndexChange=(n)=>{
  productDetailNowIndex.value = (productDetailNowIndex.value + n + products.value[productIndexOfproducts.value].imgs.length) % products.value[productIndexOfproducts.value].imgs.length  
}
//點擊index切換index
const productDetailIndexpress=(n)=>{
  productDetailNowIndex.value = n
}
//依據index位置決定輪播容器移動的距離
const productDetailMove = computed(()=>{
  const x =100*productDetailNowIndex.value
  return `transform:translateX(-${x}%)`
})
//URL# Router
const nowhash = ref(window.location.hash)  //值決定要顯示哪個main
const productfind=ref()

const hashchangeHandler=()=>{
  nowhash.value=window.location.hash.slice(1) || '/'
  productfind.value = products.value.findIndex(p=>p.id===Number(nowhash.value))
}
const urlSwitch=computed(()=>{
  if(nowhash.value==='/'){
    return "全部顯示"
  }else if(productfind.value>=0){
    productIndexOfproducts.value=productfind.value //有找到就設定商品
    return "顯示商品"
  }else if(productfind.value===-1){
    return "查無商品"
  }
})
window.addEventListener('hashchange',hashchangeHandler)
hashchangeHandler()

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

//判斷手機使用者手勢
let startX =''
let startY =''
let endX =''
let endY =''
const touchstartHandler=(event)=>{
  startX = event.touches[0].clientX
  startY = event.touches[0].clientY
}
const touchendHandler=(n,event)=>{
  endX = event.changedTouches[0].clientX
  endY = event.changedTouches[0].clientY
  if(Math.abs(Math.abs(startX-endX)-Math.abs(startY-endY)) < 20){
    //滑動距離過短(無效)
    return
  }
  if(Math.abs(startX-endX)>Math.abs(startY-endY) && n===1){
    if(startX-endX>0){
      //向左滑
      carouselIndexChange(+1)
      }else{
      //向右滑
      carouselIndexChange(-1)
    }
  }else if(Math.abs(startX-endX)>Math.abs(startY-endY) && n===2){
    if(startX-endX>0){
      //向左滑
      productDetailIndexChange(+1)
      }else{
      //向右滑
      productDetailIndexChange(-1)
    }
  }
}
// coupon折扣券
const coupons = ref(couponsJson)

// 檢查折扣券日期是否在期限內+是否滿低消
watchEffect(()=>{
  const nowTime = new Date()
  coupons.value.forEach(i=>{
    const startTime = new Date(i.dateStart.year, i.dateStart.month-1, i.dateStart.date, i.dateStart.hours)
    const endTime = new Date(i.dateEnd.year, i.dateEnd.month-1, i.dateEnd.date, i.dateEnd.hours)
    if(nowTime>=startTime && nowTime<=endTime && totalPrice.value>=i.min){
      i.disabled= false
      i.remark=''
    }
    if(nowTime<startTime){
      i.disabled= true
      i.remark='折扣尚未開始'
      return
    }
    if(totalPrice.value<i.min){
      i.disabled= true
      i.remark='未達最低消費'
    }
  })
})
//過濾過期的折價券
const filterCoupons = computed(()=>{
  let arr = [...coupons.value] // 不動到原資料
  const nowTime = new Date()
  arr = arr.filter(i=>{
    const endTime = new Date(i.dateEnd.year, i.dateEnd.month-1, i.dateEnd.date, i.dateEnd.hours)
    return endTime>nowTime
  })
  return arr
})
//樣板使用
const selectedCoupon=ref({})
const couponsHide = ref(true)
const couponStatusToggle= computed(()=>{
  if(filterCoupons.value.length && Object.keys(selectedCoupon.value).length){
    return '已套用'
  }else if(filterCoupons.value.length){
    return '有'
  }else if(!filterCoupons.value.length){
    return '無'
  }
})
//totalPrice異動時，低於低消取消優惠券
watchEffect(()=>{
  if(Object.keys(selectedCoupon.value).length===0){
    return
  }else if(totalPrice.value < selectedCoupon.value.min){
    selectedCoupon.value={}
  }
})
const checkout=()=>{
  alert('銘謝惠顧')
}
</script>
<template>
  <div class="container">
    <header>
      <div class="headerWarp">
        <a href="#/">
          <div class="logo">
            <img src="./assets/logo.png" alt="">
          </div>
        </a>
        <div class="search">
          <input type="text" v-model="search" placeholder="搜尋商品名稱">
          <i v-show="!search" class="fa-solid fa-magnifying-glass"></i>
          <i v-show="search" @click="search=''" class="fa-solid fa-xmark"></i>
        </div>
      </div>
      <div class="shopItems">
        <div class="shopItem">
          <i @click="cartOpen=!cartOpen" class="fa-solid fa-cart-shopping"></i>
          <div v-if="cartProducts.length" class="count">{{ cartProducts.length }}</div>
        </div>
        <div class="shopItem">
          <i @click="favoriteOpen=!favoriteOpen" class="fa-solid fa-heart"></i>
        </div>
      </div>
    </header>
    <TransitionGroup name="fadeIn" tag="div">
      <main v-if="urlSwitch==='全部顯示'" class="productAll">
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
                  <!-- <div class="radio">
                    <i class="fa-solid fa-check"></i>
                  </div> -->
                  <div v-if="priceRange==priceMax">不限金額</div>
                  <div v-else>單價{{ priceRange }}元以內</div>
                </label>
              </div>
              <!-- <div>
                <input type="radio" id="a" value="200元以下" v-model="price">
                <label for="a">
                  <div class="radio">
                    <i class="fa-solid fa-check"></i>
                  </div>
                  <div>200元以下</div>
                </label>
              </div>
              <div>
                <input type="radio" id="b" value="201 - 400元" v-model="price">
                <label for="b">
                  <div class="radio">
                    <i class="fa-solid fa-check"></i>
                  </div>
                  <div>201 - 400元</div>
                </label>
              </div>
              <div>
                <input type="radio" id="c" value="401 - 600元" v-model="price">
                <label for="c">
                  <div class="radio">
                    <i class="fa-solid fa-check"></i>
                  </div>
                  <div>401 - 600元</div>
                </label>
              </div>
              <div>
                <input type="radio" id="d" value="601元以上" v-model="price">
                <label for="d">
                  <div class="radio">
                    <i class="fa-solid fa-check"></i>
                  </div>
                  <div>601元以上</div>
                </label>
              </div> -->
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
          <div class="carousel" @touchstart="touchstartHandler" @touchend="touchendHandler(1,$event)">
            <div class="itemWrap" :style="move">
              <div class="item" v-for="(product,i) in products" :class="{selected:i===carouselNowIndex}">
                <a :href="'#'+product.id">
                  <div class="img" v-for="img in product.imgs.slice(0,2)" :style="getBgStyle(img)"></div>
                  <h3>{{ product.name }}</h3>
                </a>
              </div>
            </div>
            <div class="controlWrap">
              <div class="control" @click="carouselIndexChange(-1)"><i class="fa-solid fa-chevron-left"></i></div>
              <div class="control" @click="carouselIndexChange(+1)"><i class="fa-solid fa-chevron-right"></i></div>
            </div>
          </div>
          <div class="carouselIndex">
            <ul>
              <li v-for="n in products.length" @click="carouselIndexpress(n-1)" :class="{now:n-1===carouselNowIndex}"></li>
            </ul>
          </div>
          <div class="options">
            <div class="selectdFilters">
              <div class="selectdFilter icon" @click="showFilter=!showFilter"><i class="fa-solid fa-filter"></i></div>
              <div v-if="search.length" class="selectdFilter">
                <i class="fa-solid fa-magnifying-glass"></i><span>「{{ search }}」</span><i @click="search=''" class="fa-solid fa-xmark"></i>
              </div>
              <div v-if="priceRange!=priceMax" class="selectdFilter">
                <i class="fa-solid fa-sack-dollar"></i><span>單價{{ priceRange }}元以內</span><i @click="priceRange=priceMax" class="fa-solid fa-xmark"></i>
              </div>
              <!-- <div v-if="price.length" class="selectdFilter">
                <i class="fa-solid fa-sack-dollar"></i><span>{{ price }}</span><i @click="price=[]" class="fa-solid fa-xmark"></i>
              </div> -->
              <div v-if="type.length" class="selectdFilter">
                <i class="fa-solid fa-tag"></i><span>{{ type }}</span><i @click="type=[]" class="fa-solid fa-xmark"></i>
              </div>
              <div v-for="item in ingredient" class="selectdFilter">
                <i class="fa-solid fa-hashtag"></i><span>{{ item }}</span><i @click="clearIngredient(item)" class="fa-solid fa-xmark"></i>
              </div>
              <!-- <div v-if="price.length || type.length|| ingredient.length || search.length" class="clear" @click="clearAll">全部清除</div> -->
              <div v-if="priceRange!=priceMax || type.length|| ingredient.length || search.length" class="clear" @click="clearAll">全部清除</div>
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
                    <a :href="'#'+item.id">
                      <div class="product">
                        <div class="img">
                          <!-- <img v-for="url in item.imgs.slice(0,2)" :src=url alt=""> -->
                          <img v-for="file in item.imgs.slice(0,2)" :src=getImageUrl(file) alt="">
                          <i @click.prevent="item.favorite=!item.favorite" :class="{'fa-solid':item.favorite}" class="favorite fa-regular fa-heart" ></i>
                        </div>
                        <div class="name">{{ item.name }}</div>
                        <div class="unit">({{ item.unit }})</div>
                        <div class="price">NT$ {{ item.price }}</div>
                      </div>
                    </a>
                    <div class="wrap">
                      <div @click="addCart(item)" class="addCart">
                        <Transition name="slideUp" @after-leave="toggle(item)" mode="out-in">
                          <div v-if="item.animation">加入成功!</div>
                          <div v-else>加入購物車</div>
                        </Transition>
                      </div>
                      <div @click="addCart(item,()=>{cartOpen=true})" class="toCart">立即購買</div>
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
            <div v-else class="noProducts">
              <div class="img">
                <img src="./assets/001.png" alt="">
              </div>
              <div class="msg">沒有符合的產品，請減少篩選條件</div>
            </div>
          </Transition>
        </section>  
      </main>
      <main v-else-if="urlSwitch==='顯示商品'" class="productDetail">
        <div class="carouselWrap">
          <div class="carousel" @touchstart="touchstartHandler" @touchend="touchendHandler(2,$event)">
            <div class="itemWrap" :style="productDetailMove">
              <div class="item">
                <div class="img" v-for="img in products[productIndexOfproducts].imgs" :style="getBgStyle(img)"></div>
              </div>
            </div>
            <div class="controlWrap">
              <div class="control" @click="productDetailIndexChange(-1)"><i class="fa-solid fa-chevron-left"></i></div>
              <div class="control" @click="productDetailIndexChange(+1)"><i class="fa-solid fa-chevron-right"></i></div>
            </div>
          </div>
          <div class="carouselIndex">
            <ul>
              <li v-for="(img, i) in products[productIndexOfproducts].imgs" @click="productDetailIndexpress(i)" :class="{now:i===productDetailNowIndex}" :style="getBgStyle(img)"></li>
            </ul>
          </div>
        </div>
        <div class="info">
          <div class="product">
            <div class="nameWrap">
              <div class="name">{{ products[productIndexOfproducts].name }} ({{ products[productIndexOfproducts].unit }})</div>
              <i @click="products[productIndexOfproducts].favorite=!products[productIndexOfproducts].favorite" :class="{'fa-solid':products[productIndexOfproducts].favorite}" class="favorite fa-regular fa-heart" ></i>
              <i @click="copyUrl" class="share fa-solid fa-share-nodes"></i>
              <Transition>
              <span v-if='clipboard' :class="{message: clipboard}">網址已複製!</span>
              </Transition>
            </div>
            <div class="price">價格：NT$ {{ products[productIndexOfproducts].price }}</div>
            <div class="text">訂購天數需要3至5個工作天（不含訂購當天），</div>
            <div class="text">使用北海道空運乳酪、鮮奶及生鮮奶油製作而成，</div>
            <div class="text">冷藏可保存兩天，冷凍可保存兩週。</div>
            <div class="text">單筆消費800元即可享免運優惠</div>
          </div>
          <div class="number">
            <i @click="products[productIndexOfproducts].number<=1?products[productIndexOfproducts].number:products[productIndexOfproducts].number--" class="fa-solid fa-minus"></i>
            <div class="count">{{ products[productIndexOfproducts].number }}</div>
            <i @click="products[productIndexOfproducts].number>=99?products[productIndexOfproducts].number:products[productIndexOfproducts].number++" class="fa-solid fa-plus"></i>
          </div>
          <div class="wrap">
            <div @click="addCart(products[productIndexOfproducts])" class="addCart">
              <Transition name="slideUp" @after-leave="toggle(products[productIndexOfproducts])" mode="out-in">
                <div v-if="products[productIndexOfproducts].animation">加入成功!</div>
                <div v-else>加入購物車</div>
              </Transition>
            </div>
            <div @click="addCart(products[productIndexOfproducts], ()=>{cartOpen=true})" class="toCart">立即購買</div>
          </div>
        </div>
      </main>
      <main v-else-if="urlSwitch==='查無商品'" class="productNotFound">
        <div class="img">
          <img src="./assets/003.png" alt="">
        </div>
        <div class="msg">Ooops!找不到商品</div>
        <a href="#/">
          <div class="msg2">回去逛逛</div>
        </a>
      </main>
    </TransitionGroup>
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
  <section class="cart" :class="{active:cartOpen}" @click.self="cartOpen=!cartOpen">
    <div v-if="cartProducts.length" class="products">
      <i class="fa-solid fa-cart-shopping"></i>
      <i class="fa-regular fa-circle-xmark" @click="cartOpen=!cartOpen"></i>
      <div class="item title">
        <div class="select">
          <input @click="selectAll" v-model="select" type="checkbox" name="" id="all">
          <label for="all">
            <div class="checkBox">
              <i class="fa-solid fa-check"></i>
            </div>
            <span>全選</span>
          </label>
        </div>
        <div class="img"></div>
        <div class="name">品名</div>
        <div class="price">單價</div>
        <div class="wrap">數量</div>
        <div class="totalPrice">總計</div>
        <div class="options"></div>
      </div>
      <TransitionGroup name="fadeOut" tag="div" mode='out-in' class="itemWrap">
      <div v-for="item in cartProducts" :key="item.id" class="item" >
        <div class="select">
          <input type="checkbox" name="" :id="item.id" v-model="item.select">
          <label :for="item.id">
            <div class="checkBox">
              <i class="fa-solid fa-check"></i>
            </div>
          </label>
        </div>
        <div class="img">
          <img v-for="file in item.imgs.slice(0,2)" :src="getImageUrl(file)" alt="">
        </div>
        <div class="name">
          <div>{{ item.name }}</div>
          <div>({{ item.unit }})</div>
        </div>
        <div class="price">{{ item.price }}</div>
        <div class="wrap">
          <div class="number">
            <i @click="item.number<=1?item.number:item.number--" class="fa-solid fa-minus"></i>
            <div class="count">{{ item.number }}</div>
            <i @click="item.number>=99?item.number:item.number++" class="fa-solid fa-plus"></i>
          </div>
        </div>
        <div class="totalPrice">{{ (item.price*item.number).toLocaleString() }}</div>
        <div class="options">
          <div @click="deleCartProducts(item.id)" class="delete"><i class="fa-solid fa-trash-can"></i></div>
          <div @click="moveProducts(item.id)" class="move">移至最愛</div>
        </div>
      </div>
      </TransitionGroup>
      <div v-if="totalPrice" class="check">
        <div class="freightWrap">
          <div class="freightBarWrap">
            <div class="freightBar"></div>
          </div>
          <Transition name="slideUp" mode="out-in">
            <h4 v-if="totalPrice>=freightFree" class="get"><i class="fa-solid fa-circle-check"></i>已達免運門檻!</h4>
            <h4 v-else>再消費{{ freightDeficiency }}元即享免運</h4>
          </Transition>
        </div>
        <div class="couponWrapCtrl" @click="couponsHide=!couponsHide">
          <div class="titles">
            <i class="fa-solid fa-caret-right" :class="{hide:couponsHide}"></i>
            <h4>折價券</h4>
          </div>
          <div class="status">
            <Transition name="slideUp" mode="out-in">
            <h4 v-if="couponStatusToggle==='已套用'" class="get">
              <i class="fa-solid fa-circle-check"></i>已套用折價券 (<span class="cancel" @click="selectedCoupon={}">取消</span>)</h4>
            <h4 v-else-if="couponStatusToggle==='有'">您有{{ filterCoupons.length }}張折價券</h4>
            <h4 v-else-if="couponStatusToggle==='無'">目前沒有折價券</h4>
            </Transition>
          </div>
        </div>
        <div class="couponWrap" :class="{hide:couponsHide}">
          <div v-for="coupon in filterCoupons" class="coupon" :class="{disabled:coupon.disabled}">
            <input type="radio" :id=coupon.id :value=coupon v-model="selectedCoupon" :disabled="coupon.disabled">
            <label :for=coupon.id>
              <div class="stub">
                <div class="radio">
                  <i class="fa-solid fa-check"></i>
                </div>
              </div>
              <div class="content">
                <span class="couponTitle">{{ coupon.title}}</span>
                <span class="expDate">{{coupon.dateStart.year}}/{{coupon.dateStart.month}}/{{coupon.dateStart.date}}/{{coupon.dateStart.hours}}:00-</span>
                <span class="expDate">{{coupon.dateEnd.year}}/{{coupon.dateEnd.month}}/{{coupon.dateEnd.date}}/{{coupon.dateEnd.hours}}:00</span>
                <span class="remark">{{ coupon.remark }}</span>
              </div>
            </label>
          </div>
        </div>
        <div class="checkoutDetail">
          <div class="checkoutPrice"><span class="checkoutTitle">小計：</span><span class="checkoutPrice">$ {{ totalPrice.toLocaleString() }}</span></div>
          <div v-if="!discount==0" class="checkoutDiscount"><span class="checkoutTitle">折扣：</span><span class="checkoutPrice">- $ {{ discount.toLocaleString() }}</span></div>
          <div class="checkoutFreight"><span class="checkoutTitle">運費：</span><span class="checkoutPrice">+ $ {{freight.toLocaleString()}}</span></div>
          <div class="checkoutFinalPrice"><span class="checkoutTitle">總金額({{ totalItem }}件商品)：</span><span class="checkoutPrice">NT$ {{ finalPrice.toLocaleString() }}</span></div>
          <div class="checkout fa-beat" @click="checkout">確認結帳</div>
        </div>
      </div>
      <div v-else class="noSelect">請選擇一項以上商品(勾選商品前方框框)</div>
    </div>
    <div v-else class="noProducts">
      <div class="img">
        <img src="./assets/001.png" alt="">
      </div>
      <div class="msg">購物車是空的...</div>
    </div>
  </section>
  <section class="favor" :class="{active:favoriteOpen}" @click.self="favoriteOpen=!favoriteOpen">
    <div v-if="favoriteProducts.length" class="products">
      <i class="fa-solid fa-heart"></i>
      <i class="fa-regular fa-circle-xmark" @click="favoriteOpen=!favoriteOpen"></i>
      <div class="item title">
        <div class="img"></div>
        <div class="name">品名</div>
        <div class="price">單價</div>
        <div class="wrap">數量</div>
        <div class="totalPrice">總計</div>
        <div class="options"></div>
      </div>
      <TransitionGroup name="fadeOut" tag="div" mode='out-in'>
      <div v-for="item in favoriteProducts" :key="item.id" class="item" >
        <div class="img">
          <img v-for="file in item.imgs.slice(0,2)" :src=getImageUrl(file) alt="">
        </div>
        <div class="name">
          <div>{{ item.name }}</div>
          <div>({{ item.unit }})</div>
        </div>
        <div class="price">{{ item.price }}</div>
        <div class="wrap">
          <div class="number">
            <i @click="item.number<=1?item.number:item.number--" class="fa-solid fa-minus"></i>
            <div class="count">{{ item.number }}</div>
            <i @click="item.number>=99?item.number:item.number++" class="fa-solid fa-plus"></i>
          </div>
        </div>
        <div class="totalPrice">{{ (item.price*item.number).toLocaleString() }}</div>
        <div class="options">
          <div @click="addCart(item)">
          <Transition name="slideUp" @after-leave="toggle(item)" mode="out-in">
            <div v-if="item.animation">加入成功!</div>
            <div v-else>加入購物車</div>
          </Transition>
          </div>
          <div @click="item.favorite=!item.favorite">移出最愛</div>
        </div>
        
      </div>
      </TransitionGroup>
    </div>
    <div v-else class="noProducts">
      <div class="img">
        <img src="./assets/002.png" alt="">
      </div>
      <div class="msg">最愛項目是空的...</div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@mixin tablet-768{
  @media(max-width:768px){
    @content;
  }
}
@mixin size($w, $h:$w){
  width: $w;
  height: $h;
}
@mixin flex_center{
  display: flex;
  justify-content: center;
  align-items: center;
}

*{
  color: #333;
}
$color_orange: rgb(241, 108, 93);
i, label, input[type="radio"], input[type="checkbox"]{
  cursor: pointer;
  color: #333;
}

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

a, a:visited {
  color: black;
  text-decoration: none;
}
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
.productAll{
  display: flex;
  box-sizing: border-box;
  min-height: 100vh;
  aside{
    background: url(./assets/bg03.png);
    // background-color:rgba(29, 29, 29, 0.7);
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
        // background-color:rgba(29, 29, 29, 0.7);
        opacity: 1;
        pointer-events: auto;
        z-index: 2;
        transition: all .5s;
      }
    }
    .container{
      box-sizing: border-box;
      // padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      position: relative;
      @include tablet-768{
        background: url(./assets/bg03.png);
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
        // padding: 20px;
        // border: 1px sandybrown solid;
        border-radius: 20px;
        cursor: pointer;
        @include tablet-768{
          &:nth-child(3){
            margin-top: 30px;
          }
        }
        &.main{
          background: url(./assets/bg03.png);
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
    background: url(./assets/bg03.png);
    @include tablet-768{
      padding: 160px 20px 20px 20px;
    }
    .carousel{
      width: 100%;
      overflow: hidden;
      position: relative;
      border-radius: 20px;
      box-shadow: 0px 0px 15px -10px black;
      .itemWrap{ 
        width: 100%;
        // height: 300px;
        display: flex;
        transform: translateX(0%); //JS計算移動距離
        transition: all 0.5s;
        .item{
          flex-shrink: 0;
          width: 100%;
          position: relative;
          background-color:white;
          @include flex_center;
          a{
            width: 100%;
            height: 100%;
            @include flex_center;
            &::after{
              content: '';
              width: 100%;
              height: 100%;
              position: absolute;
              z-index: 2;
              background: linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 20%, rgba(255,255,255,0) 80%, rgba(255,255,255,1) 100%);
            }
            .img:nth-child(1){
              flex: 0 0 auto;
              width: 50%;
              padding-top: 40%; //高自動等於flex給的寬
              border-radius: 20px;
              position: relative;
              z-index: 1;
              // left: 0;
              opacity: 0;
              transform: rotate(0deg) translateX(5px) scale(1.3);
              transition: all 1s .5s;
            }
            .img:nth-child(2){
              flex: 0 0 auto;
              width: 50%;
              padding-top: 40%;
              border-radius: 20px;
              background-color: rgb(51, 255, 0);
              position: relative;
              opacity: 0;
              transform: rotate(-8deg) translateX(20px) scale(1.2);
              transition: all 1s .5s;
            }
            h3{
              position: absolute;
              left: 0;
              right: 0;
              bottom: 0;
              text-align: center;
              padding: 5px;
              border-radius: 10px;
              z-index: 2;
              background-color: #ffffffd3;
              opacity: 0;
              transition: all 1s .7s;
            }
          }
          &.selected{
            .img:nth-child(1){
              transform: rotate(-5deg) translateX(-15px) scale(1.2);
              opacity: 1;
            }
            .img:nth-child(2){
              transform: scale(1.1);
              opacity: 1;
            }
            h3{
              opacity: 1;
            }
          }
        }
      }
      .controlWrap{
        .control{
          position: absolute;
          top: 0;
          bottom: 0;
          left: 10px;
          margin: auto;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 2px solid rgb(199, 199, 199);
          cursor: pointer;
          transition: all .5s;
          &:hover{
            transform: scale(1.2);
          }
          &:last-child{
            left: unset;
            right: 10px;
          }
          @include flex_center;
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
        margin: auto;
        @include flex_center;
        flex-wrap: wrap;
        li{
          width: 20px;
          height: 20px;
          background-color: rgb(233, 233, 233);
          border-radius: 50%;
          margin: 5px;
          cursor: pointer;
          &:hover{
            background-color: rgb(241, 184, 184);
          }
          &:last-child{
            margin-right: 0;
          }
          @include tablet-768{
            display: none;
          }
          &.now{
            background-color: $color_orange;
          }
        }
      }
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
            // background-color:rgba(175, 179, 177, 0.634);
            background: linear-gradient(90deg, rgba(253, 253, 253, 0.495) 0%, rgb(255, 179, 154) 100%);
            box-shadow: 0px 0px 15px -10px black;
            display: flex;
            flex-direction: column;
            .img{
              border-radius: 20px 20px 0 0;
              margin-bottom: 10px;
              position: relative;
              overflow: hidden;
              img{
                width: 100%;
                object-fit: contain;
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
.cart, .favor{
  width: 100vw;
  height: 100vh;
  padding: 60px 5px 60px 5px;
  background-color:rgba(29, 29, 29, 0.7);
  position: fixed;
  top: 0;
  left: 0;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow: auto;
  pointer-events: none;
  transition: all .5s;
  opacity: 0;
  &.active{
    opacity: 1;
    pointer-events: auto;
    z-index: 2;
  }
  .products{
    width: 80%;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    position: relative;
    background: url(./assets/bg03.png);
    @include tablet-768{
      width: 100%;
    }
    .fa-cart-shopping, .fa-heart {
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translate(-50%,-50%);
      width: 10%;
      font-size: 24px;
      background: url(./assets/bg03.png);
      border-radius: 30px 30px 0 0;
      padding: 20px;
      text-align: center;
    }
    .fa-circle-xmark{
      position: absolute;
      top: 5px;
      right: 5px;
      font-size: 24px;
      z-index: 2;
    }
    .item{
      background-color:rgba(228, 228, 228, 0.634);
      border-radius: 20px;
      display: flex;
      align-items: center;
      margin: 10px 20px;
      padding: 5px;
      @include tablet-768{
        margin: 5px;
      }
      &:last-child{
        margin-bottom: 20px;
      }
      .select{
        flex: 1 1;
        padding: 10px;
        @include flex_center;
        flex-direction: column;
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
      .img{
        flex:0 0 100px;
        border-radius: 20px;
        overflow: hidden;
        position: relative;
        @include tablet-768{
          flex:0 0 50px;
        }
        img{
          width: 100%;
          object-fit: contain;
          border-radius: 20px;
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
        }
      }
      .name{
        flex: 3 1;
        padding: 5px;
        font-weight: 900;
        padding: 10px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        @include tablet-768{
          padding: 5px;
          font-weight: 900;
          font-size: 12px;
        }
      }
      .price{
        flex: 1 1;
        padding: 10px;
        @include flex_center;
        @include tablet-768{
          padding: 5px;
        }
      }
      .wrap{
        flex: 2 1;
        padding: 10px;
        @include flex_center;
        @include tablet-768{
          padding: 5px;
        }
        .number{
          padding: 10px;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px rgb(176, 176, 176) solid;
          background-color: white;
          border-radius: 5px;
          @include tablet-768{
            padding: 5px;
          }
        }
      }
      .totalPrice{
        flex: 2 1;
        padding: 10px;
        color: rgb(16, 86, 123);
        font-weight: 600;
        @include flex_center;
        @include tablet-768{
          padding: 5px;
        }
      }
      .options{
        flex: 2 1;
        padding: 10px;
        @include flex_center;
        flex-direction: column;
        cursor: pointer;
        font-size: 12px;
        @include tablet-768{
          padding: 5px;
          font-size: 11px;
        }
        >div, div, i{
          margin-bottom: 5px;
          &:hover{
            color: brown;
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
      }
    }
    .title{
      font-size: 14px;
      height: 40px;
      padding: 0;
      z-index: 1;
      background: url(./assets/bg03.png);
      white-space: nowrap;
      .select{
        margin-left: 5px;
        white-space: nowrap;
      }
      .img{
        flex:1 0 0;
      }
      .options{
        cursor: auto;
      }
    }
    .check{
      display: flex;
      flex-direction: column;      
      align-items: center;
      position: sticky;
      box-shadow: 0 -1px 10px 1px rgb(197, 197, 197) inset;
      bottom: -60px;
      background-color: white;
      padding: 10px;
      box-sizing: border-box;
      border-radius: 0 0 20px 20px;
      .freightWrap{
        width: 50%;
        text-align: center;
        margin: 10px;
        @include tablet-768{
          width: 100%;
        }
        .freightBarWrap{ //進度條
          height: 5px;
          border-radius: 20px;
          background-color: #5c5c5c;
          position: relative;
          .freightBar{
            width: v-bind(freightPercent); //動態修改
            height: 100%;
            position: absolute;
            left: 0;
            border-radius: 20px;
            background-color: $color_orange;
            transition: all .2s;
          }
        }
        h4{
          display: block;
          text-align: end;
          &.get,i{
            color: $color_orange;
          }
        }
      }
      .couponWrapCtrl{
        width: 50%;
        border-bottom: 1px solid #333;
        display: flex;
        justify-content: space-between;
        @include tablet-768{
          width: 100%;
        }
        .titles{
          display: flex;
          align-items: center;
          cursor: pointer;
          i.fa-caret-right{
            margin-right: 5px;
            transform: rotate(90deg);
            transition: all .1s;
            &.hide{
              transform: rotate(0deg);
            }
          }
          h4{
            font-size: 18px;
            &.get{
              color: $color_orange;
            }
          }
        }
        .status{
          h4{
            &.get,i{
              color: $color_orange;
              .cancel{
                color: rgb(66, 155, 190);
                cursor: pointer;
                &:hover{
                  color: rgb(41, 93, 114);
                }
              }
            }
          }
        }
      }
      .couponWrap{
        width: 50%;
        margin-bottom: 30px;
        max-height: 300px; //動畫用
        @include flex_center;
        justify-content: start;
        flex-wrap: wrap;
        overflow: auto;
        position: relative;
        transition: all 0.2s;
        scrollbar-color: rgb(241, 108, 93, .5) transparent;
        scrollbar-width: thin;
        &::-webkit-scrollbar {
          width: 4px;
          background: transparent;
        }
        &::-webkit-scrollbar-thumb {
          background: rgb(241, 108, 93, .5);
          border-radius: 20px;
        }
        @include tablet-768{
          width: 100%;
        }
        &.hide{
          max-height: 180px;
          overflow: hidden;
          &::after{
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 66%, rgba(255,255,255,1) 100%);
            pointer-events: none
          }
        }
        .coupon{
          flex: 0 0 calc(50% - 2px);
          height: 120px;
          display: flex;
          align-items: center;
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
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #f2795125 0%, #f2795150 85%, $color_orange 85%, $color_orange 100%);
            transform: scale(0.9);
            transition: all .5s;
            position: relative;
            @include flex_center;
            &:hover{
              transform: scale(1);
              .radio{
                background-color: $color_orange;
              }
            }
            &::after{
              content: '';
              position: absolute;
              top: 6px;
              left: -8px;
              width: 100%;
              height: 90%;
              transform: scale(0.97);
              border-right: 8px dotted rgb(255, 255, 255);
              border-left: 8px dotted rgb(255, 255, 255);
            }
            .stub{
              width: 20%;
              height: 100%;
              @include flex_center;
              .radio{
                box-sizing: border-box;
                width: 20px;
                height: 20px;
                margin-left: 8px;
                border: 1px solid $color_orange;
                border-radius: 50%;
                margin-right: 5px;
                @include flex_center;
                i{
                  display: none;
                }
              }
            }
            .content{
              box-sizing: border-box;
              width: 80%;
              height: 100%;
              padding: 5px;
              border-left: 5px dotted white;
              display: flex;
              justify-content: center;
              align-items: start;
              flex-direction: column;
              .couponTitle{
                margin-bottom: 5px;
              }
              .expDate{
                font-size: 10px;
              }
            }
          }
          &.disabled{
            label{
              background: linear-gradient(135deg, rgb(223,223,223) 0%, rgb(223,223,223) 85%, rgb(135,135,135) 85%, rgb(135,135,135) 100%);
              .radio{
                border: 1px solid rgb(135,135,135);
              }
              &:hover{
                transform: scale(0.9);
                .radio{
                  background-color: unset;
                }
              }
            }
            label
            .remark{
              color: red !important;
            }
          }
        }
      }
      .checkoutDetail{
        width: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        @include tablet-768{
          width: 100%;
        }
        >div{
          width: 100%;
          display: flex;
          justify-content: space-between;
          .checkoutTitle{
            font-size: 18px;
            font-weight: 900;
            @include tablet-768{
              margin-right: 10px;
              font-size: 16px;
            }
            span{
              color: $color_orange;
            }
          }
        }
        .checkoutDiscount{
          .checkoutPrice{
            color: green;
          }
        }
        .checkoutFreight{
          border-bottom: 1px solid #5c5c5c;
          margin-bottom: 5px;
        }
        .checkoutFinalPrice{
          margin-bottom: 10px;
          .checkoutPrice{
            font-weight: 900;
            color: $color_orange;
          }
        }
        .checkout{
          width: 50%;
          background-color: $color_orange;
          box-sizing: border-box;
          margin: 10px 0;
          padding: 16px;
          border-radius: 10px;
          color: white;
          font-size: 18px;
          box-shadow: 0 0 5px -1px $color_orange;
          transition: all .3s;
          @include flex_center;
          @include tablet-768{
            padding: 10px;
          }
          cursor: pointer;
          &:hover{
            background-color: rgb(242, 70, 51);
            box-shadow: 0 0 5px 2px $color_orange;
          }
        }
      }
    }
    .noSelect{
      height: 100px;
      width: 100%;
      margin-bottom: 20px;
      @include flex_center;
      color: $color_orange;
      font-size: 18px;
    }
  }
  .noProducts{
    width: 50%;
    padding: 10px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    flex-direction: column;
    border-radius: 20px;
    background-color: rgb(255, 255, 255);
    @include tablet-768{
      width: 80%;
    }
    .img{
      width: 50%;
      img{
        width: 100%;
      }
    }
    .msg{
      font-size: 30px;
      margin-bottom: 30px;
    }
  }
}
.slideUp-enter-active, .slideUp-leave-active {
  transition: all .2s linear;
}
.slideUp-enter-from {
  opacity: 0;
  transform: translateY(100%);
}
.slideUp-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
.fadeIn-enter-active, .fadeIn-leave-active {
  transition: all .2s linear;
}
.fadeIn-enter-from, .fadeIn-leave-to {
  opacity: 0;
}
.fadeOut-enter-active, .fadeOut-leave-active {
  transition: all .6s linear;
}
.fadeOut-enter-from, .fadeOut-leave-to {
  opacity: 0;
}
</style>