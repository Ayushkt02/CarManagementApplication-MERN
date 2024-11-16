import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation"
import CarPostCard from "../components/car-post.component";
import NoDataMessage from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";
import axios from "axios";
import { filterPaginationData } from "../common/filter-pagination-data";


const SearchPage = () => {
    let {query} = useParams();
    let [ cars, setCars] = useState(null);
    let [users, setUsers] = useState(null);

    const searchCars = ({ page = 1, create_new_arr = false }) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-cars", { query, page })
        .then( async ({ data }) => {
            let formatedData = await filterPaginationData({
                state: cars,
                data: data.cars,
                page,
                countRoute: "/search-cars-count",
                data_to_send: { query },
                create_new_arr
            })
            setCars(formatedData);
        })
        .catch(err => {
            console.log(err);
        })
    }

    const resetState = () => {
        setCars(null);
        setUsers(null);
    }

    useEffect(() => {
        resetState();
        searchCars({ page: 1, create_new_arr: true });
    }, [query])


    return (
        <section className="h-cover flex justify-center gap-10">
            <div className="w-full">
            {
                            cars==null ? <Loader/> :
                            cars.results.length ? 
                                cars.results.map((car, i) => {
                                    return <AnimationWrapper transition={{ duration: 1, delay: i*.1}} key={i}>
                                        <CarPostCard conten={car} author={car.author.personal_info} />
                                    </AnimationWrapper>
                                })
                            :
                                <NoDataMessage message="No cars published"/>
                        }
                        <LoadMoreDataBtn state = {cars} fetchDataFun={searchCars}/>
            </div>
            
        </section>
    )
}

export default SearchPage;