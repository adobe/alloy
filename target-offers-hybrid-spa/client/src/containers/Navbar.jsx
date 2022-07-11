import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { fetchCart } from "../actions/fetchCart";
import { fetchWishlist } from "../actions/fetchWishlist";
import Cart from "./Cart";
import Wishlist from "./Wishlist";

/**
 * Create NavBar Container
 */
class NavBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showBar: false,
      isCartOpen: false,
      isWishListOpen: false,
    };
    this.registerListeners();
  }

  registerListeners() {
    document.onclick = (evt) => {
      const btns = document.querySelector(".cart-buttons");
      const popover = document.querySelector(".cart-popover");
      if (
        (btns && btns.contains(evt.target)) ||
        (popover && popover.contains(evt.target))
      ) {
        evt.stopPropagation();
      } else {
        this.closePopovers();
      }
    };
  }

  closePopovers() {
    this.setState({
      isCartOpen: false,
      isWishListOpen: false,
    });
  }

  UNSAFE_componentWillMount() {
    const { dispatch } = this.props;
    dispatch(fetchCart());
    dispatch(fetchWishlist());
  }

  toggleNavBar() {
    this.setState({
      showBar: !this.state.showBar,
    });
  }

  render() {
    return (
      <div>
        <nav className="nav has-shadow">
          <div className="container">
            <div className="nav-left">
              <Link to="/" className="nav-item">
                <img
                  src="assets/resources/images/logo.png"
                  title="A Shop"
                  alt="A Shop"
                />
                <img src="assets/resources/images/target200.png" />
              </Link>
            </div>
            <div
              className={`nav-right nav-menu ${
                this.state.showBar ? "is-active" : ""
              }`}
            >
              <Link to="/" className="nav-item">
                Home
              </Link>
              <Link to="/products" className="nav-item">
                Products
              </Link>
              <Link to="/about" className="nav-item">
                About Demo
              </Link>

              <div key="NavBarCart" className="nav-item cart-buttons">
                <span
                  className="button menu"
                  onClick={() => this.toggleCartPopover()}
                >
                  <span className="icon">
                    <i className="fa fa-cart-arrow-down" aria-hidden="true"></i>
                  </span>
                  <span className="tag is-light">
                    {Object.keys(this.props.cart).length}
                  </span>
                </span>
                <span
                  to="/wishlist"
                  className="button menu"
                  onClick={() => this.toggleWishListPopover()}
                >
                  <span className="icon">
                    <i className="fa fa-thumbs-up" aria-hidden="true"></i>
                  </span>
                  <span className="tag is-light">
                    {Object.keys(this.props.wishlist).length}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </nav>
        <br></br>

        <div className="notice container">
          This website demonstrates how you can use the Adobe Experience
          Platform Web SDK to author and deliver personalized experiences on
          websites built with Single Page Apps (SPAs).
        </div>
        <br></br>

        {this.state.isCartOpen && (
          <div className="popover cart-popover">
            <Cart closePopover={() => this.closePopovers()} />
          </div>
        )}

        {this.state.isWishListOpen && (
          <div className="popover cart-popover">
            <Wishlist closePopover={() => this.closePopovers()} />
          </div>
        )}
      </div>
    );
  }

  toggleCartPopover() {
    const cartItemsCount = Object.keys(this.props.cart).length;
    this.setState({
      isCartOpen: !this.state.isCartOpen && cartItemsCount > 0,
      isWishListOpen: false,
    });
  }

  toggleWishListPopover() {
    const wishlistItemsCount = Object.keys(this.props.wishlist).length;
    this.setState({
      isWishListOpen: !this.state.isWishListOpen && wishlistItemsCount > 0,
      isCartOpen: false,
    });
  }
}
/**
 * Insert Props Into Component
 */
const stateProps = (state) => {
  return {
    cart: state.CartReducer.data,
    wishlist: state.WishlistReducer.data,
  };
};

export default connect(stateProps)(NavBar);
