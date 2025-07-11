import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const Footer = ({ className }) => {
    const { darkMode } = useContext(ThemeContext);

    return(
        <footer className={`${
            darkMode 
                ? 'bg-emerald-950 border-t border-emerald-900' 
                : 'bg-emerald-900'
        } h-12 shrink-0 flex items-center justify-center footer-animation ${className || ''}`}>
            <p className={`text-sm leading-6 ${
                darkMode ? 'text-emerald-400' : 'text-white'
            }`}>
                Whatsapp Hermes é um oferecimento da Secretaria de Difusão da Filial Salvador. Bugs, reclamações e sugestões - procurar Tarso
            </p> 
        </footer>
    )
}

export default Footer;