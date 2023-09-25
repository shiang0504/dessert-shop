import { ref } from 'vue'
import { defineStore } from 'pinia'

const usetoggleStore = defineStore('toggle', () => {
  // 購物車開關狀態及更改方法
  const cartOpen = ref(false)
  function cartOpenToggle() {
    cartOpen.value = !cartOpen.value
  }
  // 最愛商品開關狀態及更改方法
  const favoriteOpen = ref(false)
  function favoriteOpenToggle() {
    favoriteOpen.value = !favoriteOpen.value
  }
  return { cartOpen, cartOpenToggle, favoriteOpen, favoriteOpenToggle }
})

const useSearchStore = defineStore('search', () => {
  // 搜尋欄位值及清空方法
  const search = ref('')
  function clearSearch() {
    search.value = ''
  }
  return { search, clearSearch }
})

export { usetoggleStore, useSearchStore }