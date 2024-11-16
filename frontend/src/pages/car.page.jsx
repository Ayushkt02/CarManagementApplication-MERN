import axios from "axios"
import { createContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom"
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";

export const carStructure = {
    title: '',
    content: '',
    tags: [],
    author: { personal_info: {} },
    banner: '',
    publishedAt: ''
}

export const CarContext = createContext({});

const CarPage = () => {
    let { car_id } = useParams();
    const [ car, setCar ] = useState(carStructure);
    const [ loading, setLoading ] = useState(true);


    let { title, content, banner, author: { personal_info: { fullname, username: author_username, profile_img } }, publishedAt} = car;
    const fetchCar = () => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/get-car', { car_id })
        .then( async ({ data: { car } }) => {
            setCar(car);
            setLoading(false);
        })
        .catch(err => {
            console.log(err);
            setLoading(false);
        })
    }

    const resetStates = () => {
        setCar(carStructure);
        setLoading(true);
        
    }

    useEffect(() => {
        resetStates();
        fetchCar();
    }, [car_id])

    return (
        <AnimationWrapper>
            {
                loading ? <Loader/>
                :
                <CarContext.Provider value={{ car, setCar }} >
                    <div className="max-w-[900px] center py-10 max-lg:px-[5vw]">
                        <img src={banner} className="aspect-video rounded-md"/>

                        <div className="mt-12">
                            <h2>{ title }</h2>
                            <div className="flex mx-sm:flex-col justify-between my-8">
                                <div className="flex gap-5 items-start">
                                    <img src={profile_img} className="w-12 h-12 rounded-full"/>
                                    <p className="capitalize">
                                        {fullname}
                                        <br/>
                                        @
                                        <Link to={`/user/${author_username}`} className="underline">{author_username}</Link>
                                    </p>
                                </div>
                            </div>
                        </div>

                        
                        <div className="my-12 font-gelasio car-page-content text-2xl">
                            {content}
                        </div>


                        

                    </div>
                </CarContext.Provider>
            }
        </AnimationWrapper>
    )
}

export default CarPage;