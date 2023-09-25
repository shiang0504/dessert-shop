import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useSearchStore = defineStore('search', () => {
  // State
  const search = ref('')
  // Action
  function clearSearch() {
    search.value = ''
  }
  return { search, clearSearch }
})
