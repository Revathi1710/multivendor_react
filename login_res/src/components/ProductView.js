import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/navbar';
import axios from 'axios';
import './productview.css';

const ProductView = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const userData = JSON.parse(localStorage.getItem('userData'));

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productResponse = await axios.get(`http://localhost:5000/ProductView/${id}`);
        const productData = productResponse.data;

        if (productData.status === 'ok') {
          setProduct(productData.data);
        } else {
          setError(productData.message);
        }

        const reviewsResponse = await axios.get(`http://localhost:5000/productReviews/${id}`);
        const reviewsData = reviewsResponse.data;

        if (reviewsData.status === 'ok') {
          setReviews(reviewsData.data);
        } else {
          setError(reviewsData.message);
        }
      } catch (error) {
        setError('An error occurred: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleEnquiry = async (e) => {
    e.preventDefault();

    if (!userData) {
      window.localStorage.setItem('redirectAfterLogin', window.location.pathname);
      window.location.href = '/login';
      return;
    }

    const form = e.target;
    const formData = new FormData(form);

    const enquiryData = {
      productname: formData.get('name'),
      product_id: id,
      productPrice: product.sellingPrice,
      vendorId: product.vendorId._id,
      UserId: userData._id,
      Username: userData.fname,
      UserNumber: userData.number,
    };

    try {
      const response = await axios.post('http://localhost:5000/sendEnquiry', enquiryData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = response.data;

      if (data.status === 'ok') {
        setMessage('Enquiry sent successfully!');
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('An error occurred: ' + error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <Navbar />
      <div className="container1 mt-4">
        {product ? (
          <div className="row">
            <div className="col-md-9 productDetails">
              <div className="row productrow">
                <div className="col-md-5">
                  {product.image ? (
                    <img
                      src={`http://localhost:5000/${product.image.replace('\\', '/')}`}
                      className="img-fluid"
                      alt={product.name}
                    />
                  ) : (
                    <img
                      src="path_to_default_image.jpg"
                      className="img-fluid"
                      alt="default"
                    />
                  )}
                </div>
                <div className="col-md-7">
                  <h3>{product.name}</h3>
                  <hr />
                  <h4>Price: ₹{product.sellingPrice}</h4>
                  <p>{product.smalldescription}</p>
                  <form onSubmit={handleEnquiry}>
                    <button className="btn btn-primary">Send Enquiry</button>
                  </form>
                  {message && <p>{message}</p>}
                </div>
              </div>
            </div>
            <div className="col-md-3 sellerDetails">
              <h3>Seller Details</h3>
              {product.vendorId ? (
                <>
                  <p>Name: {product.vendorId.fname}</p>
                  <p>Company: {product.vendorId.businessName}</p>
                  <p>Email: {product.vendorId.email}</p>
                  <p>Contact Number: {product.vendorId.number}</p>
                </>
              ) : (
                <p>No vendor details available.</p>
              )}
            </div>
          </div>
        ) : (
          <p>Product not found.</p>
        )}
        <div className='productOverview mt-4'>
          <h3>Product Overview</h3>
          <p>{product.description}</p>
        </div>
        <div className="allreviews mt-4">
          <h2>All Reviews</h2>
          {reviews.length > 0 ? (
            reviews.map(review => (
              <div key={review._id} className="review-card">
                <div className="review-header">
                  <h5>{review.Username}</h5>
                  <p className="review-date">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="review-body row">
                  <div className='col-sm-3'>
                  {review.image && <img src={`http://localhost:5000/${review.image.replace('\\', '/')}`} alt="Review" className="review-image" />}
                  </div>
                  <div className="review-rating col-sm-2">
                    <span className="rating-label">Rating:</span>
                    <span className={`rating-stars rating-${review.starRate}`}></span>
                  </div>
                  <p className='col-sm-3'><strong>Response:</strong> {review.Response ? '👍' : '👎'}</p>
                  <p className='col-sm-2'><strong>Quality:</strong> {review.Quality ? '👍' : '👎'}</p>
                  <p className='col-sm-2'> <strong>Delivery:</strong> {review.Delivery ? '👍' : '👎'}</p>
                 
                </div>
              </div>
            ))
          ) : (
            <p>No reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductView;
