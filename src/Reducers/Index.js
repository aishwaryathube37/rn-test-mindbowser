import { combineReducers, applyMiddleware, createStore, compose } from 'redux';
import thunk from 'redux-thunk';
import serviceReducer from './ServiceReducer'

const AppReducers = combineReducers({
    serviceReducer,
});

const rootReducer = (state, action) => {
	return AppReducers(state,action);
}

let store = createStore(rootReducer, compose(applyMiddleware(thunk)));

export default store;