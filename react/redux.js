/**
 * 自己实现一个 redux
 */
function createStore(reducer, initStore) {
  let state = initStore;
  const subscribes = [];
  const store = {
    dipatch:(action) => {
      state = reducer(state, action);
      subscribes.forEach((subscribe) => {
        subscribe(state);
      });
    },
    getState() {
      return state;
    },
    subscribe(fn){
      subscribes.push(fn);
    },
  };
  store.dipatch({type:Symbol('2')});
  return store;
}

function myReducer(state, action) {
  if (!state) {
    state = {
      init:'my'
    };
  }
  switch(action.type) {
    case 'test':
      return {
        ...state,
        ...action.payload
      };
      break;
    default:
      return state;
  }
}

function myReducer2(state, action) {
  switch(action.type) {
    case 'test2':
      return {
        ...state,
        ...action.payload
      };
      break;
    default:
      return state;
  }
}

function combineReducer(reducers) {
  const reducerKeys = Object.keys(reducers);

  return function(state, action) {
    const nextState = {};
    /*遍历执行所有的reducers，整合成为一个新的state*/
    for (let i = 0; i < reducerKeys.length; i++) {
      const key = reducerKeys[i]
      const reducer = reducers[key]
      /*之前的 key 的 state*/
      const previousStateForKey = state[key]
      /*执行 分 reducer，获得新的state*/
      const nextStateForKey = reducer(previousStateForKey, action)

      nextState[key] = nextStateForKey
    }
    return nextState;
  }
}
let myMiddleWare = (store) => (next) => (action) => {
  console.log('middleWare', store.getState());
  next(action);
  console.log('middleWareOver');
}
let secondMiddleWare = (store) => (next) => (action) => {
  console.log('second middleware');
  next(action);
}

const reduce = combineReducer({
  1:myReducer,
  2:myReducer2,
});

const store = createStore(reduce, {});

function compose(...middleWares) {
  return function(store) {
    middleWares = middleWares.map((middleWare) => {
      return middleWare(store);
    });
    return middleWares.reduce((res, cur) => cur(res), store.dipatch);
  }
}

store.dipatch = compose(myMiddleWare, secondMiddleWare)(store);
store.subscribe(() => {
  console.log('action', store.getState());
})
store.dipatch({type:'test',payload:{info:'this is action'}})
store.dipatch({type:'test2',payload:{info:'this is test2'}})