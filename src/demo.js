import TRTC from 'trtc-js-sdk';
let sdkAppId = 1400789272
let roomId
let userId
let userSig
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
    // 播放远端流
    remoteStream.play('remoteStreamContainer');
  });
  // 2.进房成功后开始推流
  try {
    await client.join({ roomId });
    localStream = TRTC.createStream({ userId, audio: true, video: false });
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
  // 调用 destroy() 结束当前client
  client.destroy();
}

document.getElementById("shutdown_mic").onclick = async function() { //用于关闭麦克风
  localStream.muteAudio();
  const audioTrack = localStream.getAudioTrack();
  if (audioTrack) {
    audioTrack.stop();
  }
}

document.getElementById("turnon_mic").onclick = async function() { //用于打开麦克风
  const stream = TRTC.createStream({ audio: true, video:false });
  await stream.initialize();
  localStream.unmuteAudio();
  await localStream.replaceTrack(stream.getAudioTrack());
}