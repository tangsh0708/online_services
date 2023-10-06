//传入url路径以及文件名即可
export function myDownLoad(url: string, fileName: string) {
  getBolb(url).then((blob) => {
    saveAs(blob, fileName)
  })
}

function getBolb(url: string) {
  return new Promise(resolve => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.responseType = 'blob'
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(xhr.response)
      }
    }
    xhr.send()
  })
}

export function saveAs(blob: any, filename: string) {
  if (window.navigator.msSaveOrOpenBlob) {
    navigator.msSaveBlob(blob, filename)
  } else {
    const link = document.createElement('a')
    const body = document.querySelector('body') as any

    link.href = window.URL.createObjectURL(blob)
    link.download = filename

    // fix Firefox
    link.style.display = 'none'
    body.appendChild(link)

    link.click()
    body.removeChild(link)

    window.URL.revokeObjectURL(link.href)
  }
}

// 位置拆解省市区
export function direction(str: any) {
  const reg = /.+?(省|市|自治区|自治州|行政区|盟|旗|县|区)/g
  const area = str.match(reg)
  let len = 0
  for (let i = 0; i < area.length; i++) {
    len += area[i].length
  }
  area?.push(str.substring(len)) // 获取省市区之后的字符串
  area?.pop()
  return area
}
