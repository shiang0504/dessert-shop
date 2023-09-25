// const backendUrl = 'http://localhost:3000'

// const getBgStyle=(file)=>{
//   return `background: url(${backendUrl}/images/${file}) no-repeat center center / cover`
// }
const getBgStyle=(file)=>{
  const url = new URL(`../assets/${file}`, import.meta.url).href
  return `background: url(${url}) no-repeat center center / cover`
}
// const getImageUrl=(file)=>{
//   return `${backendUrl}/images/${file}`
// }
const getImageUrl=(file)=>{
  return new URL(`../assets/${file}`, import.meta.url).href
}
export{ getBgStyle, getImageUrl }