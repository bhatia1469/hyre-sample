import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import {
  createDrawerNavigator, DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';

import Login from './src/screens/Login';
import Splash from './src/screens/Splash';
import SignUp from './src/screens/SignUp';
import Messages from './src/screens/Messages';
import Chat from './src/screens/Chat';
import HyreDrawer from './src/common/HyreDrawer';
import PaymentCards from './src/screens/PaymentCards';
import RequestStatus from './src/screens/RequestStatus';
import ScanCard from './src/screens/ScanCard';
import LikeToInteract from './src/screens/LikeToInteract';
import ChooseCategoryVirtual from './src/screens/ChooseCategoryVirtual';
import ChooseCategoryLive from './src/screens/ChooseCategoryLive';
import ChooseEventType from './src/screens/ChooseEventType';
import DealDetails from './src/screens/DealDetails';
import ApplyDeal from './src/screens/ApplyDeal';
import DealStatus from './src/screens/DealStatus';
import MyEvents from './src/screens/MyEvents';
import Profile from './src/screens/Profile';
import Settings from './src/screens/Settings';
import Privacy from './src/screens/Privacy';
import UpdateCard from './src/screens/UpdateCard';
import MyDeals from './src/screens/MyDeals';
import Loader from './src/common/Loader';
import { EventRegister } from 'react-native-event-listeners';
import CallScreen from './src/screens/CallScreen'
import IncomingCallScreen from './src/screens/IncomingCallScreen'
import { navigationRef } from './src/routes/NavigationService';
import ForgotPassword from './src/screens/ForgotPassword';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-community/async-storage';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

export default function App() {
  const [loading, setLoading] = useState(false)

  EventRegister.addEventListener('loader', (value) => {
    setLoading(value)
  })

  useEffect(() => {
    AsyncStorage.getItem("token").then(token => {
      global.token = token
      console.log(">")
    })
    global.deviceId = DeviceInfo.getUniqueId()
    // alert(global.deviceId)
  }, [])

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName={"Splash"} screenOptions={{ headerShown: false }}>
        <Stack.Screen name='Splash' component={Splash} />
        <Stack.Screen name='Login' component={Login} initialParams={{ from: 'Start' }} />
        <Stack.Screen name='SignUp' component={SignUp} />
        <Stack.Screen name='Call' component={CallScreen} />
        <Stack.Screen name='IncomingCall' component={IncomingCallScreen} />
        <Stack.Screen name='ForgotPassword' component={ForgotPassword} />
        <Stack.Screen name='ScanCard' component={ScanCard} />
        <Stack.Screen name='DrawerContainer' component={DrawerContainer} />
      </Stack.Navigator>
      <Loader visible={loading} />
    </NavigationContainer>
  )
};


function DrawerContainer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <HyreDrawer />}>
      <Drawer.Screen name='AppContainer' component={AppContainer} />
    </Drawer.Navigator>
  )
}

function AppContainer() {
  return (
    <Stack.Navigator initialRouteName="LikeToInteract" screenOptions={{ headerShown: false }}>
      <Stack.Screen name='LikeToInteract' component={LikeToInteract} />
      <Drawer.Screen name='ChooseCategoryLive' component={ChooseCategoryLive} />
      <Drawer.Screen name='ChooseCategoryVirtual' component={ChooseCategoryVirtual} />
      <Drawer.Screen name='ChooseEventType' component={ChooseEventType} />
      <Drawer.Screen name='DealDetails' component={DealDetails} />
      <Drawer.Screen name='DealStatus' component={DealStatus} />
      <Stack.Screen name='Messages' component={Messages} />
      <Stack.Screen name='ApplyDeal' component={ApplyDeal} />
      <Stack.Screen name='Chat' component={Chat} />
      <Stack.Screen name='MyEvents' component={MyEvents} />
      <Stack.Screen name='MyDeals' component={MyDeals} />
      <Stack.Screen name='PaymentCards' component={PaymentCards} />
      <Stack.Screen name='RequestStatus' component={RequestStatus} />
      <Stack.Screen name='Profile' component={Profile} />
      <Stack.Screen name='Settings' component={Settings} />
      <Stack.Screen name='Privacy' component={Privacy} />
      <Stack.Screen name='UpdateCard' component={UpdateCard} />
      <Stack.Screen name='Call' component={CallScreen} />
      <Stack.Screen name='IncomingCall' component={IncomingCallScreen} />

      <Stack.Screen name='Login' component={Login} />
      <Stack.Screen name='SignUp' component={SignUp} />
      <Stack.Screen name='ScanCard' component={ScanCard} />
    </Stack.Navigator>
  )
}