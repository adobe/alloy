import React, { Component } from 'react'
import { connect } from 'react-redux'
import ProductItem from '../components/ProductItem'
import { fetchProducts } from '../actions/fetchLatestProducts'
import { addToCart } from '../actions/addToCart'
import { addToWishlist } from '../actions/addToWishlist'
import { removeFromWishlist } from '../actions/removeFromWishlist'
import { removeFromCart } from '../actions/removeFromCart'
import Helmet from "react-helmet"
import Slider from "react-slick"

/**
 * Create ProductList Container
 */
class ProductList extends Component {

  addToCart(id, target) {
    const { dispatch } = this.props;
    dispatch(addToCart(id, target))
  }

  addToWishlist(id, target) {
    const { dispatch } = this.props;
    dispatch(addToWishlist(id, target))
  }

  removeFromWishlist(id, target) {
    const { dispatch } = this.props;
    dispatch(removeFromWishlist(id, target))
  }

  removeFromCart(id, target) {
    const { dispatch } = this.props;
    dispatch(removeFromCart(id, target))
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchProducts())
  }

  render() {

    const settings = {
      dots: true,
      speed: 500,
      autoplay: false,
      autoplaySpeed: 3000,
      infinite: true
    };

    return (

      <div key="HomePage">
        <Helmet title="Home"/>
        <section className="section">
          <div className="container">
            <Slider {...settings}>
              <div><img src="assets/resources/images/carousel/easter.png"/></div>
              <div><img src="assets/resources/images/carousel/discount.png"/></div>
              <div><img src="assets/resources/images/carousel/happy.png"/></div>
              <div><img src="assets/resources/images/carousel/family.png"/></div>
              <div><img src="assets/resources/images/carousel/percent.png"/></div>
            </Slider>
          </div>
          <br></br><br></br>

          <div className="container">
            <div className="heading">
              <h1 className="title">Latest Products for 2019</h1>

              <div key="ProductListHomePage" className="columns is-multiline">
                {this.props.products.map((product) => {
                  return <ProductItem key={product.id}
                                      product={product}
                                      addToCart={this.addToCart.bind(this)}
                                      addToWishlist={this.addToWishlist.bind(this)}
                                      removeFromWishlist={this.removeFromWishlist.bind(this)}
                                      removeFromCart={this.removeFromCart.bind(this)}
                                      wishlist={this.props.wishlist}
                                      cart={this.props.cart}
                    />
                })}
              </div>
            </div>
          </div>
        </section>
      </div>

    )
  }
}
/**
 * Insert Props Into Component
 */
const stateProps = (state) => {
  return {
    products: state.LatestProductsReducer.data,
    wishlist: state.WishlistReducer.data,
    cart: state.CartReducer.data
  }
};
export default connect(stateProps)(ProductList)
