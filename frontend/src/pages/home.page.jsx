import { useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation"
import axios from "axios";
import Loader from "../components/loader.component"
import CarPostCard from "../components/car-post.component";
import NoDataMessage from "../components/nodata.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";

const HomePage = () => {

    let [ cars, setCars] = useState(null);
    let [ pageState, setPageState ] = useState("home");

    let categories = ["artificial intelligence", "cooking", "travel", "fitness", "technology", "vr",
     "photography", "sustainable", "crypto", "health", "cricket"];

    const fetchLatestCars = ( {page = 1} ) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-cars", { page })
        .then( async ({ data }) => {
            let formatedData = await filterPaginationData({
                state: cars,
                data: data.cars,
                page,
                countRoute: "/all-latest-cars-count"
            })
            setCars(formatedData);
        })
        .catch(err => {
            console.log(err);
        })
    }

    

    useEffect(() => {
        fetchLatestCars({ page: 1 });
    }, [pageState])

    return (
        <AnimationWrapper>
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
                            <LoadMoreDataBtn state = {cars} fetchDataFun={fetchLatestCars}/>
                </div>
            </section>
        </AnimationWrapper>
    )
}

export default HomePage;