import { useContext, useEffect, useState } from "react";
import axios from "axios"
import { UserContext } from "../App";
import { filterPaginationData } from "../common/filter-pagination-data";
import { Toaster } from "react-hot-toast";
import Loader from "../components/loader.component";
import NoDataMessage from "../components/nodata.component";
import AnimationWrapper from "../common/page-animation";
import { ManagePublishedCarCard } from "../components/manage-carcard.component";
import LoadMoreDataBtn from "../components/load-more.component";
import { useSearchParams } from "react-router-dom";


const Managecars = () => {

    const [ cars, setCars ] = useState(null);
    const [ query, setQuery ] = useState("");

    let activeTab = useSearchParams()[0].get("tab");

    let { userAuth: { access_token } } = useContext(UserContext);

    const getCars = ({ page, deletedDocCount=0 }) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/user-added-cars", {
            page, query, deletedDocCount
        },{
            headers:{
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then( async ({data})=>{
            let formatedData = await filterPaginationData({
                state:cars,
                data: data.cars,
                page,
                user: access_token,
                countRoute: "/user-added-cars-count",
                data_to_send: { query }
            })
            setCars(formatedData);
        })
        .catch(err => {
            console.log(err);
        })
    }

    useEffect(()=>{
        if(access_token){
            if(cars==null){
                getCars({ page:1});
            }
        }
    },[access_token, cars, query])

    const handleSearch = (e)=>{
        let searchQuery = e.target.value;
        setQuery(searchQuery);
        if(e.keyCode==13 && searchQuery.length){
            setCars(null);
        }
    }

    const handleChange = (e)=>{
        if(!e.target.value.length){
            setQuery("");
            setCars(null);
        }
    }

    // return(
    //     <>
    //         <h1 className="max-md:hidden">Manage Cars</h1>
    //         <Toaster/>

    //         <div className="relative max-md:mt-5 md:mt-8 mb-10">
    //             <input 
    //                 type="search"
    //                 className="w-full bg-grey p-4 pl-12 pr-6 rounded-full placeholder:text-dark-grey"
    //                 placeholder="Search Cars"
    //                 onChange={handleChange}
    //                 onKeyDown={handleSearch}
    //             />
    //             <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>
    //         </div>

    //         {
    //                 cars==null ? <Loader/> : 
    //                 cars.results.length ?
    //                 <> 
    //                     {
    //                         cars.results.map((car, i)=>{
    //                             return <AnimationWrapper key={i} transition={{delay: i*0.04}}>
    //                                 <ManagePublishedCarCard car={{ ...car, index:i, setStateFunc: setCars }}/>
    //                             </AnimationWrapper>
    //                         })
    //                     }
    //                     <LoadMoreDataBtn state={cars} fetchDataFun={getCars} additionalParams={{ deletedDocCount: cars.deletedDocCount }} />
    //                 </>
    //                 : 
    //                 <NoDataMessage message="No published cars"/> 
    //             }
    //     </>
    // )
    return (
        <>
        <div className="w-full lg:px-80">
          {/* Page Header */}
          <h1 className="text-3xl font-bold text-gray-800 max-md:hidden mb-6">
            Manage Cars
          </h1>
          <Toaster />
      
          {/* Search Bar */}
          <div className="relative max-md:mt-5 md:mt-8 mb-10">
            <input
              type="search"
              className="w-full bg-gray-100 p-4 pl-12 pr-6 rounded-full placeholder:text-gray-400 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-md transition-all"
              placeholder="Search Cars"
              onChange={handleChange}
              onKeyDown={handleSearch}
            />
            <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-gray-400"></i>
          </div>
      
          {/* Content */}
          {cars == null ? (
            <Loader />
          ) : cars.results.length ? (
            <>
              {/* Car Cards */}
              {cars.results.map((car, i) => (
                <AnimationWrapper key={i} transition={{ delay: i * 0.04 }}>
                  <ManagePublishedCarCard
                    car={{ ...car, index: i, setStateFunc: setCars }}
                  />
                </AnimationWrapper>
              ))}
      
              {/* Load More Button */}
              <LoadMoreDataBtn
                state={cars}
                fetchDataFun={getCars}
                additionalParams={{ deletedDocCount: cars.deletedDocCount }}
              />
            </>
          ) : (
            /* No Data Message */
            <NoDataMessage message="No published cars" />
          )}
        </div>
        </>
      );
      
}

export default Managecars;