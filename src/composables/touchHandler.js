//判斷手機使用者手勢
let startX =''
let startY =''
let endX =''
let endY =''

const touchstartHandler = (event)=>{
  startX = event.touches[0].clientX
  startY = event.touches[0].clientY
}
const touchendHandler = (callback ,event)=>{
  endX = event.changedTouches[0].clientX
  endY = event.changedTouches[0].clientY
  if(Math.abs(Math.abs(startX-endX)-Math.abs(startY-endY)) < 20){
    //滑動距離過短(無效)
    return
  }else{
    if(Math.abs(startX-endX)>Math.abs(startY-endY)){
      if(startX-endX>0){
        //向左滑
        callback(+1)
      }else{
        //向右滑
        callback(-1)
      }
    }
  }
}
export{ touchstartHandler, touchendHandler }