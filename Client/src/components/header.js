import logo from '../images/logo.png'
import {
    Sun,
    Moon
} from "lucide-react"
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeContext } from '../context/ThemeContext'

const Header = ({ className }) => {
    const { darkMode, setDarkMode } = useContext(ThemeContext)
    const navigate = useNavigate()
    
    return (
        <header className={`flex pr-2 pl-2 justify-between h-14 items-center shrink-0 header-animation ${className || ''} 
            ${darkMode 
                ? 'bg-gradient-to-r from-gray-900 from-10% to-emerald-950 to-20% border-b border-emerald-800' 
                : 'bg-gradient-to-r from-white from-10% to-emerald-900 to-20%'}`}>
            <img
                src={logo}
                className={`p-1 max-w-32 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                alt=""
            />
            <div className="flex gap-4">
                <button 
                    onClick={() => navigate('/inicio')}
                    className={`${darkMode 
                        ? 'text-emerald-400 hover:text-emerald-300' 
                        : 'text-white hover:text-emerald-700'} transition-colors`}>
                    Início
                </button>
                <button 
                    onClick={() => navigate('/hermes')}
                    className={`${darkMode 
                        ? 'text-emerald-400 hover:text-emerald-300' 
                        : 'text-white hover:text-emerald-700'} transition-colors`}>
                    Hermes
                </button>
                <button 
                    onClick={() => navigate('/athena')}
                    className={`${darkMode 
                        ? 'text-emerald-400 hover:text-emerald-300' 
                        : 'text-white hover:text-emerald-700'} transition-colors`}>
                    Athena
                </button>
            </div>
            <button 
                onClick={() => setDarkMode(curr => !curr)}
                className={`${darkMode 
                    ? 'text-white hover:text-gray-300' 
                    : 'text-white hover:text-gray-300'} transition-colors`}>
                {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
            </button> 
        </header>
    )
};

export default Header;