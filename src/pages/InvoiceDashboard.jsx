import React, { useEffect, useState, useRef } from 'react';
import axios from '../utils/axios';
import { toast} from 'react-toastify';

// Simple debounce hook
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

const InvoiceDashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [fy, setFy] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 500); // wait 500ms after user stops typing

  useEffect(() => {
    fetchInvoices();
  }, [fy, debouncedSearch]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/invoices', {
        params: {
          fy,
          search: debouncedSearch,
        }
      });
      setInvoices(res.data.invoices || []);
    } catch (err) {
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Invoice Dashboard</h2>
      <div className="d-flex mb-3">
        <input
          type="text"
          placeholder="Search Invoice #"
          onChange={e => setSearch(e.target.value)}
          className="form-control me-2"
          value={search}
        />
        <input
          type="text"
          placeholder="FY e.g. 2023-2024"
          onChange={e => setFy(e.target.value)}
          className="form-control"
          value={fy}
        />
      </div>

      {loading ? (
        <p>Loading invoices...</p>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr><th>#</th><th>Date</th><th>Amount</th><th>FY</th></tr>
          </thead>
          <tbody>
            {invoices.length > 0 ? invoices.map(inv => (
              <tr key={inv._id}>
                <td>{inv.invoiceNumber}</td>
                <td>{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                <td>{inv.invoiceAmount}</td>
                <td>{inv.financialYear}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="text-center">No invoices found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default InvoiceDashboard;
