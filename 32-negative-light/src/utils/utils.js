export const clickAnchor = properties => {
  const anchor = document.createElement('a')
  Object.assign(anchor, properties)
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
}
export const isIos = () => {
  if( /Android/i.test(navigator.userAgent)) {
    return false;
  } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    return true
  }
}
export const isMobile = {
  Android: function () {
    return navigator.userAgent.match(/Android/i)
  },
  iOS: function () {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i)
  },
  any: function () {
    return isMobile.Android() || isMobile.iOS()
  },
}

// https://codepedia.info/detect-browser-in-javascript
export const fnBrowserDetect = () => {
  let userAgent = navigator.userAgent;
  let browserName;

  if(userAgent.match(/chrome|chromium|crios/i)){
    browserName = "Chrome";
  }else if(userAgent.match(/firefox|fxios/i)){
    browserName = "Firefox";
  }  else if(userAgent.match(/safari/i)){
    browserName = "Safari";
  }else if(userAgent.match(/opr\//i)){
    browserName = "Opera";
  } else if(userAgent.match(/edg/i)){
    browserName = "Edge";
  }else{
    browserName="No browser detection";
  }

  // document.querySelector("#brw").innerText="You are using "+ browserName +" browser.";

  return browserName
}
