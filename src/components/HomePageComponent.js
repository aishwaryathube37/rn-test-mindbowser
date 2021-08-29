import React, { Component } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator, ToastAndroid, Platform, AlertIOS, TextInput, Alert } from 'react-native';
import { CONST } from '../utils/Constants'
import { COLORS } from '../utils/Colors'
import Icon from 'react-native-vector-icons/FontAwesome';
import database from '@react-native-firebase/database';

export default class HomePageComponent extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dataToDisplay: [],
            searchText: ''
        }
    }

    componentDidMount() {
        this.props.callService()
    }

    //check weather the item marked as a favorite or not
    isChecked = (item) => {
        return (Object.keys(this.props.favouritesData).length != 0) && this.props.favouritesData.includes(item.id)
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
            if (this.props.favouritesData.length >= 5) {
                if (Platform.OS === 'android') {
                    ToastAndroid.show(CONST.fav_limit, ToastAndroid.SHORT)
                } else {
                    AlertIOS.alert(CONST.fav_limit);
                }
            } else {
                this.addRecordstoFirebase(item)
            }
        }
    }

    //Receive props from redux store
    componentWillReceiveProps(nextProps) {
        if (nextProps.data.data != null) {
            this.setState({
                dataToDisplay: nextProps.data.data
            });
        }
    }

    //Filter data according to search text 
    componentDidUpdate(prevProps, prevState) {
        if (prevState.searchText != this.state.searchText) {
            let filteredData = Object.keys(this.props.fData).length != 0 && this.props.fData.data.filter((item) => {
                return item.title.toLowerCase().includes(this.state.searchText.toLowerCase())
                    && item
            })
            this.setState({
                dataToDisplay: filteredData
            })
        }
    }

    //Set text to the search view
    searchData(text) {
        this.setState({
            searchText: text
        })
    }

    //Save Record to firebase database
    addRecordstoFirebase(item) {
        const newReference = database().ref('/favouritesData').push();
        newReference
            .set({
                id: item.id,
            })
            .then(() => console.log('added'));
        this.setState({ isChecked: true })
    }

    //Function toDisplay loader 
    showLoader = (loading) => {
        if (loading) {
            return (
                <View style={[styles.loading, { opacity: loading ? 1.0 : 0.0, backgroundColor: COLORS.transperent }]}>
                    <ActivityIndicator size='large' animating={true} color={COLORS.white} />
                </View>
            );

        }
    }

    //Render flatlist data
    renderItem = (item) => (
        <TouchableOpacity onPress={() => this.props.navigation.navigate('Details', {
            selectedItem: item,
            isChecked: this.isChecked(item),
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


    render() {
        return (
            <View style={styles.main}>
                {this.showLoader(this.props.isLoading)}
                <TextInput
                    placeholder={CONST.search_placeholder}
                    placeholderTextColor="#000"
                    value={this.state.searchText}
                    style={styles.input}
                    onChangeText={(text) => { this.searchData(text) }}
                />
                <FlatList
                    data={this.state.dataToDisplay}
                    renderItem={({ item, index }) =>
                        this.renderItem(item)
                    }
                    keyExtractor={item => item.id}
                />
            </View>
        );
    }
}

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
