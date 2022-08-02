import React, { Component } from "react";
import { connect } from "react-redux";
import Helmet from "react-helmet";
import { fetchWishlist } from "../actions/fetchWishlist";
import { fetchProducts } from "../actions/fetchProducts";
import WishlistItem from "../components/WishlistItem";
import { removeFromWishlist } from "../actions/removeFromWishlist";
import { triggerView } from "../common";

/**
 * Create Wishlist Container
 */
class Wishlist extends Component {
  getItemById(id) {
    let obj = {};
    this.props.products.map((item) => {
      if (item.id == id) obj = item;
    });
    return obj;
  }

  handleTrash(key) {
    const { dispatch } = this.props;
    dispatch(removeFromWishlist(key));
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchProducts());
    dispatch(fetchWishlist());
    triggerView("cart");
  }

  render() {
    return (
      <div>
        <Helmet title="My Wishlist" />
        <section className="section">
          <div className="container">
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <abbr>ID</abbr>
                  </th>
                  <th>
                    <abbr>Title</abbr>
                  </th>
                  <th>Price</th>
                  <th>&nbsp;</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(this.props.wishlist).map((key) => {
                  return (
                    <WishlistItem
                      key={key}
                      productKey={key}
                      handleTrash={this.handleTrash.bind(this)}
                      product={this.getItemById(this.props.wishlist[key].id)}
                    />
                  );
                })}
              </tbody>
            </table>
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
    wishlist: state.WishlistReducer.data,
    products: state.ProductsReducer.data,
  };
};

export default connect(stateProps)(Wishlist);
