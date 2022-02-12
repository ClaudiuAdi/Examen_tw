const INITIAL_STATE = {
  referenceList: [],
  count: 0,
  error: null,
  fetching: false,
  fetched: false,
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case "GET_REFERENCES_PENDING":
    case "ADD_REFERENCE_PENDING":
    case "SAVE_REFERENCE_PENDING":
    case "DELETE_REFERENCE_PENDING":
      return { ...state, error: null, fetching: true, fetched: false };
    case "GET_REFERENCES_FULFILLED":
    case "ADD_REFERENCE_FULFILLED":
    case "SAVE_REFERENCE_FULFILLED":
    case "DELETE_REFERENCE_FULFILLED":
      return {
        ...state,
        referenceList: action.payload,
        error: null,
        fetching: false,
        fetched: true,
      };
    case "GET_REFERENCES_REJECTED":
    case "ADD_REFERENCE_REJECTED":
    case "SAVE_REFERENCE_REJECTED":
    case "DELETE_REFERENCE_REJECTED":
      return {
        ...state,
        referenceList: [],
        error: action.payload,
        fetching: false,
        fetched: true,
      };
    default:
      return state;
  }
}
