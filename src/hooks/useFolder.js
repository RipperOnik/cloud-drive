import { useEffect, useReducer } from "react";
import { database } from "../firebase";
import { where, query, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";


const ACTIONS = {
    SELECT_FOLDER: 'select-folder',
    UPDATE_FOLDER: 'update-folder',
    SET_CHILD_FOLDERS: 'set-child-folders',
    SET_CHILD_FILES: 'set-child-files'
}
// mimicing the root folder that doesn't exist in database
export const ROOT_FOLDER = { name: 'Root', id: null, path: [] }

function reducer(state, { type, payload }) {
    switch (type) {
        case ACTIONS.SELECT_FOLDER:
            return {
                folderId: payload.folderId,
                folder: payload.folder,
                childFiles: [],
                childFolders: []
            }
        case ACTIONS.UPDATE_FOLDER:
            return {
                ...state,
                folder: payload.folder
            }
        case ACTIONS.SET_CHILD_FOLDERS:
            return {
                ...state,
                childFolders: payload.childFolders
            }
        case ACTIONS.SET_CHILD_FILES:
            return {
                ...state,
                childFiles: payload.childFiles
            }
        default:
            return state
    }
}

export function useFolder(folderId = null, folder = null) {
    // currentFolder
    const [state, dispatch] = useReducer(reducer, {
        folderId: folderId,
        folder: folder,
        childFolders: [],
        childFiles: []
    })
    const { currentUser } = useAuth()


    // update current folder id
    useEffect(() => {
        dispatch({ type: ACTIONS.SELECT_FOLDER, payload: { folderId, folder } })

    }, [folderId, folder])

    // update current folder
    useEffect(() => {
        // means we are in the root folder
        if (folderId == null) {
            return dispatch({
                type: ACTIONS.UPDATE_FOLDER,
                payload: { folder: ROOT_FOLDER }
            })
        }
        // go to firestore to get a folder and set it to a local state
        database.folders.get(folderId).then(doc => {
            dispatch({
                type: ACTIONS.UPDATE_FOLDER,
                payload: { folder: database.formatDoc(doc) }
            })
            // if folder doesn't exist, set the local state to the root folder
        }).catch((e) => {
            console.error(e)
            dispatch({
                type: ACTIONS.UPDATE_FOLDER,
                payload: { folder: ROOT_FOLDER }
            })
        })
    }, [folderId])

    // update child folders
    useEffect(() => {
        // get all the child folders of the current folder and of the current user
        const q = query(database.folders.collection, where("parentId", "==", folderId), where("userId", "==", currentUser.uid), orderBy("createdAt"))

        // You can listen to a document with the onSnapshot() method. 
        // An initial call using the callback you provide creates a document snapshot immediately with the current contents of the single document. Then, each time the contents change, another call updates the document snapshot.
        return onSnapshot(q, (snapshot) => {
            dispatch({
                type: ACTIONS.SET_CHILD_FOLDERS,
                payload: { childFolders: snapshot.docs.map(database.formatDoc) }
            })
        })
    }, [folderId, currentUser])


    // update child files 
    useEffect(() => {
        // get all the child folders of the current folder and of the current user
        const q = query(database.files.collection, where("folderId", "==", folderId), where("userId", "==", currentUser.uid), orderBy("createdAt"))

        // You can listen to a document with the onSnapshot() method. 
        // An initial call using the callback you provide creates a document snapshot immediately with the current contents of the single document. Then, each time the contents change, another call updates the document snapshot.
        return onSnapshot(q, (snapshot) => {
            dispatch({
                type: ACTIONS.SET_CHILD_FILES,
                payload: { childFiles: snapshot.docs.map(database.formatDoc) }
            })
        })
    }, [folderId, currentUser])



    return state


}