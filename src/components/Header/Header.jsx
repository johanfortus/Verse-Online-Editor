import React from 'react';
import logo from '../../assets/verse-logo.png'
import './Header.css'

const Header = () => {
    return (
        <div className="header-container">
            <img src={logo} className='logo-icon'></img>
            <span className='logo-title'>Verse Online Editor</span>
        </div>
    );
};

export default Header;

