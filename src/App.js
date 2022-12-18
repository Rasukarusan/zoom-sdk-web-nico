import React, { ReactDOM } from 'react';

import './App.css';
import { ZoomMtg } from '@zoomus/websdk';

ZoomMtg.setZoomJSLib('https://source.zoom.us/2.9.5/lib', '/av');

ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();
// loads language files, also passes any error messages to the ui
ZoomMtg.i18n.load('en-US');
ZoomMtg.i18n.reload('en-US');

function App() {

  // setup your signature endpoint here: https://github.com/zoom/meetingsdk-sample-signature-node.js
  var signatureEndpoint = 'http://localhost:4000'
  // This Sample App has been updated to use SDK App type credentials https://marketplace.zoom.us/docs/guides/build/sdk-app
  var sdkKey = 'YOUR_SDK_KEY'
  var meetingNumber = 'YOUR_MEETING_NUMBER'
  var role = 1
  var leaveUrl = 'http://localhost:3000'
  var userName = 'React'
  var userEmail = ''
  var passWord = 'YOUR_PASS_CODE'
  // pass in the registrant's token if your meeting or webinar requires registration. More info here:
  // Meetings: https://marketplace.zoom.us/docs/sdk/native-sdks/web/client-view/meetings#join-registered
  // Webinars: https://marketplace.zoom.us/docs/sdk/native-sdks/web/client-view/webinars#join-registered
  var registrantToken = ''

  function getSignature(e) {
    e.preventDefault();

    fetch(signatureEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        meetingNumber: meetingNumber,
        role: role
      })
    }).then(res => res.json())
    .then(response => {
      startMeeting(response.signature)
    }).catch(error => {
      console.error(error)
    })
  }

  function startMeeting(signature) {
    document.getElementById('zmmtg-root').style.display = 'block'

    ZoomMtg.init({
      leaveUrl: leaveUrl,
      success: (success) => {
        ZoomMtg.join({
          signature: signature,
          meetingNumber: meetingNumber,
          userName: userName,
          sdkKey: sdkKey,
          userEmail: userEmail,
          passWord: passWord,
          tk: registrantToken,
          success: (success) => {
            // 弾幕ボタンを追加
            const footer = document.getElementById('foot-bar');
            const fireBtn = document.createElement('button');
            fireBtn.textContent = '弾幕';
            fireBtn.onclick = () => {
              showChatPane()
              fire()
            }
            footer.appendChild(fireBtn);
          },
          error: (error) => {
            console.log(error)
          }
        })

      },
      error: (error) => {
        console.log(error)
      }
    })
  }

  return (
    <div className="App">
      <main>
        <h1>Zoom Meeting SDK Sample React</h1>

        <button onClick={getSignature}>Join Meeting</button>
      </main>
    </div>
  );
}

/**
 * チャットメッセージを流す
 */
const createText = (text) => {
  const randomNum = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
  var id = "video-share-layout"
  var textbox_element = document.getElementsByClassName(id)[0];

  const height = textbox_element.style.height.replace("px", "")
  var new_element = document.createElement('p')
  new_element.textContent = text
  new_element.className = 'mytext'
  new_element.style.cssText = `top: ${randomNum(0, height)}px;`
  textbox_element.appendChild(new_element);
}

/**
 * チャットパネルを開く
 *
 * チャットメッセージのDOMを取得するため
 */
const showChatPane = () => {
  const chatBtn = document.querySelector('[aria-label="open the chat pane"]');
  chatBtn.click()
  document.getElementById("wc-container-left").style.cssText = "width: 100%;"
}

/**
  * 弾幕開始
  */
function fire() {
  let lastMessage = null
  setInterval(() => {
    let chatMessages = document.getElementsByClassName("ReactVirtualized__Grid__innerScrollContainer")[0].children
    for(let i = chatMessages.length -1 ; i >= 0 ; i-- ) {
        if (lastMessage && lastMessage.id === chatMessages[i].id) {
            break
        }
        const text = chatMessages[i].lastElementChild.textContent
        createText(text)
    }
    lastMessage = chatMessages[chatMessages.length - 1]
  }, 1000)
}

export default App;
