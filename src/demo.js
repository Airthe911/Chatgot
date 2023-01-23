import TRTC from 'trtc-js-sdk';
import "./demo.css";
let sdkAppId = 1400789272; // '填入您创建应用的 sdkAppId'

let roomId ; // '您指定的房间号'

let userId ; // '您指定的用户ID'

let userSig ; // '生成的userSig'

let client, localStream;

document.getElementById("startCall").onclick = async function () {
  roomId = parseInt(document.querySelector('#roomId').value);

  userId = document.querySelector('#userId').value;

  userSig = document.querySelector('#userSig').value;

  client = TRTC.createClient({ mode: 'rtc', sdkAppId, userId, userSig });

  // 1.监听事件

  client.on('stream-added', event => {

    const remoteStream = event.stream;

    console.log('远端流增加: ' + remoteStream.getId());

    //订阅远端流

    client.subscribe(remoteStream);

  });

  client.on('stream-subscribed', event => {

    // 远端流订阅成功

    const remoteStream = event.stream;

    // 播放远端流，传入的元素 ID 必须是页面里存在的 div 元素

    remoteStream.play('remoteStreamContainer');

  });

  // 2.进房成功后开始推流

  try {

    await client.join({ roomId });

    localStream = TRTC.createStream({ userId, audio: true, video: true });

    await localStream.initialize();

    // 播放本地流

    localStream.play("localStreamContainer");

    await client.publish(localStream);

  } catch (error) {

    console.error(error);

  }

}

document.getElementById("finishCall").onclick = async function () {

  // 停止本地流预览

  localStream.close();

  await client.leave();

  // 退房成功，如果没有调用 client.destroy()，可再次调用 client.join 重新进房开启新的通话

  // 调用 destroy() 结束当前 client 的生命周期

  client.destroy();

}