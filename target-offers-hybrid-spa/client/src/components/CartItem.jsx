import React, { Component } from 'react'
import { Link } from 'react-router-dom'
/**
 * Create WishlistItem Component
 */
class CartItem extends Component {
  render() {
    return (
      <tr>
        <td>{this.props.product.id}</td>
        <td><Link to={`product/${this.props.product.id}`}>{this.props.product.title}</Link></td>
        <td>${this.props.product.price}</td>
        <td>
          <a href="#" className="button is-danger is-outlined" onClick={(e) => {
                        e.preventDefault();
                        this.props.handleTrash(this.props.productKey);
                    }}>
            <span className="icon is-small"> <i className="fa fa-trash" aria-hidden="true"></i> </span>
          </a>
        </td>
      </tr>
    )
  }
}

export default CartItem
