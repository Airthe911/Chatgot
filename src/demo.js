import TRTC from 'trtc-js-sdk';
import "../asr.js";
//逐步实现语音通话，语音识别和语音合成，目前已经实现前两个了
//Chatgot主要功能demo
//接下来的主要目标，是根据实时生成的文字数据，生成对应的文字回复（目前并不知道怎么实现），然后再做语音合成，播放生成的回复文字
let sdkAppId = 1400789272
let roomId
let userId
let userSig
let client, localStream, localStreamAsr;
document.getElementById("startCall").onclick = async function () {
  roomId = parseInt(document.querySelector('#roomId').value); //待解决事项（1）,用户应当只需要输入账号和密码，房间号后续需要加一个智能生成，且不能与其它正在使用的房间冲突
  userId = document.querySelector('#userId').value;
  userSig = document.querySelector('#userSig').value;
  client = TRTC.createClient({ mode: 'rtc', sdkAppId, userId, userSig });
  // 监听事件
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
  // 进房成功后开始推流
  try {
    await client.join({ roomId });
    //只打开音频，我们的功能不需要开启视频
    localStream = TRTC.createStream({ userId, audio: true, video: false }); //待解决事项（2），最好给加上一个开启后显示出来的界面，否则使用者无法准确知道自己是否已经加入到通话中
    await localStream.initialize();
    // 播放本地流
    localStream.play("localStreamContainer");
    await client.publish(localStream);
  } catch (error) {
    console.error(error);
  }
  localStreamAsr = new ASR({
    secretKey: 'RgkdKm6HG5lOq6A5rQl6LdlhR3VpCSfl',
    secretId: 'AKID87wXubAYlpvCIZosgHoBSYjjldIuMcJs',
    appId: 1314868828,
    engine_model_type : '16k_en', //16k英文模式
    voice_format : 1,
    hotword_id : '08003a00000000000000000000000000', //热词表，先放个默认的上去吧，后续可以考虑根据各个场景来改一下？
    needvad: 1,
    filter_dirty: 0,
    filter_modal: 0,
    filter_punc: 0,
    convert_num_mode : 1,
    word_info: 2,
    audioTrack: localStream.getAudioTrack() 
})
    localStreamAsr.start();
    localStreamAsr.OnRecognitionStart = (res) => {
    console.log('本地流：开始识别', res);
    };
    localStreamAsr.OnSentenceBegin = (res) => {
    console.log('本地流：一句话开始', res);
    };
    localStreamAsr.OnRecognitionResultChange = (res) => {
    console.log('本地流：识别变化时', res);
    };
    localStreamAsr.OnSentenceEnd = (res) => {
    console.log('本地流：一句话结束', res);
    };
    localStreamAsr.OnChange = (res) => {
    console.log('本地流：识别中' ,res)
    }
    localStreamAsr.OnRecognitionComplete = (res) => {
    console.log('本地流：识别结束', res);
    };
    localStreamAsr.OnError = (res) => {
    console.log('本地流：识别失败', res);
    };
}

document.getElementById("finishCall").onclick = async function () {
  // 停止本地流预览
  localStream.close();
  await client.leave();
  // 调用 destroy() 结束当前client
  localStreamAsr.stop();
  console.log("结束识别");//暂时把它绑定为结束按钮的事件之一，不过这里可以考虑优化一下，暂停的时候也应该暂停识别，否则会一直识别失败的
  client.destroy();
}

document.getElementById("shutdown_mic").onclick = async function() { //用于暂时关闭麦克风（不是退出房间）
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