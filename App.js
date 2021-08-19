/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

 import React from 'react';
 import Home from './src/components/Home';
 import { NavigationContainer } from '@react-navigation/native';
 import { createStackNavigator } from '@react-navigation/stack';
 import Details from './src/components/Details';
import { COLORS } from './src/utils/Colors';
 
 
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
       component={Home}
       options={{
         title: 'Home',
       }}
     />
     <Stack.Screen
       name="Details"
       component={Details}
       options={{
         title: 'Details',
       }}
     />
   </Stack.Navigator>
 );
 
 export default class App extends React.Component {
   render() {
     return <NavigationContainer>
       <AppStack />
     </NavigationContainer>;
   }
 }
 