import { createContext, useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { Navigate, useParams } from "react-router-dom";
import CarEditor from "../components/car-editor.component";
import PublishForm from "../components/publish-form.component";
import Loader from "../components/loader.component";
import axios from "axios";

const carStructure = {
    title: '',
    banner: '',
    extraPhotos: [],
    content: [],
    tags: [],
    author: { personal_info: {  } } 
}

export const EditorContext = createContext({  });

const Editor = () => {

    let { car_id } = useParams();
    const [ car, setCar ] = useState(carStructure);
    const [ editorState, setEditorState ] = useState("editor");
    const [ loading, setLoading ] = useState(true);


    let { userAuth: { access_token } } = useContext(UserContext);

    useEffect( () => {
        if(!car_id){
            return setLoading(false);
        }
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-car", { car_id, mode: 'edit'})
        .then(({data: {car}}) => {
            setCar(car);
            setLoading(false);
        })
        .catch(err => {
            setCar(null);
            setLoading(false);
        })
    }, [])


    return (
        <EditorContext.Provider value={{ car, setCar, editorState, setEditorState}}>
            {     
                access_token === null ? <Navigate to="/signin" />
                :
                loading ? <Loader/> :
                editorState == "editor" ? <CarEditor/> : <PublishForm/>
            }
        </EditorContext.Provider>
    )
}

export default Editor;