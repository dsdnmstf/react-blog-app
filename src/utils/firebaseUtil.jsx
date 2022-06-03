import { async } from "@firebase/util";
import { AlignHorizontalLeftRounded } from "@mui/icons-material";
import { initializeApp } from "firebase/app";
import {
  child,
  get,
  getDatabase,
  onValue,
  push,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  setCurrentUserFalse,
  setCurrentUserTrue,
} from "../redux/actions/firebasActions";
import { failedNote } from "../toastify/Toastify";
import { Navigate } from "react-router-dom";

const firebaseConfig = {
  apiKey: "AIzaSyCAwqtxXzg2THhpQBrc252xmqI4by4-1nc",
  authDomain: "blogs-e852e.firebaseapp.com",
  projectId: "blogs-e852e",
  storageBucket: "blogs-e852e.appspot.com",
  messagingSenderId: "820993512566",
  appId: "1:820993512566:web:fb24c2b5783fa8575cbb57",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export const writeBlogData = ({
  title,
  Image_url,
  content,
  user,
  id,
  like,
}) => {
  const db = getDatabase();
  set(ref(db, "blogs/" + id), {
    title: title,
    Image_url: Image_url,
    content: content,
    user: user,
    id: id,
    like: like,
  });
};

export const getDataFromFirebase = (setBlogs) => {
  const db = getDatabase(app);
  const starCountRef = ref(db, "blogs/");
  onValue(starCountRef, (snapshot) => {
    const blogs = snapshot.val() ? snapshot.val() : [];
    const blogsArray = Object.values(blogs);
    setBlogs(blogsArray);
  });
};

export const updateData = (title, Image_url, content, user, id, like) => {
  const db = getDatabase();
  // A post entry.
  const postData = {
    title: title,
    Image_url: Image_url,
    content: content,
    user: user,
    id: id,
    like: like,
  };
  // const newPostKey = push(child(ref(db), "blogs")).key;
  const updates = {};
  updates["/blogs/" + id] = postData;
  // updates["/user-blogs/" + id + "/" + newPostKey] = postData;

  return update(ref(db), updates);
};

export const deleteData = (id) => {
  const db = getDatabase();

  remove(ref(db, "blogs/" + id));
};

export const getDataForDetail = (id, setBlogDetail) => {
  const dbRef = ref(getDatabase());
  get(child(dbRef, `blogs/${id}`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        setBlogDetail(snapshot.val());
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

// const db = getDatabase();
// const starCountRef = ref(db, "posts/" + postId + "/starCount");
// onValue(starCountRef, (snapshot) => {
//   const data = snapshot.val();
//   updateStarCount(postElement, data);
// });

export const userStateChecker = (dispatch) => {
  onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
      dispatch(setCurrentUserTrue(currentUser));
    } else {
      dispatch(setCurrentUserFalse());
    }
  });
};

export const loginWithGoogle = (dispatch) => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  signInWithPopup(auth, provider)
    .then((result) => {
      dispatch(setCurrentUserTrue(result.user));
    })
    .catch((error) => {
      alert(error);
    });
};
export const logOut = () => {
  signOut(auth);
};

export const createUser = async (email, password) => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.log(error);
  }
};

export const loginWithEmail = async (email, password, dispatch) => {
  try {
    await dispatch(setCurrentUserTrue(auth.currentUser));
    await signInWithEmailAndPassword(auth, email, password);

    console.log(auth.currentUser);
  } catch (error) {
    failedNote(
      "The password is invalid or the user  does not have a password!"
    );
    console.log(error);
  }
};
