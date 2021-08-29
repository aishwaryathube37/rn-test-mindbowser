/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

 import React from 'react';
 import { NavigationContainer } from '@react-navigation/native';
 import { createStackNavigator } from '@react-navigation/stack';
 import DetailsPageComponent from './src/components/DetailsPageComponent';
 import { COLORS } from './src/utils/Colors';
 import { Provider } from 'react-redux';
 import store from './src/Reducers/Index';
 import HomePageComponent from './src/Actions/ApiCallAction';

 const Stack = createStackNavigator();
 const AppStack = () => (
   <Stack.Navigator
     initialRouteName="Home"
     headerMode="screen"
     screenOptions={{
       headerTintColor: COLORS.white,
       headerStyle: { backgroundColor: COLORS.theme },
     }}
   >
     <Stack.Screen
       name="Home"
       component={HomePageComponent}
       options={{
         title: 'Home',
       }}
     />
     <Stack.Screen
       name="Details"
       component={DetailsPageComponent}
       options={{
         title: 'Details',
       }}
     />
   </Stack.Navigator>
 );

 
 
 export default class App extends React.Component {
   render() {
     return  <Provider store={store}>
       <NavigationContainer>
       < AppStack/>
       </NavigationContainer>
 </Provider>
   }
 }
 