import { useEffect , useState , createContext} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext();

export const ThemeProvider = ({children}) => {

    const [gradientUp , setGradientUp] = useState("#007B8F");
    const [gradientDown , setGradientDown] = useState("#4B0057");
    const [roleSelected, setRoleSelected] = useState("Student");


    useEffect (() => {

        const loadTheme = async () => {
            try {
                const storedGradientUp = await AsyncStorage.getItem("gradientUp");
                const storedGradientDown = await AsyncStorage.getItem("gradientDown");

                if (storedGradientUp && storedGradientDown) {
                    setGradientUp(storedGradientUp);
                    setGradientDown(storedGradientDown);
                }
            } catch (error) {
                console.log(error, "Theme Not Found");
            }
        };
        loadTheme();
    },[])




      const changeTheme = async (gradientUp, gradientDown) => {
    
        await AsyncStorage.setItem("gradientUp", gradientUp);
        await AsyncStorage.setItem("gradientDown", gradientDown);
    
        setGradientUp(gradientUp);
        setGradientDown(gradientDown);
    
      }


    const value = {
        gradientUp,
        setGradientUp,
        gradientDown,
        setGradientDown,
        changeTheme,
        roleSelected,
        setRoleSelected,
    };


    return(
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};


export default ThemeContext;