import React, { useEffect, useRef } from 'react';
import { View, Platform, NativeModules, requireNativeComponent } from 'react-native';

// 안드로이드 네이티브 WebRTC 뷰
const RTCView = requireNativeComponent('RTCView');

interface WebRTCPlayerProps {
  streamUrl: string;
  style?: any;
}

const WebRTCPlayer: React.FC<WebRTCPlayerProps> = ({ streamUrl, style }) => {
  const rtcViewRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      // 안드로이드에서 WebRTC 스트림 시작
      console.log('Starting WebRTC stream:', streamUrl);

      // WebRTC 연결 설정
      const startWebRTC = async () => {
        try {
          // WebRTC 피어 연결 생성
          const peerConnection = new RTCPeerConnection({
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' }
            ]
          });

          // 비디오 스트림 추가
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });

          stream.getTracks().forEach(track => {
            peerConnection.addTrack(track, stream);
          });

          // ICE 후보 수집
          peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
              console.log('ICE candidate:', event.candidate);
            }
          };

          // 원격 스트림 수신
          peerConnection.ontrack = (event) => {
            console.log('Remote stream received');
            if (rtcViewRef.current) {
              rtcViewRef.current.srcObject = event.streams[0];
            }
          };

        } catch (error) {
          console.error('WebRTC error:', error);
        }
      };

      startWebRTC();
    }
  }, [streamUrl]);

  if (Platform.OS === 'android') {
    return (
      <RTCView
        ref={rtcViewRef}
        style={style}
        streamURL={streamUrl}
        mirror={false}
        objectFit="contain"
      />
    );
  }

  // iOS에서는 expo-av Video 사용
  const { Video } = require('expo-av');
  return (
    <Video
      source={{ uri: streamUrl }}
      style={style}
      resizeMode="contain"
      shouldPlay={true}
      isLooping={true}
    />
  );
};

export default WebRTCPlayer;
