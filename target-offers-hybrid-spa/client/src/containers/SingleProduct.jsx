import React, { Component } from "react";
import { connect } from "react-redux";
import Helmet from "react-helmet";
import { fetchProduct } from "../actions/fetchProduct";
import { addToCart } from "../actions/addToCart";
import { addToWishlist } from "../actions/addToWishlist";
import { removeFromWishlist } from "../actions/removeFromWishlist";
import { removeFromCart } from "../actions/removeFromCart";

/**
 * Create SingleProduct Container
 */
class SingleProduct extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchProduct(this.props.match.params.id));
  }

  checkWishlist(id) {
    let check = null;
    Object.keys(this.props.wishlist).map((key) => {
      if (this.props.wishlist[key].id == id) check = true;
    });
    return check;
  }

  checkCart(id) {
    let check = null;
    Object.keys(this.props.cart).map((key) => {
      if (this.props.cart[key].id == id) check = true;
    });
    return check;
  }

  getKeyByIdForWl(id) {
    let productKey = "";
    Object.keys(this.props.wishlist).map((key) => {
      if (this.props.wishlist[key].id == id) productKey = key;
    });
    return productKey;
  }

  getKeyByIdForCart(id) {
    let productKey = "";
    Object.keys(this.props.cart).map((key) => {
      if (this.props.cart[key].id == id) productKey = key;
    });
    return productKey;
  }

  render() {
    return (
      <div key="ProductViewPage">
        <Helmet
          title={this.props.product.title}
          meta={[
            { property: "og:type", content: "article" },
            { property: "og:title", content: this.props.product.title },
            { property: "og:image", content: this.props.product.image },
            {
              property: "og:description",
              content: this.props.product.description,
            },
          ]}
        />
        <section className="section">
          <div className="container">
            <div className="columns">
              <div className="column is-half">
                <img src={this.props.product.image} width="100%" />
              </div>

              <div className="column is-half">
                <h1 className="title">{this.props.product.title}</h1>

                <h3>
                  <b>Price: ${this.props.product.price}</b>
                </h3>
                <br />

                <p>{this.props.product.description}</p>
                <button
                  data-track-action="link-click"
                  data-track="analytics"
                  data-link-name={`${
                    this.checkCart(this.props.product.id)
                      ? "remove-from-cart"
                      : "add-to-cart"
                  }`}
                  className={`button btn-margin ${
                    this.checkCart(this.props.product.id)
                      ? "is-info"
                      : "is-success"
                  }`}
                  onClick={(event) => {
                    this.checkCart(this.props.product.id)
                      ? this.props.dispatch(
                          removeFromCart(
                            this.getKeyByIdForCart(this.props.product.id),
                            event.target
                          )
                        )
                      : this.props.dispatch(
                          addToCart(this.props.product.id, event.target)
                        );
                  }}
                >
                  {`${
                    this.checkCart(this.props.product.id)
                      ? "Remove from Cart"
                      : "Add to Cart"
                  }`}
                </button>
                <button
                  data-track-action="link-click"
                  data-track="analytics"
                  data-link-name={`${
                    this.checkWishlist(this.props.product.id)
                      ? "remove-from-wishlist"
                      : "add-to-wishlist"
                  }`}
                  className={`button btn-margin ${
                    this.checkWishlist(this.props.product.id)
                      ? "is-info"
                      : "is-primary"
                  }`}
                  onClick={(event) => {
                    this.checkWishlist(this.props.product.id)
                      ? this.props.dispatch(
                          removeFromWishlist(
                            this.getKeyByIdForWl(this.props.product.id),
                            event.target
                          )
                        )
                      : this.props.dispatch(
                          addToWishlist(this.props.product.id, event.target)
                        );
                  }}
                >
                  {`${
                    this.checkWishlist(this.props.product.id)
                      ? "Remove from Wishlist"
                      : "Add to Wishlist"
                  }`}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}
/**
 * Insert Props Into Component
 */
const stateProps = (state) => {
  return {
    cart: state.CartReducer.data,
    wishlist: state.WishlistReducer.data,
    product: state.ProductReducer.data,
  };
};
export default connect(stateProps)(SingleProduct);
