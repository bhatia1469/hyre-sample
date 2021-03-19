/**
 * @format
 */

import { AppRegistry, Platform } from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import { Voximplant } from 'react-native-voximplant';
import App from './App';
import { name as appName } from './app.json';
import CallManager from './src/manager/CallManager';
import PushBackground from './src/manager/PushBackground'
import { navigate } from './src/routes/NavigationService';

AppRegistry.registerComponent(appName, () => App);

if (Platform.OS === 'android') {
    AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => PushBackground);
}
else {
    const options = {
        ios: {
            appName: 'Hyre',
        },
    };
    RNCallKeep.setup(options);
    RNCallKeep.addEventListener('answerCall', (event) => {
        // alert("_onRNCallKeepPerformAnswerCallAction")
        console.log('CallKitManager: _onRNCallKeepPerformAnswerCallAction' + global.callId);
        Voximplant.Hardware.AudioDeviceManager.getInstance().callKitConfigureAudioSession();
        // setTimeout(() => {
        navigate('Call', {
            callId: global.callId,
            isVideo: false,
            userName: '',
            isIncoming: true,
        })
        // }, 10000);
    });
    RNCallKeep.addEventListener('endCall', (event) => {
        console.log('CallKitManager: _onRNCallKeepPerformEndCallAction');
        CallManager.getInstance().endCall();
        Voximplant.Hardware.AudioDeviceManager.getInstance().callKitStopAudio();
        Voximplant.Hardware.AudioDeviceManager.getInstance().callKitReleaseAudioSession();
    });


}