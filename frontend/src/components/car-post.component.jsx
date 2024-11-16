import { Link } from "react-router-dom";

const CarPostCard = ({ conten, author }) => {
  let { tags, content, title, banner, car_id: id } = conten;
  let { fullname, profile_img, username } = author;

  return (
    <>
      <Link
        to={`/car/${id}`}
        className="flex flex-col lg:flex-row gap-8 items-center p-5"
      >
        {/* Banner */}
        <div className="w-full lg:w-[175px] h-[120px] bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
          <img
            src={banner}
            alt="Car Banner"
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>

        <div className="flex-1">
          {/* Author Info */}
          <div className="flex gap-3 items-center mb-4">
            <img
              src={profile_img}
              alt="Author"
              className="w-7 h-7 rounded-full object-cover"
            />
            <p className="text-gray-700 font-normal text-sm line-clamp-1">
              <span className="font-semibold">{fullname}</span>@{username}
            </p>
          </div>

          {/* Title */}
          <h1 className="car-title">
            {title}
          </h1>

          {/* Content */}
          <p className="text-ellipsis my-3 text-xl font-gelasio leading-7 max-sm:hidden md:max-[1100px]:hidden line-clamp-2">
            {content}
          </p>

          {/* Tags */}
          <div className=" gap-4 mt-7 hidden lg:block ">
                    <span className="btn-light py-1 px-4">{tags[0]}</span>
                    
                 </div>
        </div>
      </Link>
      <hr className="border-gray-300 my-6 opacity-10" />
    </>
  );
};

export default CarPostCard;
