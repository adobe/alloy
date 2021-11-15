import React from 'react';
import './Header.scss';

// Icons
import { Menu as MenuIcon } from 'react-feather';

// Redux
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toggleNav, togglePopup } from '../../state/actions/appAction';
import { Button, CloseButton, useBreakpointValue } from '@chakra-ui/react';

const Header = ({ title, expenseButton = false, goBackButton = false }) => {
    const appDispatch = useDispatch();
    const popupVisible = useSelector((state) => state.app.popupVisible);
    const menuIconVisible = useBreakpointValue({ base: true, md: false });

    const handlePopupToggle = () => {
        appDispatch(togglePopup());
    };

    const handleNavToggle = () => {
        appDispatch(toggleNav());
    };

    return (
        <div className="header">
            <div className="header__menu">
                {menuIconVisible && (
                    <MenuIcon
                        className="header__buttons__icon"
                        fontSize="large"
                        onClick={handleNavToggle}
                    />
                )}
            </div>
            {!menuIconVisible && <h1>{title}</h1>}
            <div className="header__buttons">
                {expenseButton && (
                    <Link to="/expenses">
                        <Button onClick={handlePopupToggle} colorScheme="blue">
                            {popupVisible ? 'x' : 'New expense'}
                        </Button>
                    </Link>
                )}
                {goBackButton && (
                    <Link to="/expenses">
                        <CloseButton color="white" size="lg" />
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Header;