import { Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";
import { createContext, useEffect, useState } from "react";
import { lookInSession } from "./common/session";
import Editor from "./pages/editor.pages";
import HomePage from "./pages/home.page"
import SearchPage from "./pages/search.page";
import CarPage from "./pages/car.page";
import Managecars from "./pages/manage-cars.page";

export const UserContext = createContext({});
export const ThemeContext = createContext({});

const App = () => {

    const [userAuth, setUserAuth] = useState({});
    const [ theme, setTheme ] = useState("light");

    useEffect(()=>{
        let userInSession = lookInSession("user");
        let themeInSession = lookInSession("theme");

        userInSession ? setUserAuth(JSON.parse(userInSession)) : setUserAuth({ access_token: null });

        if(themeInSession){
            setTheme(() => {
                document.body.setAttribute('data-theme', themeInSession);
                return themeInSession;
            })
        }else{
            document.body.setAttribute('data-theme', theme);
        }
    }, [])

    return (
            <UserContext.Provider value={{userAuth, setUserAuth}}>
                <Routes>
                    <Route path="/editor" element={<Editor/>}/>
                    <Route path="/editor/:car_id" element={<Editor/>}/>
                    <Route path="/" element={<Navbar/>}>
                        <Route index element={<HomePage />}/>
                        <Route path="cars" element={<Managecars/>} />
                        <Route path="signin" element={<UserAuthForm type="sign-in" />}/>
                        <Route path="signup" element={<UserAuthForm type="sign-up" />}/>
                        <Route path="search/:query" element={<SearchPage/>}/>
                        <Route path="car/:car_id" element={<CarPage/>}/>
                    </Route>
                </Routes>
            </UserContext.Provider>
    )
}

export default App;