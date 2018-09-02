import { createStore, applyMiddleware, combineReducers, bindActionCrators } from 'redux';
import { connect, Provider } from 'react-redux';
import thunk from 'redux-thunk';
import React, { Component } from react;

class App extends Component {
  componentDidMound = () => {
    this.props.fetchUsers();
  }

  handleChange = (event) => {
    this.props.selectUser(event.target.value);
  }

  render() {
      const { userList, currentUser, loading, error } = this.props;

      if (loading) {
          return <p>Loading...</p>
      } else if (error) {
          return <p>Error... {error.message}</p>
      }

       return (
           <div>
               <Select onChange={this.handleChange} userList={userList} />
               <currentUser currentUser={currentUser} />
           </div>
       )
  }
}

const Select = (props) => {
    renderOptions = () => (
       props.userList.map(user =>
           <option value={user.id} key={`user-${user.id}`}>{user.name}</option>
       )
   )

   return (
       <select onChange={props.onChange} defaultValue="">
            <option value="">Select User</option>
            { this.renderOptions() }
       </select>
   )
}

const CurrentUser = (props) => {
    return (
        <div>
            {
                props.currentUser && JSON.stringify(props.currentUser)
            }
        </div>
    )
}

const reducer = (state, action) => {
    switch(action.type) {
        case 'REQUEST_USERS':
            return {
                ...state,
                loading: action.loading,
                userList: []
            }

        case 'REQUEST_USERS_SUCCESS':
            return {
                ...state,
                loading: action.loading,
                userList: action.userList
            }

        case 'REQUEST_USERS_ERROR':
            return {
                ...state,
                loading: action.loading,
                error: action.error
            }

        case 'SELECT_USER':
            return {
                ...state,
                currentUser: state.userList.find(user => user.id === action.currentUser)
            }

        default:
            return state;
    }
}

const actionCreators = {
    requestUsers: () => {
        return {
            type: 'REQUEST_USERS',
            loading: true,
            error: null
        }
    },

    requestUsersSuccess: (userList) => {
        return {
            type: 'REQUEST_USERS_SUCCESS',
            userList,
            loading: false,
            error: null
        }
    },

    requestUsersError: (error) => {
        return {
            type: 'REQUEST_USERS_ERROR',
            loading: false,
            userList: [],
            error
        }
    },

    fetchUsers: () => {
        return (dispatch) => {
            dispatch(actionCreators.requestUsers);

            return fetch('https://jsonplaceholder.typicode.com/users')
                        .then((response) => {
                            return response.json();
                        })
                        .then((json) => {
                            dispatch(actionCreators.requestUsersSuccess(json));
                        })
                        .catch((error) => {
                            dispatch(actionCreators.requestUsersError(error));
                        })
        }
    },

    selectUser: (currentUser) => {
        return {
            type: 'SELECT_USER',
            currentUser
        }
    }
}

const previousState = { userList: [], currentUser: null };
const store = createStore(reducer, previousState, applyMiddleware(thunk));

const mapStateToProps = (state) => ({
    userList: state.userList,
    currentUser: state.currentUser,
    loading: state.loading,
    error: state.error
});

const mapDispatchToProps = (dispatch) => {
    return bindActionCrators(actionCreators, dispatch);
}


const AppContainer = connect(mapStateToProps, mapDispatchToProps)(App);

ReactDOM.render(
    <Provider store={store}>
        <AppContainer />
    </Provider>,
    document.getElementById('app')
);