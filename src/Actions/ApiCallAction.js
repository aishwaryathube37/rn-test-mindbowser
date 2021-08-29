import * as ActionTypes from './ActionTypes';
import { connect } from 'react-redux';
import axios from 'axios';
import HomePageComponent from '../components/HomePageComponent';
import { CONST } from '../utils/Constants'
import database from '@react-native-firebase/database';

const mapStateToProps = (state) => ({
    isLoading: state.serviceReducer.isLoading,
    error: state.serviceReducer.error,
    data: state.serviceReducer.data,
    fData: state.serviceReducer.fData,
    favouritesData: state.serviceReducer.favouriteData
});

const mapDispatchToProps = (dispatch) => ({
    callService: () => dispatch(callWebservice()),
    getFavouritesRecord: () => dispatch(getFavouritesData())
})

export const callWebservice = () => {
    return dispatch => {
        dispatch(serviceActionPending())
        axios.get(CONST.api, {
            params: {
              api_key: CONST.api_key,
              limit: CONST.limit,
              offset: CONST.offset,
              rating: CONST.rating,
            }
          })
        .then(response => {
            getFavouritesData(response.data,dispatch),
            dispatch(serviceActionSuccess(response.data))
            dispatch(fData(response.data))
        })
        .catch(error => {
            dispatch(serviceActionError(error))
        });
    }
}

//Get favourites records from firebase database
export const getFavouritesData = (response,dispatch) => {
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
        response.data.forEach(element => {
          arrayIds.push(element.id)
        });

        let favouritesDataNew = newFavouriteArray.filter((item) => {
            return arrayIds.includes(item) && item
          })
        dispatch(favouritesData(favouritesDataNew))
      });
}


export const serviceActionPending = () => ({
    type: ActionTypes.SERVICE_PENDING
})

export const serviceActionError = (error) => ({
    type: ActionTypes.SERVICE_ERROR,
    error: error
})

export const serviceActionSuccess = (data) => ({
    type: ActionTypes.SERVICE_SUCCESS,
    data: data
})
export const fData = (fData) => ({
  type: ActionTypes.F_DATA,
  fData: fData
})
export const favouritesData = (favouriteData) => ({
    type: ActionTypes.FAVOURITES_DATA,
    favouriteData: favouriteData
})


export default connect(mapStateToProps, mapDispatchToProps)(HomePageComponent);