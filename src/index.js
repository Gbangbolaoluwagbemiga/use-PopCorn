import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import StarRating from './starRating';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    {/* <StarRating
      maxRating={20}
      messages={['Terrible', 'Bad', 'Okay', 'Good', 'Amazing']}
      size={2.25}
    />
 */}
    {/* <StarRating
      maxRating={5}
      messages={["Terrible", "Bad", "Okay", "Good", "Amazing"]}
    />
    <StarRating size={24} color="red" className="test" defaultRating={2} />

    <Test /> */}
  </React.StrictMode>
);
