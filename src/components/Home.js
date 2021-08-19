import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import React from 'react';
import NetInfo from '@react-native-community/netinfo'
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator, ToastAndroid, Platform, AlertIOS, TextInput, Alert } from 'react-native';
import database from '@react-native-firebase/database';
import { CONST } from '../utils/Constants'
import { COLORS } from '../utils/Colors'
let unsubscribe = null;

class Home extends React.Component {

  //States are initialized in constructor
  constructor(props) {
    super(props)
    this.state = {
      connection_Status: "",
      records: [],
      filteredData: [],
      favouritesData: [],
      isLoading: false,
      searchText: "",
    }
  }

  //Function to get the records using api call
  getRecords = async () => {
    this.setState({
      isLoading: true
    })

    axios.get(CONST.api, {
      params: {
        api_key: CONST.api_key,
        limit: CONST.limit,
        offset: CONST.offset,
        rating: CONST.rating,
      }
    }).then((response) => {
      this.saveRecords(response.data)
      console.log(response.data)
      this.setState({
        isLoading: false
      })
    }).catch((error) => {
      console.log(error);
      this.setState({
        isLoading: false
      })
      if (Platform.OS === 'android') {
        ToastAndroid.show(error.toString(), ToastAndroid.LONG)
      } else {
        AlertIOS.alert(error.toString());
      }
    })
  };

  //Network connectivity check and call to function
  componentDidMount() {
    unsubscribe = NetInfo.addEventListener(state => {
      console.log("Connection type", state.type);
      console.log("Is connected?", state.isConnected);
      if (state.isConnected == true) {
        this.getRecords()
      }
      else {
        Alert.alert(
          CONST.title_alert,
          CONST.message,
          [
            { text: CONST.ok, onPress: () => console.log("OK Pressed") }
          ]
        );
      }
    });
  }

  //Save records from api call response to state 
  saveRecords(response) {
    this.setState({
      records: response.data,
      filteredData: response.data
    }, () => {
      this.getFavouritesData()
    })
  }

  //Display loader 
  showLoader = (loading) => {
    if (loading) {
      return (
        <View style={[styles.loading, { opacity: loading ? 1.0 : 0.0, backgroundColor: COLORS.transperent }]}>
          <ActivityIndicator size='large' animating={true} color={COLORS.white} />
        </View>
      );

    }
  }

  //Get favourites records from firebase database
  getFavouritesData() {
    database()
      .ref('/favouritesData')
      .on('value', snapshot => {
        let newFavouriteArray = [];
        snapshot.forEach((childSnapshot) => {
          childSnapshot.forEach((childSnap) => {
            if (childSnap.val() != null) {
              newFavouriteArray.push(childSnap.val())
            }
          });
        });
        let arrayIds = []
        this.state.records.forEach(element => {
          arrayIds.push(element.id)
        });

        this.setState({
          favouritesData: newFavouriteArray.filter((item) => {
            return arrayIds.includes(item) && item
          }),
          isLoading: false,
        }, () => {
        })

      });
  }

  //Render flatlist data
  renderItem = (item) => (
    <TouchableOpacity onPress={() => this.props.navigation.navigate('Details', {
      selectedItem: item,
      isChecked: this.isChecked(item),
      favourites: this.state.favouritesData
    })}>
      <View style={styles.container}>
        <View style={styles.row}>
          <View style={styles.avatar}>
            {
              item.user ?
                <Image source={{ uri: item.user && item.user.avatar_url }} style={styles.image} /> :
                <Image source={require('../images/noimage.jpg')} style={styles.image} />
            }
          </View>
          <View style={styles.view}>
            {(item.user && item.user.username) ?
              <Text style={styles.name}>{item.username}</Text> :
              <Text style={styles.name}>{CONST.no_name}</Text>
            }
            <Text style={styles.title}>{item.title}</Text>
            {
              (item.user && item.user.description) ?
                <Text numberOfLines={3} ellipsizeMode='tail' style={styles.description}>{item.user && item.user.description}</Text> :
                <Text numberOfLines={3} ellipsizeMode='tail' style={styles.description}>{CONST.no_description}</Text>
            }
          </View>
          <View style={styles.favourites}>
            <TouchableOpacity onPress={() => this.onClickFavourite(item)}>
              {this.isChecked(item) ?
                <Icon name="star" size={22} color={COLORS.yellow}></Icon> : <Icon name="star-o" size={22} color={COLORS.yellow}></Icon>
              }
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  //check weather the item marked as a favorite or not
  isChecked = (item) => {
    return this.state.favouritesData && this.state.favouritesData.includes(item.id)
  }

  //Function to call onclick of favoiurites
  onClickFavourite = (item) => {
    if (this.isChecked(item)) {
      if (Platform.OS === 'android') {
        ToastAndroid.show(CONST.alread_added, ToastAndroid.SHORT)
      } else {
        AlertIOS.alert(CONST.alread_added);
      }
    } else {
      if (this.state.favouritesData.length >= 5) {
        if (Platform.OS === 'android') {
          ToastAndroid.show(CONST.fav_limit, ToastAndroid.LONG)
        } else {
          AlertIOS.alert(CONST.fav_limit);
        }
      } else {
        this.addRecordstoFirebase(item)
      }
    }
  }

  //Save Records to firebase database
  addRecordstoFirebase(item) {
    const newReference = database().ref('/favouritesData').push();
    newReference
      .set({
        id: item.id,
      })
      .then(() => console.log('added'));
  }

  //Set text to the search view
  searchData(text) {
    this.setState({
      searchText: text
    })
  }

  //Filter data according to search text 
  componentDidUpdate(prevProps, prevState) {
    if (prevState.searchText != this.state.searchText) {
      var filteredData = this.state.filteredData.filter((item) => {
        return item.title.toLowerCase().includes(this.state.searchText.toLowerCase())
          && item
      })
      this.setState({
        records: filteredData
      })
    }
  }

  //Render UI of the application
  render() {
    return (
      <View style={styles.main}>
        {this.showLoader(this.state.isLoading)}
        <TextInput
          placeholder={CONST.search_placeholder}
          placeholderTextColor="#000"
          value={this.state.searchText}
          style={styles.input}
          onChangeText={(text) => { this.searchData(text) }}
        />
        <FlatList
          data={this.state.records}
          renderItem={({ item, index }) =>
            this.renderItem(item)
          }
          keyExtractor={item => item.id}
        />
      </View>
    );
  }

  componentWillUnmount() {
    // Unsubscribe
    if (unsubscribe != null) unsubscribe()
  }
}

//Stylesheets
const styles = StyleSheet.create({
  container: {
    shadowColor: '#ccc',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.4,
    elevation: 8,
    backgroundColor: '#d0efff',
    padding: 20,
    borderRadius: 10,
    flex: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10
  },
  main: {
    flex: 1
  },
  row: {
    flexDirection: 'row',
  },
  avatar: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  view: {
    flex: 7,
    flexDirection: 'column',
    marginLeft: 25
  },
  input: {
    height: 40,
    margin: 12,
    padding: 10,
    borderWidth: 1,
    color: COLORS.black,
    borderRadius: 20
  },

  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4
  },
  image:
  {
    width: 65,
    height: 65,
    borderRadius: 65,
    marginVertical: 5
  },
  name: {
    color: COLORS.title,
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10
  },
  title: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: 'bold'
  },
  favourites: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  description: {
    color: COLORS.black,
    fontSize: 15,
    marginTop: 8
  }
});

export default Home;