import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useState, useRef, useEffect } from 'react';
import { FlatList, Image, Text, TextInput, TouchableOpacity, View, StatusBar, SafeAreaView, Linking, PermissionsAndroid, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import ImagePicker from 'react-native-image-picker';
import ReactNativeModal from 'react-native-modal';
import { openSettings } from 'react-native-permissions';
import ActionSheetCustom from '../../modules/react-native-actionsheet';
import { colors } from '../common/colors';
import styles, { fonts } from '../common/styles';
import TitleHeader from '../common/TitleHeader';
import { openFilePicker, openImagePicker, openCamera, option, optionBold } from '../common/functions';
import Webservice from '../common/Webservice';
import moment from 'moment'
import Const from '../common/Const';
import AsyncStorage from '@react-native-community/async-storage';
import LoginManager from '../manager/LoginManager';
import { Voximplant } from 'react-native-voximplant';
import globalStyles from '../common/globalStyles';
import SimpleToast from 'react-native-simple-toast';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import LoaderEmitter from '../common/LoaderEmitter';

export default function Chat({ route }) {
    const { otherUserId, connectionId, requestId } = route.params
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState([])
    const [conId, setConId] = useState("")
    const [imageUri, setImageUri] = useState("")
    const [file, setFile] = useState(null)
    const [menu, showMenu] = useState(false)
    const navigation = useNavigation();
    const flatList = useRef(null);
    const [name, setName] = useState("")
    const [temp, setTemp] = useState(0)
    const [otherUser, setOtherUser] = useState("")
    const [isblocked, setBlocked] = useState(false)


    let actionSheet

    useEffect(() => {
        console.log(StatusBar.currentHeight)
        setConId(connectionId)
        getChat()
    }, [route.params])


    useFocusEffect(() => {
        global.screen = "Chat"
        return function clean() {
            global.screen = ""
        }
    })

    function getChat() {
        
        Webservice.call('messages/' + otherUserId + "/" + requestId, 'GET', null, true).then(res => {
            setMessages(res.conversations.reverse())
            setName((res.otherUser.name))
            setOtherUser(res.otherUser)
            setBlocked(res.blockStatus)

            console.log(res.conversations)
        }).catch(err => {
            console.log(err)
        })
    }

    function initVoximplant() {
        LoaderEmitter.show()
        AsyncStorage.getItem('user').then(async (user) => {
            const m = await LoginManager.getInstance().loginWithPassword(`${JSON.parse(user)._id}@${Const.Voximplant.appName}.voximplant.com`, '111111');
            LoaderEmitter.hide()
            checkVoximplantLoggedIn()
        })
    }

    async function checkVoximplantLoggedIn() {
        showMenu(false)
        if (isblocked) {
            setTimeout(() => {
                SimpleToast.show('You have been blocked by this celebrity')
            }, 500);
        } else {
            setTimeout(async () => {
                const state = await LoginManager.getInstance().getState()
                console.log("state", state)
                if (state === Voximplant.ClientState.LOGGED_IN) {
                    makeCall()
                } else {
                    initVoximplant()
                }
            }, 500);
        }
    }

    async function makeCall() {
        showMenu(false)
        Keyboard.dismiss()
        setTimeout(async () => {
            console.log('MainScreen: make call: ' + 'test1' + ', isVideo:');
            try {
                if (Platform.OS === 'android') {
                    let permissions = [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];
                    const granted = await PermissionsAndroid.requestMultiple(permissions);
                    const recordAudioGranted = granted['android.permission.RECORD_AUDIO'] === 'granted';
                    const cameraGranted = granted['android.permission.CAMERA'] === 'granted';
                    if (recordAudioGranted) {

                    } else {
                        console.warn('MainScreen: makeCall: record audio permission is not granted');
                        return;
                    }
                }

                navigation.navigate('Call', {
                    callId: null,
                    isVideo: false,
                    isIncoming: false,
                    userName: otherUser.name,
                    callTo: otherUser._id + '@' + Const.Voximplant.appName + '.voximplant.com',
                });
            } catch (e) {
                console.warn('MainScreen: makeCall failed: ' + e);
            }
        }, 1000);
    }

    function confirmDeal() {
        if (isblocked) {
            showMenu(false)
            setTimeout(() => {
                SimpleToast.show('You have been blocked by this celebrity')
            }, 500)
        } else {
            showMenu(false);
            navigation.navigate('DealDetails', { managerId: otherUserId, requestId: requestId })
        }
    }


    function sendMessage(type, uri) {
        let msg = message
        setMessage("")
        let formData = new FormData()
        if (type == 'text') {
            formData.append("message_image", "")
            formData.append("media_type", "T")
            if (msg.length == 0) {
                return
            }
        } else if (type == 'image') {
            console.log((uri))
            let photo = {
                uri: uri,
                type: 'image/jpeg',
                name: 'image.jpg',
            }
            formData.append("message_image", photo)
            formData.append("media_type", "I")
        } else if (type == 'doc') {
            formData.append("message_image", uri)
            formData.append("media_type", "F")
        }
        formData.append("message", msg)
        formData.append("other_user_id", otherUserId)
        formData.append("request_id", requestId)
        formData.append("connection_id", messages.length > 0 ? messages[0].connection_id : "")

        Webservice.call('messages', 'POST', formData, true, type == 'text' ? false : true).then(res => {
            if (res) {
                // getChat()
                let arr = messages
                arr.unshift(res.message)
                setMessages(arr)
                setTemp(temp + 1)
            }
        }).catch(err => console.log(err))

    }

    function showFile(link) {
        Linking.openURL(Const.imageUrl + link)
    }

    function picker() {
        return <ActionSheetCustom
            ref={o => actionSheet = o}
            title={'Send file from'}
            style={{ backgroundColor: 'red' }}
            options={[option('Camera'), option('Gallery'), option('File'), optionBold('Cancel')]}
            cancelButtonIndex={3}
            onPress={(index) => {
                console.log(index)
                if (index == 0) {
                    openCamera((source, name) => {
                        console.log(source)
                        setImageUri(source.uri)
                        setTimeout(() => {
                            sendMessage('image', source.uri)
                        }, 1000);
                    })
                } else if (index == 1) {
                    openImagePicker((source, name) => {
                        console.log(source)
                        setImageUri(source.uri)
                        setTimeout(() => {
                            sendMessage('image', source.uri)
                        }, 1000);
                    })
                } else if (index == 2) {
                    openFilePicker(res => {
                        console.log("Asdasdasd.......", res)
                        setFile(res)
                        setTimeout(() => {
                            sendMessage('doc', res)
                        }, 1000);
                    })
                }
            }}
        />
    }

    return (

        <View style={{ flex: 1 }}>
            <StatusBar backgroundColor={colors.orange} />
            <SafeAreaView style={{ backgroundColor: colors.orange }} />
            <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
                <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? 'padding' : 'none'} keyboardVerticalOffset={getStatusBarHeight()} style={styles.containerOrange}>

                    <TitleHeader
                        title={name}
                        leftIcon={require('../assets/images/back_arrow.png')}
                        rightIcon={require('../assets/images/menu_dots.png')}
                        onLeftPress={() => navigation.goBack()}
                        onRightPress={() => showMenu(true)}
                    />

                    <View style={[styles.contContent, { padding: 0, paddingTop: 20, alignItems: 'center', elevation: 1 }]}>
                        <Text style={{ color: '#94999B', fontFamily: fonts.bold, fontSize: 12, marginBottom: 10 }}>
                            {moment.utc(messages[0]?.createdAt).local().format('DD MMMM, YYYY HH:mm')}
                        </Text>

                        <FlatList
                            data={messages}
                            inverted={true}
                            keyExtractor={(item) => item._id}
                            showsVerticalScrollIndicator={false}
                            style={{ flex: 1, width: '100%' }}
                            renderItem={({ item, index }) => {
                                if (item.other_user_id._id == otherUserId) {
                                    if (item.media_type == 'T')
                                        return (<View style={{ padding: 8, }}>
                                            <View style={{ marginStart: 100, alignSelf: 'flex-end' }}>
                                                <View style={[styles.containerMyMsg]}>
                                                    <Text style={styles.textMyMsg}>{item.message}</Text>
                                                </View>
                                            </View>
                                        </View>
                                        )
                                    else if (item.media_type == 'F') {
                                        return <View style={{ padding: 8, }}>
                                            <View style={{ marginStart: 100, alignSelf: 'flex-end' }}>
                                                <View style={[styles.containerMyMsg, { flexDirection: 'row', alignItems: 'center' }]}>
                                                    <Text style={styles.textMyMsg}>File</Text>
                                                    <TouchableOpacity style={styles.openFileButton}
                                                        onPress={() => showFile(item.message_image)}>
                                                        <Text style={{ fontFamily: fonts.semiBold, color: 'white' }}>Open</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    } else if (item.media_type == 'I') {
                                        return <View style={{ padding: 8, }}>
                                            <View style={{ marginStart: 100, alignSelf: 'flex-end' }}>
                                                <View style={[styles.containerMyMsg]}>
                                                    <Image
                                                        source={{ uri: Const.imageUrl + item.message_image }}
                                                        style={{ height: 200, width: 200 }} />
                                                </View>
                                            </View>
                                        </View>
                                    }
                                } else {
                                    if (item.media_type == 'T')
                                        return <View style={{ padding: 8 }}>
                                            <View style={{ marginEnd: 100, alignSelf: 'flex-start' }}>
                                                <View style={[styles.containerOtherMsg]}>
                                                    <Text style={styles.textOtherMsg}>{item.message}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    else if (item.media_type == 'F') {
                                        return <View style={{ padding: 8, }}>
                                            <View style={{ marginEnd: 100, alignSelf: 'flex-start' }}>
                                                <View style={[styles.containerOtherMsg, { flexDirection: 'row', alignItems: 'center' }]}>
                                                    <Text style={styles.textOtherMsg}>File</Text>
                                                    <TouchableOpacity style={[styles.openFileButton, { borderColor: 'black' }]}
                                                        onPress={() => showFile(item.message_image)}>
                                                        <Text style={{ fontFamily: fonts.semiBold }}>Open</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    } else if (item.media_type == 'I') {
                                        return <View style={{ padding: 8, }}>
                                            <View style={{ marginEnd: 100, alignSelf: 'flex-start' }}>
                                                <View style={[styles.containerOtherMsg]}>
                                                    <Image
                                                        source={{ uri: Const.imageUrl + item.message_image }}
                                                        style={{ height: 200, width: 200 }} />
                                                </View>
                                            </View>
                                        </View>
                                    }
                                }
                            }}
                        />
                        {picker()}

                    </View>

                    {isblocked ? <View style={{ backgroundColor: 'white', padding: 20, alignItems: 'center' }}>
                        <Text style={{ fontFamily: fonts.bold, color: 'red', textAlign: 'center' }}>You cannot reply to this conversation as you have been blocked by this celebrity.</Text>
                    </View>
                        :
                        <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F8F8', paddingVertical: 8 }, globalStyles.darkShadow]}>
                            {/* <TouchableOpacity style={{ padding: 10 }} onPress={() => actionSheet.show()}> */}
                            <TouchableOpacity style={{ padding: 10 }} onPress={() => actionSheet.show()}>
                                <Image source={require('../assets/images/attachment.png')} style={[styles.iconSmall]} />
                            </TouchableOpacity>
                            <TextInput
                                placeholder={"Write here..."}
                                multiline={true}
                                value={message}
                                onChangeText={setMessage}
                                // onSubmitEditing={() => sendMessage('text')}
                                maxLength={200}
                                style={[{ flex: 1, fontFamily: fonts.light }]}
                            />
                            <TouchableOpacity onPress={() => sendMessage('text')} style={{ padding: 10 }}>
                                <Image source={require('../assets/images/send-message.png')} style={[styles.iconSmall]} />
                            </TouchableOpacity>
                        </View>
                    }
                    <ReactNativeModal
                        isVisible={menu}
                        onBackdropPress={() => { showMenu(false) }}
                        onBackButtonPress={() => { showMenu(false) }}
                        useNativeDriver={true}
                        animationIn={'fadeIn'}
                        animationOut={'fadeOut'}
                    >
                        <View style={{ flex: 1, alignSelf: 'flex-end', marginTop: Platform.OS == 'android' ? 0 : 20 }}>
                            <Image source={require('../assets/images/menu_dots.png')} style={[styles.icon20, { alignSelf: 'flex-end' }]} />
                            <TouchableOpacity onPress={checkVoximplantLoggedIn} style={styles.chatButton}>
                                <Image source={require('../assets/images/phone_orange.png')} style={[styles.iconMini, { position: 'absolute', left: 10 }]} />
                                <Text style={{ color: colors.orange, fontSize: 16, fontFamily: fonts.bold }}>Call</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={confirmDeal}
                                style={[styles.buttonOrange, { width: 140, margin: 0, marginTop: 10, height: 50, borderRadius: 12 }]}>
                                <Text style={{ color: 'white', fontSize: 16, fontFamily: fonts.bold }}>Confirm Deal</Text>
                            </TouchableOpacity>
                        </View>
                    </ReactNativeModal>

                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    )
}