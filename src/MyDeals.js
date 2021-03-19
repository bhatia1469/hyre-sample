import React, { useState, useEffect } from 'react';
import { View, Image, Text, StatusBar, TouchableOpacity, FlatList, Dimensions, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles, { fonts } from '../common/styles';
import { colors } from '../common/colors';
import Divider from '../common/Divider';
import globalStyles from '../common/globalStyles';
import { BoxShadow } from 'react-native-shadow';
import SimpleToast from 'react-native-simple-toast';

export default function MyDeals() {
    const [data, setData] = useState("")
    const navigation = useNavigation();

    useEffect(() => {
        Webservice.call("deals/user/deals", "GET", null, true).then(result => {
            if (result) {
                let arr = []
                arr = arr.concat(
                    result.data.new_deals,
                    result.data.accepted_deals,
                    result.data.viewed_deals,
                    result.data.declined_deals
                )
                console.log(JSON.stringify(arr))
                setData(arr)
            }
        }).catch(err => {
            console.log("err=>", err)
            SimpleToast.show(err.message)
        })
    }, [])

    function showDetails(id, manId) {
        navigation.navigate('DealDetails', { requestId: id, managerId: manId })
    }

    const shadowOpt = {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        border: 30,
        color: "#000",
        radius: 50,
        opacity: 0.3,
        style: { flex: 1, top: -100 }
    }

    return (

        <View style={{ flex: 1 }}>
            <StatusBar backgroundColor={colors.orange} />
            <SafeAreaView style={{ backgroundColor: colors.orange }} />
            <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>

                <View style={styles.container}>
                    <View style={{ backgroundColor: colors.orange, position: 'absolute', width: '100%' }}>
                        <TouchableOpacity style={{ padding: 20 }} onPress={() => navigation.goBack()}>
                            <Image style={globalStyles.iconSmall} source={require('../assets/images/back_arrow.png')} />
                        </TouchableOpacity>
                        <Image style={{ alignSelf: 'center', height: 90, marginBottom: 150, resizeMode: 'contain' }} source={require('../assets/images/logo.png')} />
                    </View>
                    <View style={[styles.contContent, globalStyles.darkShadow, { marginHorizontal: 20, marginTop: 200, elevation: 8 }]}>
                        <Text style={{ fontFamily: fonts.bold, fontSize: 20, alignSelf: 'center' }}>My Deals</Text>
                        <FlatList
                            data={data}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item, index }) => {
                                return (
                                    <TouchableOpacity onPress={() => showDetails(item.request_id._id, item.manager_id)} style={{ width: '100%', alignItems: 'flex-start', marginTop: 20 }}>
                                        <View style={styles.rowCenter}>
                                            <Text style={{ fontFamily: fonts.bold, fontSize: 20, width: 140 }}>{item.request_id.appointment_sub_category.name}</Text>
                                            {item.status == 'PEN' ?
                                                <View style={{
                                                    borderRadius: 16, borderColor: colors.orange,
                                                    borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2
                                                }}>
                                                    <Text style={{ fontFamily: fonts.regular, color: colors.orange }}>
                                                        <Image style={globalStyles.iconMicro} source={require('../assets/images/refresh_orange.png')} />
                                                        {"  "}In Progress</Text>
                                                </View> : null}
                                            {item.status == 'ACC' ?
                                                <View style={{
                                                    borderRadius: 16, backgroundColor: '#50C98E',
                                                    paddingHorizontal: 8, paddingVertical: 4,
                                                }}>
                                                    <Text style={{ fontFamily: fonts.regular, color: 'white' }}>
                                                        <Image style={globalStyles.iconMicro} source={require('../assets/images/check_circle.png')} />
                                                        {"  "}Confirmed</Text>
                                                </View> : null}
                                            {item.status == 'REJ' ?
                                                <View style={{
                                                    borderRadius: 16, paddingHorizontal: 8, borderWidth: 1, borderColor: 'red', paddingVertical: 4,
                                                }}>
                                                    <Text style={{ fontFamily: fonts.regular, color: 'red' }}>
                                                        <Image style={globalStyles.iconMicro} source={require('../assets/images/cross_red.png')} />
                                                        {"  "}Rejected</Text>
                                                </View> : null}
                                        </View>
                                        <Divider color={"#e5e5e5"} style={{ marginTop: 20, width: 100, height: 2 }} />
                                        <View style={styles.rowCenter}>
                                            <Image style={globalStyles.iconMini} source={require('../assets/images/calendar.png')} />
                                            <Text style={{ color: '#94999B', marginVertical: 10, marginStart: 4 }}>{item.request_id.date}</Text>
                                        </View>
                                        <View style={styles.rowCenter}>
                                            <Image style={globalStyles.iconMini} source={require('../assets/images/location.png')} />
                                            <Text style={{ color: '#94999B', marginStart: 4 }}>
                                                {item.request_id.location}</Text>
                                        </View>

                                    </TouchableOpacity>
                                )
                            }}
                        />
                    </View>
                </View>
            </SafeAreaView>
        </View>
    )
}