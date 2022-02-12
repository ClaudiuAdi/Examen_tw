import { combineReducers } from "redux";
import article from "./article-reducer";
import reference from "./reference-reducer";

export default combineReducers({
  article,
  reference,
});
