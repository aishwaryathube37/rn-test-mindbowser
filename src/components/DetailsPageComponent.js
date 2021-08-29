import React from 'react';
import { ScrollView, StyleSheet, Text, Image, View, TouchableOpacity, ToastAndroid } from 'react-native';
import { COLORS } from '../utils/Colors';
import Icon from 'react-native-vector-icons/FontAwesome';
import { CONST } from '../utils/Constants';
import { connect } from 'react-redux';
import database from '@react-native-firebase/database';

const mapStateToProps = (state) => ({
  data: state.serviceReducer.data,
  favouritesData: state.serviceReducer.favouriteData
});

export class DetailsPageComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      itemSelected: {},
    }
  }

  componentDidMount() {
    this.setState({
      itemSelected: this.props.route.params.selectedItem,
      isChecked: this.props.route.params.isChecked,
    })
  }

  //Save Record to firebase database
  addRecordstoFirebase() {
    const newReference = database().ref('/favouritesData').push();
    newReference
      .set({
        id: this.state.itemSelected.id,
      })
      .then(() => console.log('added'));
    this.setState({ isChecked: true })
  }

  //Function to call onclick of favoiurites
  onClickFavourite = () => {
    if (this.state.isChecked) {
      if (Platform.OS === 'android') {
        ToastAndroid.show(CONST.alread_added, ToastAndroid.SHORT)
      } else {
        AlertIOS.alert(CONST.alread_added);
      }
    } else {
      if (Object.keys(this.props.favouritesData).length >= 5) {
        if (Platform.OS === 'android') {
          ToastAndroid.show(CONST.fav_limit, ToastAndroid.SHORT)
        } else {
          AlertIOS.alert(CONST.fav_limit);
        }
      } else {
        this.addRecordstoFirebase()
      }
    }
  }

  //Render UI of the application
  render() {
    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <TouchableOpacity style={{ alignSelf: 'flex-end' }} onPress={() => this.onClickFavourite()}>
            {this.state.isChecked ?
              <Icon name="star" size={22} color={COLORS.yellow}></Icon> : <Icon name="star-o" size={22} color={COLORS.yellow}></Icon>
            }
          </TouchableOpacity>
          <Text style={styles.title}>{this.state.itemSelected.username}</Text>
          <Text style={styles.title}>{this.state.itemSelected.title}</Text>
          {
            this.state.itemSelected.user ?
              <Image
                source={{ uri: this.state.itemSelected.user.avatar_url }}
                style={styles.image}
              /> :
              <Image
                source={require('../images/noimage.jpg')}
                style={styles.image}
              />
          }
          <Text style={styles.text}>{this.state.itemSelected.user && this.state.itemSelected.user.description}</Text>
        </View>
      </ScrollView>
    );
  }
}

//Stylesheets 
const styles = StyleSheet.create({
  container: {
    shadowColor: COLORS.gray,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.4,
    elevation: 8,
    backgroundColor: COLORS.background,
    padding: 20,
    borderRadius: 10,
    flex: 1,
    borderWidth: 1,
    margin: 10,
    alignItems: 'center'
  },
  scrollView: {
    flex: 1
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    color: COLORS.theme,
    fontWeight: 'bold',
    marginVertical: 10
  },
  text: {
    color: COLORS.black,
    fontSize: 15,
    marginTop: 8
  },
  image: {
    marginTop: 15,
    width: 150,
    height: 150,
    marginVertical: 5
  }
});

export default sts = connect(mapStateToProps, null)(DetailsPageComponent)
