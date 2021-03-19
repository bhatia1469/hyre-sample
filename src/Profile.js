import React, { useState, useEffect } from 'react';
import { View, Image, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles, { fonts } from '../common/styles';
import { colors } from '../common/colors';
import Divider from '../common/Divider';
import globalStyles from '../common/globalStyles';
import { ActionSheetCustom } from '../../modules/react-native-actionsheet/lib';
import { option, optionBold, openCamera, openImagePicker } from '../common/functions';
import Webservice from '../common/Webservice';
import AsyncStorage from '@react-native-community/async-storage';

export default function Profile({ route }) {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [number, setNumber] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [profilePictureName, setProfilePictureName] = useState("Add Profile Picture")
    const navigation = useNavigation();
    const params = route.params
    const [details, setDetails] = useState()
    const [image, setImage] = useState("")

    const onAddId = () => {
        navigation.navigate('ScanCard', { from: "update" })
    }

    const onUpdateProfile = () => {

        let formBody = new FormData()
        if (image != '') {
            let photo = {
                uri: image.uri,
                type: 'image/jpeg',
                name: 'photo.jpg',
            };
            console.log(photo)
            formBody.append('profile_image', photo)
        }
        formBody.append("name", name.trim())
        formBody.append("phone_number", number)
        formBody.append("email", email)
        // formBody.append("password", password)
        // formBody.append("user_type", "C")

        Webservice.call("users", "PUT", formBody, true).then(result => {
            if (result) {
                console.log(result)
                AsyncStorage.setItem("user", JSON.stringify(result.user)).then(() => {
                    navigation.goBack()
                })
            }
        }).catch(err => {
            console.log("err=>", err)
            SimpleToast.show(err.message)
        })
    }


    function validate() {
        if (name.length == 0) {
            SimpleToast.show("Name field cannot be empty")
        } else if (email.length == 0) {
            SimpleToast.show("Email field cannot be empty")
        } else if (!Patterns.email.test(email)) {
            SimpleToast.show("Entered email is not valid")
        } else if (number.length == 0) {
            SimpleToast.show("Number field cannot be empty")
        } else {
            onUpdateProfile()
        }
    }

    let actionSheet

    const onAddProfilePicture = () => {
        actionSheet.show()
    }


    useEffect(() => {
        AsyncStorage.getItem("user").then((user) => {
            setDetails(JSON.parse(user))
            setNumber(JSON.parse(user).phone_number)
            setName(JSON.parse(user)?.name)
            setEmail(JSON.parse(user)?.email)
        })
    }, [])


    function picker() {
        return <ActionSheetCustom
            ref={o => actionSheet = o}
            title={'Send file from'}
            style={{ backgroundColor: 'red' }}
            options={[option('Camera'), option('Gallery'), optionBold('Cancel')]}
            cancelButtonIndex={2}
            onPress={(index) => {
                console.log(index)
                if (index == 0) {
                    openCamera((uri, name) => {
                        console.log(uri)
                        setImage(uri)
                        setProfilePictureName(name)
                    })
                } else if (index == 1) {
                    openImagePicker((uri, name) => {
                        setImage(uri)
                        console.log(uri)
                        setProfilePictureName(name)
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
                <View style={{ backgroundColor: colors.orange, width: '100%' }}>
                    <TouchableOpacity style={{ padding: 20 }} onPress={() => navigation.goBack()}>
                        <Image style={globalStyles.iconSmall} source={require('../assets/images/back_arrow.png')} />
                    </TouchableOpacity>
                    <Image style={{ alignSelf: 'center', height: 100, marginBottom: 60, resizeMode: 'contain' }} source={require('../assets/images/logo.png')} />
                </View>
                <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: 'white', paddingBottom: 40 }}>
                    <View style={{ flex: 1, alignItems: 'center' }}>

                        <View style={{ backgroundColor: 'white', paddingHorizontal: 20, flex: 1, width: '100%' }}>
                            <View style={[styles.loginInput, { marginTop: 20 }]}>
                                <Image style={styles.icon20} source={require('../assets/images/user_circle.png')} />
                                <TextInput
                                    placeholder="Full name"
                                    style={styles.signUpInput}
                                    value={name}
                                    placeholderTextColor={"#94999B"}
                                    onChangeText={setName}
                                    maxLength={20}
                                />
                            </View>
                            <Divider color={"#e5e5e5"} />
                            <View style={[styles.loginInput, { marginTop: 20 }]}>
                                <Image style={styles.icon20} source={require('../assets/images/mail.png')} />
                                <TextInput
                                    placeholder="Email address"
                                    keyboardType={"email-address"}
                                    placeholderTextColor={"#94999B"}
                                    value={email}
                                    style={styles.signUpInput}
                                    onChangeText={setEmail}
                                    maxLength={20}
                                />
                            </View>
                            <Divider color={"#e5e5e5"} />
                            <View style={[styles.loginInput, { marginTop: 20 }]}>
                                <Image style={styles.icon20} source={require('../assets/images/phone.png')} />
                                <TextInput
                                    placeholder="Phone number"
                                    keyboardType={"number-pad"}
                                    placeholderTextColor={"#94999B"}
                                    value={number}
                                    style={styles.signUpInput}
                                    onChangeText={setNumber}
                                    maxLength={20}
                                />
                            </View>
                            <Divider color={"#e5e5e5"} />
                            {/* <View style={[styles.loginInput, { marginTop: 20 }]}>
                                <Image style={styles.icon20} source={require('../assets/images/lock_light.png')} />
                                <TextInput
                                    placeholder="Password"
                                    secureTextEntry={true}
                                    style={styles.signUpInput}
                                    value={password}
                                    placeholderTextColor={"#94999B"}
                                    onChangeText={setPassword}
                                    maxLength={20}
                                />
                            </View>
                            <Divider color={"#e5e5e5"} />
                            <View style={[styles.loginInput, { marginTop: 20 }]}>
                                <Image style={styles.icon20} source={require('../assets/images/lock_light.png')} />
                                <TextInput
                                    placeholder="Confirm password"
                                    secureTextEntry={true}
                                    placeholderTextColor={"#94999B"}
                                    value={confirmPassword}
                                    style={styles.signUpInput}
                                    onChangeText={setConfirmPassword}
                                    maxLength={20}
                                />
                            </View>
                            <Divider color={"#e5e5e5"} /> */}
                            <TouchableOpacity onPress={onAddProfilePicture} style={[styles.loginInput, { marginTop: 20, height: 50 }]}>
                                <Image style={styles.icon20} source={require('../assets/images/icon_id.png')} />
                                <Text style={[styles.signUpInput, { color: '#94999B', height: null }]}>{details?.profile_image}</Text>
                                <Image style={styles.icon20} source={require('../assets/images/forw_arrow_black.png')} />
                            </TouchableOpacity>
                            <Divider color={"#e5e5e5"} />
                        </View>

                        <View style={{ padding: 20, width: '100%', alignItems: 'center' }}>
                            <TouchableOpacity style={[styles.buttonOrange, { height: 50, width: '100%', margin: 20 }]} onPress={validate}>
                                <Text style={styles.buttonOrangeBoldText}>Update Profile</Text>
                            </TouchableOpacity>
                        </View>
                        {/* <TouchableOpacity onPress={onLogin} style={{ marginTop: 40 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
                            <Text style={[{ color: colors.textLight, fontFamily: fonts.light, }]}>Already have an account?{" "}</Text>
                            <Text style={[{ fontFamily: fonts.bold, color: colors.darkGray }]}>Sign In</Text>
                        </View>
                    </TouchableOpacity> */}
                        {picker()}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}