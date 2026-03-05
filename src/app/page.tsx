"use client";

import { useState, useEffect } from 'react';

export default function OrderPage() {
  const [formData, setFormData] = useState({
    merchantOrderId: "",
    amount: "50000",
    serviceCode: "SHOPEE_MALL",
    ipnUrl: "https://merchant.com/callback",
    uiCallbackUrl: "https://merchant.com/result",
    extraData: JSON.stringify({
      content: "Thanh toan don hang 123",
      location: "HCM",
      device: "ANDROID"
    }, null, 2)
  });

  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      merchantOrderId: "ORD_" + Math.floor(Date.now() / 1000)
    }));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResultData(null);
    setErrorMsg(null);

    try {
      let parsedExtra = {};
      try {
        parsedExtra = JSON.parse(formData.extraData);
      } catch (e) {
        throw new Error("Invalid JSON in Extra Data fields");
      }

      const payload = {
        merchantOrderId: formData.merchantOrderId,
        amount: parseInt(formData.amount, 10),
        serviceCode: formData.serviceCode,
        settlementType: "TWO_STEP",
        ipnUrl: formData.ipnUrl,
        uiCallbackUrl: formData.uiCallbackUrl,
        extraData: parsedExtra
      };

      const res = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      setResultData(data);

      // Auto-trigger deeplink if result property is present and valid
      if (data.result && data.result.startsWith('mytelpayv2://')) {
        setTimeout(() => {
          window.location.href = data.result;
        }, 1500); // give the user 1.5 seconds to see the result before redirecting
      }

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="header">
        <h1 className="title">MytelPay Order Generation</h1>
        <p className="subtitle">Seamless payment integration playground</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="label">Merchant Order ID</label>
              <input
                type="text"
                name="merchantOrderId"
                className="input"
                value={formData.merchantOrderId}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Amount (MMK)</label>
              <input
                type="number"
                name="amount"
                className="input"
                value={formData.amount}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Service Code</label>
              <input
                type="text"
                name="serviceCode"
                className="input"
                value={formData.serviceCode}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="label">IPN URL</label>
              <input
                type="text"
                name="ipnUrl"
                className="input"
                value={formData.ipnUrl}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group full">
              <label className="label">UI Callback URL</label>
              <input
                type="text"
                name="uiCallbackUrl"
                className="input"
                value={formData.uiCallbackUrl}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group full">
              <label className="label">Extra Data (JSON)</label>
              <textarea
                name="extraData"
                className="input textarea"
                value={formData.extraData}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? (
              <>
                <div className="loader"></div>
                Processing...
              </>
            ) : 'Generate Order & Open Payment'}
          </button>
        </form>

        {errorMsg && (
          <div className="result-card" style={{ borderColor: 'var(--error)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
            <h3 className="result-title" style={{ color: 'var(--error)' }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Error
            </h3>
            <p style={{ color: 'var(--text-muted)' }}>{errorMsg}</p>
          </div>
        )}

        {resultData && (
          <div className="result-card">
            <h3 className="result-title">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Success! Order Generated
            </h3>

            <div className="code-block">
              {JSON.stringify(resultData, null, 2)}
            </div>

            {resultData.result && typeof resultData.result === 'string' && resultData.result.startsWith('mytelpay') && (
              <a href={resultData.result} className="btn-deeplink">
                Open MytelPay App Now
              </a>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
