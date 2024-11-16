import { Link, useNavigate, useParams } from "react-router-dom";
import logo from "../imgs/logo.png"
import AnimationWrapper from "../common/page-animation";
import lightDefaulBanner from "../imgs/banner.png"
import { useContext } from "react";
import UploadImage from "../common/aws";
import { Toaster, toast } from "react-hot-toast"
import { EditorContext } from "../pages/editor.pages";
import { UserContext } from "../App";

 
const CarEditor = () => {

    let { car, car: { title, extraPhotos, banner, content, tags, author }, setCar, setEditorState } = useContext(EditorContext)
    let{ userAuth: { access_token } } = useContext(UserContext);
    let { car_id } = useParams();
    let navigate = useNavigate();

    const handleBannerUpload = async(e) => {
        let img = e.target.files[0];
        
        if(img){
            let loadingToast = toast.loading("Uploading....")
            UploadImage(img).then((url) => {
                if(url){
                    toast.dismiss(loadingToast);
                    toast.success("Uploaded 👍")
                    setCar({ ...car, banner: url  })
                }
            })
            .catch(err => {
                toast.dismiss(loadingToast);
                return toast.error(err);
            })
        }
    }

    const handleTitleKeyDown = (e) => {
        if(e.keyCode == 13){
            e.preventDefault();
        }
    }


    const handleTitleChange = (e) => {
        let input = e.target;
        console.log(input.scrollHeight);
        input.style.height = 'auto';
        input.style.height = input.scrollHeight+"px";

        setCar({ ...car, title: input.value })
    }

    const handleContentChange = (e) => {
        let input = e.target;
        console.log(input.scrollHeight);
        input.style.height = 'auto';
        input.style.height = input.scrollHeight+"px";

        setCar({ ...car, content: input.value })
    }

    const handleError = (e) => {
        let img = e.target; 
        img.src = lightDefaulBanner;
    }

    const handlePublishEvent = () => {
        if(!banner){
            return toast.error("Upload a Car Image to publish it");
        }
        if(!title){
            return toast.error("Write Car title to publish it");
        }
        if(!content){
            return toast.error("Write something in your car description to publish it")
        }
        setEditorState("publish")
        
    }
    


    return(
        <>
            <nav className="navbar">
                <Link to="/" className="flex-none h-12">
                    <img src={logo} />
                </Link>

                <p className="max-md:hidden text-black line-clamp-1 w-full text-2xl">
                    { title.length ? title : "New Car" }
                </p>

                <div className="flex gap-4 ml-auto ">
                    <button className="btn-dark py-2 "
                        onClick={handlePublishEvent}
                    >
                        Publish
                    </button>
                </div>
            </nav>
            <Toaster/>
            <AnimationWrapper>
                <section>
                    <div className="mx-auto max-w-[900px] w-full">

                        <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey">
                            <label htmlFor="uploadBanner">
                                <img 
                                    src={banner}
                                    className="z-20"
                                    onError={handleError}
                                />
                                <input 
                                    id="uploadBanner"
                                    type="file"
                                    accept=".png, .jpg, .jpeg"
                                    hidden
                                    onChange={handleBannerUpload}
                                />
                            </label>
                        </div>
                        <textarea
                            defaultValue={title}
                            placeholder="Car Title"
                            className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40 bg-white"
                            onKeyDown={handleTitleKeyDown}
                            onChange={handleTitleChange}
                        ></textarea>

                        <hr className="w-full opacity-10 my-5"/>
                        <textarea id="textEditor" 
                        className="font-gelasio text-xl w-full outline-none mt-10 leading-tight placeholder:opacity-40 bg-white" 
                        placeholder="Write descripltion about car" 
                        onChange={handleContentChange}
                        defaultValue={content}></textarea>
                    </div>
                </section>
            </AnimationWrapper>
        </>
    )
}

export default CarEditor;