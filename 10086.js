// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: mobile;

/**
 * Author: GideonSenku,Chavyleung,wangfei021325
 * Github: https://github.com/GideonSenku
 */

const $ = importModule('Env')

const chavy_autologin_cmcc = `直接将本段子界文字替换成BoxJS中的chavy_autologin_cmcc数据，或者抓包填入一个request对象`

const chavy_getfee_cmcc = `直接将本段子界文字替换成BoxJS中的chavy_getfee_cmcc数据，或者抓包填入一个request对象`


const crypto = {
  moduleName: 'crypto-js',
  url: 'https://raw.githubusercontent.com/GideonSenku/Scriptable/master/crypto-js.min.js'
}

!(async () => {
  $.CryptoJS = $.require(crypto)
  await loginapp()
  await queryfee()
  await querymeal()
  await showmsg()
})()
  .catch((e) => $.logErr(e))
  
  
function showmsg() {
  return new Promise((resolve) => {
    $.subt = `[话费剩余] ${$.fee.rspBody.curFee}元`
    const res = $.meal.rspBody.qryInfoRsp[0].resourcesTotal
    const flowRes = res.find((r) => r.resourcesCode === '04')
    const voiceRes = res.find((r) => r.resourcesCode === '01')
    console.log(JSON.stringify(flowRes))
    if (flowRes) {
      const remUnit = flowRes.remUnit === '05' ? 'GB' : 'MB'
      const usedUnit = flowRes.usedUnit === '05' ? 'GB' : 'MB'
      const unit = flowRes.allUnit === '05' ? 'GB' : 'MB'
      $.flowRes = `[流量剩余] ${flowRes.allRemainRes}${remUnit}`
    }
    if (voiceRes) {
      const remUnit = flowRes.remUnit === '01' ? '分钟' : ''
      const usedUnit = flowRes.usedUnit === '01' ? '分钟' : ''
      const allUnit = '分钟'
      $.voiceRes = `[语音剩余] ${voiceRes.allRemainRes}${allUnit}`
    }
    
    // create and show widget
    if (config.runsInWidget) {
    let widget = createWidget("移不动",$.subt , $.flowRes, $.voiceRes)
    Script.setWidget(widget)
    Script.complete()
    } else {
      $.msg( '移不动', `${$.subt}\n${$.flowRes}\n${$.voiceRes}`, '确定')
    }
    resolve()
  })
}  

function createWidget(pretitle, title, subtitle, other) {
  let w = new ListWidget()
  
  const bgColor = new LinearGradient()
  bgColor.colors = [new Color("#ff7b1c"), new Color("#fe9e0b")]
  bgColor.locations = [0.0, 1.0]
  w.backgroundGradient = bgColor
  w.centerAlignContent()
  
  let preTxt = w.addText(pretitle)
  preTxt.textColor = Color.white()
  preTxt.applySubheadlineTextStyling()
  
  
  let titleTxt = w.addText(title)
  titleTxt.textSize = 12
  titleTxt.textColor = Color.white()
  
  
  let subTxt = w.addText(subtitle)
  subTxt.textColor = Color.white()
  subTxt.textSize = 12  
  
  let otherTxt = w.addText(other)
  otherTxt.textColor = Color.white()
  otherTxt.textSize = 12 
  
  w.presentSmall()
  return w
}

function loginapp() {
  return new Promise((resolve) => {
    const url = JSON.parse(chavy_autologin_cmcc)
    $.post(url, (resp, data) => {
      try {
        $.setck = resp.headers['Set-Cookie']
        log($.setck)
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve()
      }
    })
  })
}


function queryfee() {
  return new Promise((resolve) => {
    const url = JSON.parse(chavy_getfee_cmcc)
    const body = JSON.parse(decrypt(url.body, 'bAIgvwAuA4tbDr9d'))
    const cellNum = body.reqBody.cellNum
    const bodystr = `{"t":"${$.CryptoJS.MD5($.setck).toString()}","cv":"9.9.9","reqBody":{"cellNum":"${cellNum}"}}`
    url.body = encrypt(bodystr, 'bAIgvwAuA4tbDr9d')
    url.headers['Cookie'] = $.setck
    url.headers['xs'] = $.CryptoJS.MD5(url.url + '_' + bodystr + '_Leadeon/SecurityOrganization').toString()
    $.post(url, (resp, data) => {
      try {
        $.fee = JSON.parse(decrypt(data, 'GS7VelkJl5IT1uwQ'))
        console.warn($.fee)
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve()
      }
    })
  })
}

function querymeal() {
  return new Promise((resolve) => {
    const url = JSON.parse(chavy_getfee_cmcc)
    url.url = 'https://clientaccess.10086.cn/biz-orange/BN/newComboMealResouceUnite/getNewComboMealResource'
    const body = JSON.parse(decrypt(url.body, 'bAIgvwAuA4tbDr9d'))
    const cellNum = body.reqBody.cellNum
    const bodystr = `{"t":"${$.CryptoJS.MD5($.setck).toString()}","cv":"9.9.9","reqBody":{"cellNum":"${cellNum}","tag":"3"}}`
    url.body = encrypt(bodystr, 'bAIgvwAuA4tbDr9d')
    url.headers['Cookie'] = $.setck
    url.headers['xs'] = $.CryptoJS.MD5(url.url + '_' + bodystr + '_Leadeon/SecurityOrganization').toString()
    $.post(url, (resp, data) => {
      try {
        $.meal = JSON.parse(decrypt(data, 'GS7VelkJl5IT1uwQ'))
        console.warn($.meal)
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve()
      }
    })
  })
}


function encrypt(str, key) {
  return $.CryptoJS.AES.encrypt($.CryptoJS.enc.Utf8.parse(str), $.CryptoJS.enc.Utf8.parse(key), {
    iv: $.CryptoJS.enc.Utf8.parse('9791027341711819'),
    mode: $.CryptoJS.mode.CBC,
    padding: $.CryptoJS.pad.Pkcs7
  }).toString()
}

function decrypt(str, key) {
  return $.CryptoJS.AES.decrypt(str, $.CryptoJS.enc.Utf8.parse(key), {
    iv: $.CryptoJS.enc.Utf8.parse('9791027341711819'),
    mode: $.CryptoJS.mode.CBC,
    padding: $.CryptoJS.pad.Pkcs7
  }).toString($.CryptoJS.enc.Utf8)
}
