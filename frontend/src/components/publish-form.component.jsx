import { useContext } from "react"
import AnimationWrapper from "../common/page-animation"
import { Toaster, toast} from "react-hot-toast"
import { EditorContext } from "../pages/editor.pages"
import Tag from "./tags.component"
import axios from "axios"
import { UserContext } from "../App"
import { useNavigate, useParams } from "react-router-dom"

const PublishForm = () => {
    let tagLimit = 10;
    let { car_id } = useParams();
    // let car_id = car_id;
    let { car, car: { title, banner, content, tags }, setEditorState, setCar } = useContext(EditorContext)
    let{ userAuth: { access_token } } = useContext(UserContext);
    let navigate = useNavigate();


    const handleCloseEvent = () => {
        setEditorState("editor");
    }

    const handleCarTitleChange = (e) => {
        let input = e.target;
        setCar({ ...car, title: input.value })
    }

    const handleCarContentChange = (e) => {
        let input = e.target;
        setCar({ ...car, content: input.value })
    }

    const handleTitleKeyDown = (e) => {
        if(e.keyCode == 13){
            e.preventDefault();
        }
    }

    const handleKeyDown = (e) => {
        if(e.keyCode == 13 || e.keyCode == 188){
            e.preventDefault();
            let tag = e.target.value;
            if(tags.length < tagLimit){
                if(!tags.includes(tag) && tag.length){
                    setCar({ ...car, tags: [...tags, tag]})
                }
            }else{
                toast.error(`You can add max ${tagLimit} tags`)
            }
            e.target.value = "";
        }
    }

    const publishCar = (e) => {
        if(e.target.className.includes("disable")){
            return;
        }
        if(!title.length){
            return toast.error("Write car title before publishing");
        }
        if(tags.lenght == 0){
            return toast.error("Enter at least 1 tag to help us rank your car")
        }
        let loadingToast = toast.loading("publishing....");
        e.target.classList.add('disable');

        let carObj = {
            title, banner, content, tags
        }

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/create-car", {...carObj, id: car_id}, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(() => {
            e.target.classList.remove('disable');
            toast.dismiss(loadingToast);
            toast.success("Published 👍")
            setTimeout(() => {
                navigate("/");
            }, 500)
        })
        .catch(({ response }) => {
            e.target.classList.remove('disable');
            toast.dismiss(loadingToast);
            return toast.error(response.data.error);
        })
    }

    return(
        <AnimationWrapper>
            <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">
                <Toaster />
                <button className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]"
                    onClick={handleCloseEvent}
                >
                    <i className="fi fi-br-cross"></i>
                </button>
                <div className="max-w-[550px] center">
                    <p className="text-dark-grey mb-1">Preview</p>
                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
                        <img src={banner}/>
                    </div>
                    <h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-2">{ title }</h1>
                </div>

                <div className="border-grey lg:border-1 lg:pl-8">
                    <p className="text-dark-grey mb-2 mt-9">Car Title</p>

                    <input type="text" placeholder="Car Title" defaultValue={title} className="input-box pl-4" 
                        onChange={handleCarTitleChange}
                    />

                    <p className="text-dark-grey mb-2 mt-9"> description about your car</p>

                    <textarea defaultValue={content} className="h-40 resize-none leading-7 input-box pl-4"
                        onChange={handleCarContentChange}
                        onKeyDown={handleTitleKeyDown}
                    ></textarea>


                    <p className="text-dark-grey mb-2 mt-9">Topics - ( Helps in searching and ranking your car post )</p>

                    <div className="relative input-box pl-2 py-2 pb-4">
                        <input type="text" placeholder="Topic" className="sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white"
                            onKeyDown={handleKeyDown}
                        />
                        {
                            tags.map((tag, i) => {
                                return <Tag tag={tag} tagIndex={i} key={i}/>
                            })
                        }
                    </div>
                    <p className="mt-1 mb-4 text-dark-grey text-right">{tagLimit - tags.length} Tags left </p>
                    <button className="btn-dark px-8"
                        onClick={publishCar}
                    >Publish</button>
                </div>
            </section>
        </AnimationWrapper>
    )
}

export default PublishForm;