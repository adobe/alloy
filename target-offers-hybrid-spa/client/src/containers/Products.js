import React, { Component } from "react";
import { connect } from "react-redux";
import ProductItem from "../components/ProductItem";
import { fetchProducts } from "../actions/fetchProducts";
import { addToCart } from "../actions/addToCart";
import { addToWishlist } from "../actions/addToWishlist";
import { removeFromWishlist } from "../actions/removeFromWishlist";
import { removeFromCart } from "../actions/removeFromCart";
import Helmet from "react-helmet";
import { triggerView } from "../common";

class Products extends Component {
  constructor(props) {
    super(props);
    this.handleLoadMoreClicked = this.handleLoadMoreClicked.bind(this);
    this.state = {
      page: 1,
      pageSize: 4,
    };
  }

  addToCart(id, target) {
    const { dispatch } = this.props;
    dispatch(addToCart(id, target));
  }

  addToWishlist(id, target) {
    const { dispatch } = this.props;
    dispatch(addToWishlist(id, target));
  }

  removeFromWishlist(id, target) {
    const { dispatch } = this.props;
    dispatch(removeFromWishlist(id, target));
  }

  removeFromCart(id, target) {
    const { dispatch } = this.props;
    dispatch(removeFromCart(id, target));
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchProducts());
  }

  render() {
    let productsToLoad = this.state.page * this.state.pageSize;

    const settings = {
      dots: true,
      speed: 500,
      autoplay: true,
      autoplaySpeed: 3000,
      infinite: true,
    };

    return (
      <div>
        <Helmet title="Products" />
        <section className="section">
          <div className="container">
            <div className="heading">
              <h1 className="title">Products</h1>

              <div className="columns is-multiline">
                {this.props.products.slice(0, productsToLoad).map((product) => {
                  return (
                    <ProductItem
                      key={product.id}
                      product={product}
                      addToCart={this.addToCart.bind(this)}
                      addToWishlist={this.addToWishlist.bind(this)}
                      removeFromWishlist={this.removeFromWishlist.bind(this)}
                      removeFromCart={this.removeFromCart.bind(this)}
                      wishlist={this.props.wishlist}
                      cart={this.props.cart}
                    />
                  );
                })}
              </div>
              {productsToLoad < this.props.products.length && (
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={this.handleLoadMoreClicked}
                >
                  Load more
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    );
  }

  handleLoadMoreClicked() {
    const page = this.state.page + 1; // assuming page number is derived from component�s state
    this.setState({ page: page });
    this.targetView("PRODUCTS-PAGE-" + page);
  }

  targetView(viewName) {
    triggerView(viewName);
  }
}
/**
 * Insert Props Into Component
 */
const stateProps = (state) => {
  return {
    products: state.ProductsReducer.data,
    wishlist: state.WishlistReducer.data,
    cart: state.CartReducer.data,
  };
};
export default connect(stateProps)(Products);
