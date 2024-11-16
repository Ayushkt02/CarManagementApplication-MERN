import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { UserContext } from "../App";
import axios from "axios"


export const ManagePublishedCarCard = ({ car }) => {

    let { banner, content, car_id, title, publishedAt } = car;

    let [ showStat, setShowStat ] = useState(false);
    let { userAuth: { access_token } } = useContext(UserContext);
    

    return(
        <>
            <div className="flex gap-10 border-b mb-6 max-md:px-4 border-grey pb-6 items-center">
                <img src={banner} className="max-md:hidden lg:hidden xl:block w-28 h-28 flex-none bg-grey object-cover rounded-md"/>
                <div className="flex flex-col justify-between py-2 w-full min-w-[300px]">
                    <div>
                        <Link to={`/car/${car_id}`} className="car-title mb-4 hover:underline">{title}</Link>
                        <p className="line-clamp-2 font-gelasio text-xl">{content}</p>
                    </div>
                    <div className="flex gap-6 mt-3">
                        <Link to={`/editor/${car_id}`} className="pr-4 py-2 underline">Edit</Link>

                        <button className="pr-4 py-2 underline text-red" onClick={(e) => deleteCar(car, access_token, e.target)}>Delete</button>

                    </div>
                </div>
            </div>
        </>
    )  
}

const deleteCar = (car, access_token, target) => {
    let { car_id, setStateFunc } = car;
    target.setAttribute("disabled", true);

    axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/delete-car", { car_id }, {
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    })
    .then(({ data }) => {
        target.removeAttribute("disabled");
        setStateFunc(prev => {
            const { deletedDocCount = 0, totalDocs, results } = prev;

            // Create a new results array excluding the deleted car
            const updatedResults = results.filter(item => item.car_id !== car_id);

            if (!updatedResults.length && totalDocs - 1 > 0) {
                return null; // If no items left and more items are available, fetch new data
            }

            return {
                ...prev,
                results: updatedResults,
                totalDocs: totalDocs - 1,
                deletedDocCount: deletedDocCount + 1
            };
        });
    })
    .catch(err => {
        console.error("Error while deleting car:", err);
    });
};