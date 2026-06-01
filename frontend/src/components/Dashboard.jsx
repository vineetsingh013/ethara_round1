import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useNotify } from './Notification';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const notify = useNotify();
  const navigate = useNavigate();

  useEffect(() => {
    api.getDashboard()
      .then(setData)
      .catch((err) => notify.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>
      <div className="dashboard-cards">
        <div className="card clickable" onClick={() => navigate('/admin/products')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/products')}>
          <h3>Total Products</h3>
          <div className="value">{data?.total_products ?? 0}</div>
        </div>
        <div className="card clickable" onClick={() => navigate('/admin/customers')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/customers')}>
          <h3>Total Customers</h3>
          <div className="value">{data?.total_customers ?? 0}</div>
        </div>
        <div className="card clickable" onClick={() => navigate('/admin/orders')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/orders')}>
          <h3>Total Orders</h3>
          <div className="value">{data?.total_orders ?? 0}</div>
        </div>
        <div className="card clickable" onClick={() => navigate('/admin/products')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/products')}>
          <h3>Low Stock Items</h3>
          <div className="value">{data?.low_stock_products ?? 0}</div>
        </div>
      </div>
    </div>
  );
}
